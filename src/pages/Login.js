import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ setUserId }) {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [errorGlow, setErrorGlow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setErrorGlow(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })
      .then(res => res.json())
      .then(data => {
        if (data.userId) {
          setLoading(true);
          setUserId(data.userId);
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);

        } else {
          if (data.msg === "User not found") {
            alert("You have not registered yet. Go to Signup page and register.");
            navigate("/signup");
          } else if (data.msg === "Invalid credentials") {
            setErrorGlow(true);
          } else {
            alert(data.msg);
          }
        }
      })
      .catch(err => console.log("Login error:", err));
  };

  const loaderStyle = {
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #6b21a8",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    animation: "spin 1s linear 2",
    marginLeft: "5px"
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100">
      {/* Inline Keyframes */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md space-y-4 animate-flip-in">
        <h2 className="text-2xl font-bold text-purple-700 text-center">Login</h2>
        <input type="text" name="username" placeholder="Username" onChange={handleChange} className="w-full p-2 border rounded-xl" required />
        <input type="password" name="password" placeholder="Password"
          onChange={handleChange}
          className={`w-full p-2 border rounded-xl transition-all duration-300 ${errorGlow ? "border-red-500 shadow-red-400 shadow-md" : ""}`}
          required />
        <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded-xl hover:bg-purple-700 flex justify-center items-center">
        {loading ? <span style={loaderStyle}></span> : "Login"}
        </button>
        <p className="text-sm text-center">
          Not registered yet? <span onClick={() => navigate('/signup')} className="text-blue-600 cursor-pointer">Sign Up</span>
        </p>
        <div className="text-center text-gray-500 text-sm">or login with</div>
        <div className="flex justify-center space-x-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-red-100 flex items-center justify-center cursor-pointer shadow hover:shadow-md">
            <img
              src="/logos/G.jpg"
              alt="Google"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center cursor-pointer shadow hover:shadow-md">
            <img
              src="/logos/F.jpg"
              alt="Facebook"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden bg-black flex items-center justify-center cursor-pointer shadow hover:shadow-md">
            <img
              src="/logos/X.jpg"
              alt="Twitter"
              className="w-full h-full object-cover object-center scale-125"
            />
          </div>
        </div>
      </form>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: "", username: "", email: "", phnum: "", password: "", confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    fetch("http://localhost:3001/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then(res => res.json())
      .then(data => {
        if (data.userId) {
          alert("Signup successful. Please login.");
          navigate("/login");
        } else if (data.msg === "User already exists") {
          alert("User already exists. Please login.");
          navigate("/login");
        } else {
          alert(data.msg);
        }
      })
      .catch(err => console.log("Signup error:", err));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md space-y-4 animate-flip-in">
        <h2 className="text-2xl font-bold text-purple-700 text-center">Sign Up</h2>
        <input type="text" name="fullname" placeholder="Full Name" onChange={handleChange} className="w-full p-2 border rounded-xl" required />
        <input type="text" name="username" placeholder="Username" onChange={handleChange} className="w-full p-2 border rounded-xl" required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border rounded-xl" required />
        <input type="tel" name="phnum" placeholder="Phone Number" onChange={handleChange} className="w-full p-2 border rounded-xl" required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full p-2 border rounded-xl" required />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} className="w-full p-2 border rounded-xl" required />
        <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded-xl hover:bg-purple-700">Sign Up</button>
        <p className="text-sm text-center">
          Already have an account? <span onClick={() => navigate('/login')} className="text-blue-600 cursor-pointer">Login</span>
        </p>
      </form>
    </div>
  );
}

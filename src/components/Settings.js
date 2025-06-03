import React, { useState, useEffect } from "react";
import { GrNext } from "react-icons/gr";
import { IoIosClose } from "react-icons/io";
import { Switch } from "@headlessui/react"; 
import { useUser } from "../utils/UserContext";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedProtectiveOption, setSelectedProtectiveOption] = useState("");
  const { userId } = useUser() || {};
  const navigate = useNavigate();
  const [emailNotif, setEmailNotif] = useState(() => {
  const saved = localStorage.getItem(`cyberSafeEnabled_${userId}`);
    return saved === "true";
  });
  const [closing, setClosing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [smsNotif, setSmsNotif] = useState(false);
  const [userData, setUserData] = useState(null);

useEffect(() => {
  if (userId) {
    fetch(`http://localhost:3001/api/auth/user/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user data");
        return res.json();
      })
      .then((data) => {
        setUserData(data);
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
      });
  }
}, [userId]);

  const closePopup = () => {
    setClosing(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 100); 
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setSelectedProtectiveOption(""); 
  };

  const handleBackToSettings = () => {
    setSelectedOption("");
    setSelectedProtectiveOption("");
  };

  const handleProtectiveSubOptionClick = (subOption) => {
    setSelectedProtectiveOption(subOption);
  };
  const renderBlockedUsersContent = () => {
    const blockedData = {
      "View Blocked": ["Ram", "Unknown"],
      "Blocked Spams": ["Rummy Circle", "Ludo Master"],
      "Reported Contacts": ["Gayatri", "Banu"],
    };
  
    const title = selectedProtectiveOption;
    const users = blockedData[title] || [];
  
    return (
      <div className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded-xl shadow space-y-4">
        <h3 className="text-2xl font-semibold">{title}</h3>
        {users.map((user, index) => (
          <div
            key={index}
            className="flex items-center justify-between border dark:border-gray-600 p-3 rounded bg-gray-100 dark:bg-gray-700 mb-2"
          >
            <div className="flex items-center gap-3">
              <img
                src="/path-to-avatar.png"
                alt="profile"
                className="w-8 h-8 rounded-full"
              />
              <span>{user}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

const renderProfileInfo = (isLogoutPage) => {
  if (!userData) return <p>Loading user data...</p>;

  const imagePath = userData.profileImage?.replace(/\\/g, "/");
  const imageURL = `http://localhost:3001/${imagePath}`;

  const handleLogout = () => {
    localStorage.removeItem("userId"); 
    localStorage.removeItem("cyberSafeEnabled_" + userId); 
    navigate("/login");
  };

  return (
    <div className="bg-white p-6 rounded shadow space-y-4 flex flex-col items-center">
      {/* Profile Image */}
      <div className="flex justify-center mb-6">
        <img
          src={imageURL}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover shadow"
        />
      </div>
      <h3 className="text-xl font-semibold mb-4">Profile Info</h3>

      {/* Profile Info */}
      <div className="space-y-4 text-gray-700">
        <div className="flex">
          <div className="w-40 font-semibold">Full Name</div>
          <div className="mx-3">:</div>
          <div>{userData.fullname}</div>
        </div>
        <div className="flex">
          <div className="w-40 font-semibold">Username</div>
          <div className="mx-3">:</div>
          <div>{userData.username}</div>
        </div>
        <div className="flex">
          <div className="w-40 font-semibold">Email</div>
          <div className="mx-3">:</div>
          <div>{userData.email}</div>
        </div>
        <div className="flex">
          <div className="w-40 font-semibold">Phone Number</div>
          <div className="mx-3">:</div>
          <div>{userData.phnum}</div>
        </div>
        <div className="flex">
          <div className="w-40 font-semibold">Password</div>
          <div className="mx-3">:</div>
          <div>* * * * * *</div>
        </div>
      </div>
       {isLogoutPage && (
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

  const renderAccountSettingsContent = () => {
    switch (selectedProtectiveOption) {
      case "Profile Info":
        return renderProfileInfo(false);
      case "Security":
        return (
          <div className="bg-white p-6 rounded shadow space-y-3">
            <h3 className="text-xl font-semibold">Security</h3>
            <ul className="list-disc pl-6 text-sm text-gray-700">
              <li>Change your password</li>
              <li>Enable 2-step verification</li>
              <li>Review active login sessions</li>
            </ul>
          </div>
        );
      case "Notification Settings":
        return (
          <div className="bg-white p-6 rounded shadow space-y-3">
            <h3 className="text-xl font-semibold">Notification Settings</h3>
            <div className="flex items-center justify-between mt-4">
              <span>Email Notifications</span>
              <Switch
                checked={emailNotif}
                onChange={setEmailNotif}
                className={`${emailNotif ? "bg-green-500" : "bg-gray-300"} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
              >
                <span className={`${emailNotif ? "translate-x-6" : "translate-x-1"} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
              </Switch>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span>SMS Notifications</span>
              <Switch
                checked={smsNotif}
                onChange={setSmsNotif}
                className={`${smsNotif ? "bg-green-500" : "bg-gray-300"} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
              >
                <span className={`${smsNotif ? "translate-x-6" : "translate-x-1"} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
              </Switch>
            </div>
          </div>
        );
      case "Logout":
      return renderProfileInfo(true);
      default:
        return (
          <div className="space-y-4">
            {["Profile Info", "Security", "Notification Settings"].map((sub) => (
              <div
                key={sub}
                onClick={() => handleProtectiveSubOptionClick(sub)}
                className="cursor-pointer p-4 bg-white shadow-sm border border-gray-200 rounded-md hover:bg-purple-50 transition"
              >
                <h3 className="text-lg font-medium text-black">{sub}</h3>
              </div>
            ))}
          </div>
        );
    }
  };

  const renderProtectiveContent = () => {
    switch (selectedProtectiveOption) {
      case "Cyber Safe Mode":
      return (
        <div className="bg-white p-6 rounded shadow space-y-4 relative">
          <h3 className="text-xl font-semibold mb-4">Cyber Safe Mode</h3>
          <p>
            Enable Cyber Safe Mode to auto-filter bullying, sensitive content, and inappropriate messages.
          </p>

          <div className="flex items-center gap-4">
            <span>Enable Safe Browsing</span>
            <Switch
              checked={emailNotif}
              onChange={async (enabled) => {
                setEmailNotif(enabled);
                if (userId) {
                  localStorage.setItem(`cyberSafeEnabled_${userId}`, enabled);
                  window.dispatchEvent(
                  new CustomEvent("cyberSafeStatusChange", {
                    detail: { userId, status: enabled },
                  })
                );
                }
                
                if (enabled) {
                  try {
                    const res = await fetch("http://localhost:5000/activate", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ activate: true }),
                    });

                  if (res.ok) {
                    setShowPopup(true);
                  } else {
                    console.error("Flask server did not respond OK");
                  }
                } catch (err) {
                  console.error("Failed to activate Cyber Safe Mode:", err);
                }
              }
            }}
            className={`${
              emailNotif ? "bg-green-500" : "bg-gray-300"
            } relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
          >
          <span
            className={`${
              emailNotif ? "translate-x-6" : "translate-x-1"
            } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
          />
        </Switch>
      </div>

      <ul className="list-disc pl-6 text-gray-700 text-sm">
        <li>Auto-block bullying or harassing users</li>
        <li>Hide sensitive images or videos</li>
        <li>Flag and report abusive content</li>
      </ul>

      {showPopup && (
      <div className="fixed inset-0 z-50 flex items-start justify-center ml-28 mt-16">
          <div
            className={`bg-green-100 border border-green-400 text-green-800 px-6 py-3 rounded shadow-lg relative w-[90%] max-w-md mt-10 text-center animate-${
              closing ? "slide-up" : "slide-down"
            }`}
          >
            <button
              onClick={closePopup}
              className="absolute top-2 right-3 text-green-600 hover:text-green-800 text-xl"
            >
              <IoIosClose size={23}/>
            </button>
            <p className="text-lg font-semibold">
              Cyber Safe Mode is enabled successfully!
            </p>
          </div>
        </div>
      )}
    </div>
  );

      case "Access Control":
        return (
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-semibold mb-4">Access Control</h3>
            <p>Manage who can access your content, your login devices, and session history.</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm mt-4 space-y-1">
              <li>View active login sessions and revoke any device</li>
              <li>Control third-party app access to your account</li>
              <li>Manage media and story visibility</li>
            </ul>
            <div className="mt-4 flex items-center gap-4">
              <span>Enable Access Controls</span>
              <Switch
                checked={smsNotif}
                onChange={setSmsNotif}
                className={`${smsNotif ? "bg-green-500" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${smsNotif ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform bg-white rounded-full transition`}
                />
              </Switch>
            </div>
          </div>
        );

      case "Parental Control":
        return (
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-semibold mb-4">Parental Guidance</h3>
            <p>Control your child’s experience and keep them safe while using the app.</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm mt-4 space-y-1">
              <li>Set screen time limits</li>
              <li>Restrict content based on age ratings</li>
              <li>Monitor daily activity and report summary</li>
            </ul>
            <div className="mt-4 flex items-center gap-4">
              <span>Enable Parental Controls</span>
              <Switch
                checked={smsNotif}
                onChange={setSmsNotif}
                className={`${smsNotif ? "bg-green-500" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${smsNotif ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform bg-white rounded-full transition`}
                />
              </Switch>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            {["Cyber Safe Mode", "Access Control", "Parental Control"].map((sub) => (
              <div
                key={sub}
                onClick={() => handleProtectiveSubOptionClick(sub)}
                className="cursor-pointer p-4 bg-white shadow-sm border border-gray-200 rounded-md hover:bg-purple-50 transition"
              >
                <h3 className="text-lg font-medium text-black">{sub}</h3>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full">
      <div className="p-4">
        {/* Header with breadcrumb */}
        <h2 className="text-2xl font-semibold mb-2 mt-2 flex items-center gap-2">
          <span
            onClick={handleBackToSettings}
            className={`cursor-pointer ${!selectedOption ? "text-black" : "text-gray-500 hover:text-black"} transition`}
          >
            Settings
          </span>

          {selectedOption && (
            <>
              <GrNext className="text-sm mt-1" />

              {/* Selected Option */}
              <span
                onClick={() => setSelectedProtectiveOption("")}
                className={`cursor-pointer ${
                  selectedProtectiveOption ? "text-gray-500 hover:text-black" : "text-black"
                } transition`}
              >
                {selectedOption}
              </span>
            </>
          )}

          {selectedProtectiveOption && (
            <>
              <GrNext className="text-sm mt-1" />

              {/* Sub Option */}
              <span className="text-black">{selectedProtectiveOption}</span>
            </>
          )}
        </h2>
        <hr className="border-t border-gray-300 mb-4" />

        {/* Main Settings */}
        {!selectedOption && (
          <div className="space-y-4 mt-6">
            {["Account Settings", "Protective Mode", "Blocked Users", "Logout Account"].map((option) => (
              <div
                key={option}
                onClick={() => handleOptionClick(option)}
                className={`cursor-pointer p-4 bg-white shadow-sm border border-gray-200 rounded-md hover:bg-purple-50 transition ${
                  option === "Logout Account" ? "text-red-600" : "text-black"
                }`}
              >
                <h3 className="text-lg font-medium">{option}</h3>
              </div>
            ))}
          </div>
        )}

        {/* Render Sub Contents */}
        {selectedOption === "Protective Mode" && (
          <div className="mt-6">{renderProtectiveContent()}</div>
        )}

        {selectedOption === "Account Settings" && (
          <div className="mt-6">{renderAccountSettingsContent()}</div>
        )}
        {selectedOption === "Logout Account" && renderProfileInfo(true)}
        {selectedOption === "Blocked Users" && selectedProtectiveOption && (
          <div className="mt-6">{renderBlockedUsersContent()}</div>
        )}

          {selectedOption === "Blocked Users" && !selectedProtectiveOption && (
            <div className="space-y-4 mt-6">
              {["View Blocked", "Blocked Spams", "Reported Contacts"].map((sub) => (
                <div
                  key={sub}
                  onClick={() => handleProtectiveSubOptionClick(sub)}
                  className="cursor-pointer p-4 bg-white shadow-sm border border-gray-200 
                  rounded-md hover:bg-purple-50 transition text-black"
                >
                  <h3 className="text-lg font-medium">{sub}</h3>
                </div>
              ))}
            </div>
          )}

      </div>
    </div>
  );
};

export default Settings;

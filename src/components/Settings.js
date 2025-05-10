import React, { useState } from "react";
import { GrNext } from "react-icons/gr";
import { Switch } from "@headlessui/react"; 

const Settings = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedProtectiveOption, setSelectedProtectiveOption] = useState("");

  // Toggle switches
  const [emailNotif, setEmailNotif] = useState(false);
  const [smsNotif, setSmsNotif] = useState(false);

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
      "View Blocked": ["user1", "user2"],
      "Blocked Spams": ["spammer1", "spammer2"],
      "Reported Contacts": ["reported1", "reported2"],
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
  
  const renderProtectiveContent = () => {
    switch (selectedProtectiveOption) {
      case "Cyber Safe Mode":
        return (
          <div className="bg-white p-6 rounded shadow space-y-4">
            <h3 className="text-xl font-semibold mb-4">Cyber Safe Mode</h3>
            <p>
              Enable Cyber Safe Mode to auto-filter bullying, sensitive content, and inappropriate messages.
            </p>
            <div className="flex items-center gap-4">
              <span>Enable Safe Browsing</span>
              <Switch
                checked={emailNotif}
                onChange={setEmailNotif}
                className={`${emailNotif ? "bg-green-500" : "bg-gray-300"} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
              >
                <span
                  className={`${emailNotif ? "translate-x-6" : "translate-x-1"} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                />
              </Switch>
            </div>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Auto-block bullying or harassing users</li>
              <li>Hide sensitive images or videos</li>
              <li>Flag and report abusive content</li>
            </ul>
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
          <span onClick={handleBackToSettings} className="cursor-pointer text-black">
            Settings
          </span>
          {selectedOption && (
            <>
              <GrNext className="text-xl mt-1" />
              <span
                onClick={() => setSelectedProtectiveOption("")}
                className={`text-xl ${selectedProtectiveOption ? "cursor-pointer text-black" : "text-gray-600"}`}
              >
                {selectedOption}
              </span>
            </>
          )}
          {selectedProtectiveOption && (
            <>
              <GrNext className="text-xl mt-1" />
              <span className="text-xl text-gray-600">{selectedProtectiveOption}</span>
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

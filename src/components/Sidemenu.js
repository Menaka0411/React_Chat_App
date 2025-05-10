import React, { useState, useRef, useEffect } from "react";
import { IoMenuOutline, IoCallOutline } from "react-icons/io5";
import { RxDashboard } from "react-icons/rx";
import { RiContactsBook2Line } from "react-icons/ri";
import { GrGroup } from "react-icons/gr";
import { MdOutlineArchive, MdOutlineSettings } from "react-icons/md";
import { AiOutlinePlus } from "react-icons/ai";
import { useUser } from "../utils/UserContext";
import axios from "axios";

const navItems = [
  { icon: RxDashboard, label: "Dashboard" },
  { icon: RiContactsBook2Line, label: "Contacts" },
  { icon: GrGroup, label: "Groups" },
  { icon: IoCallOutline, label: "Call Logs" },
  { icon: MdOutlineArchive, label: "Archives" },
  { icon: MdOutlineSettings, label: "Settings" },
];

export default function Sidemenu({ onMenuChange, activeMenu }) {
  const { userId } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [userData, setUserData] = useState({ username: "", fullname: "" });
  const [selectedMenu, setSelectedMenu] = useState(activeMenu || "Dashboard"); // Added state for active menu
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:3001/api/auth/user/${userId}`)
        .then(res => {
          setUserData(res.data);
          setProfileImage(res.data.profileImage || null);
        })
        .catch(err => console.error("Failed to fetch user data:", err));
    }
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("profileImage", file);
      try {
        const res = await axios.post(`http://localhost:3001/api/auth/upload/${userId}`, formData);
        setProfileImage(res.data.profileImage);
        setUserData(prev => ({ ...prev, profileImage: res.data.profileImage }));
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    }
  };

  const handleMenuClick = (label) => {
    setSelectedMenu(label); 
    onMenuChange(label); 
  };

  return (
    <div className="relative">
      {!isOpen && (
        <div
          className="fixed top-4 left-4 z-50 cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <IoMenuOutline className="w-8 h-8 text-purple-700" />
        </div>
      )}

      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-white shadow-xl transition-all duration-300 ease-in-out z-40 ${isOpen ? "w-64" : "w-16"}`}
      >
        <div className="flex flex-col h-full">
          {/* User Profile Section */}
          {isOpen && (
            <div className="relative flex items-center space-x-4 px-4 py-6 border-b mt-6">
              <div className="relative">
                <img
                  src={profileImage ? `http://localhost:3001/${profileImage}` : "/default-avatar.png"}
                  alt="User Avatar"
                  className="w-14 h-14 rounded-full object-cover"
                />
                <label
                  htmlFor="profile-upload"
                  className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md cursor-pointer"
                  title="Upload photo"
                >
                  <AiOutlinePlus className="w-4 h-4 text-purple-600" />
                </label>
                <input
                  type="file"
                  id="profile-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-base">
                  {userData.username || "Username"}
                </h2>
                <p className="text-sm text-gray-600">
                  {userData.fullname || "Full Name"}
                </p>
                <span className="text-xs text-green-500">● Active</span>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className={`flex flex-col py-20 ${isOpen ? "px-2" : "px-0"} space-y-2 mt-10`}>
            {navItems.map(({ icon: Icon, label }, idx) => (
              <div
                key={idx}
                onClick={() => handleMenuClick(label)} 
                className={`flex items-center cursor-pointer hover:bg-purple-100 px-4 py-3 transition-all duration-200 ${isOpen ? "justify-start space-x-4" : "justify-center"} ${label === selectedMenu ? "bg-purple-200" : ""}`}
              >
                <Icon className="w-6 h-6 text-purple-700" />
                {isOpen && <span className="text-gray-800">{label}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

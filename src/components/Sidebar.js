import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { IoEllipsisVertical } from "react-icons/io5";

export default function Sidebar({
  isSidemenuExpanded,
  fullname,
  profileImage,
  contacts,
  onSelectContact,
  setContacts,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [openOptionsId, setOpenOptionsId] = useState(null);
  const optionsRef = useRef(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const { data: contactsList } = await axios.get(`http://localhost:3001/contacts/${userId}`);
        setContacts(contactsList);
      } catch (err) {
        console.error("Error fetching contacts:", err);
      }
    };
    fetchContacts();
  }, [userId, setContacts]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setOpenOptionsId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filtered contacts for the search dropdown
  const filteredContactsForSearch = (contacts || []).filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleIconClick = (e, contactId) => {
    e.stopPropagation(); 
    setOpenOptionsId(prev => (prev === contactId ? null : contactId)); 
  };

  const handleDelete = (contactId) => {
    console.log("Delete contact:", contactId);
    setOpenOptionsId(null);
  };

  const handleArchive = (contactId) => {
    console.log("Archive contact:", contactId);
    setOpenOptionsId(null);
  };

  return (
    <div className="flex h-full">
      <div
        className={`w-72 bg-white flex flex-col border-r border-gray-200 p-4 ${isSidemenuExpanded ? "opacity-50" : ""}`}
      >
        {/* Profile Info */}
        <div className="flex items-center space-x-3 mb-4">
          <img
            src={
              profileImage
                ? `http://localhost:3001/${profileImage}`
                : "https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
            }
            alt="User Avatar"
            className="rounded-full w-10 h-10 object-cover"
          />
          <div>
            <p className="font-semibold text-gray-700">{fullname || "Fullname"}</p>
            <p className="text-xs text-green-600">Online</p>
          </div>
        </div>

        <hr className="border-t border-gray-300 mb-3" />

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search contacts"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            className="w-full mb-2 px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          {isFocused && searchTerm && (
            <div className="absolute z-10 left-0 right-0 bg-white border rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">
              {filteredContactsForSearch.length > 0 ? (
                filteredContactsForSearch.map((contact) => (
                  <div
                    key={contact._id || contact.name}
                    onClick={() => {
                      onSelectContact(contact);
                      setSearchTerm("");
                    }}
                    className="flex items-center px-4 py-2 hover:bg-purple-50 cursor-pointer"
                  >
                    <img
                      src={
                        contact.userProfile
                          ? `http://localhost:3001/${contact.userProfile}`
                          : "https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                      }
                      alt="Contact Avatar"
                      className="rounded-full w-8 h-8 object-cover mr-3"
                    />
                    <p>{contact.name}</p>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">No contacts found</div>
              )}
            </div>
          )}
        </div>

        {/* Contacts List */}
        <p className="text-sm font-semibold text-gray-600 mt-4 mb-2">Recent Chats</p>

        <div className="space-y-2 overflow-y-auto flex-1" ref={optionsRef}>
          {/* Render all contacts regardless of the search term */}
          {(contacts || []).map((contact) => (
            <div
              key={contact._id || contact.userId || contact.name}
              onClick={() => onSelectContact(contact)}
              className="flex justify-between items-center p-2 rounded-lg hover:bg-purple-50 cursor-pointer relative"
            >
              <div className="flex items-center">
                <img
                  src={
                    contact.userProfile
                      ? `http://localhost:3001/${contact.userProfile}`
                      : "https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                  }
                  alt="Contact Avatar"
                  className="rounded-full w-10 h-10 object-cover mr-3"
                />
                <div>
                  <p className="font-medium text-gray-800"> {contact.name !== "Unknown User" ? contact.name : contact.phone}</p>
                </div>
              </div>
              <div onClick={(e) => handleIconClick(e, contact._id || contact.userId)}>
                <IoEllipsisVertical className="text-gray-500 hover:text-gray-700" />
              </div>

              {/* Options Panel */}
              {openOptionsId === contact._id && (
                <div className="absolute right-1 top-10 bg-white border rounded-md shadow-md z-10 w-28">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(contact._id);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-purple-100"
                  >
                    Delete
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArchive(contact._id);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-purple-100"
                  >
                    Archive
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

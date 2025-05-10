import React, { useState, useEffect } from "react";
import { useUser } from "../utils/UserContext";
import axios from "axios";
import { CiChat1 } from "react-icons/ci";
import { IoCallOutline, IoEllipsisHorizontal } from "react-icons/io5";
import { MdPersonAddAlt, MdSort } from "react-icons/md";
import ChatArea from "./ChatArea";

export default function Contacts({ isMobileViewActive }) {
  const { userId } = useUser();
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("az");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newContact, setNewContact] = useState({
    profile: "",
    name: "",
    phone: "",
    email: "",
  });
  const [showContacts, setShowContacts] = useState(true);

  useEffect(() => {
    if (userId) {
      axios
        .get(`http://localhost:3001/contacts/${userId}`)
        .then((res) => setContacts(res.data || []))
        .catch((err) => console.error("Failed to fetch contacts:", err));
    }
  }, [userId]);

  const sortContacts = (contactsList) => {
    switch (sortOption) {
      case "az":
        return [...contactsList].sort((a, b) => a.name.localeCompare(b.name));
      case "za":
        return [...contactsList].sort((a, b) => b.name.localeCompare(a.name));
      case "recent":
        return [...contactsList].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      default:
        return contactsList;
    }
  };

  const filteredContacts = sortContacts(
    contacts.filter((contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleAddContact = () => {
    if (!userId) {
      console.error("User ID is missing");
      return;
    }

    const formData = new FormData();
    formData.append("profile", newContact.profile);
    formData.append("name", newContact.name);
    formData.append("phone", newContact.phone);
    formData.append("email", newContact.email);

    axios
      .post(`http://localhost:3001/contacts/${userId}`, formData)
      .then((res) => {
        setContacts((prev) => [...prev, res.data]);
        setShowModal(false);
        setNewContact({ profile: "", name: "", phone: "", email: "" });
      })
      .catch((err) => console.error("Failed to add contact:", err));
  };

  const handleCloseModal = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
    }
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleOptions = (contactId) => {
    alert(`Options for contact ${contactId}`);
  };

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setShowContacts(false); 
  };

  if (isMobileViewActive && window.innerWidth < 768) {
    return null;
  }

  return (
    <div className={`flex flex-col h-full ${showContacts ? "p-4" : "p-0"}`}>
      {showContacts && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 px-4 py-2 mb-1 rounded-md w-full sm:w-72 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <div className="flex gap-2 justify-end relative">
            <button
              onClick={() => setShowModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition flex items-center gap-2"
            >
              <MdPersonAddAlt className="text-lg" />
              Add Contact
            </button>
            <button
              onClick={() => setShowSortDropdown((prev) => !prev)}
              className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 hover:bg-purple-700"
            >
              <MdSort className="text-lg" />
              Sort
            </button>

            {showSortDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border rounded-md shadow-md z-10 w-36 text-sm">
                <div
                  onClick={() => {
                    setSortOption("az");
                    setShowSortDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-purple-100 cursor-pointer"
                >
                  A-Z
                </div>
                <div
                  onClick={() => {
                    setSortOption("za");
                    setShowSortDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-purple-100 cursor-pointer"
                >
                  Z-A
                </div>
                <div
                  onClick={() => {
                    setSortOption("recent");
                    setShowSortDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-purple-100 cursor-pointer"
                >
                  Recently Added
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showContacts && <div className="border-b border-gray-300 mb-4" />}

      {showContacts ? (
        <div className="overflow-auto flex-1 m-0 p-0">
          {filteredContacts.length > 0 ? (
            <ul className="space-y-3">
              {filteredContacts.map((contact) => (
                <li
                  key={contact._id}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-purple-50 border"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={contact.userProfile ? `http://localhost:3001/${contact.userProfile}` : "https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"}
                      alt="Contact"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.phone || contact.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pr-3">
                    <button
                      className="p-2 rounded-full hover:bg-purple-100 transition"
                      onClick={() => handleContactClick(contact)}
                    >
                      <CiChat1 className="text-xl text-purple-600" />
                    </button>
                    <button
                      className="p-2 rounded-full hover:bg-purple-100 transition"
                      onClick={() => handleCall(contact.phone)}
                    >
                      <IoCallOutline className="text-xl text-purple-600" />
                    </button>
                    <button
                      className="p-2 rounded-full hover:bg-purple-100 transition"
                      onClick={() => handleOptions(contact._id)}
                    >
                      <IoEllipsisHorizontal className="text-xl text-purple-600" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center mt-10">No contacts found.</p>
          )}
        </div>
      ) : (
        <ChatArea selectedContact={selectedContact} />
      )}

      {/* Modal */}
      {showModal && (
        <div
          onClick={handleCloseModal}
          className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-md w-[500px] sm:w-[600px]"
          >
            <h2 className="text-xl font-semibold mb-4">Add Contact</h2>
            <div className="flex items-center gap-4 mb-4">
              <label htmlFor="profile-upload">
                <img
                  src={
                    newContact.profile
                      ? URL.createObjectURL(newContact.profile)
                      : "https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                  }
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
              </label>
              <input
                type="file"
                id="profile-upload"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setNewContact({ ...newContact, profile: e.target.files[0] })
                }
              />
              <input
                type="text"
                placeholder="Name"
                value={newContact.name}
                onChange={(e) =>
                  setNewContact({ ...newContact, name: e.target.value })
                }
                className="border px-4 py-2 rounded-md flex-1"
              />
            </div>
            <div className="flex flex-col mb-4 gap-2">
              <input
                type="text"
                placeholder="Phone"
                value={newContact.phone}
                onChange={(e) =>
                  setNewContact({ ...newContact, phone: e.target.value })
                }
                className="border px-4 py-2 rounded-md"
              />
              <input
                type="email"
                placeholder="Email"
                value={newContact.email}
                onChange={(e) =>
                  setNewContact({ ...newContact, email: e.target.value })
                }
                className="border px-4 py-2 rounded-md"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContact}
                className="bg-purple-600 text-white px-4 py-2 rounded-md"
              >
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

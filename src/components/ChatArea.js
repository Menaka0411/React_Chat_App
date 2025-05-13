import React, { useEffect, useRef, useState } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { FiSearch, FiPhoneCall } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { RiArrowDropRightLine } from "react-icons/ri";
import { LuReply, LuForward } from "react-icons/lu";
import { IoSaveOutline } from "react-icons/io5";
import { MdDeleteOutline } from "react-icons/md";
import { PiHandWaving } from "react-icons/pi";

import axios from "axios";
import { useUser } from "../utils/UserContext";
import io from "socket.io-client";

const socket = io("http://localhost:3001", {
  transports: ["websocket"]
});

export default function ChatArea({ selectedContact }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const scrollRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const dropdownRef = useRef(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [contactUser, setContactUser] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteOption, setDeleteOption] = useState("me");
  const [cyberSafeMode, setCyberSafeMode] = useState(false);
  const { userId } = useUser();

  useEffect(() => {
    const handleReceiveMessage = async (data) => {
      const isRelevant = 
        (data.senderId === userId && data.receiverId === selectedContact?.userId) ||
        (data.receiverId === userId && data.senderId === selectedContact?.userId);

      if (!isRelevant) return;

      if (cyberSafeMode) {
        try {
          const { data: prediction } = await axios.post("http://localhost:5000/predict", {
            message: data.text
          });

          if (prediction.label === "bully") {
            setMessages((prev) => [
              ...prev,
              {
                ...data,
                text: "This message seems to be sensitive, so it was blocked.",
                isBlocked: true
              }
            ]);
            return;
          }
        } catch (err) {
          console.error("Error predicting message:", err);
        }
      }

      setMessages((prev) => [...prev, data]);
    };
    socket.on("receive-message", handleReceiveMessage);
  
    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [userId, selectedContact?.userId, cyberSafeMode]);
  
  useEffect(() => {
    if (userId) {
      socket.emit("register-user", userId);
      const mode = localStorage.getItem(`cyberSafeEnabled_${userId}`);
      setCyberSafeMode(mode === "true"); 
    }
  }, [userId]);

  useEffect(() => {
    if (selectedContact) {  
      setMessages([]);
      const fetchMessages = async () => {
        try {
          const { data: matchedUser } = await axios.post("http://localhost:3001/api/users/find-by-contact", {
            phone: selectedContact.phone,
            email: selectedContact.email
          });
  
          if (!matchedUser) {
            console.warn("User not found for contact");
            return;
          }
          setContactUser(matchedUser);
          const realUserId = matchedUser._id;
          const res = await axios.get(`http://localhost:3001/messages/${userId}/${realUserId}`);
          setMessages(res.data || []);
        } catch (error) {
          console.error(error);
        }
      };
  
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedContact, userId]);
  
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getDateLabel = (dateStr) => {
    const today = new Date();
    const msgDate = new Date(dateStr);
  
    today.setHours(0, 0, 0, 0);
    msgDate.setHours(0, 0, 0, 0);
  
    const diff = Math.floor((today - msgDate) / (1000 * 60 * 60 * 24));
  
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
  
    return msgDate.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };
  

  const groupedMessages = messages.reduce((acc, msg) => {
    const dateLabel = getDateLabel(msg.timestamp);
    if (!acc[dateLabel]) acc[dateLabel] = [];
    acc[dateLabel].push(msg);
    return acc;
  }, {});

const handleSend = async () => {
  if (!newMsg.trim()) return;

  try {
    // Predict using Flask
    if (cyberSafeMode) {
      const { data: prediction } = await axios.post("http://localhost:5000/predict", {
        message: newMsg
      });

      if (prediction.label === "bully") {
        // Block sender from sending
        setMessages((prev) => [
          ...prev,
          {
            _id: Date.now(),
            senderId: userId,
            text: "This message has sensitive content and cannot be sent.",
            isBlocked: true,
            timestamp: new Date().toISOString(),
          }
        ]);
        setNewMsg("");
        return;
      }
    }

    const { data: matchedUser } = await axios.post("http://localhost:3001/api/users/find-by-contact", {
      phone: selectedContact.phone,
      email: selectedContact.email
    });

    const receiverId = matchedUser._id;

    const msgObj = {
      senderId: userId,
      receiverId,
      text: newMsg,
      timestamp: new Date().toISOString(),
      replyTo: replyTo?._id || null
    };

    const { data: savedMsg } = await axios.post("http://localhost:3001/messages", msgObj);
    socket.emit("send-message", savedMsg);
    setMessages((prevMessages) => [...prevMessages, savedMsg]);
    setNewMsg("");
    setReplyTo(null);

  } catch (err) {
    console.error("Error sending message:", err);
  }
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setShowMoreOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setShowMoreOptions(false);
      }
        if (
        selectMode &&
        selectedMessages.length === 0 &&
        !event.target.closest(".message-container")
      ) {
        setSelectMode(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectMode, selectedMessages]);
  

  if (!selectedContact) {
    return (
      <div className="flex-1 h-full bg-white flex items-center justify-center">
        <p className="text-gray-400 text-lg">Select a contact to start chatting 💬</p>
      </div>
    );
  }

  if (cyberSafeMode && messages.length === 0) {
    return (
      <div className="flex-1 h-full bg-white flex items-center justify-center">
        <p className="text-gray-500 font-medium text-center">
          🛡 Cyber Safe Mode is enabled for the chats
        </p>
      </div>
    );
  }

  const toggleMessageSelection = (msgId) => {
    setSelectedMessages((prevSelected) =>
      prevSelected.includes(msgId)
        ? prevSelected.filter((id) => id !== msgId)
        : [...prevSelected, msgId]
    );
  };
  
  
  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <img
            src={
              selectedContact.userProfile
                ? `http://localhost:3001/${selectedContact.userProfile}`
                : "https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
            }
            className="rounded-full w-10 h-10 object-cover"
            alt="Contact"
          />
          <div>
            <p className="font-semibold text-gray-800">{selectedContact.name !== "Unknown User" ? selectedContact.name : selectedContact.phone}</p>
            <p className="text-xs text-green-600">Online</p>
          </div>
        </div>
    {!selectMode ? (
        <div className="flex items-center space-x-4 text-purple-600 text-xl">
          <FiSearch className="cursor-pointer" />
          <FiPhoneCall className="cursor-pointer" />
          <div className="relative" ref={dropdownRef}>
            <BsThreeDotsVertical
              className="cursor-pointer"
              onClick={() => {
                setDropdownOpen((prev) => !prev);
                setShowMoreOptions(false); 
              }}
            />

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border text-black rounded-lg shadow-lg z-10 text-sm">
                {!showMoreOptions ? (
                  <>
                    <div
                      className="px-4 py-2 hover:bg-purple-100 cursor-pointer"
                      onClick={() => setShowContactInfo(true)}
                    >
                      View Contact
                    </div>
                    <div
                      className="px-4 py-2 hover:bg-purple-100 cursor-pointer"
                      onClick={() => console.log("Mute Notifications")}
                    >
                      Mute Notifications
                    </div>
                    <div
                      className="px-4 py-2 hover:bg-purple-100 cursor-pointer"
                      onClick={() => {
                        setSelectMode(true);
                        setDropdownOpen(false);
                      }}
                    >
                      Select
                    </div>
                    <div
                      className="px-4 py-2 hover:bg-purple-100 cursor-pointer flex items-center justify-between"
                      onClick={() => setShowMoreOptions(true)}
                    >
                      More <RiArrowDropRightLine size={20} />
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="px-4 py-2 hover:bg-purple-100 cursor-pointer"
                      onClick={() => console.log("Report")}
                    >
                      Report
                    </div>
                    <div
                      className="px-4 py-2 hover:bg-purple-100 cursor-pointer"
                      onClick={() => console.log("Block")}
                    >
                      Block
                    </div>
                    <div
                      className="px-4 py-2 hover:bg-purple-100 cursor-pointer"
                      onClick={() => console.log("Clear Chat")}
                    >
                      Clear Chat
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
     ) : (
      <div className="flex items-center space-x-10 mr-10 text-purple-600 text-2xl">
        <LuReply className="cursor-pointer" title="Reply"
          onClick={() => {
          const msg = messages.find(m => m._id === selectedMessages[0]);
          setReplyTo(msg);
          setSelectMode(false);
          setSelectedMessages([]); }} 
        />
        <IoSaveOutline className="cursor-pointer" title="Save" />
        <MdDeleteOutline className="cursor-pointer" title="Delete" 
         onClick={() => setShowDeletePopup(true)}
         />
        <LuForward className="cursor-pointer" title="Forward" />
      </div>
    )}
  </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 message-container">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-400 text-xl">
          <p className="mr-2">Say hello...</p>
          <PiHandWaving className="text-4xl text-purple-300" />
        </div>
      )}

        {Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
          <div key={dateLabel}>
            <div className="text-center text-gray-500 text-sm mb-3">
              <span className="bg-gray-100 px-3 py-1 rounded-full">{dateLabel}</span>
            </div>
            {msgs.map((msg, i) => {
              const isSentByMe = msg.senderId === userId;
              const isSelected = selectedMessages.includes(msg._id); 

              return (
                <div key={msg._id || i} 
                className={`flex ${isSentByMe ? "justify-end" : "justify-start"} mb-2`}
                onClick={() => selectMode && toggleMessageSelection(msg._id)} >
                  {selectMode && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleMessageSelection(msg._id)}
                      className="mr-2 mt-2"
                    />
                  )}
                  <div className="relative max-w-[75%]">
                    <div
                      className={`px-4 py-2 rounded-2xl flex flex-col ${
                        isSentByMe
                          ? "bg-purple-300 text-black rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p className="break-words leading-relaxed">{msg.text}</p>
                      <div
                        className={`text-xs mt-1 ${
                          isSentByMe ? "text-black self-end" : "text-gray-800 self-start"
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        {replyTo && (
          <div className="bg-gray-100 px-4 py-2 border-l-4 border-purple-500 mb-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700 italic">Replying to: {replyTo.text}</p>
              <button onClick={() => setReplyTo(null)} className="text-gray-500 hover:text-red-500">&times;</button>
            </div>
          </div>
        )}
      <div className="flex items-center justify-between ">
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="ml-3 p-2 text-purple-600"
        >
          <AiOutlineSend size={30} />
        </button>
      </div>
    </div>

      {showContactInfo && (
        <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg border-l z-20 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Contact Info</h2>
            <button
              className="text-gray-600 hover:text-black"
              onClick={() => setShowContactInfo(false)}
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <img
              src={
                selectedContact.userProfile
                  ? `http://localhost:3001/${selectedContact.userProfile}`
                  : "https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
              }
              className="w-24 h-24 rounded-full object-cover"
              alt="Profile"
            />
            <div className="text-center">
              <p className="font-bold text-gray-800 text-xl">{selectedContact.name}</p>
              <p className="text-xs text-green-500">● Online</p>
            </div>
            <div className="w-full border-t pt-4">
              <p className="text-gray-600 font-semibold">Username</p>
              <p className="text-gray-800 ">{contactUser.username}</p>
              </div>
            <div className="w-full border-t pt-4">
              <p className="text-gray-600 font-semibold">Phone</p>
              <p className="text-gray-800">{selectedContact.phone}</p>
            </div>
            <div className="w-full border-t pt-4">
              <p className="text-gray-600 font-semibold">Email</p>
              <p className="text-gray-800">{selectedContact.email}</p>
            </div>
          </div>
        </div>
      )}

      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center ml-48 z-50">
          <div className="bg-white rounded-lg p-6 w-96 relative">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-xl"
              onClick={() => setShowDeletePopup(false)}
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4">Do you want to delete?</h2>
            <div
              className="mb-3 flex items-center cursor-pointer"
              onClick={() => setDeleteOption("me")}
            >
              <input
                type="radio"
                name="deleteOption"
                checked={deleteOption === "me"}
                onChange={() => setDeleteOption("me")}
                className="mr-2"
              />
              <label className="cursor-pointer">Delete for me</label>
            </div>
            <div
              className="mb-5 flex items-center cursor-pointer"
              onClick={() => setDeleteOption("everyone")}
            >
              <input
                type="radio"
                name="deleteOption"
                checked={deleteOption === "everyone"}
                onChange={() => setDeleteOption("everyone")}
                className="mr-2"
              />
              <label className="cursor-pointer">Delete for everyone</label>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-1 bg-gray-300 text-gray-700 rounded"
                onClick={() => setShowDeletePopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1 bg-red-500 text-white rounded"
                onClick={() => {
                  console.log("Delete Option:", deleteOption);
                  console.log("Selected Msgs:", selectedMessages);
                  setShowDeletePopup(false);
                  setSelectedMessages([]);
                  setSelectMode(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

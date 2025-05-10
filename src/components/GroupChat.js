import React, { useEffect, useRef, useState } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { FiSearch, FiPhoneCall } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import { useUser } from "../utils/UserContext";
import io from "socket.io-client";

const socket = io("http://localhost:3001", {
  transports: ["websocket"]
});

export default function GroupChat({ selectedGroup }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [membersData, setMembersData] = useState({});
  const scrollRef = useRef(null);
  const { userId } = useUser();

  useEffect(() => {
    if (selectedGroup) {
      const fetchMembersData = async () => {
        try {
          const memberIds = [...selectedGroup.members, selectedGroup.createdBy];
          const { data } = await axios.post("http://localhost:3001/api/users/get-multiple", { ids: memberIds });
          const mappedData = {};
          data.forEach(user => {
            mappedData[user._id] = user;
          });
          setMembersData(mappedData);
        } catch (err) {
          console.error("Error fetching members data:", err);
        }
      };
      fetchMembersData();
    }
  }, [selectedGroup]);

  useEffect(() => {
    socket.on("send-groupchats", async (message) => {
        try {
          io.to(message.groupId).emit("receive-groupchats", message);
        } catch (err) {
          console.error("Error sending group message:", err);
        }
      });
      
    return () => {
      socket.off("receive-groupchats");
    };
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedGroup) {
      const fetchGroupMessages = async () => {
        try {
          const res = await axios.get(`http://localhost:3001/groupchats/${selectedGroup._id}`);
          setMessages(res.data || []);
        } catch (err) {
          console.error("Error fetching group messages:", err);
        }
      };
      fetchGroupMessages();
    }
  }, [selectedGroup]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;
  
    const msgObj = {
      groupId: selectedGroup._id,
      senderId: userId,
      text: newMsg,
      timestamp: new Date().toISOString(),
    };
  
    try {
      const { data: savedMsg } = await axios.post("http://localhost:3001/groupchats", msgObj);
      socket.emit("send-groupchats", savedMsg);
      setMessages(prevMessages => [...prevMessages, savedMsg]);
      setNewMsg("");
    } catch (err) {
      console.error("Error sending group message:", err);
    }
  };
  

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const getDateLabel = (dateStr) => {
    const today = new Date();
    const msgDate = new Date(dateStr);
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

  if (!selectedGroup) {
    return (
      <div className="flex-1 h-full bg-white flex items-center justify-center">
        <p className="text-gray-400 text-lg">Select a group to start chatting 💬</p>
      </div>
    );
  }

  // Calculate total members including logged-in user
  const totalMembers = new Set([...selectedGroup.members, selectedGroup.createdBy]).size;

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <img
            src={
              selectedGroup.profileImage
                ? `http://localhost:3001/${selectedGroup.profileImage}`
                : "https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
            }
            className="rounded-full w-10 h-10 object-cover"
            alt="Group"
          />
          <div>
            <p className="font-semibold text-gray-800">{selectedGroup.groupName}</p>
            <p className="text-xs text-green-600">{totalMembers} Members</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-purple-600 text-xl">
          <FiSearch className="cursor-pointer" />
          <FiPhoneCall className="cursor-pointer" />
          <BsThreeDotsVertical className="cursor-pointer" />
        </div>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
          <div key={dateLabel}>
            <div className="text-center text-gray-500 text-sm mb-3">
              <span className="bg-gray-100 px-3 py-1 rounded-full">{dateLabel}</span>
            </div>
            {msgs.map((msg, i) => {
              const isSentByMe = msg.senderId === userId;
              const sender = membersData[msg.senderId];

              return (
                <div key={i} className={`flex ${isSentByMe ? "justify-end" : "justify-start"} mb-2`}>
                  <div className={`flex items-end ${isSentByMe ? "flex-row-reverse" : "flex-row"} max-w-[75%]`}>
                    <img
                      src={
                        sender?.profileImage
                          ? `http://localhost:3001/${sender.profileImage}`
                          : "https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                      }
                      className="w-8 h-8 rounded-full object-cover mx-2"
                      alt="User"
                    />
                    <div
                      className={`px-4 py-2 rounded-2xl flex flex-col ${
                        isSentByMe
                          ? "bg-purple-300 text-black rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p className="break-words leading-relaxed">{msg.text}</p>
                      <div className={`text-xs mt-1 ${isSentByMe ? "text-black self-end" : "text-gray-800 self-start"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
      <div className="flex items-center justify-between p-4 border-t">
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
  );
}

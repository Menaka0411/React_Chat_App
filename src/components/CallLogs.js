import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MdOutlineVideocam, MdOutlineCallMade,
  MdOutlineCallReceived, MdOutlineCallMissed, MdSort,
} from "react-icons/md";
import { IoEllipsisVertical, IoCallOutline } from "react-icons/io5";
import { useUser } from "../utils/UserContext";

const mockCallLogs = [
  {
    id: 1,
    userId: "68087740e5fff101ab2f0086",
    name: "Vaishali",
    callType: "incoming",
    isMissed: false,
  },
  {
    id: 2,
    userId: "68087740e5fff101ab2f0086",
    name: "Harini",
    callType: "incoming",
    isMissed: true,
  },
  {
    id: 3,
    userId: "6809c524c377554435fe9a32",
    name: "Menaka",
    callType: "outgoing",
    isMissed: false,
  },
  {
    id: 4,
    userId: "68087740e5fff101ab2f0086",
    name: "Vaishali",
    callType: "outgoing",
    isMissed: false,
  },
];

const CallLogs = () => {
  const { userId } = useUser();
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");

  // Fetch contacts from backend
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/contacts/${userId}`);
        setContacts(res.data);
        console.log("Fetched contacts:", res.data);

      } catch (err) {
        console.error("Failed to fetch contacts", err);
      }
    };

    fetchContacts();
  }, [userId]);

  const handleSort = (order) => {
    setSortOrder(order);
    setShowSortDropdown(false);
  };

  const filteredLogs = mockCallLogs
    .filter((log) => log.userId === userId)
    .filter((log) =>
      log.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  const getUserProfile = (log) => {
    const match = contacts.find(
      (c) => c.name === log.name && c.userId === log.userId
    );
    return match ? `http://localhost:3000/${match.userProfile}` : "default-profile.png";
  };

  return (
    <div className="w-full h-full">
      <div className="p-4">
        {/* Search + Sort */}
        <div className="flex justify-between items-center mb-4 relative">
          <div className="w-full sm:w-72 relative">
            <input
              type="text"
              placeholder="Search call logs ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div className="flex space-x-3 relative">
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown((prev) => !prev)}
                className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition flex items-center gap-2"
              >
                <MdSort className="text-lg" /> Sort
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-md shadow-md z-10">
                  <div
                    className="p-2 hover:bg-purple-100 text-sm cursor-pointer"
                    onClick={() => handleSort("asc")}
                  >
                    A - Z
                  </div>
                  <div
                    className="p-2 hover:bg-purple-100 text-sm cursor-pointer"
                    onClick={() => handleSort("desc")}
                  >
                    Z - A
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <hr className="border-t border-gray-300 mb-4" />

        {/* Empty state */}
        {filteredLogs.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            No call logs yet
          </p>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between border p-3 rounded-md"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={`http://localhost:3000/${getUserProfile(log)}`}
                    alt={log.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium">{log.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      {log.callType === "incoming" &&
                        (log.isMissed ? (
                          <MdOutlineCallMissed className="text-red-500" />
                        ) : (
                          <MdOutlineCallReceived className="text-green-500" />
                        ))}
                      {log.callType === "outgoing" && (
                        <MdOutlineCallMade className="text-green-500" />
                      )}
                      {log.isMissed
                        ? "Missed Call"
                        : log.callType === "incoming"
                        ? "Incoming"
                        : "Outgoing"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                {log.name === "Vaishali" && log.callType === "outgoing" ? (
                    <IoCallOutline className="text-2xl text-purple-600" />
                  ) : (
                    <MdOutlineVideocam className="text-2xl text-purple-600" />
                  )}
                  <IoEllipsisVertical className="text-xl text-gray-600 cursor-pointer" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CallLogs;

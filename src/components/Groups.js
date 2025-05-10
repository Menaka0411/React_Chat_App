import React, { useState, useEffect, useRef } from "react";
import { MdOutlineGroupAdd, MdSort, MdPersonAddAlt } from "react-icons/md";
import { CiChat1 } from "react-icons/ci";
import { IoCallOutline, IoEllipsisHorizontal } from "react-icons/io5";
import GroupChat from "./GroupChat";
import axios from "axios";

export default function GroupsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [isAddMembersPopupOpen, setIsAddMembersPopupOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);        
  const [filteredGroups, setFilteredGroups] = useState([]); 
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupProfile, setGroupProfile] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [groupBio, setGroupBio] = useState("");
  const [errorMsg, setErrorMsg] = useState(""); 
  const [isDoneClicked, setIsDoneClicked] = useState(false); 
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isGroupChatOpen, setIsGroupChatOpen] = useState(false);

  const userId = localStorage.getItem("userId");
  const createGroupPopupRef = useRef(null);
  const addMembersPopupRef = useRef(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const { data } = await axios.get(`http://localhost:3001/contacts/${userId}`);
        setContacts(data);
      } catch (err) {
        console.error("Failed to fetch contacts", err);
      }
    };
    fetchContacts();
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isCreatePopupOpen && createGroupPopupRef.current && !createGroupPopupRef.current.contains(e.target)
      ) {
        if (!isAddMembersPopupOpen) {
          setIsCreatePopupOpen(false);
        }
      }
      if (!e.target.closest('.relative')) {
        setShowSortDropdown(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCreatePopupOpen, isAddMembersPopupOpen]);  

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredGroups([]);
    } else {
      const filtered = groups.filter((group) =>
        group.groupName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGroups(filtered);
    }
  }, [searchTerm, groups]);

  const handleCreateGroup = async () => {
    if (selectedMembers.length < 2) {
      alert("Select at least 2 members to create a group!");
      return;
    }
    if (selectedMembers.length > 100) {
      alert("You cannot add more than 100 members.");
      return;
    }

    const formData = new FormData();
    formData.append("groupName", groupName);
    formData.append("groupBio", groupBio);
    formData.append("members", JSON.stringify(selectedMembers));
    if (groupProfile) {
      formData.append("profileImage", groupProfile);
    }
    formData.append("createdBy", userId);

    try {
      const { data } = await axios.post("http://localhost:3001/groups", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { data: updatedGroups } = await axios.get("http://localhost:3001/groups");
      setGroups(updatedGroups);

      setGroups((prevGroups) => [...prevGroups, data]);

      setIsCreatePopupOpen(false);
      setGroupName("");
      setGroupBio("");
      setSelectedMembers([]);
      setGroupProfile(null);
    } catch (err) {
      console.error("Error creating group", err);
    }
  };

  const handleCancelCreateGroup = () => {
    setIsCreatePopupOpen(false);
    setGroupName("");
    setGroupBio("");
    setSelectedMembers([]);
    setGroupProfile(null);
  };

  const toggleMemberSelection = (contactId) => {
    setSelectedMembers((prevSelected) =>
      prevSelected.includes(contactId)
        ? prevSelected.filter((id) => id !== contactId)
        : [...prevSelected, contactId]
    );
    setErrorMsg(""); 
  };

  const handleAddMembersDone = () => {
    if (selectedMembers.length < 2) {
      setErrorMsg("A group must have at least 2 members.");
      return;
    }
    setIsDoneClicked(true); 
    setIsAddMembersPopupOpen(false);
  };

  const handleCancelAddMembers = () => {
    setIsDoneClicked(false); 
    setIsAddMembersPopupOpen(false);
    setSelectedMembers([]); 
  };

  const handleSort = (order) => {
    const sorted = [...groups].sort((a, b) => {
      const nameA = a.groupName.toLowerCase();
      const nameB = b.groupName.toLowerCase();
      return order === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
    setGroups(sorted);
    setShowSortDropdown(false);
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data } = await axios.get("http://localhost:3001/groups");
        setGroups(data);
      } catch (err) {
        console.error("Error fetching groups", err);
      }
    };
  
    fetchGroups();
  }, []);
  
  const handleGroupChat = (group) => {
    setSelectedGroup(group);
    setIsGroupChatOpen(true);
  };  
  
  const handleGroupCall = (group) => {
    console.log("Start call with group:", group.groupName);
  };
  
  const handleGroupOptions = (group) => {
    console.log("Show options for group:", group.groupName);
  };
  
  return (
    <div className="w-full h-full">
    {isGroupChatOpen && selectedGroup ? (
      <GroupChat selectedGroup={selectedGroup} />
    ) : (
    <div className="p-4">

      <div className="flex justify-between items-center mb-4 relative">

      <div className="w-full sm:w-72 relative">
        <input
          type="text"
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        {searchTerm.trim() !== "" && (
          <div className="absolute mt-1 bg-white border border-gray-300 rounded-md shadow-md w-full max-h-60 overflow-y-auto z-10">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <div key={group._id} className="p-2 hover:bg-purple-100 cursor-pointer text-sm">
                  {group.groupName}
                </div>
              ))
            ) : (
              <div className="p-2 text-gray-500 text-sm text-center">No group found</div>
            )}
          </div>
        )}
      </div>

      <div className="flex space-x-3 relative">
        <button
          onClick={() => setIsCreatePopupOpen(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition flex items-center gap-2"
        >
          <MdOutlineGroupAdd className="text-lg" /> Create
        </button>

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

      {/* Groups List */}
    <div>
      {groups.length > 0 ? (
        groups.map((group) => (
          <div key={group._id} className="flex items-center justify-between border p-3 mb-2 rounded-lg hover:bg-purple-50">
            <div className="flex items-center gap-3">
              <img
                src={group.groupProfile ? `http://localhost:3001/${group.groupProfile}` : "https://imgur.com/N9vJXS5.png"}
                alt="Group"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{group.groupName}</p>
                <p className="text-xs text-gray-500">{group.groupBio}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pr-3">
              <button
                className="p-2 rounded-full hover:bg-purple-100 transition"
                onClick={() => handleGroupChat(group)}
              >
                <CiChat1 className="text-xl text-purple-600" />
              </button>
              <button
                className="p-2 rounded-full hover:bg-purple-100 transition"
                onClick={() => handleGroupCall(group)}
              >
                <IoCallOutline className="text-xl text-purple-600" />
              </button>
              <button
                className="p-2 rounded-full hover:bg-purple-100 transition"
                onClick={() => handleGroupOptions(group)}
              >
                <IoEllipsisHorizontal className="text-xl text-purple-600" />
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No groups found</p>
      )}
    </div>
</div>
 )}
      
      {/* Create Group Popup */}
      {isCreatePopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-20">
          <div
             ref={createGroupPopupRef}
            className="bg-white p-6 rounded-xl shadow-lg w-96 relative"
          >
            <h2 className="text-lg font-semibold text-purple-600 mb-4">Create Group</h2>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <img
                  src={groupProfile ? URL.createObjectURL(groupProfile) : "https://imgur.com/N9vJXS5.png"}
                  alt="Group Avatar"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setGroupProfile(e.target.files[0])}
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                  title="Upload Profile Picture"
                />
              </div>
              <input
                type="text"
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <textarea
              placeholder="Group Bio (optional)"
              value={groupBio}
              onChange={(e) => setGroupBio(e.target.value)}
              className="w-full mb-4 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              rows="3"
            />

            <button
              onClick={() => setIsAddMembersPopupOpen(true)}
              className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition mb-4"
            >
              <MdPersonAddAlt className="text-lg" />
              Add Members
            </button>

            {isDoneClicked && selectedMembers.length > 0 && (
              <div className="text-xs text-gray-600 mb-4">
                {selectedMembers.length} member{selectedMembers.length > 1 ? "s" : ""} selected
              </div>
            )}

            <div className="flex justify-between gap-2">
              <button
                onClick={handleCancelCreateGroup}
                className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateGroup}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Members Popup */}
      {isAddMembersPopupOpen && (
        <div ref={addMembersPopupRef}
        className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-30">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-purple-600 mb-4">Add Members</h2>

            {errorMsg && (
              <div className="text-red-500 text-sm mb-4">{errorMsg}</div>
            )}

            {contacts.length > 0 ? (
              contacts.map((contact) => (
              <div
                key={contact._id}
                className="flex items-center p-2 rounded-lg mb-2 hover:bg-purple-100 cursor-pointer"
                onClick={() => toggleMemberSelection(contact._id)} 
              >
                <img
                  src={contact.userProfile ? `http://localhost:3001/${contact.userProfile}` : "https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"}
                  alt="Contact Avatar"
                  className="w-8 h-8 rounded-full mr-3"
                />
                <p className="text-gray-700 flex-1">{contact.name}</p> 
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(contact._id)}
                  onChange={(e) => e.stopPropagation()} 
                  className="ml-auto"
                />
              </div>
              ))
            ) : (
              <p className="text-gray-500">No contacts available</p>
            )}

            <div className="flex justify-between gap-2 mt-4">
              <button
                onClick={handleCancelAddMembers}
                className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMembersDone}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

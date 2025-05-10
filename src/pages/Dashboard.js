import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import Sidemenu from "../components/Sidemenu";
import Contacts from '../components/Contacts';
import Groups from '../components/Groups';
import CallLogs from '../components/CallLogs'
import Archives from '../components/Archives';
import Settings from '../components/Settings';
import axios from "axios";

export default function Dashboard({ userId }) {
  const [isSidemenuExpanded, setSidemenuExpanded] = useState(false);
  const [fullname, setFullname] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(""); 
  const sidemenuRef = useRef(null);

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await axios.get(`http://localhost:3001/api/auth/user/${userId}`);
        setFullname(userRes.data.fullname || "");
        setProfileImage(userRes.data.profileImage || null);

        const contactsRes = await axios.get(`http://localhost:3001/contacts/${userId}`);
        setContacts(contactsRes.data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const renderContent = () => {
    if (selectedContact) {
      return <ChatArea selectedContact={selectedContact} />;
    }

    switch (selectedMenu) {
      case "Contacts":
        return <Contacts />;
      case "Groups":
        return <Groups />;
      case "Call Logs":
        return <CallLogs />;
      case "Archives":
        return <Archives />;
      case "Settings":
        return <Settings />;
      default:
        return <ChatArea selectedContact={selectedContact} />;
    }
  };

  return (
    <div className="h-screen w-screen bg-white overflow-hidden">
      <div className="flex h-full w-full">
        <div ref={sidemenuRef} className="z-50">
            <Sidemenu
              onIconClick={() => setSidemenuExpanded(prev => !prev)}
              isExpanded={isSidemenuExpanded}
              onMenuChange={(menu) => {
                setSelectedMenu(menu);
                if (menu === "Dashboard") {
                  setSelectedContact(null);  
                }
              }}
            />
        </div>
        <div className={`z-40 transition-all duration-300 ${isSidemenuExpanded ? 'ml-64' : 'ml-16'}`}>
          <Sidebar
            userId={userId}
            isSidemenuExpanded={isSidemenuExpanded}
            fullname={fullname}
            profileImage={profileImage}
            contacts={contacts}
            onSelectContact={setSelectedContact}
            setContacts={setContacts}
          />
        </div>
        <div className="flex-1 h-full z-30 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

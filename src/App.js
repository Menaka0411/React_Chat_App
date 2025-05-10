import React from 'react';
import {Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Contacts from './components/Contacts.js';
import Groups from './components/Groups';
import Archives from './components/Archives';
import Settings from './components/Settings';
import { useUser } from './utils/UserContext';

export default function App() {
  const { userId, setUserId } = useUser();

  return (
    <Routes>
      <Route path="/" element={<Login setUserId={setUserId} />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login setUserId={setUserId} />} />
      <Route path="/dashboard" element={<Dashboard userId={userId} />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/groups" element={<Groups />} />
      <Route path="/archives" element={<Archives />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

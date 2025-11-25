// src/App.jsx (โค้ดใหม่)
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard'; // <--- เพิ่ม import Dashboard

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Dashboard Route */}
        <Route path="/dashboard" element={<Dashboard />} /> {/* <--- เพิ่ม Route ใหม่ */}
      </Routes>
    </div>
  );
}

export default App;
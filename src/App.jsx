// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="app">
      <Routes>
        {/* 🔹 หน้าแรก: แสดง Dashboard เลย แม้ยังไม่ล็อกอิน */}
        <Route path="/" element={<Dashboard />} />

        {/* 🔹 ยังเข้าผ่าน /dashboard ได้เหมือนเดิม */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </div>
  );
}

export default App;

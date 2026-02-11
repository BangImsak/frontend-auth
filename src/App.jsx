// src/App.jsx (UPDATED - ต้องแก้ไขไฟล์นี้ด้วย)

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// ... นำเข้าคอมโพเนนต์เดิม
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import DataDownload from './pages/DataDownload'; 
import DateDetailView from './pages/DateDetailView'; // <-- นำเข้าคอมโพเนนต์ใหม่

// ----------------------------------------------------
// คอมโพเนนต์สำหรับตรวจสอบการเข้าสู่ระบบ (Protected Route)
// ----------------------------------------------------
const ProtectedRoute = ({ element }) => {
    const user = localStorage.getItem("user");
    return user ? element : <Navigate to="/login" />;
};
// ----------------------------------------------------


function App() {
 return (
  <div className="app">
   <Routes>
    {/* 🔹 Dashboard */}
    <Route path="/" element={<Dashboard />} />
    <Route path="/dashboard" element={<Dashboard />} />

    {/* Auth pages */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* 1. Protected Route: หน้าหลัก Data Export (รายการวันที่) */}
        <Route 
            path="/data-export" 
            element={<ProtectedRoute element={<DataDownload />} />} 
        />
        
        {/* 2. Protected Route: หน้าแสดงรายละเอียดข้อมูลของวันที่นั้นๆ */}
        <Route 
            path="/data-export/:date" // <-- เพิ่มพารามิเตอร์ :date
            element={<ProtectedRoute element={<DateDetailView />} />} 
        />
        
    {/* 🔹 Optional: Redirect หน้าที่ไม่พบไปยังหน้าแรก */}
        <Route path="*" element={<Navigate to="/" />} />
        
   </Routes>
  </div>
 );
}

export default App;
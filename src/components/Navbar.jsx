// src/components/Navbar.jsx
import React from "react";

function Navbar({ currentStatus }) {
  // ใช้สีสถานะเป็นสีเน้น (Accent Color)
  const brandAccentColor = currentStatus ? currentStatus.bgClass.replace('bg-', 'bg-') : "bg-emerald-600";

  return (
    <header className="w-full h-14 fixed top-0 left-0 flex items-center justify-between z-30 bg-white shadow-lg border-b border-gray-200">
      {/* ซ้าย: PM Dashboard Branding */}
      <div
        className={`flex items-center h-full w-[240px] px-6 ${brandAccentColor} text-white transition-colors duration-300 shadow-md`}
      >
        <span className="text-lg font-bold">PM Dashboard</span>
      </div>

      {/* ขวา: (ลบปุ่ม Login/Logout ออกแล้ว) */}
      <div className="flex-1 h-full bg-white"></div>
    </header>
  );
}

export default Navbar;
// src/components/Navbar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

function Navbar({ currentStatus }) {
  const brandColorClass = currentStatus ? currentStatus.bgClass : "bg-[#06b17a]";
  const navigate = useNavigate();

  // Modal สำหรับ Logout
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ✅ เช็คสถานะล็อกอินจาก localStorage / sessionStorage
  const isLoggedIn = Boolean(
    localStorage.getItem("user") || sessionStorage.getItem("user")
  );

  // กด Logout -> เปิด Modal
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // กด Login -> ไปหน้า /login
  const handleLoginClick = () => {
    navigate("/login");
  };

  // ยืนยัน Logout จริง
  const confirmLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setShowLogoutModal(false);
    navigate("/login");
  };

  // ปิด Modal
  const closeModal = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      {/* Header Bar */}
      <header className="w-full h-14 fixed top-0 left-0 flex items-center justify-between z-30 bg-white shadow-sm">
        {/* ซ้าย: PM Dashboard Branding */}
        <div
          className={`flex items-center h-full w-[240px] px-6 ${brandColorClass} text-white transition-colors duration-300`}
        >
          <span className="text-lg font-semibold">PM Dashboard</span>
        </div>

        {/* ขวา: ปุ่ม Login / Logout */}
        <div className="flex-1 flex items-center justify-end h-full px-6">
          {isLoggedIn ? (
            // 🔴 แสดงปุ่ม Logout เมื่อ "มี user" ใน storage
            <button
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-1.5 px-4 rounded-full transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              onClick={handleLogoutClick}
            >
              <span>Logout</span>
            </button>
          ) : (
            // 🟢 แสดงปุ่ม Login เมื่อยังไม่ได้ล็อกอิน
            <button
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-1.5 px-4 rounded-full transition-all shadow-md hover:shadow-lg"
              onClick={handleLoginClick}
            >
              Login
            </button>
          )}
        </div>
      </header>

      {/* Logout Confirmation Modal (Popup) */}
      {isLoggedIn && showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* ฉากหลังดำจาง + เบลอ */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          {/* กล่อง Popup */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10 transform transition-all scale-100 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex flex-col items-center text-center">
              {/* ไอคอน Logout */}
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <LogOut className="w-7 h-7 text-red-600 ml-1" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Confirm Logout
              </h3>
              <p className="text-sm text-gray-500 mb-6 px-2">
                Are you sure you want to log out from the system? You will need to sign in again.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-700 font-semibold text-sm shadow-lg hover:shadow-red-500/30 transition-all transform hover:-translate-y-0.5"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;

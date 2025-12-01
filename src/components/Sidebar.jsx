// src/components/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { X, User, LayoutDashboard, LogOut, LogIn } from "lucide-react";

const sidebarItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
];

function Sidebar({
  currentStatus,
  isOpen = false,
  onClose = () => {},
}) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const activeColorClass = currentStatus
    ? currentStatus.bgClass
    : "bg-emerald-600";

  // State สำหรับ User Profile
  const [profile, setProfile] = useState(null);
  
  // ✅ State สำหรับ Modal Logout (เอากลับมาแล้วครับ)
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (data) {
      try {
        const user = JSON.parse(data);
        setProfile({
            firstName: user.firstName || "User",
            lastName: user.lastName || "",
            role: user.role || "User",
            email: user.email || ""
        });
      } catch (e) {
        console.error("Cannot parse user", e);
      }
    } else {
        setProfile(null);
    }
  }, []);

  // ✅ ฟังก์ชันเปิด Modal
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    // ปิด Sidebar บนมือถือด้วย (ถ้าเปิดอยู่) เพื่อให้เห็น Modal ชัดๆ
    if (window.innerWidth < 768) {
       onClose(); 
    }
  };

  // ✅ ฟังก์ชันยืนยัน Logout จริงๆ
  const confirmLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setShowLogoutModal(false);
    navigate("/login");
  };

  // ✅ ฟังก์ชันปิด Modal
  const closeModal = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      {/* Overlay สำหรับ Mobile Sidebar */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-10 transition-opacity md:hidden
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* Sidebar Content */}
      <aside
        className={`fixed top-0 left-0 h-full z-20 bg-[#053744] text-white pt-14
          w-[240px] md:w-[240px] flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 shadow-2xl`}
      >
        {/* === Profile Section === */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <User size={20} className="text-white" />
          </div>
          <div className="leading-tight flex-1 min-w-0">
            {profile ? (
                <>
                    <p className="text-sm font-semibold truncate text-white">
                        {profile.firstName} {profile.lastName}
                    </p>
                    <p className="text-xs text-gray-300">{profile.role}</p>
                </>
            ) : (
                <p className="text-sm font-semibold text-white">Guest User</p>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-md hover:bg-white/10 active:scale-95 flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* === Nav Items === */}
        <nav className="flex-1 flex flex-col p-3 pt-4 gap-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all
                  ${
                    isActive
                      ? `${activeColorClass} text-white shadow-lg shadow-black/20`
                      : "text-white/80 hover:bg-white/10"
                  }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* ปุ่ม Login / Logout */}
          <div className="mt-1">
            {profile ? (
                <button
                    onClick={handleLogoutClick} // เรียกใช้ฟังก์ชันเปิด Modal แทน window.confirm
                    className="flex w-full items-center gap-3 p-3 rounded-xl text-sm font-medium text-white/80 hover:bg-red-500/20 hover:text-red-100 transition-all text-left"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            ) : (
                <Link
                    to="/login"
                    className="flex w-full items-center gap-3 p-3 rounded-xl text-sm font-medium text-white/80 hover:bg-emerald-500/20 hover:text-emerald-100 transition-all"
                >
                    <LogIn size={20} />
                    <span>Login</span>
                </Link>
            )}
          </div>
        </nav>
      </aside>

      {/* ✅ Logout Confirmation Modal (เอาโค้ดเดิมกลับมาใส่ตรงนี้) */}
      {profile && showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          {/* ฉากหลังดำจาง + เบลอ */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          {/* กล่อง Popup */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10 transform transition-all scale-100 animate-[fadeIn_0.2s_ease-out] border border-gray-100">
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
                  className="flex-1 px-4 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-700 font-semibold text-sm shadow-lg shadow-red-500/30 transition-all transform hover:-translate-y-0.5"
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

export default Sidebar;
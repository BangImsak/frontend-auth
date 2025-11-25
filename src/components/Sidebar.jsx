// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";

const sidebarItems = [
  { name: "Dashboard", icon: "📊", path: "/dashboard" },
  { name: "Notifications", icon: "🔔", path: "/notifications" },
];

function Sidebar({
  currentStatus,
  isOpen = false,     // ✅ คุมการเปิด/ปิดบนมือถือ
  onClose = () => {}, // ✅ ปิดเมื่อกด overlay หรือปุ่ม X
  userName = "บังยาฮารี",
  userRole = "User",
  userEmail = "",     // เผื่ออยากโชว์อีเมล
}) {
  const location = useLocation();
  const activeColorClass = currentStatus
    ? currentStatus.bgClass
    : "bg-[#06b17a]";

  return (
    <>
      {/* ✅ Overlay (เฉพาะมือถือ) */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-10 transition-opacity md:hidden
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* ✅ Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-20 bg-[#053744] text-white pt-14
          w-[240px] md:w-[240px]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0`}
      >
        {/* === Header / Profile (แบบไม่โชว์รูปตามที่บังบอก) === */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="leading-tight">
            <p className="text-sm font-semibold">{userName}</p>
            <p className="text-xs text-gray-300">{userRole}</p>
            {userEmail && (
              <p className="text-[11px] text-white/70 mt-1 truncate max-w-[180px]">
                {userEmail}
              </p>
            )}
          </div>

          {/* ปุ่มปิด (เฉพาะมือถือ) */}
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-md hover:bg-white/10 active:scale-95"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* === Nav Items === */}
        <nav className="flex flex-col p-2 pt-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose} // ✅ คลิกเมนูแล้วปิดบนมือถือทันที
                className={`flex items-center gap-3 p-3 my-1 rounded-lg text-sm font-medium transition-all
                  ${isActive
                    ? `${activeColorClass} text-white shadow-lg`
                    : "text-white/80 hover:bg-white/10"
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;

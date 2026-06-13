import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const used = user?.generationsUsed || 0;
  const limit = user?.generationsLimit || 5;
  const percent = Math.min((used / limit) * 100, 100);

  const SidebarContent = () => (
    <aside className="h-full w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Content<span className="text-zinc-400">Craft</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">AI Content Generator</p>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden text-zinc-500 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1">
        <NavLink
          to="/dashboard"
          onClick={() => setIsOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? "bg-white text-zinc-900"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`
          }
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Generate
        </NavLink>

        <NavLink
          to="/history"
          onClick={() => setIsOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? "bg-white text-zinc-900"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`
          }
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          History
        </NavLink>
      </nav>

      {/* Usage Tracker */}
      <div className="p-4 border-t border-zinc-800">
        <div className="bg-zinc-800 rounded-lg p-3 mb-3">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-zinc-400">Generations used</span>
            <span className="text-white font-medium">{used}/{limit}</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${percent >= 100 ? "bg-red-500" : "bg-white"}`}
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          {percent >= 100 && (
            <p className="text-red-400 text-xs mt-2">Limit reached — Upgrade to continue</p>
          )}
        </div>

        {user?.plan === "free" && (
          <button className="w-full bg-white text-zinc-900 text-sm font-semibold py-2 rounded-lg hover:bg-zinc-200 transition-all mb-3">
            ⚡ Upgrade to Pro
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center text-sm font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-zinc-500 capitalize">{user?.plan} plan</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-zinc-500 hover:text-white transition-colors"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar — always visible */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:z-50">
        <SidebarContent />
      </div>

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-white"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar — slides in */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Sidebar panel */}
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-64">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
}
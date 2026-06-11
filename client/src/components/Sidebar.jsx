import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PricingModal from "./PricingModal";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const used = user?.generationsUsed || 0;
  const limit = user?.generationsLimit || 5;
  const percent = Math.min((used / limit) * 100, 100);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Content<span className="text-zinc-400">Craft</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1">AI Content Generator</p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive ? "bg-white text-zinc-900" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
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
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive ? "bg-white text-zinc-900" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
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

        {/* Upgrade button — now opens PricingModal */}
        {user?.plan === "free" && (
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-white text-zinc-900 text-sm font-semibold py-2 rounded-lg hover:bg-zinc-200 transition-all mb-3"
          >
            ⚡ Upgrade to Pro
          </button>
        )}

        {/* User Info */}
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

      {/* Pricing Modal */}
      {showModal && <PricingModal onClose={() => setShowModal(false)} />}
    </aside>
  );
}
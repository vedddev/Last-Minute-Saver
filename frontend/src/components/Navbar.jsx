import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiSearchLine,
  RiBellLine,
  RiUserLine,
  RiSettings4Line,
  RiLogoutBoxLine,
  RiMoonLine,
  RiCheckboxCircleLine,
  RiCloseLine,
} from "react-icons/ri";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// ─── Notification Dropdown ────────────────────────────────────────────────────
const MOCK_NOTIFS = [
  { id: 1, icon: RiCheckboxCircleLine, color: "#34d399", text: "3 tasks completed today", time: "2m ago", read: false },
  { id: 2, icon: RiBellLine, color: "#a78bfa", text: "AI Coach has a new insight for you", time: "18m ago", read: false },
  { id: 3, icon: RiCheckboxCircleLine, color: "#60a5fa", text: "Schedule updated for tomorrow", time: "1h ago", read: true },
];

function NotifDropdown({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      style={{
        position: "absolute",
        top: "calc(100% + 10px)",
        right: 0,
        width: 300,
        background: "rgba(14,14,28,0.95)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        zIndex: 200,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Notifications</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#a78bfa", cursor: "pointer" }}>Mark all read</span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex" }}
          >
            <RiCloseLine size={16} />
          </button>
        </div>
      </div>

      {MOCK_NOTIFS.map((n) => (
        <motion.div
          key={n.id}
          whileHover={{ background: "rgba(255,255,255,0.04)" }}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "13px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            cursor: "pointer",
            background: n.read ? "transparent" : "rgba(124,58,237,0.05)",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: `${n.color}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            <n.icon size={15} color={n.color} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, color: n.read ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.8)", margin: 0, lineHeight: 1.5 }}>
              {n.text}
            </p>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 3, display: "block" }}>{n.time}</span>
          </div>
          {!n.read && (
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c3aed", marginTop: 6, flexShrink: 0 }} />
          )}
        </motion.div>
      ))}

      <div style={{ padding: "10px 16px" }}>
        <button
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.07)",
            background: "transparent",
            color: "rgba(255,255,255,0.4)",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          View all notifications
        </button>
      </div>
    </motion.div>
  );
}

// ─── Avatar Dropdown ──────────────────────────────────────────────────────────
function AvatarDropdown({ onClose }) {
  const menuItems = [
    { icon: RiUserLine, label: "Profile" },
    { icon: RiSettings4Line, label: "Settings" },
    { icon: RiMoonLine, label: "Appearance" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      style={{
        position: "absolute",
        top: "calc(100% + 10px)",
        right: 0,
        width: 220,
        background: "rgba(14,14,28,0.95)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        zIndex: 200,
      }}
    >
      {/* User info */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "linear-gradient(135deg,rgba(124,58,237,0.1),rgba(59,130,246,0.07))",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            A
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Athena User</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Pro Plan</div>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div style={{ padding: "8px" }}>
        {menuItems.map(({ icon: Icon, label }) => (
          <motion.button
            key={label}
            whileHover={{ background: "rgba(255,255,255,0.06)" }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "9px 10px",
              borderRadius: 9,
              border: "none",
              background: "transparent",
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <Icon size={16} />
            {label}
          </motion.button>
        ))}
      </div>

      <div style={{ padding: "8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <motion.button
          whileHover={{ background: "rgba(239,68,68,0.1)" }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "9px 10px",
            borderRadius: 9,
            border: "none",
            background: "transparent",
            color: "#f87171",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          <RiLogoutBoxLine size={16} />
          Logout
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────
function SearchBar() {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <motion.div
      animate={{
        width: focused ? 320 : 220,
        borderColor: focused ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)",
        boxShadow: focused ? "0 0 0 3px rgba(124,58,237,0.1)" : "none",
      }}
      transition={{ duration: 0.25 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid",
        borderRadius: 11,
        padding: "8px 14px",
        overflow: "hidden",
      }}
    >
      <motion.div animate={{ color: focused ? "#a78bfa" : "rgba(255,255,255,0.3)" }} transition={{ duration: 0.2 }}>
        <RiSearchLine size={15} />
      </motion.div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search tasks, insights..."
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          color: "#fff",
          fontSize: 13,
          minWidth: 0,
        }}
      />
      <AnimatePresence>
        {!focused && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 5,
              padding: "1px 5px",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            ⌘K
          </motion.span>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {query && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setQuery("")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.3)",
              display: "flex",
              padding: 0,
            }}
          >
            <RiCloseLine size={14} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar({ sidebarWidth = 240 }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const notifRef = useRef(null);
  const avatarRef = useRef(null);

  const unreadCount = MOCK_NOTIFS.filter((n) => !n.read).length;

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setShowAvatar(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <motion.header
      animate={{ left: sidebarWidth }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: 64,
        background: scrolled ? "rgba(8,8,18,0.92)" : "rgba(8,8,18,0.75)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.3)" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        zIndex: 90,
        transition: "background 0.3s, box-shadow 0.3s",
      }}
    >
      {/* Left — Greeting + Date */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: "flex", flexDirection: "column", gap: 1 }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{getGreeting()} 👋</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.01em" }}>{formatDate()}</span>
      </motion.div>

      {/* Right — Search + Actions */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: "flex", alignItems: "center", gap: 10 }}
      >
        {/* Search */}
        <SearchBar />

        {/* Notification bell */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <motion.button
            onClick={() => { setShowNotifs((v) => !v); setShowAvatar(false); }}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            whileTap={{ scale: 0.93 }}
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              border: "1px solid rgba(255,255,255,0.08)",
              background: showNotifs ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: showNotifs ? "#a78bfa" : "rgba(255,255,255,0.5)",
              position: "relative",
            }}
          >
            <RiBellLine size={18} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: "absolute",
                  top: 7,
                  right: 7,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
                  border: "1.5px solid #080812",
                }}
              />
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifs && <NotifDropdown onClose={() => setShowNotifs(false)} />}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <div ref={avatarRef} style={{ position: "relative" }}>
          <motion.button
            onClick={() => { setShowAvatar((v) => !v); setShowNotifs(false); }}
            whileHover={{ opacity: 0.9 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              background: showAvatar ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.04)",
              border: "1px solid",
              borderColor: showAvatar ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.08)",
              borderRadius: 11,
              padding: "5px 12px 5px 6px",
              cursor: "pointer",
              transition: "border-color 0.2s, background 0.2s",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              A
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 500, lineHeight: 1 }}>You</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1 }}>Pro</span>
            </div>
          </motion.button>

          <AnimatePresence>
            {showAvatar && <AvatarDropdown onClose={() => setShowAvatar(false)} />}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.header>
  );
}
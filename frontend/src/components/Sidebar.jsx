import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";
import {
  RiDashboardLine,
  RiTaskLine,
  RiRobot2Line,
  RiCalendarLine,
  RiBarChartLine,
  RiSettings4Line,
  RiLogoutBoxLine,
  RiBrainLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiSparklingLine,
} from "react-icons/ri";

const MotionLink = motion.create(Link);

// ─── Nav Config ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: RiDashboardLine, label: "Dashboard",   path: "/dashboard" },
  { icon: RiTaskLine,      label: "Tasks",        path: "/tasks"     },
  { icon: RiRobot2Line,    label: "AI Planner",   path: "/planner"   },
  { icon: RiCalendarLine,  label: "Schedule",     path: "/schedule"  },
  { icon: RiBarChartLine,  label: "Analytics",    path: "/analytics" },
  { icon: RiSettings4Line, label: "Settings",     path: "/settings"  },
];

// ─── Tooltip (shown when collapsed) ──────────────────────────────────────────
function Tooltip({ label, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "absolute",
            left: "calc(100% + 12px)",
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(20,20,36,0.97)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 500,
            color: "#fff",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 999,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {label}
          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              left: -5,
              top: "50%",
              transform: "translateY(-50%)",
              width: 0,
              height: 0,
              borderTop: "5px solid transparent",
              borderBottom: "5px solid transparent",
              borderRight: "5px solid rgba(255,255,255,0.1)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Nav Item ─────────────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, path, collapsed }) {
  const location = useLocation();
  const active =
    location.pathname === path || location.pathname.startsWith(`${path}/`);
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <MotionLink
        to={path}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileTap={{ scale: 0.96 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "100%",
          padding: collapsed ? "11px 0" : "10px 12px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderRadius: 11,
          border: "none",
          cursor: "pointer",
          textDecoration: "none",
          background: active
            ? "linear-gradient(135deg,rgba(124,58,237,0.25),rgba(59,130,246,0.15))"
            : hovered
            ? "rgba(255,255,255,0.05)"
            : "transparent",
          color: active ? "#c4b5fd" : hovered ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.38)",
          position: "relative",
          overflow: "hidden",
          transition: "color 0.2s, background 0.2s",
        }}
      >
        {/* Active left bar */}
        {active && (
          <motion.div
            layoutId="activeBar"
            style={{
              position: "absolute",
              left: 0,
              top: "20%",
              bottom: "20%",
              width: 3,
              borderRadius: "0 3px 3px 0",
              background: "linear-gradient(180deg,#7c3aed,#3b82f6)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}

        {/* Active shimmer */}
        {active && (
          <motion.div
            animate={{ x: ["−100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)",
              pointerEvents: "none",
            }}
          />
        )}

        <motion.div
          animate={{ color: active ? "#a78bfa" : hovered ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.38)" }}
          transition={{ duration: 0.2 }}
          style={{ flexShrink: 0, display: "flex" }}
        >
          <Icon size={19} />
        </motion.div>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="label"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.22 }}
              style={{
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </MotionLink>

      {/* Tooltip — only when collapsed */}
      {collapsed && <Tooltip label={label} visible={hovered} />}
    </div>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ collapsed }) {
  return (
    <Link
      to="/dashboard"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: collapsed ? "22px 0" : "22px 16px 20px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        minHeight: 72,
        textDecoration: "none",
      }}
    >
      <motion.div
        whileHover={{ rotate: 10, scale: 1.08 }}
        transition={{ type: "spring", stiffness: 300 }}
        style={{
          width: 34,
          height: 34,
          borderRadius: 11,
          background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 4px 18px rgba(124,58,237,0.4)",
        }}
      >
        <RiBrainLine size={19} color="#fff" />
      </motion.div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="logoText"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                fontSize: 17,
                fontWeight: 800,
                background: "linear-gradient(90deg,#c4b5fd,#93c5fd)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.1,
                whiteSpace: "nowrap",
              }}
            >
              Athena AI
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.25)",
                fontWeight: 500,
                letterSpacing: "0.08em",
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginTop: 2,
              }}
            >
              <RiSparklingLine size={9} />
              Productivity Intelligence
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar({ onWidthChange }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const width = collapsed ? 72 : 240;

  // Notify parent of width changes (for layout offset)
  useEffect(() => {
    onWidthChange?.(width);
  }, [width, onWidthChange]);

  // Auto-collapse on small screens
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setCollapsed(e.matches);
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <motion.aside
      animate={{ width }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        background: "rgba(9,9,20,0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        overflow: "visible",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Logo collapsed={collapsed} />

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: collapsed ? "14px 10px" : "14px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          overflowY: "auto",
          overflowX: "visible",
          scrollbarWidth: "none",
        }}
      >
        {NAV_ITEMS.map(({ icon, label, path }) => (
          <NavItem
            key={path}
            icon={icon}
            label={label}
            path={path}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Divider */}
      <div style={{ margin: "0 12px", height: 1, background: "rgba(255,255,255,0.06)" }} />

      {/* Logout */}
      <div style={{ padding: collapsed ? "12px 10px" : "12px 10px" }}>
        <LogoutButton collapsed={collapsed} onLogout={handleLogout} />
      </div>

      {/* Collapse toggle */}
      <motion.button
        onClick={() => setCollapsed((c) => !c)}
        whileHover={{ scale: 1.12, backgroundColor: "rgba(124,58,237,0.4)" }}
        whileTap={{ scale: 0.93 }}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          position: "absolute",
          top: 20,
          right: -14,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "rgba(124,58,237,0.25)",
          border: "1px solid rgba(124,58,237,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#a78bfa",
          zIndex: 101,
          boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
          transition: "background 0.2s",
        }}
      >
        <motion.div
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.25 }}
          style={{ display: "flex" }}
        >
          {collapsed ? <RiMenuUnfoldLine size={14} /> : <RiMenuFoldLine size={14} />}
        </motion.div>
      </motion.button>
    </motion.aside>
  );
}

// ─── Logout Button (extracted for clarity) ────────────────────────────────────
function LogoutButton({ collapsed, onLogout }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <motion.button
        onClick={onLogout}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileTap={{ scale: 0.96 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "100%",
          padding: collapsed ? "11px 0" : "10px 12px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderRadius: 11,
          border: "none",
          cursor: "pointer",
          background: hovered ? "rgba(239,68,68,0.1)" : "transparent",
          color: hovered ? "#f87171" : "rgba(255,255,255,0.3)",
          transition: "color 0.2s, background 0.2s",
          marginBottom: 4,
        }}
      >
        <RiLogoutBoxLine size={19} style={{ flexShrink: 0 }} />
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="logout-label"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.22 }}
              style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden" }}
            >
              Logout
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
      {collapsed && <Tooltip label="Logout" visible={hovered} />}
    </div>
  );
}
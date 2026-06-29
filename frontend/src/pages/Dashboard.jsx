import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiDashboardLine,
  RiTaskLine,
  RiCalendarLine,
  RiRobot2Line,
  RiBarChartLine,
  RiSettingsLine,
  RiLogoutBoxLine,
  RiBrainLine,
  RiFlashlightLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiSendPlaneLine,
  RiLoader4Line,
  RiAlertLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiFireLine,
  RiFocusLine,
  RiMenuLine,
  RiCloseLine,
  RiUserLine,
  RiBellLine,
  RiSearchLine,
  RiStarLine,
  RiPulseLine,
} from "react-icons/ri";
// import Sidebar from "../components/Sidebar";
// import Navbar from "../components/Navbar";
// import DashboardCards from "../components/DashboardCards";
// import CoachCard from "../components/CoachCard";
// import ChatWidget from "../components/ChatWidget";
// import TaskCard from "../components/TaskCard";
// import ScheduleTimeline from "../components/ScheduleTimeline";
// import ProductivityChart from "../components/ProductivityChart";


import aiService from "../services/aiService";


// ─── Sidebar ─────────────────────────────────────────────────────────────────
const navItems = [
  {
    icon: RiDashboardLine,
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: RiTaskLine,
    label: "Tasks",
    path: "/tasks",
  },
  {
    icon: RiCalendarLine,
    label: "Schedule",
    path: "/schedule",
  },
  {
    icon: RiRobot2Line,
    label: "AI Coach",
    path: "/coach",
  },
  {
    icon: RiBarChartLine,
    label: "Analytics",
    path: "/analytics",
  },
  {
    icon: RiSettingsLine,
    label: "Settings",
    path: "/settings",
  },
];
function Sidebar({ collapsed, onToggle }) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        background: "rgba(10,10,20,0.85)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "24px 20px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          minHeight: 72,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <RiBrainLine size={18} color="#fff" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              style={{
                fontSize: 18,
                fontWeight: 700,
                background: "linear-gradient(90deg,#a78bfa,#60a5fa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                whiteSpace: "nowrap",
              }}
            >
              Athena AI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map(({ icon: Icon, label, active }) => (
          <motion.button
            key={label}
            whileHover={{ backgroundColor: "rgba(124,58,237,0.15)" }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              background: active ? "rgba(124,58,237,0.2)" : "transparent",
              color: active ? "#a78bfa" : "rgba(255,255,255,0.45)",
              textAlign: "left",
              width: "100%",
              transition: "color 0.2s",
              position: "relative",
            }}
          >
            {active && (
              <motion.div
                layoutId="activeNav"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  borderRadius: "0 2px 2px 0",
                  background: "linear-gradient(180deg,#7c3aed,#3b82f6)",
                }}
              />
            )}
            <Icon size={20} style={{ flexShrink: 0 }} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ fontSize: 14, fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }}
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <motion.button
          whileHover={{ backgroundColor: "rgba(239,68,68,0.12)" }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 12px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: "transparent",
            color: "rgba(255,255,255,0.35)",
            width: "100%",
          }}
        >
          <RiLogoutBoxLine size={20} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ fontSize: 14 }}>
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Toggle */}
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "absolute",
          top: 22,
          right: -14,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "rgba(124,58,237,0.3)",
          border: "1px solid rgba(124,58,237,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#a78bfa",
          zIndex: 10,
        }}
      >
        {collapsed ? <RiMenuLine size={13} /> : <RiCloseLine size={13} />}
      </motion.button>
    </motion.aside>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar({ sidebarWidth }) {
  return (
    <motion.header
      animate={{ left: sidebarWidth }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: 64,
        background: "rgba(8,8,18,0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        zIndex: 90,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: "7px 14px",
            color: "rgba(255,255,255,0.3)",
            fontSize: 13,
          }}
        >
          <RiSearchLine size={15} />
          <span>Search anything...</span>
          <span style={{ marginLeft: 16, fontSize: 11, color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "1px 5px" }}>⌘K</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <motion.button
          whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "rgba(255,255,255,0.5)",
            position: "relative",
          }}
        >
          <RiBellLine size={18} />
          <span
            style={{
              position: "absolute",
              top: 7,
              right: 7,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#7c3aed",
            }}
          />
        </motion.button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RiUserLine size={14} color="#fff" />
          </div>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>You</span>
        </div>
      </div>
    </motion.header>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{ color: "#7c3aed" }}
      >
        <RiLoader4Line size={32} />
      </motion.div>
    </div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "rgba(239,68,68,0.1)",
        border: "1px solid rgba(239,68,68,0.25)",
        borderRadius: 12,
        padding: "12px 16px",
        color: "#f87171",
        fontSize: 14,
        marginBottom: 20,
      }}
    >
      <RiAlertLine size={18} />
      {message}
    </motion.div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, accent, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -3, boxShadow: `0 12px 40px ${accent}22` }}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        cursor: "default",
        backdropFilter: "blur(10px)",
        transition: "box-shadow 0.3s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{label}</span>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `${accent}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={17} color={accent} />
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{value ?? "—"}</div>
      {sub && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{sub}</div>}
    </motion.div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, accent = "#a78bfa" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <Icon size={18} color={accent} />
      <h2 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>{title}</h2>
    </div>
  );
}

// ─── Glass Card ───────────────────────────────────────────────────────────────
function GlassCard({ children, delay = 0, style = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 18,
        padding: "22px 24px",
        backdropFilter: "blur(10px)",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Task List ────────────────────────────────────────────────────────────────
function TaskList({ tasks }) {
  const priorityColor = { high: "#f87171", medium: "#fbbf24", low: "#34d399" };

  if (!tasks?.length) {
    return <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, textAlign: "center", padding: "24px 0" }}>No tasks found.</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {tasks.slice(0, 6).map((task, i) => (
        <motion.div
          key={task.id ?? i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "11px 14px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: priorityColor[task.priority?.toLowerCase()] ?? "#60a5fa",
              flexShrink: 0,
            }}
          />
          <span style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{task.title ?? task.name}</span>
          {task.priority && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: priorityColor[task.priority.toLowerCase()] ?? "#60a5fa",
                background: `${priorityColor[task.priority.toLowerCase()] ?? "#60a5fa"}15`,
                padding: "2px 8px",
                borderRadius: 6,
                textTransform: "capitalize",
              }}
            >
              {task.priority}
            </span>
          )}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>
            {task.status ?? "pending"}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Coach Card ───────────────────────────────────────────────────────────────
function CoachCard({ coach }) {
  if (!coach) return null;

  const message = typeof coach === "string" ? coach : coach.message ?? coach.advice ?? coach.tip ?? JSON.stringify(coach);

  return (
    <div
      style={{
        background: "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(59,130,246,0.1))",
        border: "1px solid rgba(124,58,237,0.25)",
        borderRadius: 14,
        padding: "18px 20px",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <RiRobot2Line size={20} color="#fff" />
      </div>
      <div>
        <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          AI Coach
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.65, margin: 0 }}>{message}</p>
      </div>
    </div>
  );
}

// ─── Priority List ────────────────────────────────────────────────────────────
function PriorityList({ priorities }) {
  if (!priorities) return null;

  const items = Array.isArray(priorities) ? priorities : priorities.priorities ?? priorities.items ?? [];

  if (!items.length) return <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No priorities found.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.slice(0, 5).map((item, i) => {
        const label = typeof item === "string" ? item : item.title ?? item.task ?? item.name ?? JSON.stringify(item);
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 11,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#7c3aed",
                width: 20,
                textAlign: "center",
              }}
            >
              {i + 1}
            </span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Schedule Timeline ────────────────────────────────────────────────────────
function ScheduleTimeline({ schedule }) {
  const items = Array.isArray(schedule) ? schedule : schedule?.schedule ?? schedule?.events ?? schedule?.items ?? [];

  if (!items.length) return <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No schedule data.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {items.slice(0, 6).map((item, i) => {
        const title = typeof item === "string" ? item : item.title ?? item.task ?? item.name ?? "Task";
        const time = item.time ?? item.start_time ?? item.scheduled_time ?? "";
        return (
          <div key={i} style={{ display: "flex", gap: 14 }}>
            {/* Timeline rail */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: i === 0 ? "#7c3aed" : "rgba(124,58,237,0.35)",
                  border: "2px solid",
                  borderColor: i === 0 ? "#a78bfa" : "rgba(124,58,237,0.2)",
                  flexShrink: 0,
                  marginTop: 12,
                }}
              />
              {i < items.slice(0, 6).length - 1 && (
                <div style={{ width: 1, flex: 1, background: "rgba(124,58,237,0.15)", minHeight: 20 }} />
              )}
            </div>
            <div style={{ paddingBottom: 16, paddingTop: 8, flex: 1 }}>
              {time && <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600, marginBottom: 3 }}>{time}</div>}
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{title}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Productivity Bar Chart ───────────────────────────────────────────────────
function ProductivityChart({ data }) {
  const chartData = Array.isArray(data) ? data : data?.productivity ?? data?.scores ?? data?.weekly ?? [];

  if (!chartData.length) return <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, textAlign: "center", padding: "24px 0" }}>No chart data.</div>;

  const max = Math.max(...chartData.map((d) => (typeof d === "number" ? d : d.value ?? d.score ?? 0)), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
      {chartData.slice(0, 10).map((item, i) => {
        const val = typeof item === "number" ? item : item.value ?? item.score ?? 0;
        const label = typeof item === "object" ? item.label ?? item.day ?? item.date ?? `D${i + 1}` : `${i + 1}`;
        const pct = (val / max) * 100;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
            <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                style={{
                  width: "100%",
                  background: i === chartData.length - 1 || pct === 100
                    ? "linear-gradient(180deg,#7c3aed,#3b82f6)"
                    : "rgba(124,58,237,0.35)",
                  borderRadius: "4px 4px 0 0",
                  minHeight: 4,
                }}
              />
            </div>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Chat Widget ─────────────────────────────────────────────────────────────
function ChatWidget() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm Athena. Ask me anything about your tasks, schedule, or productivity." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setSending(true);
    try {
      const res = await api.post("/ai/chat", { message: text });
      const reply =
        res.data?.response ?? res.data?.message ?? res.data?.reply ?? res.data?.content ?? "Got it!";
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Something went wrong. Please try again." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 14, paddingRight: 4, minHeight: 180, maxHeight: 260 }}>
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "9px 13px",
                borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                background: m.role === "user"
                  ? "linear-gradient(135deg,#7c3aed,#3b82f6)"
                  : "rgba(255,255,255,0.06)",
                fontSize: 13,
                color: "#fff",
                lineHeight: 1.55,
                border: m.role === "assistant" ? "1px solid rgba(255,255,255,0.07)" : "none",
              }}
            >
              {m.text}
            </div>
          </motion.div>
        ))}
        {sending && (
          <div style={{ display: "flex" }}>
            <div style={{ padding: "9px 14px", borderRadius: "14px 14px 14px 4px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>
                <RiLoader4Line size={14} color="#a78bfa" />
              </motion.div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          gap: 8,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 12,
          padding: "8px 10px",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask Athena..."
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#fff",
            fontSize: 13,
          }}
        />
        <motion.button
          onClick={send}
          disabled={!input.trim() || sending}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            border: "none",
            background: input.trim() && !sending ? "linear-gradient(135deg,#7c3aed,#3b82f6)" : "rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: input.trim() && !sending ? "pointer" : "default",
            transition: "background 0.2s",
          }}
        >
          <RiSendPlaneLine size={15} color="#fff" />
        </motion.button>
      </div>
    </div>
  );
}

// ─── Today's Focus ────────────────────────────────────────────────────────────
function TodaysFocus({ dashboard }) {
  const focus = dashboard?.focus ?? dashboard?.today_focus ?? dashboard?.daily_focus ?? null;
  if (!focus) return null;

  const text = typeof focus === "string" ? focus : focus.title ?? focus.task ?? focus.message ?? JSON.stringify(focus);

  return (
    <div
      style={{
        background: "linear-gradient(135deg,rgba(59,130,246,0.12),rgba(124,58,237,0.1))",
        border: "1px solid rgba(59,130,246,0.2)",
        borderRadius: 14,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 0,
      }}
    >
      <RiFocusLine size={22} color="#60a5fa" />
      <div>
        <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
          Today's Focus
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{text}</div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarWidth = sidebarCollapsed ? 72 : 240;

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  const [dashboard, setDashboard] = useState(null);
  const [coach, setCoach] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [priorities, setPriorities] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const errs = [];

      const results = await Promise.allSettled([
        api.get("/ai/dashboard"),
        api.get("/ai/coach"),
        api.get("/tasks/"),
        api.get("/ai/priorities"),
      ]);

      const [dashRes, coachRes, tasksRes, priRes] = results;

      if (dashRes.status === "fulfilled") setDashboard(dashRes.value.data);
      else errs.push("Dashboard data unavailable.");

      if (coachRes.status === "fulfilled") setCoach(coachRes.value.data.coach);
      else errs.push("Coach data unavailable.");

      if (tasksRes.status === "fulfilled") {
        const d = tasksRes.value.data;
        setTasks(Array.isArray(d) ? d : d?.tasks ?? d?.data ?? []);
      } else errs.push("Tasks unavailable.");

      if (priRes.status === "fulfilled") setPriorities(priRes.value.data);
      else errs.push("Priorities unavailable.");

      setErrors(errs);
      setLoading(false);
    };

    fetchAll();
  }, []);

  // Derived stat values from dashboard
  const productivity = dashboard?.productivity_score ?? dashboard?.score ?? dashboard?.productivity ?? null;
  const streak = dashboard?.streak ?? dashboard?.streak_days ?? null;
  const completedToday = dashboard?.completed_today ?? dashboard?.tasks_completed ?? tasks.filter((t) => t.status === "completed").length;
  const pending = dashboard?.pending ?? dashboard?.pending_tasks ?? tasks.filter((t) => t.status !== "completed").length;

  const chartData = dashboard?.chart ?? dashboard?.weekly_productivity ?? dashboard?.productivity_data ?? [];
  const scheduleData = dashboard?.schedule ?? dashboard?.timeline ?? [];

  return (
    <div style={{ minHeight: "100vh", background: "#080812", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c) => !c)} />
      <Navbar sidebarWidth={sidebarWidth} />

      {/* Main */}
      <motion.main
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ paddingTop: 64, minHeight: "100vh" }}
      >
        <div style={{ padding: "32px 28px", maxWidth: 1400 }}>
          {/* Page header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 }}>Good morning 👋</h1>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0 }}>
              Here's what's happening with your productivity today.
            </p>
          </motion.div>

          {/* Errors */}
          {errors.map((e, i) => <ErrorBanner key={i} message={e} />)}

          {loading ? (
            <Spinner />
          ) : (
            <>
              {/* Stat Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                <StatCard icon={RiPulseLine} label="Productivity Score" value={productivity !== null ? `${productivity}%` : "—"} sub="vs yesterday" accent="#7c3aed" delay={0} />
                <StatCard icon={RiFireLine} label="Current Streak" value={streak !== null ? `${streak}d` : "—"} sub="Keep it going!" accent="#f59e0b" delay={0.06} />
                <StatCard icon={RiCheckboxCircleLine} label="Completed Today" value={completedToday} sub="tasks done" accent="#34d399" delay={0.12} />
                <StatCard icon={RiTimeLine} label="Pending Tasks" value={pending} sub="need attention" accent="#60a5fa" delay={0.18} />
              </div>

              {/* Row 2: Focus + Coach */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <GlassCard delay={0.2}>
                  <SectionHeader icon={RiFocusLine} title="Today's Focus" accent="#60a5fa" />
                  <TodaysFocus dashboard={dashboard} />
                </GlassCard>
                <GlassCard delay={0.24}>
                  <SectionHeader icon={RiRobot2Line} title="AI Coach Insight" accent="#a78bfa" />
                  <CoachCard coach={coach} />
                </GlassCard>
              </div>

              {/* Row 3: Tasks + Priorities */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <GlassCard delay={0.28}>
                  <SectionHeader icon={RiTaskLine} title="Task List" accent="#34d399" />
                  <TaskList tasks={tasks} />
                </GlassCard>
                <GlassCard delay={0.32}>
                  <SectionHeader icon={RiStarLine} title="AI Priorities" accent="#fbbf24" />
                  <PriorityList priorities={priorities} />
                </GlassCard>
              </div>

              {/* Row 4: Chart + Schedule + Chat */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 16, marginBottom: 24 }}>
                <GlassCard delay={0.36}>
                  <SectionHeader icon={RiBarChartLine} title="Productivity Chart" accent="#a78bfa" />
                  <ProductivityChart data={chartData} />
                </GlassCard>

                <GlassCard delay={0.4}>
                  <SectionHeader icon={RiCalendarLine} title="Schedule Timeline" accent="#60a5fa" />
                  <ScheduleTimeline schedule={scheduleData} />
                </GlassCard>

                <GlassCard delay={0.44} style={{ display: "flex", flexDirection: "column" }}>
                  <SectionHeader icon={RiFlashlightLine} title="Ask Athena" accent="#f59e0b" />
                  <div style={{ flex: 1 }}>
                    <ChatWidget />
                  </div>
                </GlassCard>
              </div>
            </>
          )}
        </div>
      </motion.main>
    </div>
  );
}

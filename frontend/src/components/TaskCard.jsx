import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiFlag2Line,
  RiCalendarEventLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiLoader4Line,
  RiPauseLine,
  RiAlertLine,
  RiMoreLine,
  RiEditLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiArrowRightLine,
} from "react-icons/ri";

// ─── Priority config ──────────────────────────────────────────────────────────
const PRIORITY = {
  high: {
    label: "High",
    color: "#f87171",
    bg: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.25)",
    glow: "rgba(248,113,113,0.15)",
    bar: "linear-gradient(90deg,#ef4444,#f87171)",
    dot: "#ef4444",
  },
  medium: {
    label: "Medium",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.12)",
    border: "rgba(251,191,36,0.25)",
    glow: "rgba(251,191,36,0.12)",
    bar: "linear-gradient(90deg,#d97706,#fbbf24)",
    dot: "#d97706",
  },
  low: {
    label: "Low",
    color: "#34d399",
    bg: "rgba(52,211,153,0.12)",
    border: "rgba(52,211,153,0.25)",
    glow: "rgba(52,211,153,0.12)",
    bar: "linear-gradient(90deg,#059669,#34d399)",
    dot: "#10b981",
  },
};

const DEFAULT_PRIORITY = {
  label: "Normal",
  color: "#60a5fa",
  bg: "rgba(96,165,250,0.12)",
  border: "rgba(96,165,250,0.2)",
  glow: "rgba(96,165,250,0.1)",
  bar: "linear-gradient(90deg,#2563eb,#60a5fa)",
  dot: "#3b82f6",
};

function getPriority(raw) {
  if (!raw) return DEFAULT_PRIORITY;
  return PRIORITY[raw.toString().toLowerCase()] ?? DEFAULT_PRIORITY;
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  completed: { label: "Completed", color: "#34d399", icon: RiCheckboxCircleLine, bg: "rgba(52,211,153,0.1)" },
  done:      { label: "Completed", color: "#34d399", icon: RiCheckboxCircleLine, bg: "rgba(52,211,153,0.1)" },
  "in-progress": { label: "In Progress", color: "#60a5fa", icon: RiLoader4Line,       bg: "rgba(96,165,250,0.1)"  },
  "in_progress":  { label: "In Progress", color: "#60a5fa", icon: RiLoader4Line,       bg: "rgba(96,165,250,0.1)"  },
  active:    { label: "In Progress", color: "#60a5fa", icon: RiLoader4Line,       bg: "rgba(96,165,250,0.1)"  },
  pending:   { label: "Pending",     color: "#fbbf24", icon: RiPauseLine,         bg: "rgba(251,191,36,0.1)"  },
  todo:      { label: "To Do",       color: "#fbbf24", icon: RiPauseLine,         bg: "rgba(251,191,36,0.1)"  },
  overdue:   { label: "Overdue",     color: "#f87171", icon: RiAlertLine,         bg: "rgba(248,113,113,0.1)" },
  blocked:   { label: "Blocked",     color: "#f87171", icon: RiAlertLine,         bg: "rgba(248,113,113,0.1)" },
};

const DEFAULT_STATUS = { label: "Pending", color: "#fbbf24", icon: RiPauseLine, bg: "rgba(251,191,36,0.1)" };

function getStatus(raw) {
  if (!raw) return DEFAULT_STATUS;
  return STATUS[raw.toString().toLowerCase().trim()] ?? DEFAULT_STATUS;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDeadline(raw) {
  if (!raw) return null;
  try {
    const d = new Date(raw);
    if (isNaN(d)) return raw;
    const now = new Date();
    const diffMs = d - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const formatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    if (diffDays < 0)   return { text: formatted, badge: `${Math.abs(diffDays)}d overdue`, danger: true };
    if (diffDays === 0) return { text: formatted, badge: "Due today",                      danger: true };
    if (diffDays === 1) return { text: formatted, badge: "Tomorrow",                       danger: false };
    if (diffDays <= 3)  return { text: formatted, badge: `${diffDays}d left`,              danger: false };
    return { text: formatted, badge: null, danger: false };
  } catch {
    return { text: String(raw), badge: null, danger: false };
  }
}

function formatTime(raw) {
  if (raw === null || raw === undefined) return null;
  const n = Number(raw);
  if (isNaN(n)) return String(raw);
  if (n < 60) return `${n}m`;
  const h = Math.floor(n / 60);
  const m = n % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

// ─── Context menu ─────────────────────────────────────────────────────────────
function ContextMenu({ onClose }) {
  const items = [
    { icon: RiEyeLine,       label: "View details",  color: "rgba(255,255,255,0.65)" },
    { icon: RiEditLine,      label: "Edit task",     color: "rgba(255,255,255,0.65)" },
    { icon: RiArrowRightLine,label: "Change status", color: "rgba(255,255,255,0.65)" },
    { icon: RiDeleteBinLine, label: "Delete",        color: "#f87171"                },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -6 }}
      transition={{ duration: 0.15 }}
      style={{
        position: "absolute",
        top: 36,
        right: 0,
        width: 170,
        background: "rgba(14,14,28,0.97)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 13,
        overflow: "hidden",
        boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        zIndex: 50,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map(({ icon: Icon, label, color }, i) => (
        <motion.button
          key={label}
          whileHover={{ background: "rgba(255,255,255,0.06)" }}
          onClick={onClose}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            width: "100%",
            padding: "9px 13px",
            border: "none",
            borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
            background: "transparent",
            color,
            fontSize: 12,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <Icon size={14} />
          {label}
        </motion.button>
      ))}
    </motion.div>
  );
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────
export default function TaskCard({ task = {} }) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const title    = task.title ?? task.name ?? task.task ?? "Untitled Task";
  const priority = getPriority(task.priority);
  const status   = getStatus(task.status);
  const deadline = formatDeadline(task.deadline ?? task.due_date ?? task.due ?? null);
  const estTime  = formatTime(task.estimated_time ?? task.estimate ?? task.duration ?? null);
  const desc     = task.description ?? task.notes ?? null;

  const isCompleted =
    ["completed", "done"].includes((task.status ?? "").toLowerCase());

  const StatusIcon = status.icon;

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => { setHovered(false); setMenuOpen(false); }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "relative",
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? priority.border : "rgba(255,255,255,0.07)"}`,
        borderRadius: 16,
        overflow: "hidden",
        cursor: "default",
        boxShadow: hovered ? `0 10px 36px ${priority.glow}` : "none",
        transition: "border-color 0.25s, box-shadow 0.25s",
      }}
    >
      {/* Priority top bar */}
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0.6, opacity: hovered ? 1 : 0.5 }}
        transition={{ duration: 0.3 }}
        style={{
          height: 3,
          background: priority.bar,
          transformOrigin: "left",
          borderRadius: "3px 3px 0 0",
        }}
      />

      <div style={{ padding: "18px 18px 16px" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
          {/* Title */}
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: isCompleted ? "rgba(255,255,255,0.35)" : "#fff",
              margin: 0,
              lineHeight: 1.45,
              textDecoration: isCompleted ? "line-through" : "none",
              flex: 1,
            }}
          >
            {title}
          </h3>

          {/* Context menu trigger */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <motion.button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              whileTap={{ scale: 0.9 }}
              animate={{ opacity: hovered ? 1 : 0 }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                border: "none",
                background: menuOpen ? "rgba(255,255,255,0.08)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <RiMoreLine size={16} />
            </motion.button>

            <AnimatePresence>
              {menuOpen && <ContextMenu onClose={() => setMenuOpen(false)} />}
            </AnimatePresence>
          </div>
        </div>

        {/* Description */}
        {desc && (
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.35)",
              margin: "0 0 14px",
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {desc}
          </p>
        )}

        {/* Badges row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
          {/* Priority badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              fontWeight: 600,
              color: priority.color,
              background: priority.bg,
              border: `1px solid ${priority.border}`,
              borderRadius: 7,
              padding: "3px 9px",
            }}
          >
            <RiFlag2Line size={11} />
            {priority.label}
          </div>

          {/* Status badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              fontWeight: 600,
              color: status.color,
              background: status.bg,
              borderRadius: 7,
              padding: "3px 9px",
            }}
          >
            <StatusIcon size={11} />
            {status.label}
          </div>

          {/* Deadline urgency badge */}
          {deadline?.badge && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                color: deadline.danger ? "#f87171" : "#fbbf24",
                background: deadline.danger ? "rgba(248,113,113,0.1)" : "rgba(251,191,36,0.1)",
                borderRadius: 7,
                padding: "3px 9px",
              }}
            >
              {deadline.danger && <RiAlertLine size={10} />}
              {deadline.badge}
            </div>
          )}
        </div>

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {/* Deadline */}
          {deadline && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                color: deadline.danger ? "#f87171" : "rgba(255,255,255,0.3)",
              }}
            >
              <RiCalendarEventLine size={12} color={deadline.danger ? "#f87171" : "rgba(255,255,255,0.25)"} />
              {deadline.text}
            </div>
          )}

          {/* Estimated time */}
          {estTime && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
              }}
            >
              <RiTimeLine size={12} color="rgba(255,255,255,0.25)" />
              {estTime}
            </div>
          )}
        </div>

        {/* Completion progress bar (if in-progress) */}
        {(task.progress !== undefined && task.progress !== null) && (
          <div style={{ marginTop: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                marginBottom: 5,
              }}
            >
              <span>Progress</span>
              <span>{task.progress}%</span>
            </div>
            <div
              style={{
                height: 4,
                borderRadius: 4,
                background: "rgba(255,255,255,0.07)",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(Number(task.progress) || 0, 100)}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                style={{
                  height: "100%",
                  borderRadius: 4,
                  background: priority.bar,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Completed overlay shimmer */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(52,211,153,0.03)",
              pointerEvents: "none",
              borderRadius: 16,
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
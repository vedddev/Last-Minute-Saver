import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiTaskLine, RiAddLine, RiSearchLine, RiFilterLine,
  RiEditLine, RiDeleteBinLine, RiCheckboxCircleLine,
  RiFlag2Line, RiCalendarEventLine, RiTimeLine,
  RiLoader4Line, RiAlertLine, RiInboxLine,
  RiCloseLine, RiMoreLine, RiSaveLine, RiProgress4Line,
} from "react-icons/ri";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
// import TaskCard from "../components/TaskCard";

import taskService from "../services/taskService";

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:      "#080812",
  surface: "rgba(255,255,255,0.03)",
  border:  "rgba(255,255,255,0.07)",
  borderHover: "rgba(255,255,255,0.14)",
  text:    "#fff",
  muted:   "rgba(255,255,255,0.4)",
  faint:   "rgba(255,255,255,0.12)",
};

// ─── Priority config ──────────────────────────────────────────────────────────
const PRIORITY = {
  high:   { label: "High",   color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)"  },
  medium: { label: "Medium", color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)"   },
  low:    { label: "Low",    color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)"   },
};
const DEFAULT_PRIORITY = { label: "Normal", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.25)" };
const getPriority = (raw) => PRIORITY[raw?.toLowerCase()] ?? DEFAULT_PRIORITY;

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  completed:   { label: "Completed",   color: "#34d399", bg: "rgba(52,211,153,0.1)"  },
  done:        { label: "Completed",   color: "#34d399", bg: "rgba(52,211,153,0.1)"  },
  "in-progress":{ label: "In Progress",color: "#60a5fa", bg: "rgba(96,165,250,0.1)"  },
  in_progress: { label: "In Progress", color: "#60a5fa", bg: "rgba(96,165,250,0.1)"  },
  pending:     { label: "Pending",     color: "#fbbf24", bg: "rgba(251,191,36,0.1)"  },
  todo:        { label: "To Do",       color: "#fbbf24", bg: "rgba(251,191,36,0.1)"  },
  overdue:     { label: "Overdue",     color: "#f87171", bg: "rgba(248,113,113,0.1)" },
};
const DEFAULT_STATUS = { label: "Pending", color: "#fbbf24", bg: "rgba(251,191,36,0.1)" };
const getStatus = (raw) => STATUS[raw?.toLowerCase()?.trim()] ?? DEFAULT_STATUS;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDeadline(raw) {
  if (!raw) return null;
  try {
    const d = new Date(raw);
    if (isNaN(d)) return String(raw);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return String(raw); }
}

function isOverdue(raw) {
  if (!raw) return false;
  try { return new Date(raw) < new Date(); } catch { return false; }
}

// ─── Shared components ────────────────────────────────────────────────────────
function Spinner({ size = 28 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 40 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <RiLoader4Line size={size} color="#7c3aed" />
      </motion.div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 48, textAlign: "center" }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <RiAlertLine size={26} color="#f87171" />
      </div>
      <p style={{ fontSize: 14, color: "#f87171", margin: 0 }}>{message}</p>
      {onRetry && (
        <motion.button onClick={onRetry} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{ padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.1)", color: "#f87171", fontSize: 13, cursor: "pointer" }}>
          Retry
        </motion.button>
      )}
    </motion.div>
  );
}

function EmptyState({ filtered }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 56, textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: 18, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <RiInboxLine size={28} color="#a78bfa" />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: T.muted, margin: 0 }}>
        {filtered ? "No tasks match your filters" : "No tasks yet"}
      </p>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", margin: 0 }}>
        {filtered ? "Try adjusting your search or filter." : "Click 'Add Task' to create your first task."}
      </p>
    </motion.div>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
const EMPTY_FORM = { title: "", priority: "medium", status: "pending", deadline: "", estimated_time: "", description: "" };

function TaskModal({ task, onClose, onSave, saving }) {
  const [form, setForm] = useState(task ? {
    title: task.title ?? "",
    priority: task.priority ?? "medium",
    status: task.status ?? "pending",
    deadline: task.deadline ?? task.due_date ?? "",
    estimated_time: task.estimated_time ?? "",
    description: task.description ?? "",
  } : { ...EMPTY_FORM });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const isEdit = !!task;

  const inputStyle = {
    width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px",
    color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit",
  };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: T.muted, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, display: "block" };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
      <motion.div initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 20 }}
        style={{ width: "100%", maxWidth: 500, background: "rgba(12,12,26,0.98)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 22, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "linear-gradient(135deg,rgba(124,58,237,0.08),rgba(59,130,246,0.05))" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {isEdit ? <RiEditLine size={16} color="#a78bfa" /> : <RiAddLine size={16} color="#a78bfa" />}
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{isEdit ? "Edit Task" : "New Task"}</span>
          </div>
          <motion.button onClick={onClose} whileHover={{ scale: 1.1 }} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex" }}>
            <RiCloseLine size={20} />
          </motion.button>
        </div>

        {/* Form */}
        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Task title..." style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Priority</label>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />
            </div>
            <div>
              <label style={labelStyle}>Est. Time (mins)</label>
              <input type="number" value={form.estimated_time} onChange={(e) => set("estimated_time", e.target.value)} placeholder="90" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional notes..." rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "0 24px 22px" }}>
          <motion.button onClick={onClose} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ padding: "9px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: T.muted, fontSize: 13, cursor: "pointer" }}>
            Cancel
          </motion.button>
          <motion.button onClick={() => onSave(form)} disabled={!form.title.trim() || saving} whileHover={form.title.trim() && !saving ? { scale: 1.03 } : {}} whileTap={form.title.trim() && !saving ? { scale: 0.97 } : {}}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 22px", borderRadius: 10, border: "none", background: form.title.trim() && !saving ? "linear-gradient(135deg,#7c3aed,#3b82f6)" : "rgba(255,255,255,0.07)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: form.title.trim() && !saving ? "pointer" : "default", boxShadow: form.title.trim() && !saving ? "0 4px 16px rgba(124,58,237,0.3)" : "none" }}>
            {saving ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RiLoader4Line size={15} /></motion.div> : <RiSaveLine size={15} />}
            {isEdit ? "Save Changes" : "Add Task"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, onEdit, onDelete, onComplete, index }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const p = getPriority(task.priority);
  const s = getStatus(task.status);
  const deadline = formatDeadline(task.deadline ?? task.due_date);
  const overdue = isOverdue(task.deadline ?? task.due_date);
  const isDone = ["completed", "done"].includes(task.status?.toLowerCase());

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)} onHoverEnd={() => { setHovered(false); setMenuOpen(false); }}
      whileHover={{ y: -2 }}
      style={{ position: "relative", background: T.surface, border: `1px solid ${hovered ? p.border : T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: hovered ? `0 8px 32px ${p.color}18` : "none", transition: "border-color 0.2s, box-shadow 0.2s" }}
    >
      {/* Priority top stripe */}
      <div style={{ height: 3, background: `linear-gradient(90deg,${p.color},transparent)`, opacity: hovered ? 1 : 0.5, transition: "opacity 0.2s" }} />

      <div style={{ padding: "16px 16px 14px" }}>
        {/* Row 1: title + menu */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: isDone ? T.muted : T.text, margin: 0, lineHeight: 1.4, textDecoration: isDone ? "line-through" : "none", flex: 1 }}>
            {task.title ?? task.name ?? "Untitled"}
          </h3>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <motion.button onClick={() => setMenuOpen((v) => !v)} animate={{ opacity: hovered ? 1 : 0 }}
              style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: menuOpen ? "rgba(255,255,255,0.08)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.muted }}>
              <RiMoreLine size={16} />
            </motion.button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div initial={{ opacity: 0, scale: 0.93, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93 }}
                  style={{ position: "absolute", top: 32, right: 0, width: 158, background: "rgba(14,14,28,0.97)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.5)", zIndex: 10 }}>
                  {[
                    { icon: RiCheckboxCircleLine, label: "Mark Complete", color: "#34d399", action: () => { onComplete(task); setMenuOpen(false); } },
                    { icon: RiEditLine,           label: "Edit",          color: T.muted,    action: () => { onEdit(task);    setMenuOpen(false); } },
                    { icon: RiDeleteBinLine,       label: "Delete",        color: "#f87171",  action: () => { onDelete(task);  setMenuOpen(false); } },
                  ].map(({ icon: Icon, label, color, action }) => (
                    <motion.button key={label} onClick={action} whileHover={{ background: "rgba(255,255,255,0.06)" }}
                      style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "9px 13px", border: "none", background: "transparent", color, fontSize: 12, cursor: "pointer" }}>
                      <Icon size={14} />{label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: p.color, background: p.bg, border: `1px solid ${p.border}`, borderRadius: 6, padding: "2px 8px" }}>
            <RiFlag2Line size={9} />{p.label}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: s.color, background: s.bg, borderRadius: 6, padding: "2px 8px" }}>
            {s.label}
          </span>
        </div>

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          {deadline && (
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: overdue && !isDone ? "#f87171" : T.muted }}>
              <RiCalendarEventLine size={12} />{deadline}{overdue && !isDone && " · Overdue"}
            </span>
          )}
          {task.estimated_time && (
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: T.muted }}>
              <RiTimeLine size={12} />{task.estimated_time}m
            </span>
          )}
        </div>

        {/* Progress bar */}
        {task.progress !== undefined && task.progress !== null && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
              <span>Progress</span><span>{task.progress}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${task.progress}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg,${p.color},${p.color}aa)` }} />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <AnimatePresence>
          {hovered && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {!isDone && (
                <motion.button onClick={() => onComplete(task)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.08)", color: "#34d399", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                  <RiCheckboxCircleLine size={13} />Complete
                </motion.button>
              )}
              <motion.button onClick={() => onEdit(task)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: T.muted, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                <RiEditLine size={13} />Edit
              </motion.button>
              <motion.button onClick={() => onDelete(task)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(248,113,113,0.25)", background: "rgba(248,113,113,0.07)", color: "#f87171", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                <RiDeleteBinLine size={13} />Delete
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Tasks page ───────────────────────────────────────────────────────────────
const FILTERS = ["All", "Pending", "In Progress", "Completed", "High Priority"];

export default function Tasks() {
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("All");
  const [modal, setModal]       = useState(null);  // null | "add" | task object
  const [saving, setSaving]     = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };

  const fetchTasks = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await taskService.getTasks();
      const data = res.data;
      setTasks(Array.isArray(data) ? data : data?.tasks ?? data?.data ?? []);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load tasks.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal === "add") {
        await taskService.addTask(form);
        showToast("Task created.");
      } else {
        await taskService.updateTask(modal.id, form);
        showToast("Task updated.");
      }
      setModal(null);
      fetchTasks();
    } catch (e) {
      showToast(e?.response?.data?.message ?? "Save failed.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (task) => {
    try {
      await taskService.deleteTask(task.id);
      setTasks((t) => t.filter((x) => x.id !== task.id));
      showToast("Task deleted.");
    } catch { showToast("Delete failed."); }
  };

  const handleComplete = async (task) => {
    try {
      await taskService.updateTask(task.id, { ...task, status: "completed" });
      setTasks((t) => t.map((x) => x.id === task.id ? { ...x, status: "completed" } : x));
      showToast("Task marked complete.");
    } catch { showToast("Update failed."); }
  };

  // Filter + search
  const visible = tasks.filter((t) => {
    const title = (t.title ?? t.name ?? "").toLowerCase();
    if (search && !title.includes(search.toLowerCase())) return false;
    if (filter === "All") return true;
    if (filter === "High Priority") return t.priority?.toLowerCase() === "high";
    if (filter === "Pending")     return ["pending","todo"].includes(t.status?.toLowerCase());
    if (filter === "In Progress") return ["in-progress","in_progress","active"].includes(t.status?.toLowerCase());
    if (filter === "Completed")   return ["completed","done"].includes(t.status?.toLowerCase());
    return true;
  });

  const isFiltered = search || filter !== "All";

  const counts = {
    total:     tasks.length,
    completed: tasks.filter((t) => ["completed","done"].includes(t.status?.toLowerCase())).length,
    pending:   tasks.filter((t) => ["pending","todo"].includes(t.status?.toLowerCase())).length,
    high:      tasks.filter((t) => t.priority?.toLowerCase() === "high").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter',system-ui,sans-serif", display: "flex" }}>
      <Sidebar onWidthChange={setSidebarWidth} />

      <div style={{ flex: 1, marginLeft: sidebarWidth, transition: "margin-left 0.28s ease", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar sidebarWidth={sidebarWidth} />

        <main style={{ flex: 1, padding: "88px 28px 40px" }}>
          {/* Page header */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 13, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <RiTaskLine size={21} color="#a78bfa" />
                </div>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Tasks</h1>
                  <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>{counts.total} total · {counts.completed} done · {counts.pending} pending</p>
                </div>
              </div>
              <motion.button onClick={() => setModal("add")} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#7c3aed,#3b82f6)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(124,58,237,0.35)" }}>
                <RiAddLine size={17} />Add Task
              </motion.button>
            </div>
          </motion.div>

          {/* Stat pills */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
            {[
              { label: "Total",     val: counts.total,     color: "#a78bfa" },
              { label: "Completed", val: counts.completed, color: "#34d399" },
              { label: "Pending",   val: counts.pending,   color: "#fbbf24" },
              { label: "High",      val: counts.high,      color: "#f87171" },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10, background: T.surface, border: `1px solid ${T.border}` }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
                <span style={{ fontSize: 12, color: T.muted }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{val}</span>
              </div>
            ))}
          </motion.div>

          {/* Search + Filters */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            {/* Search */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 200, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 11, padding: "9px 14px" }}>
              <RiSearchLine size={15} color={T.muted} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..."
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: T.text, fontSize: 13, fontFamily: "inherit" }} />
              {search && (
                <motion.button onClick={() => setSearch("")} whileHover={{ scale: 1.1 }} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex" }}>
                  <RiCloseLine size={15} />
                </motion.button>
              )}
            </div>
            {/* Filter chips */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FILTERS.map((f) => (
                <motion.button key={f} onClick={() => setFilter(f)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ padding: "7px 14px", borderRadius: 9, border: `1px solid ${filter === f ? "rgba(124,58,237,0.5)" : T.border}`, background: filter === f ? "rgba(124,58,237,0.2)" : T.surface, color: filter === f ? "#c4b5fd" : T.muted, fontSize: 12, fontWeight: filter === f ? 600 : 400, cursor: "pointer", transition: "all 0.2s" }}>
                  {f}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Task grid */}
          {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={fetchTasks} /> : (
            <AnimatePresence mode="popLayout">
              {visible.length === 0 ? (
                <EmptyState filtered={isFiltered} />
              ) : (
                <motion.div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
                  {visible.map((task, i) => (
                    <TaskCard key={task.id ?? i} task={task} index={i} onEdit={(t) => setModal(t)} onDelete={handleDelete} onComplete={handleComplete} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && <TaskModal task={modal === "add" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} saving={saving} />}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "rgba(20,20,36,0.97)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "11px 22px", fontSize: 13, color: T.text, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 300, backdropFilter: "blur(12px)", whiteSpace: "nowrap" }}>
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
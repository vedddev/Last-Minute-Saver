import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  RiCalendarLine,
  RiTimeLine,
  RiFlag2Line,
  RiRobot2Line,
  RiLoader4Line,
  RiAlertLine,
  RiRefreshLine,
  RiCheckboxCircleLine,
  RiSunLine,
  RiMoonLine,
  RiInboxLine,
  RiSparklingLine,
  RiCalendar2Line,
  RiArrowLeftLine,
  RiArrowRightLine,
} from "react-icons/ri";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ScheduleTimeline from "../components/ScheduleTimeline";

import aiService from "../services/aiService";

const T = {
  bg: "#080812", surface: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.07)", text: "#fff", muted: "rgba(255,255,255,0.4)",
};

const PRIORITY_COLOR = { high: "#f87171", medium: "#fbbf24", low: "#34d399" };
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const PERIOD_META = {
  morning:   { label: "Morning",   icon: RiSunLine, color: "#fbbf24" },
  afternoon: { label: "Afternoon", icon: RiSunLine,     color: "#f97316" },
  evening:   { label: "Evening",   icon: RiMoonLine,    color: "#a78bfa" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getWeekDays(anchor) {
  const d = new Date(anchor);
  const day = d.getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d); x.setDate(d.getDate() - day + i); return x;
  });
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function fmtDate(d) { return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }

function parseTime(raw) {
  if (!raw) return null;
  const d = new Date(raw); if (!isNaN(d)) return d;
  const m = String(raw).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (m) { const now = new Date(); let h = +m[1], min = +m[2]; if (m[3]?.toUpperCase() === "PM" && h < 12) h += 12; if (m[3]?.toUpperCase() === "AM" && h === 12) h = 0; now.setHours(h, min, 0, 0); return now; }
  return null;
}

function fmtTime(raw) { const d = parseTime(raw); return d ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : String(raw ?? ""); }

function getHour(raw) { const d = parseTime(raw); return d ? d.getHours() : null; }

function getPeriod(h) { if (h === null) return "morning"; if (h < 12) return "morning"; if (h < 17) return "afternoon"; return "evening"; }

function normaliseItems(raw) {

  let arr = [];

  if (Array.isArray(raw)) {
    arr = raw;
  } else if (Array.isArray(raw?.timeline)) {
    arr = raw.timeline;
  } else if (Array.isArray(raw?.schedule?.timeline)) {
    arr = raw.schedule.timeline;
  } else if (Array.isArray(raw?.tasks)) {
    arr = raw.tasks;
  } else if (Array.isArray(raw?.events)) {
    arr = raw.events;
  }

  return arr.map((item, i) => ({
    id: item.id ?? i,
    title: item.title ?? item.task ?? item.name ?? `Task ${i + 1}`,
    start: item.start_time ?? item.start ?? item.time,
    end: item.end_time ?? item.end,
    priority: item.priority,
    status: item.status,
    description: item.description ?? item.notes
  }));
}

// ─── Weekly mini-calendar ─────────────────────────────────────────────────────
function WeekStrip({ anchor, selected, onSelect, onPrev, onNext }) {
  const days = getWeekDays(anchor);
  const today = new Date();
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: "16px 18px", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <RiCalendar2Line size={16} color="#60a5fa" />
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
            {days[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {days[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[{ icon: RiArrowLeftLine, action: onPrev }, { icon: RiArrowRightLine, action: onNext }].map(({ icon: Icon, action }, i) => (
            <motion.button key={i} onClick={action} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.93 }}
              style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, cursor: "pointer", color: T.muted, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={14} />
            </motion.button>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
        {days.map((d, i) => {
          const isToday   = isSameDay(d, today);
          const isSel     = isSameDay(d, selected);
          return (
            <motion.button key={i} onClick={() => onSelect(d)} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 4px", borderRadius: 12, border: `1px solid ${isSel ? "rgba(124,58,237,0.5)" : isToday ? "rgba(96,165,250,0.3)" : "transparent"}`, background: isSel ? "rgba(124,58,237,0.2)" : isToday ? "rgba(96,165,250,0.08)" : "transparent", cursor: "pointer" }}>
              <span style={{ fontSize: 10, color: isSel ? "#c4b5fd" : T.muted, fontWeight: 600, textTransform: "uppercase" }}>{DAY_NAMES[d.getDay()]}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: isSel ? "#fff" : isToday ? "#60a5fa" : "rgba(255,255,255,0.7)" }}>{d.getDate()}</span>
              {isToday && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#60a5fa" }} />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Timeline item ─────────────────────────────────────────────────────────────
function TimelineItem({ item, index, isFirst, isLast }) {
  const [open, setOpen] = useState(false);
  const pc = PRIORITY_COLOR[item.priority?.toLowerCase()] ?? "#60a5fa";
  const isDone = ["completed","done"].includes(item.status?.toLowerCase());
  const startStr = fmtTime(item.start);
  const endStr   = item.end ? fmtTime(item.end) : null;

  return (
    <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06, duration: 0.35 }}
      style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
      {/* Rail */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 22, flexShrink: 0 }}>
        <div style={{ width: 2, background: isFirst ? "transparent" : "rgba(255,255,255,0.07)", minHeight: 12, flex: isFirst ? "0 0 12px" : 1 }} />
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: index * 0.06 + 0.1, type: "spring" }}
          style={{ width: 12, height: 12, borderRadius: "50%", background: pc, boxShadow: `0 0 0 3px ${pc}20`, flexShrink: 0 }} />
        <div style={{ width: 2, background: isLast ? "transparent" : "rgba(255,255,255,0.07)", flex: 1, minHeight: 12 }} />
      </div>

      {/* Card */}
      <motion.div onClick={() => item.description && setOpen((v) => !v)} whileHover={{ x: 2 }}
        style={{ flex: 1, marginBottom: isLast ? 0 : 12, background: T.surface, border: `1px solid ${open ? `${pc}40` : T.border}`, borderRadius: 14, overflow: "hidden", cursor: item.description ? "pointer" : "default", borderLeft: `3px solid ${pc}` }}>
        <div style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: isDone ? T.muted : T.text, margin: 0, textDecoration: isDone ? "line-through" : "none", lineHeight: 1.4 }}>{item.title}</h4>
            {isDone && <RiCheckboxCircleLine size={15} color="#34d399" style={{ flexShrink: 0 }} />}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {item.start && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: T.muted }}>
                <RiTimeLine size={12} />{startStr}{endStr ? ` → ${endStr}` : ""}
              </span>
            )}
            {item.priority && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: pc, background: `${pc}12`, borderRadius: 5, padding: "2px 7px" }}>
                <RiFlag2Line size={9} />{item.priority}
              </span>
            )}
          </div>
          <AnimatePresence>
            {open && item.description && (
              <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "10px 0 0", lineHeight: 1.65, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10, overflow: "hidden" }}>
                {item.description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Free time slot ───────────────────────────────────────────────────────────
function FreeSlot({ label }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 22 }}>
        <div style={{ width: 2, background: "rgba(255,255,255,0.05)", flex: 1, minHeight: 12 }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", border: "1.5px dashed rgba(255,255,255,0.15)" }} />
        <div style={{ width: 2, background: "rgba(255,255,255,0.05)", flex: 1, minHeight: 12 }} />
      </div>
      <div style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: "1px dashed rgba(255,255,255,0.08)", marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>🌿 {label}</span>
      </div>
    </div>
  );
}

// ─── Main Schedule page ───────────────────────────────────────────────────────
export default function Schedule() {
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [anchor, setAnchor]     = useState(new Date());
  const [selected, setSelected] = useState(new Date());

  const fetch = async () => {
    setLoading(true); setError(null);
    try {
      const res = await aiService.schedule({
    available_hours: [8, 8, 8, 8, 8]
    });
      setSchedule(res.data);
    } catch (e) { setError(e?.response?.data?.message ?? "Failed to load schedule."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [selected]);

  const shiftWeek = (dir) => {
    const d = new Date(anchor); d.setDate(d.getDate() + dir * 7);
    setAnchor(d);
  };
  console.log("Schedule State:", schedule);
  const items = normaliseItems(schedule);

  // Group by period
  const groups = { morning: [], afternoon: [], evening: [] };
  items.forEach((item) => { const period = getPeriod(getHour(item.start)); groups[period].push(item); });

  const completed = items.filter((i) => ["completed","done"].includes(i.status?.toLowerCase())).length;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter',system-ui,sans-serif", display: "flex" }}>
      <Sidebar onWidthChange={setSidebarWidth} />
      <div style={{ flex: 1, marginLeft: sidebarWidth, transition: "margin-left 0.28s ease" }}>
        <Navbar sidebarWidth={sidebarWidth} />
        <main style={{ padding: "88px 28px 48px" }}>
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 13, background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <RiCalendarLine size={21} color="#60a5fa" />
              </div>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Schedule</h1>
                <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>
                  {selected.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  {items.length > 0 && ` · ${completed}/${items.length} done`}
                </p>
              </div>
            </div>
            <motion.button onClick={fetch} disabled={loading} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.1)", color: "#a78bfa", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <RiRobot2Line size={15} />AI Refresh
            </motion.button>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr minmax(0,420px)", gap: 22, alignItems: "start" }}>
            {/* Left — calendar + timeline */}
            <div>
              <WeekStrip anchor={anchor} selected={selected} onSelect={setSelected} onPrev={() => shiftWeek(-1)} onNext={() => shiftWeek(1)} />

              {/* Timeline */}
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, overflow: "hidden" }}>
                {/* Timeline header */}
                <div style={{ padding: "16px 18px", borderBottom: `1px solid ${T.border}`, background: "linear-gradient(135deg,rgba(96,165,250,0.06),rgba(124,58,237,0.04))", display: "flex", alignItems: "center", gap: 10 }}>
                  <RiTimeLine size={16} color="#60a5fa" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Daily Timeline</span>
                  {items.length > 0 && (
                    <span style={{ fontSize: 11, color: T.muted, background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "2px 8px" }}>{items.length} events</span>
                  )}
                </div>

                <div style={{ padding: "18px 18px 10px" }}>
                  {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <RiLoader4Line size={28} color="#7c3aed" />
                      </motion.div>
                    </div>
                  ) : error ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: 32, textAlign: "center" }}>
                      <RiAlertLine size={28} color="#f87171" />
                      <p style={{ fontSize: 13, color: "#f87171", margin: 0 }}>{error}</p>
                      <motion.button onClick={fetch} whileHover={{ scale: 1.04 }} style={{ padding: "7px 16px", borderRadius: 9, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.08)", color: "#f87171", fontSize: 12, cursor: "pointer" }}>Retry</motion.button>
                    </div>
                  ) : items.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: 40, textAlign: "center" }}>
                      <RiInboxLine size={32} color={T.muted} />
                      <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>No events scheduled for this day.</p>
                    </div>
                  ) : (
                    Object.entries(groups).map(([period, periodItems]) => {
                      if (!periodItems.length) return null;
                      const meta = PERIOD_META[period];
                      const Icon = meta.icon;
                      let globalIdx = 0;
                      Object.keys(groups).forEach((p) => { if (p < period) globalIdx += groups[p].length; });
                      return (
                        <div key={period} style={{ marginBottom: 20 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                            <Icon size={14} color={meta.color} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: meta.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{meta.label}</span>
                            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                          </div>
                          {periodItems.map((item, gi) => (
                            <TimelineItem key={item.id} item={item} index={globalIdx + gi} isFirst={gi === 0} isLast={gi === periodItems.length - 1} />
                          ))}
                          {period !== "evening" && <FreeSlot label={`Free time before ${period === "morning" ? "afternoon" : "evening"}`} />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right — upcoming + AI badge */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* AI badge */}
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(59,130,246,0.08))", border: "1px solid rgba(124,58,237,0.22)", borderRadius: 16, padding: "16px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <motion.div animate={{ boxShadow: ["0 0 0 0 rgba(124,58,237,0)","0 0 0 8px rgba(124,58,237,0.1)","0 0 0 0 rgba(124,58,237,0)"] }} transition={{ duration: 2.5, repeat: Infinity }}
                  style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,#7c3aed,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <RiRobot2Line size={19} color="#fff" />
                </motion.div>
                <div>
                  <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>AI Schedule</div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.65 }}>
                    {schedule?.message ?? schedule?.summary ?? schedule?.insight ?? "Your AI-generated schedule is displayed on the left. Click a card to expand details."}
                  </p>
                </div>
              </motion.div>

              {/* Upcoming events */}
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, overflow: "hidden" }}>
                <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                  <RiSparklingLine size={15} color="#fbbf24" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Upcoming</span>
                </div>
                <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {loading ? (
                    <div style={{ padding: 20, display: "flex", justifyContent: "center" }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RiLoader4Line size={20} color="#7c3aed" /></motion.div>
                    </div>
                  ) : items.length === 0 ? (
                    <p style={{ fontSize: 12, color: T.muted, margin: 0, textAlign: "center", padding: "12px 0" }}>No upcoming events</p>
                  ) : (
                    items.slice(0, 5).map((item, i) => {
                      const pc = PRIORITY_COLOR[item.priority?.toLowerCase()] ?? "#60a5fa";
                      return (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 11, background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border}` }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: pc, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: T.text, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</p>
                            {item.start && <p style={{ fontSize: 10, color: T.muted, margin: 0 }}>{fmtTime(item.start)}</p>}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>

              {/* Progress summary */}
              {items.length > 0 && (
                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28 }}
                  style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: "16px 18px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 10 }}>TODAY'S PROGRESS</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.muted, marginBottom: 6 }}>
                    <span>{completed} completed</span><span>{items.length} total</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 6, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${items.length ? (completed / items.length) * 100 : 0}%` }} transition={{ duration: 0.9, ease: "easeOut" }}
                      style={{ height: "100%", borderRadius: 6, background: "linear-gradient(90deg,#7c3aed,#3b82f6)" }} />
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>{items.length ? Math.round((completed / items.length) * 100) : 0}% done</div>
                </motion.div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
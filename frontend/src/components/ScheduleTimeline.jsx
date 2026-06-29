import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCalendarLine,
  RiTimeLine,
  RiFlag2Line,
  RiCheckboxCircleLine,
  RiLoader4Line,
  RiPauseLine,
  RiAlertLine,
  RiArrowDownSLine,
  RiMoonLine,
  RiSunLine,
  RiSparklingLine,
} from "react-icons/ri";

// ─── Priority config ──────────────────────────────────────────────────────────
const PRIORITY = {
  high:   { label: "High",   color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.28)", dot: "#ef4444", bar: "linear-gradient(180deg,#ef4444,#f87171)" },
  medium: { label: "Medium", color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.28)",  dot: "#d97706", bar: "linear-gradient(180deg,#d97706,#fbbf24)" },
  low:    { label: "Low",    color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.28)",  dot: "#10b981", bar: "linear-gradient(180deg,#059669,#34d399)" },
};

const DEFAULT_PRIORITY = {
  label: "Normal", color: "#60a5fa", bg: "rgba(96,165,250,0.12)",
  border: "rgba(96,165,250,0.22)", dot: "#3b82f6", bar: "linear-gradient(180deg,#2563eb,#60a5fa)",
};

function getPriority(raw) {
  if (!raw) return DEFAULT_PRIORITY;
  return PRIORITY[raw.toString().toLowerCase()] ?? DEFAULT_PRIORITY;
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  completed:   { label: "Done",        color: "#34d399", icon: RiCheckboxCircleLine },
  done:        { label: "Done",        color: "#34d399", icon: RiCheckboxCircleLine },
  "in-progress":{ label: "In Progress",color: "#60a5fa", icon: RiLoader4Line        },
  in_progress: { label: "In Progress", color: "#60a5fa", icon: RiLoader4Line        },
  active:      { label: "In Progress", color: "#60a5fa", icon: RiLoader4Line        },
  pending:     { label: "Pending",     color: "#fbbf24", icon: RiPauseLine          },
  todo:        { label: "To Do",       color: "#fbbf24", icon: RiPauseLine          },
  overdue:     { label: "Overdue",     color: "#f87171", icon: RiAlertLine          },
  blocked:     { label: "Blocked",     color: "#f87171", icon: RiAlertLine          },
};

const DEFAULT_STATUS = { label: "Scheduled", color: "#a78bfa", icon: RiCalendarLine };

function getStatus(raw) {
  if (!raw) return DEFAULT_STATUS;
  return STATUS[raw.toString().toLowerCase().trim()] ?? DEFAULT_STATUS;
}

// ─── Time helpers ─────────────────────────────────────────────────────────────
function parseTime(raw) {
  if (!raw) return null;
  if (raw instanceof Date) return raw;
  const d = new Date(raw);
  if (!isNaN(d)) return d;
  // Handle "HH:MM" or "HH:MM AM/PM"
  const match = String(raw).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match) {
    const now = new Date();
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === "PM" && h < 12) h += 12;
    if (meridiem === "AM" && h === 12) h = 0;
    now.setHours(h, m, 0, 0);
    return now;
  }
  return null;
}

function formatTimeStr(raw) {
  const d = parseTime(raw);
  if (!d) return String(raw ?? "");
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function getDuration(start, end) {
  const s = parseTime(start);
  const e = parseTime(end);
  if (!s || !e) return null;
  const diffMin = Math.round((e - s) / 60000);
  if (diffMin <= 0) return null;
  if (diffMin < 60) return `${diffMin}m`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function getHour(raw) {
  const d = parseTime(raw);
  return d ? d.getHours() : null;
}

// ─── Period buckets ───────────────────────────────────────────────────────────
function getPeriod(hour) {
  if (hour === null) return "anytime";
  if (hour < 6)  return "night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

const PERIOD_META = {
  morning:   { label: "Morning",   icon: RiSunLine,  color: "#fbbf24", bg: "rgba(251,191,36,0.08)"  },
  afternoon: { label: "Afternoon", icon: RiSunLine,      color: "#f97316", bg: "rgba(249,115,22,0.08)"  },
  evening:   { label: "Evening",   icon: RiMoonLine,     color: "#a78bfa", bg: "rgba(167,139,250,0.08)" },
  night:     { label: "Night",     icon: RiMoonLine,     color: "#60a5fa", bg: "rgba(96,165,250,0.08)"  },
  anytime:   { label: "Scheduled", icon: RiCalendarLine, color: "#60a5fa", bg: "rgba(96,165,250,0.08)"  },
};

const PERIOD_ORDER = ["morning", "afternoon", "evening", "night", "anytime"];

// ─── Normalise one schedule item ──────────────────────────────────────────────
function normaliseItem(item, i) {
  if (typeof item === "string") {
    return { id: i, title: item, start: null, end: null, priority: null, status: null, description: null };
  }
  return {
    id:          item.id ?? i,
    title:       item.title ?? item.task ?? item.name ?? item.event ?? `Task ${i + 1}`,
    start:       item.start_time ?? item.start ?? item.time ?? item.scheduled_time ?? null,
    end:         item.end_time   ?? item.end   ?? item.end_time ?? null,
    priority:    item.priority   ?? null,
    status:      item.status     ?? null,
    description: item.description ?? item.notes ?? null,
  };
}

// ─── Timeline connector dot ───────────────────────────────────────────────────
function ConnectorDot({ priority, isFirst, isLast, isActive }) {
  const p = getPriority(priority);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
      {/* Top rail */}
      <div style={{
        width: 2,
        flex: isFirst ? "0 0 12px" : 1,
        background: isFirst ? "transparent" : "rgba(255,255,255,0.07)",
        minHeight: isFirst ? 12 : 20,
      }} />

      {/* Dot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          width: isActive ? 14 : 10,
          height: isActive ? 14 : 10,
          borderRadius: "50%",
          background: p.dot,
          boxShadow: isActive ? `0 0 0 4px ${p.dot}25` : "none",
          flexShrink: 0,
          zIndex: 1,
          transition: "width 0.2s, height 0.2s, box-shadow 0.2s",
        }}
      />

      {/* Bottom rail */}
      <div style={{
        width: 2,
        flex: 1,
        background: isLast ? "transparent" : "rgba(255,255,255,0.07)",
        minHeight: isLast ? 0 : 20,
      }} />
    </div>
  );
}

// ─── Single timeline item ─────────────────────────────────────────────────────
function TimelineItem({ item, index, isFirst, isLast, delay }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const p = getPriority(item.priority);
  const s = getStatus(item.status);
  const StatusIcon = s.icon;
  const startStr = formatTimeStr(item.start);
  const endStr   = formatTimeStr(item.end);
  const duration = getDuration(item.start, item.end);
  const hour     = getHour(item.start);
  const isActive = item.status === "in-progress" || item.status === "active" || item.status === "in_progress";

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", gap: 12, alignItems: "stretch" }}
    >
      {/* Rail + dot */}
      <ConnectorDot priority={item.priority} isFirst={isFirst} isLast={isLast} isActive={isActive} />

      {/* Card */}
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ x: 3 }}
        transition={{ duration: 0.2 }}
        style={{
          flex: 1,
          marginBottom: isLast ? 0 : 12,
          background: hovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${hovered ? p.border : "rgba(255,255,255,0.07)"}`,
          borderRadius: 14,
          overflow: "hidden",
          cursor: item.description ? "pointer" : "default",
          transition: "background 0.2s, border-color 0.2s",
          boxShadow: hovered ? `0 6px 28px ${p.color}18` : "none",
        }}
        onClick={() => item.description && setExpanded((v) => !v)}
      >
        {/* Priority left stripe */}
        <div style={{
          position: "absolute",
          left: 0, top: 0, bottom: 0,
          width: 3,
          background: p.bar,
          borderRadius: "3px 0 0 3px",
        }} />

        <div style={{ padding: "13px 14px 13px 17px", position: "relative" }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                {/* Active pulse */}
                {isActive && (
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa", flexShrink: 0 }}
                  />
                )}
                <h4 style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: item.status === "completed" || item.status === "done"
                    ? "rgba(255,255,255,0.35)"
                    : "#fff",
                  margin: 0,
                  lineHeight: 1.4,
                  textDecoration: item.status === "completed" || item.status === "done" ? "line-through" : "none",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}>
                  {item.title}
                </h4>
              </div>
            </div>

            {/* Expand arrow */}
            {item.description && (
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.22 }}
                style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0, display: "flex" }}
              >
                <RiArrowDownSLine size={16} />
              </motion.div>
            )}
          </div>

          {/* Meta row */}
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            {/* Time range */}
            {(item.start || item.end) && (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <RiTimeLine size={12} color="rgba(255,255,255,0.3)" />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                  {item.start && startStr}
                  {item.start && item.end && " → "}
                  {item.end && endStr}
                </span>
                {duration && (
                  <span style={{
                    fontSize: 10, color: "rgba(255,255,255,0.25)",
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 5, padding: "1px 6px",
                  }}>
                    {duration}
                  </span>
                )}
              </div>
            )}

            {/* Priority badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 10, fontWeight: 600, color: p.color,
              background: p.bg, border: `1px solid ${p.border}`,
              borderRadius: 6, padding: "2px 7px",
            }}>
              <RiFlag2Line size={9} />
              {p.label}
            </div>

            {/* Status badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 10, fontWeight: 600, color: s.color,
              background: `${s.color}12`, borderRadius: 6, padding: "2px 7px",
            }}>
              <StatusIcon size={9} />
              {s.label}
            </div>
          </div>

          {/* Expandable description */}
          <AnimatePresence initial={false}>
            {expanded && item.description && (
              <motion.div
                key="desc"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                style={{ overflow: "hidden" }}
              >
                <p style={{
                  fontSize: 12, color: "rgba(255,255,255,0.4)",
                  lineHeight: 1.65, margin: "10px 0 0",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  paddingTop: 10,
                }}>
                  {item.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Period group header ──────────────────────────────────────────────────────
function PeriodHeader({ period, count, delay }) {
  const meta = PERIOD_META[period] ?? PERIOD_META.anytime;
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 10,
        marginTop: 4,
      }}
    >
      <div style={{
        width: 26, height: 26, borderRadius: 8,
        background: meta.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={14} color={meta.color} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: meta.color, textTransform: "capitalize" }}>
        {meta.label}
      </span>
      <span style={{
        fontSize: 10, color: "rgba(255,255,255,0.25)",
        background: "rgba(255,255,255,0.06)",
        borderRadius: 5, padding: "1px 7px",
      }}>
        {count} {count === 1 ? "task" : "tasks"}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 12, padding: "40px 20px", textAlign: "center",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 16,
        background: "rgba(96,165,250,0.1)",
        border: "1px solid rgba(96,165,250,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <RiCalendarLine size={24} color="#60a5fa" />
      </div>
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)", margin: "0 0 4px" }}>
          No schedule yet
        </p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: 0, lineHeight: 1.6 }}>
          Use AI Planner to generate your schedule.
        </p>
      </div>
    </div>
  );
}

// ─── Summary bar ─────────────────────────────────────────────────────────────
function SummaryBar({ items }) {
  const total     = items.length;
  const completed = items.filter(i => ["completed","done"].includes(i.status?.toLowerCase())).length;
  const pct       = total ? Math.round((completed / total) * 100) : 0;

  const byPriority = {
    high:   items.filter(i => i.priority?.toLowerCase() === "high").length,
    medium: items.filter(i => i.priority?.toLowerCase() === "medium").length,
    low:    items.filter(i => i.priority?.toLowerCase() === "low").length,
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexWrap: "wrap", gap: 12,
      padding: "12px 16px",
      background: "rgba(255,255,255,0.02)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 160 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 4, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg,#7c3aed,#3b82f6)" }}
          />
        </div>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
          {completed}/{total} done
        </span>
      </div>

      {/* Priority pips */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {Object.entries(byPriority).map(([k, v]) => v > 0 && (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: PRIORITY[k].dot }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{v} {k}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ScheduleTimeline ─────────────────────────────────────────────────────────
export default function ScheduleTimeline({ schedule }) {
  // Normalise input — handle array, object with nested array, or null
  const rawItems = Array.isArray(schedule)
    ? schedule
    : schedule?.schedule   ??
      schedule?.events     ??
      schedule?.tasks      ??
      schedule?.items      ??
      schedule?.timeline   ??
      [];

  const items = rawItems.map(normaliseItem);

  // Group by time period
  const groups = {};
  PERIOD_ORDER.forEach((p) => { groups[p] = []; });

  items.forEach((item) => {
    const hour = getHour(item.start);
    const period = getPeriod(hour);
    groups[period].push(item);
  });

  const activePeriods = PERIOD_ORDER.filter((p) => groups[p].length > 0);

  let globalDelay = 0;
  let globalIndex = 0;

  return (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 20,
      overflow: "hidden",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "linear-gradient(135deg,rgba(124,58,237,0.06),rgba(59,130,246,0.04))",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: "rgba(96,165,250,0.15)",
            border: "1px solid rgba(96,165,250,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <RiCalendarLine size={17} color="#60a5fa" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Schedule Timeline</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 5,
          background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)",
          borderRadius: 8, padding: "3px 10px",
        }}>
          <RiSparklingLine size={11} color="#a78bfa" />
          <span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600 }}>
            {items.length} {items.length === 1 ? "event" : "events"}
          </span>
        </div>
      </div>

      {/* Summary bar */}
      {items.length > 0 && <SummaryBar items={items} />}

      {/* Timeline */}
      <div style={{ padding: "18px 18px 10px" }}>
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          activePeriods.map((period) => {
            const groupItems = groups[period];
            const headerDelay = globalDelay;
            globalDelay += 0.05;

            return (
              <div key={period} style={{ marginBottom: 20 }}>
                <PeriodHeader period={period} count={groupItems.length} delay={headerDelay} />

                <div style={{ position: "relative" }}>
                  {groupItems.map((item, gi) => {
                    const d = globalDelay;
                    const idx = globalIndex;
                    globalDelay += 0.06;
                    globalIndex += 1;

                    return (
                      <TimelineItem
                        key={item.id}
                        item={item}
                        index={idx}
                        isFirst={gi === 0}
                        isLast={gi === groupItems.length - 1}
                        delay={d}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
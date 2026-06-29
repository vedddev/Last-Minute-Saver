import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiRobot2Line,
  RiFocusLine,
  RiFireLine,
  RiLightbulbLine,
  RiListOrdered2,
  RiSparklingLine,
  RiRefreshLine,
  RiArrowDownSLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function extract(obj, keys, fallback = null) {
  if (!obj) return fallback;
  if (typeof obj === "string") return obj;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return fallback;
}

function extractList(obj, keys) {
  if (!obj) return [];
  for (const k of keys) {
    const val = obj[k];
    if (Array.isArray(val) && val.length) return val;
  }
  return [];
}

function stringifyItem(item) {
  if (!item) return "";
  if (typeof item === "string") return item;
  return (
    item.title ??
    item.task ??
    item.step ??
    item.action ??
    item.text ??
    item.message ??
    JSON.stringify(item)
  );
}

// ─── Section config ───────────────────────────────────────────────────────────
const SECTIONS = [
  {
    key: "greeting",
    icon: RiSparklingLine,
    label: "Greeting",
    accent: "#a78bfa",
    bg: "rgba(167,139,250,0.08)",
    border: "rgba(167,139,250,0.18)",
    keys: ["greeting", "hello", "welcome", "intro", "message"],
    list: false,
  },
  {
    key: "focus",
    icon: RiFocusLine,
    label: "Today's Focus",
    accent: "#60a5fa",
    bg: "rgba(96,165,250,0.08)",
    border: "rgba(96,165,250,0.18)",
    keys: ["focus", "today_focus", "daily_focus", "todays_focus", "objective"],
    list: false,
  },
  {
    key: "motivation",
    icon: RiFireLine,
    label: "Motivation",
    accent: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.18)",
    keys: ["motivation", "motivate", "encourage", "encouragement", "quote", "inspire"],
    list: false,
  },
  {
    key: "advice",
    icon: RiLightbulbLine,
    label: "Advice",
    accent: "#34d399",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.18)",
    keys: ["advice", "tip", "tips", "recommendation", "suggestions", "insight"],
    list: false,
  },
  {
    key: "work_order",
    icon: RiListOrdered2,
    label: "Work Order",
    accent: "#f87171",
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.18)",
    keys: [
      "work_order",
      "order",
      "steps",
      "tasks",
      "plan",
      "schedule",
      "priorities",
      "action_items",
      "todo",
    ],
    list: true,
  },
];

// ─── Section block ────────────────────────────────────────────────────────────
function Section({ section, coach, delay, defaultOpen = true }) {
  const { icon: Icon, label, accent, bg, border, keys, list } = section;
  const [open, setOpen] = useState(defaultOpen);

  const rawText = !list ? extract(coach, keys) : null;
  const rawList = list ? extractList(coach, keys) : [];

  const hasContent = list ? rawList.length > 0 : !!rawText;
  if (!hasContent) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "13px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: `${accent}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={14} color={accent} />
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: accent,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          style={{ color: "rgba(255,255,255,0.25)", display: "flex" }}
        >
          <RiArrowDownSLine size={16} />
        </motion.div>
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "2px 16px 16px" }}>
              {!list && rawText && (
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.72)",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {rawText}
                </p>
              )}

              {list && rawList.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {rawList.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: "9px 12px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 6,
                          background: `${accent}20`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 700,
                          color: accent,
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        {i + 1}
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          color: "rgba(255,255,255,0.68)",
                          lineHeight: 1.55,
                          flex: 1,
                        }}
                      >
                        {stringifyItem(item)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Fallback — flat string ───────────────────────────────────────────────────
function FlatMessage({ text }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        padding: "4px 0 8px",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 11,
          background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <RiRobot2Line size={18} color="#fff" />
      </div>
      <p
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.72)",
          lineHeight: 1.7,
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: "32px 16px",
        color: "rgba(255,255,255,0.25)",
      }}
    >
      <RiRobot2Line size={32} />
      <p style={{ fontSize: 13, margin: 0, textAlign: "center", lineHeight: 1.6 }}>
        No coach data available yet.<br />Check back after your tasks are set up.
      </p>
    </div>
  );
}

// ─── CoachCard ────────────────────────────────────────────────────────────────
export default function CoachCard({ coach }) {
  const [refreshKey, setRefreshKey] = useState(0);

  // Detect flat string vs object
  const isFlat = typeof coach === "string";
  const isEmpty = !coach || (typeof coach === "object" && !Object.keys(coach).length);

  // Check if any structured section has data
  const hasSections =
    !isFlat &&
    !isEmpty &&
    SECTIONS.some((s) => {
      if (s.list) return extractList(coach, s.keys).length > 0;
      return !!extract(coach, s.keys);
    });

  return (
    <motion.div
      key={refreshKey}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "relative",
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        overflow: "hidden",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      {/* Glass sheen */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg,rgba(124,58,237,0.07) 0%,rgba(59,130,246,0.04) 50%,transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Top glow bar */}
      <div
        style={{
          height: 2,
          background: "linear-gradient(90deg,#7c3aed,#3b82f6,#7c3aed)",
          backgroundSize: "200% 100%",
          animation: "shimmer 3s linear infinite",
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 20px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          {/* Animated avatar */}
          <motion.div
            animate={{ boxShadow: ["0 0 0 0 rgba(124,58,237,0)", "0 0 0 6px rgba(124,58,237,0.12)", "0 0 0 0 rgba(124,58,237,0)"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 13,
              background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <RiRobot2Line size={22} color="#fff" />
          </motion.div>

          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                background: "linear-gradient(90deg,#c4b5fd,#93c5fd)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.2,
              }}
            >
              Athena Coach
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginTop: 3,
              }}
            >
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#34d399",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11, color: "#34d399", fontWeight: 500 }}>Active</span>
            </div>
          </div>
        </div>

        {/* Refresh hint */}
        <motion.button
          onClick={() => setRefreshKey((k) => k + 1)}
          whileHover={{ rotate: 180, color: "#a78bfa" }}
          transition={{ duration: 0.35 }}
          title="Refresh coach view"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 9,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          <RiRefreshLine size={15} />
        </motion.button>
      </div>

      {/* Body */}
      <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {isEmpty && <EmptyState />}

        {isFlat && !isEmpty && <FlatMessage text={coach} />}

        {hasSections &&
          SECTIONS.map((section, i) => (
            <Section
              key={section.key}
              section={section}
              coach={coach}
              delay={i * 0.07}
              defaultOpen={i < 3}
            />
          ))}

        {/* Fallback: object but no recognised keys — show raw message */}
        {!isFlat && !isEmpty && !hasSections && (
          <FlatMessage
            text={
              coach.message ??
              coach.response ??
              coach.content ??
              coach.text ??
              "Your AI coach is ready. Start adding tasks to get personalised insights."
            }
          />
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "11px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <RiCheckboxCircleLine size={13} color="#34d399" />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
            Personalised to your tasks
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <RiSparklingLine size={12} color="#a78bfa" />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>AI powered</span>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
      `}</style>
    </motion.div>
  );
}
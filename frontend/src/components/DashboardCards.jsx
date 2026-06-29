import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  RiPulseLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiFocusLine,
  RiAlertLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiFireLine,
} from "react-icons/ri";

// ─── Animated counter ─────────────────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (target === null || target === undefined || isNaN(Number(target))) return;
    const start = performance.now();
    const from = 0;
    const to = Number(target);

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return value;
}

// ─── Radial ring (productivity score) ────────────────────────────────────────
function RadialRing({ score, accent }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(Number(score) || 0, 0), 100);
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width={72} height={72} style={{ flexShrink: 0 }}>
      {/* Track */}
      <circle
        cx={36}
        cy={36}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={5}
      />
      {/* Progress */}
      <motion.circle
        cx={36}
        cy={36}
        r={radius}
        fill="none"
        stroke={accent}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ transform: "rotate(-90deg)", transformOrigin: "36px 36px" }}
      />
      {/* Center label */}
      <text
        x={36}
        y={40}
        textAnchor="middle"
        fill="#fff"
        fontSize={13}
        fontWeight={700}
        fontFamily="Inter, system-ui, sans-serif"
      >
        {pct}%
      </text>
    </svg>
  );
}

// ─── Mini sparkline ───────────────────────────────────────────────────────────
function Sparkline({ data = [], color }) {
  if (!data.length) return null;
  const w = 80;
  const h = 28;
  const max = Math.max(...data, 1);
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - (v / max) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />
    </svg>
  );
}

// ─── Card shell ───────────────────────────────────────────────────────────────
function Card({ children, delay = 0, accent = "#7c3aed", glow = false, style = {} }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        position: "relative",
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? `${accent}40` : "rgba(255,255,255,0.07)"}`,
        borderRadius: 18,
        padding: "22px 22px 20px",
        overflow: "hidden",
        cursor: "default",
        transition: "border-color 0.25s, box-shadow 0.25s",
        boxShadow: hovered && glow ? `0 8px 40px ${accent}22` : "none",
        ...style,
      }}
    >
      {/* Gradient orb top-right */}
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      {children}
    </motion.div>
  );
}

// ─── Card: Productivity Score ─────────────────────────────────────────────────
function ProductivityScoreCard({ dashboard, delay }) {
  const accent = "#7c3aed";
  const score =
    dashboard?.productivity_score ??
    dashboard?.score ??
    dashboard?.productivity ??
    0;

  const delta =
    dashboard?.score_delta ??
    dashboard?.productivity_delta ??
    null;

  const sparkData =
    dashboard?.score_history ??
    dashboard?.weekly_scores ??
    [];

  const isUp = delta === null ? null : delta >= 0;

  return (
    <Card delay={delay} accent={accent} glow>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                background: `${accent}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RiPulseLine size={16} color={accent} />
            </div>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
              Productivity Score
            </span>
          </div>

          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", lineHeight: 1, marginBottom: 8 }}>
            {score}
            <span style={{ fontSize: 18, fontWeight: 500, color: "rgba(255,255,255,0.4)", marginLeft: 2 }}>%</span>
          </div>

          {delta !== null && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                color: isUp ? "#34d399" : "#f87171",
                background: isUp ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                borderRadius: 6,
                padding: "2px 8px",
              }}
            >
              {isUp ? <RiArrowUpLine size={12} /> : <RiArrowDownLine size={12} />}
              {Math.abs(delta)}% vs yesterday
            </div>
          )}

          {sparkData.length > 1 && (
            <div style={{ marginTop: 14 }}>
              <Sparkline data={sparkData} color={accent} />
            </div>
          )}
        </div>

        <RadialRing score={score} accent={accent} />
      </div>
    </Card>
  );
}

// ─── Card: Pending Tasks ──────────────────────────────────────────────────────
function PendingTasksCard({ dashboard, delay }) {
  const accent = "#f59e0b";
  const raw =
    dashboard?.pending_tasks ??
    dashboard?.pending ??
    dashboard?.tasks_pending ??
    0;
  const count = useCountUp(raw);
  const sub =
    dashboard?.pending_sub ??
    dashboard?.overdue ??
    null;

  return (
    <Card delay={delay} accent={accent} glow>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: `${accent}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RiTimeLine size={16} color={accent} />
        </div>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
          Pending Tasks
        </span>
      </div>

      <div style={{ fontSize: 42, fontWeight: 800, color: "#fff", lineHeight: 1, marginBottom: 6 }}>
        {count}
      </div>

      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
        {sub !== null
          ? `${sub} overdue`
          : "awaiting completion"}
      </div>

      {/* Progress bar — filled proportion */}
      <div
        style={{
          marginTop: 16,
          height: 4,
          borderRadius: 4,
          background: "rgba(255,255,255,0.07)",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((raw / Math.max(raw + 10, 1)) * 100, 100)}%` }}
          transition={{ delay: delay + 0.3, duration: 0.9, ease: "easeOut" }}
          style={{
            height: "100%",
            borderRadius: 4,
            background: `linear-gradient(90deg, ${accent}, #fbbf24)`,
          }}
        />
      </div>
    </Card>
  );
}

// ─── Card: Completed Tasks ────────────────────────────────────────────────────
function CompletedTasksCard({ dashboard, delay }) {
  const accent = "#34d399";
  const raw =
    dashboard?.completed_today ??
    dashboard?.tasks_completed ??
    dashboard?.completed ??
    0;
  const count = useCountUp(raw);
  const total =
    dashboard?.total_tasks ??
    dashboard?.tasks_total ??
    null;
  const pct = total ? Math.round((raw / total) * 100) : null;

  return (
    <Card delay={delay} accent={accent} glow>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: `${accent}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RiCheckboxCircleLine size={16} color={accent} />
        </div>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
          Completed Today
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 6 }}>
        <div style={{ fontSize: 42, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
          {count}
        </div>
        {total !== null && (
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
            / {total}
          </div>
        )}
      </div>

      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
        {pct !== null ? `${pct}% of total tasks` : "tasks finished"}
      </div>

      {/* Segmented dots */}
      <div style={{ display: "flex", gap: 4, marginTop: 16, flexWrap: "wrap" }}>
        {Array.from({ length: Math.min(total ?? raw, 12) }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.05 * i, duration: 0.25 }}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: i < raw ? accent : "rgba(255,255,255,0.08)",
            }}
          />
        ))}
      </div>
    </Card>
  );
}

// ─── Card: Today's Focus ──────────────────────────────────────────────────────
function TodaysFocusCard({ dashboard, delay }) {
  const accent = "#60a5fa";
  const focus =
    dashboard?.focus ??
    dashboard?.today_focus ??
    dashboard?.daily_focus ??
    null;

  const text =
    !focus
      ? null
      : typeof focus === "string"
      ? focus
      : focus.title ?? focus.task ?? focus.message ?? null;

  const streak =
    dashboard?.streak ??
    dashboard?.streak_days ??
    null;

  return (
    <Card delay={delay} accent={accent} glow>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: `${accent}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RiFocusLine size={16} color={accent} />
        </div>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
          Today's Focus
        </span>
      </div>

      {text ? (
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#fff",
            lineHeight: 1.55,
            margin: "0 0 12px",
          }}
        >
          {text}
        </p>
      ) : (
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: "0 0 12px" }}>
          No focus set for today.
        </p>
      )}

      {streak !== null && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
            fontWeight: 600,
            color: "#fbbf24",
            background: "rgba(251,191,36,0.1)",
            borderRadius: 7,
            padding: "4px 10px",
          }}
        >
          <RiFireLine size={13} />
          {streak}-day streak
        </div>
      )}
    </Card>
  );
}

// ─── Card: High Risk Tasks ────────────────────────────────────────────────────
function HighRiskCard({ dashboard, delay }) {
  const accent = "#f87171";
  const raw =
    dashboard?.high_risk_tasks ??
    dashboard?.high_risk ??
    dashboard?.at_risk ??
    0;
  const count = useCountUp(raw);

  const items =
    dashboard?.high_risk_items ??
    dashboard?.risk_tasks ??
    [];

  const severity =
    raw === 0 ? "safe" : raw <= 2 ? "moderate" : "critical";

  const severityColor = { safe: "#34d399", moderate: "#f59e0b", critical: "#f87171" };
  const severityLabel = { safe: "All clear", moderate: "Monitor closely", critical: "Immediate attention" };

  return (
    <Card delay={delay} accent={accent} glow>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: `${accent}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RiAlertLine size={16} color={accent} />
        </div>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
          High Risk Tasks
        </span>
      </div>

      <div style={{ fontSize: 42, fontWeight: 800, color: raw > 0 ? accent : "#fff", lineHeight: 1, marginBottom: 8 }}>
        {count}
      </div>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontSize: 11,
          fontWeight: 600,
          color: severityColor[severity],
          background: `${severityColor[severity]}15`,
          borderRadius: 7,
          padding: "3px 9px",
          marginBottom: items.length ? 14 : 0,
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: severityColor[severity],
            display: "inline-block",
          }}
        />
        {severityLabel[severity]}
      </div>

      {items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {items.slice(0, 3).map((item, i) => {
            const label =
              typeof item === "string"
                ? item
                : item.title ?? item.name ?? item.task ?? `Task ${i + 1}`;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.1 + i * 0.07 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.55)",
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: "rgba(248,113,113,0.06)",
                  border: "1px solid rgba(248,113,113,0.12)",
                }}
              >
                <RiAlertLine size={11} color={accent} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {label}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ─── DashboardCards ───────────────────────────────────────────────────────────
export default function DashboardCards({ dashboard }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
        width: "100%",
      }}
    >
      <ProductivityScoreCard dashboard={dashboard} delay={0}    />
      <PendingTasksCard       dashboard={dashboard} delay={0.07} />
      <CompletedTasksCard     dashboard={dashboard} delay={0.14} />
      <TodaysFocusCard        dashboard={dashboard} delay={0.21} />
      <HighRiskCard           dashboard={dashboard} delay={0.28} />
    </div>
  );
}
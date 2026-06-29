import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiBarChartLine, RiFireLine, RiCheckboxCircleLine,
  RiTimeLine, RiLoader4Line, RiAlertLine, RiRobot2Line,
  RiTrophyLine, RiCalendarLine, RiRefreshLine,
  RiArrowUpLine, RiArrowDownLine, RiSparklingLine,
  RiPulseLine, RiStarLine, RiLightbulbLine,
} from "react-icons/ri";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import aiService from "../services/aiService";

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#080812",
  surface: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.07)",
  text: "#fff",
  muted: "rgba(255,255,255,0.4)",
};

// ─── Shared components ────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 60 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <RiLoader4Line size={32} color="#7c3aed" />
      </motion.div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: 60, textAlign: "center" }}>
      <div style={{ width: 54, height: 54, borderRadius: 16, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <RiAlertLine size={28} color="#f87171" />
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

// ─── Glass card wrapper ───────────────────────────────────────────────────────
function GlassCard({ children, style = {}, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 18,
        overflow: "hidden",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

function CardHeader({ icon: Icon, title, accent = "#a78bfa", right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${T.border}`, background: `linear-gradient(135deg,${accent}08,transparent)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} color={accent} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{title}</span>
      </div>
      {right}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, accent, delta, delay }) {
  const isUp = delta === null || delta === undefined ? null : delta >= 0;
  return (
    <GlassCard delay={delay} style={{ position: "relative", overflow: "hidden" }}>
      {/* Orb */}
      <div style={{ position: "absolute", top: -24, right: -24, width: 90, height: 90, borderRadius: "50%", background: `radial-gradient(circle,${accent}22 0%,transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ padding: "20px 20px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>{label}</span>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={16} color={accent} />
          </div>
        </div>
        <div style={{ fontSize: 34, fontWeight: 800, color: T.text, lineHeight: 1, marginBottom: 8 }}>{value ?? "—"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {isUp !== null && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, color: isUp ? "#34d399" : "#f87171", background: isUp ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)", borderRadius: 6, padding: "2px 7px" }}>
              {isUp ? <RiArrowUpLine size={11} /> : <RiArrowDownLine size={11} />}{Math.abs(delta)}{typeof delta === "number" && delta < 10 ? "" : ""}
            </span>
          )}
          {sub && <span style={{ fontSize: 11, color: T.muted }}>{sub}</span>}
        </div>
      </div>
    </GlassCard>
  );
}

// ─── Radial score ring ────────────────────────────────────────────────────────
function ScoreRing({ score, accent = "#7c3aed" }) {
  const r = 52, circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(Number(score) || 0, 0), 100);
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={128} height={128} style={{ flexShrink: 0 }}>
      <circle cx={64} cy={64} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
      <motion.circle cx={64} cy={64} r={r} fill="none" stroke={accent} strokeWidth={8} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        style={{ transform: "rotate(-90deg)", transformOrigin: "64px 64px" }}
      />
      <text x={64} y={60} textAnchor="middle" fill="#fff" fontSize={22} fontWeight={800} fontFamily="Inter,sans-serif">{pct}</text>
      <text x={64} y={78} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={11} fontFamily="Inter,sans-serif">/ 100</text>
    </svg>
  );
}

// ─── HTML/CSS Bar chart ───────────────────────────────────────────────────────
function BarChart({ data, label, accent = "#7c3aed", delay = 0 }) {
  const vals = data.map((d) => (typeof d === "number" ? d : d.value ?? d.score ?? d.completed ?? 0));
  const labels = data.map((d, i) => (typeof d === "object" ? d.label ?? d.day ?? d.date ?? `D${i + 1}` : `D${i + 1}`));
  const max = Math.max(...vals, 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {label && <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
        {vals.map((v, i) => {
          const pct = (v / max) * 100;
          const isMax = v === Math.max(...vals);
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
              <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ delay: delay + i * 0.05, duration: 0.6, ease: "easeOut" }}
                  style={{
                    width: "100%",
                    background: isMax
                      ? `linear-gradient(180deg,${accent},${accent}88)`
                      : `linear-gradient(180deg,${accent}55,${accent}22)`,
                    borderRadius: "5px 5px 0 0",
                    minHeight: 4,
                    position: "relative",
                  }}
                >
                  {isMax && (
                    <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: accent, fontWeight: 700, whiteSpace: "nowrap" }}>{v}</div>
                  )}
                </motion.div>
              </div>
              <span style={{ fontSize: 9, color: T.muted, textAlign: "center" }}>{labels[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── HTML/CSS Horizontal bar ──────────────────────────────────────────────────
function HBarChart({ data, accent = "#7c3aed", delay = 0 }) {
  const vals = data.map((d) => (typeof d === "object" ? d.value ?? d.count ?? d.completed ?? 0 : d));
  const max = Math.max(...vals, 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {data.map((d, i) => {
        const label = typeof d === "object" ? d.label ?? d.day ?? d.month ?? `Item ${i + 1}` : `Item ${i + 1}`;
        const v = vals[i];
        const pct = (v / max) * 100;
        const colors = ["#7c3aed", "#3b82f6", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#60a5fa", "#fb923c", "#e879f9", "#2dd4bf", "#f472b6", "#a3e635"];
        const c = colors[i % colors.length];
        return (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: T.muted }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{v}</span>
            </div>
            <div style={{ height: 8, borderRadius: 8, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: delay + i * 0.07, duration: 0.7, ease: "easeOut" }}
                style={{ height: "100%", borderRadius: 8, background: `linear-gradient(90deg,${c},${c}88)` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── HTML/CSS Line sparkline ──────────────────────────────────────────────────
function LineChart({ data, accent = "#a78bfa", height = 80, delay = 0 }) {
  const vals = data.map((d) => (typeof d === "number" ? d : d.value ?? d.score ?? 0));
  const labels = data.map((d, i) => (typeof d === "object" ? d.label ?? d.day ?? `W${i + 1}` : `W${i + 1}`));
  const max = Math.max(...vals, 1);
  const min = Math.min(...vals, 0);
  const range = max - min || 1;
  const w = 100 / (vals.length - 1 || 1);

  const points = vals.map((v, i) => ({
    x: i * w,
    y: 100 - ((v - min) / range) * 100,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1]?.x ?? 0} 100 L 0 100 Z`;

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 100 100`} preserveAspectRatio="none" style={{ width: "100%", height, display: "block" }}>
        <defs>
          <linearGradient id={`lg-${accent.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity={0.25} />
            <stop offset="100%" stopColor={accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <motion.path
          d={areaD}
          fill={`url(#lg-${accent.replace("#","")})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3, duration: 0.5 }}
        />
        <motion.path
          d={pathD}
          fill="none"
          stroke={accent}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay, duration: 1.2, ease: "easeOut" }}
        />
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={2}
            fill={accent}
            stroke="#080812"
            strokeWidth={1}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.8 + i * 0.05 }}
          />
        ))}
      </svg>
      {/* X-axis labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {labels.map((l, i) => (
          <span key={i} style={{ fontSize: 9, color: T.muted, textAlign: "center", flex: 1 }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Donut completion chart ───────────────────────────────────────────────────
function DonutChart({ pct, accent = "#34d399" }) {
  const r = 38, circ = 2 * Math.PI * r;
  const p = Math.min(Math.max(Number(pct) || 0, 0), 100);
  const offset = circ - (p / 100) * circ;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <svg width={96} height={96} style={{ flexShrink: 0 }}>
        <circle cx={48} cy={48} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
        <motion.circle cx={48} cy={48} r={r} fill="none" stroke={accent} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "48px 48px" }}
        />
        <text x={48} y={52} textAnchor="middle" fill="#fff" fontSize={16} fontWeight={800} fontFamily="Inter,sans-serif">{p}%</text>
      </svg>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 4 }}>Completion Rate</div>
        <div style={{ fontSize: 12, color: T.muted }}>Tasks finished on time</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 11, fontWeight: 600, color: accent, background: `${accent}15`, borderRadius: 6, padding: "3px 9px" }}>
          <RiCheckboxCircleLine size={12} />{p}% of all tasks
        </div>
      </div>
    </div>
  );
}

// ─── AI Insights list ─────────────────────────────────────────────────────────
function InsightsList({ insights }) {
  const items = Array.isArray(insights)
    ? insights
    : insights?.insights ?? insights?.tips ?? insights?.recommendations ?? [];

  if (!items.length) {
    return <p style={{ fontSize: 13, color: T.muted, margin: 0, fontStyle: "italic" }}>No insights available yet. Complete more tasks to unlock AI insights.</p>;
  }

  const colors = ["#a78bfa", "#60a5fa", "#34d399", "#fbbf24", "#f87171"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.slice(0, 6).map((item, i) => {
        const text = typeof item === "string" ? item : item.text ?? item.message ?? item.insight ?? item.tip ?? JSON.stringify(item);
        const c = colors[i % colors.length];
        return (
          <motion.div key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 12, background: `${c}08`, border: `1px solid ${c}18` }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: `${c}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              <RiLightbulbLine size={13} color={c} />
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.65, margin: 0 }}>{text}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Streak display ───────────────────────────────────────────────────────────
function StreakDisplay({ streak }) {
  const val = Number(streak) || 0;
  const blocks = Array.from({ length: Math.min(val, 14) }, (_, i) => i);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ fontSize: 36 }}>🔥</motion.div>
        <div>
          <div style={{ fontSize: 40, fontWeight: 800, color: "#f59e0b", lineHeight: 1 }}>{val}</div>
          <div style={{ fontSize: 12, color: T.muted }}>day streak</div>
        </div>
      </div>
      {blocks.length > 0 && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {blocks.map((_, i) => (
            <motion.div key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 300 }}
              style={{ width: 14, height: 14, borderRadius: 4, background: i === blocks.length - 1 ? "#f59e0b" : i > blocks.length - 4 ? "#fbbf24" : "rgba(245,158,11,0.35)" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Most productive day ──────────────────────────────────────────────────────
function ProductiveDay({ data }) {
  const day = typeof data === "string" ? data : data?.day ?? data?.name ?? data?.most_productive_day ?? null;
  const reason = typeof data === "object" ? data?.reason ?? data?.note ?? null : null;
  if (!day) return <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>Not enough data yet.</p>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 54, height: 54, borderRadius: 16, background: "linear-gradient(135deg,#7c3aed,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <RiTrophyLine size={26} color="#fff" />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.text }}>{day}</div>
        {reason && <div style={{ fontSize: 12, color: T.muted, marginTop: 3, lineHeight: 1.5 }}>{reason}</div>}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 11, color: "#fbbf24", background: "rgba(251,191,36,0.1)", borderRadius: 6, padding: "2px 8px" }}>
          <RiStarLine size={11} />Most productive day
        </div>
      </div>
    </div>
  );
}

// ─── Analytics page ───────────────────────────────────────────────────────────
export default function Analytics() {
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await aiService.analyze();
      console.log("Analytics API:", res.data);
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load analytics.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Resolve analytics fields ──
  const score         = data?.productivity_score ?? data?.score ?? data?.productivity ?? null;
  const scoreDelta    = data?.score_delta ?? data?.productivity_delta ?? null;
  const streak        = data?.streak ?? data?.streak_days ?? null;
  const completionPct = data?.completion_rate ?? data?.completion_percentage ?? data?.task_completion_rate ?? null;
  const focusTime     = data?.focus_time ?? data?.focus_hours ?? data?.total_focus_time ?? null;
  const focusDelta    = data?.focus_delta ?? null;
  const totalTasks    = data?.total_tasks ?? data?.tasks_total ?? null;
  const completedTasks= data?.completed_tasks ?? data?.tasks_completed ?? null;
  const productiveDay = data?.most_productive_day ?? data?.best_day ?? data?.productive_day ?? null;
  const insights      = data?.insights ?? data?.ai_insights ?? data?.recommendations ?? data;

  const weeklyData  = data?.weekly  ?? data?.weekly_productivity  ?? data?.weekly_chart  ?? data?.weekly_data  ?? [];
  const monthlyData = data?.monthly ?? data?.monthly_productivity ?? data?.monthly_chart ?? data?.monthly_data ?? [];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter',system-ui,sans-serif", display: "flex" }}>
      <Sidebar onWidthChange={setSidebarWidth} />

      <div style={{ flex: 1, marginLeft: sidebarWidth, transition: "margin-left 0.28s ease" }}>
        <Navbar sidebarWidth={sidebarWidth} />

        <main style={{ padding: "88px 28px 48px" }}>
          {/* Page header */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 13, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <RiBarChartLine size={21} color="#a78bfa" />
              </div>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Analytics</h1>
                <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>AI-powered productivity insights</p>
              </div>
            </div>
            <motion.button onClick={fetchData} disabled={loading} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.1)", color: "#a78bfa", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <RiRefreshLine size={15} />Refresh
            </motion.button>
          </motion.div>

          {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={fetchData} /> : (
            <>
              {/* ── Row 1: Stat cards ── */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 20 }}>
                <StatCard icon={RiPulseLine}          label="Productivity Score"  value={score !== null ? `${score}%` : "—"}              accent="#7c3aed" delta={scoreDelta}  sub="overall score"         delay={0}    />
                <StatCard icon={RiFireLine}            label="Current Streak"      value={streak !== null ? `${streak}d` : "—"}             accent="#f59e0b" delta={null}       sub="days in a row"         delay={0.06} />
                <StatCard icon={RiCheckboxCircleLine}  label="Tasks Completed"     value={completedTasks ?? "—"}                            accent="#34d399" delta={null}       sub={totalTasks ? `of ${totalTasks}` : "total"} delay={0.12} />
                <StatCard icon={RiTimeLine}            label="Focus Time"          value={focusTime !== null ? `${focusTime}h` : "—"}        accent="#60a5fa" delta={focusDelta} sub="this week"             delay={0.18} />
                <StatCard icon={RiTrophyLine}          label="Completion Rate"     value={completionPct !== null ? `${completionPct}%` : "—"} accent="#fbbf24" delta={null}      sub="tasks on time"         delay={0.24} />
              </div>

              {/* ── Row 2: Score ring + Completion donut ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                {/* Productivity Score card */}
                <GlassCard delay={0.28}>
                  <CardHeader icon={RiPulseLine} title="Productivity Score" accent="#7c3aed" />
                  <div style={{ padding: "22px 22px", display: "flex", alignItems: "center", gap: 22 }}>
                    <ScoreRing score={score ?? 0} accent="#7c3aed" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: T.muted, marginBottom: 10 }}>Performance breakdown</div>
                      {[
                        { label: "Task Completion", val: completionPct ?? 0, color: "#34d399" },
                        { label: "On-time delivery", val: Math.round((completionPct ?? 0) * 0.9), color: "#60a5fa" },
                        { label: "Focus sessions",  val: focusTime ? Math.min(focusTime * 5, 100) : 0, color: "#a78bfa" },
                      ].map(({ label, val, color }) => (
                        <div key={label} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.muted, marginBottom: 4 }}>
                            <span>{label}</span><span>{val}%</span>
                          </div>
                          <div style={{ height: 5, borderRadius: 5, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ delay: 0.5, duration: 0.9, ease: "easeOut" }}
                              style={{ height: "100%", borderRadius: 5, background: `linear-gradient(90deg,${color},${color}88)` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>

                {/* Completion donut */}
                <GlassCard delay={0.32}>
                  <CardHeader icon={RiCheckboxCircleLine} title="Task Completion Rate" accent="#34d399" />
                  <div style={{ padding: "24px 22px" }}>
                    <DonutChart pct={completionPct ?? 0} accent="#34d399" />
                    <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
                      {[
                        { label: "Completed", val: completedTasks ?? 0, color: "#34d399" },
                        { label: "Total",     val: totalTasks ?? 0,    color: "#60a5fa" },
                        { label: "Pending",   val: totalTasks && completedTasks ? totalTasks - completedTasks : 0, color: "#fbbf24" },
                      ].map(({ label, val, color }) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                          <span style={{ fontSize: 11, color: T.muted }}>{label}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* ── Row 3: Weekly chart ── */}
              <GlassCard delay={0.36} style={{ marginBottom: 20 }}>
                <CardHeader icon={RiBarChartLine} title="Weekly Productivity" accent="#a78bfa"
                  right={<div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#a78bfa", background: "rgba(167,139,250,0.1)", borderRadius: 8, padding: "3px 9px" }}><RiSparklingLine size={11} />Weekly view</div>} />
                <div style={{ padding: "20px 22px" }}>
                  {weeklyData.length > 0
                    ? <BarChart data={weeklyData} accent="#7c3aed" delay={0.4} />
                    : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 120, color: T.muted, fontSize: 13 }}>No weekly data yet.</div>
                  }
                </div>
              </GlassCard>

              {/* ── Row 4: Monthly chart + Streak + Most productive day ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
                {/* Monthly trend */}
                <GlassCard delay={0.42}>
                  <CardHeader icon={RiCalendarLine} title="Monthly Trend" accent="#60a5fa" />
                  <div style={{ padding: "18px 20px" }}>
                    {monthlyData.length > 0
                      ? <LineChart data={monthlyData} accent="#60a5fa" height={90} delay={0.5} />
                      : <div style={{ height: 90, display: "flex", alignItems: "center", justifyContent: "center", color: T.muted, fontSize: 12 }}>No monthly data.</div>
                    }
                  </div>
                </GlassCard>

                {/* Streak */}
                <GlassCard delay={0.46}>
                  <CardHeader icon={RiFireLine} title="Streak" accent="#f59e0b" />
                  <div style={{ padding: "20px 20px" }}>
                    <StreakDisplay streak={streak} />
                  </div>
                </GlassCard>

                {/* Most productive day */}
                <GlassCard delay={0.50}>
                  <CardHeader icon={RiTrophyLine} title="Most Productive Day" accent="#fbbf24" />
                  <div style={{ padding: "20px 20px" }}>
                    <ProductiveDay data={productiveDay} />
                  </div>
                </GlassCard>
              </div>

              {/* ── Row 5: AI Insights ── */}
              <GlassCard delay={0.54}>
                <CardHeader icon={RiRobot2Line} title="AI Insights" accent="#a78bfa"
                  right={
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
                        style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} />
                      <span style={{ fontSize: 10, color: "#34d399", fontWeight: 600 }}>Live</span>
                    </div>
                  }
                />
                <div style={{ padding: "20px 22px" }}>
                  <InsightsList insights={insights} />
                </div>
              </GlassCard>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
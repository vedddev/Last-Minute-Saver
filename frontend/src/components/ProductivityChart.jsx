import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Dot,
} from "recharts";
import {
  RiBarChartLine,
  RiLineChartLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiPulseLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiSparklingLine,
  RiCalendarLine,
} from "react-icons/ri";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normaliseData(raw) {
  if (!raw) return [];

  const arr = Array.isArray(raw)
    ? raw
    : raw.data       ??
      raw.chart      ??
      raw.weekly     ??
      raw.daily      ??
      raw.history    ??
      raw.productivity ??
      [];

  if (!arr.length) return [];

  return arr.map((item, i) => {
    if (typeof item === "number") {
      return {
        label: `Day ${i + 1}`,
        completed: null,
        pending: null,
        score: item,
      };
    }
    return {
      label:
        item.label     ??
        item.day       ??
        item.date      ??
        item.name      ??
        item.week      ??
        `Day ${i + 1}`,
      completed:
        item.completed ??
        item.completed_tasks ??
        item.done      ??
        null,
      pending:
        item.pending   ??
        item.pending_tasks ??
        item.todo      ??
        null,
      score:
        item.score              ??
        item.productivity_score ??
        item.productivity       ??
        item.value              ??
        null,
    };
  });
}

function calcStat(data, key) {
  const vals = data.map((d) => d[key]).filter((v) => v !== null && v !== undefined);
  if (!vals.length) return null;
  const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  const last = vals[vals.length - 1];
  const prev = vals[vals.length - 2] ?? null;
  const delta = prev !== null ? last - prev : null;
  return { avg, last, delta };
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      style={{
        background: "rgba(14,14,28,0.97)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14,
        padding: "12px 16px",
        backdropFilter: "blur(20px)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        minWidth: 160,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: i < payload.length - 1 ? 6 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{entry.name}</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
            {entry.name === "Score" ? `${entry.value}%` : entry.value}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

// ─── Custom legend ────────────────────────────────────────────────────────────
function CustomLegend({ payload }) {
  if (!payload?.length) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 20, paddingTop: 12 }}>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: entry.type === "line" ? "50%" : 3, background: entry.color }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, label, stat, accent, unit = "" }) {
  if (!stat) return null;
  const isUp = stat.delta !== null && stat.delta >= 0;

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 4,
      padding: "12px 16px",
      background: `${accent}10`,
      border: `1px solid ${accent}25`,
      borderRadius: 12,
      flex: 1, minWidth: 110,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Icon size={13} color={accent} />
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
        {stat.last}{unit}
      </div>
      {stat.delta !== null && (
        <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 600, color: isUp ? "#34d399" : "#f87171" }}>
          {isUp ? <RiArrowUpLine size={11} /> : <RiArrowDownLine size={11} />}
          {Math.abs(stat.delta)}{unit} vs prev
        </div>
      )}
    </div>
  );
}

// ─── View tabs ────────────────────────────────────────────────────────────────
const VIEWS = [
  { key: "composed", label: "Overview",  icon: RiBarChartLine },
  { key: "area",     label: "Trend",     icon: RiLineChartLine },
];

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 240, color: "rgba(255,255,255,0.25)" }}>
      <RiBarChartLine size={36} />
      <p style={{ fontSize: 13, margin: 0, textAlign: "center", lineHeight: 1.6 }}>
        No chart data available yet.<br />Complete tasks to see your productivity trends.
      </p>
    </div>
  );
}

// ─── Chart axes shared props ──────────────────────────────────────────────────
const axisStyle = { fontSize: 11, fill: "rgba(255,255,255,0.3)", fontFamily: "Inter, system-ui, sans-serif" };
const gridStyle = { stroke: "rgba(255,255,255,0.05)", strokeDasharray: "4 4" };

// ─── ProductivityChart ────────────────────────────────────────────────────────
export default function ProductivityChart({ dashboard }) {
  const [view, setView] = useState("composed");

  // Resolve data from multiple possible dashboard shapes
  const rawData =
    dashboard?.chart              ??
    dashboard?.weekly_productivity??
    dashboard?.productivity_data  ??
    dashboard?.history            ??
    dashboard?.weekly             ??
    dashboard?.data               ??
    dashboard                     ??
    null;

  const data = normaliseData(rawData);

  const hasCompleted = data.some((d) => d.completed !== null);
  const hasPending   = data.some((d) => d.pending   !== null);
  const hasScore     = data.some((d) => d.score     !== null);

  const completedStat = hasCompleted ? calcStat(data, "completed") : null;
  const pendingStat   = hasPending   ? calcStat(data, "pending")   : null;
  const scoreStat     = hasScore     ? calcStat(data, "score")     : null;

  const avgScore = scoreStat?.avg ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        overflow: "hidden",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "linear-gradient(135deg,rgba(124,58,237,0.06),rgba(59,130,246,0.03))",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <RiBarChartLine size={17} color="#a78bfa" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Productivity Analytics</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 4 }}>
              <RiCalendarLine size={10} />
              Last {data.length || 0} entries
            </div>
          </div>
        </div>

        {/* View tabs */}
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 4 }}>
          {VIEWS.map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              onClick={() => setView(key)}
              whileTap={{ scale: 0.95 }}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 12px", borderRadius: 7, border: "none",
                background: view === key ? "rgba(124,58,237,0.35)" : "transparent",
                color: view === key ? "#c4b5fd" : "rgba(255,255,255,0.35)",
                fontSize: 12, fontWeight: 500, cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              <Icon size={13} />
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Stat pills ── */}
      {data.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <StatPill icon={RiCheckboxCircleLine} label="Completed"   stat={completedStat} accent="#34d399" />
          <StatPill icon={RiTimeLine}           label="Pending"     stat={pendingStat}   accent="#f59e0b" />
          <StatPill icon={RiPulseLine}          label="Score"       stat={scoreStat}     accent="#a78bfa" unit="%" />
        </div>
      )}

      {/* ── Chart ── */}
      <div style={{ padding: "16px 8px 8px" }}>
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <ResponsiveContainer width="100%" height={260}>
                {view === "composed" ? (
                  <ComposedChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#34d399" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#f59e0b" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#d97706" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#a78bfa" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#a78bfa" stopOpacity={0}    />
                      </linearGradient>
                    </defs>

                    <CartesianGrid {...gridStyle} />

                    <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="tasks" tick={axisStyle} axisLine={false} tickLine={false} width={28} />
                    <YAxis yAxisId="score" orientation="right" tick={axisStyle} axisLine={false} tickLine={false} domain={[0, 100]} width={36} tickFormatter={(v) => `${v}%`} />

                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Legend content={<CustomLegend />} />

                    {avgScore !== null && (
                      <ReferenceLine yAxisId="score" y={avgScore} stroke="rgba(167,139,250,0.3)" strokeDasharray="5 5" label={{ value: `Avg ${avgScore}%`, fill: "rgba(167,139,250,0.5)", fontSize: 10, position: "insideTopRight" }} />
                    )}

                    {hasCompleted && (
                      <Bar yAxisId="tasks" dataKey="completed" name="Completed" fill="url(#completedGrad)" radius={[5,5,0,0]} maxBarSize={36} />
                    )}
                    {hasPending && (
                      <Bar yAxisId="tasks" dataKey="pending" name="Pending" fill="url(#pendingGrad)" radius={[5,5,0,0]} maxBarSize={36} />
                    )}
                    {hasScore && (
                      <Area yAxisId="score" type="monotone" dataKey="score" name="Score" stroke="#a78bfa" strokeWidth={2.5} fill="url(#scoreAreaGrad)" dot={false} activeDot={{ r: 5, fill: "#a78bfa", stroke: "#fff", strokeWidth: 2 }} />
                    )}
                  </ComposedChart>
                ) : (
                  /* Trend / Area view */
                  <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#34d399" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#34d399" stopOpacity={0}   />
                      </linearGradient>
                      <linearGradient id="areaPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0}   />
                      </linearGradient>
                      <linearGradient id="areaScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#a78bfa" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#a78bfa" stopOpacity={0}    />
                      </linearGradient>
                    </defs>

                    <CartesianGrid {...gridStyle} />
                    <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={28} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
                    <Legend content={<CustomLegend />} />

                    {hasCompleted && (
                      <Area type="monotone" dataKey="completed" name="Completed" stroke="#34d399" strokeWidth={2.5} fill="url(#areaCompleted)" dot={false} activeDot={{ r: 5, fill: "#34d399", stroke: "#fff", strokeWidth: 2 }} />
                    )}
                    {hasPending && (
                      <Area type="monotone" dataKey="pending" name="Pending" stroke="#f59e0b" strokeWidth={2.5} fill="url(#areaPending)" dot={false} activeDot={{ r: 5, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }} />
                    )}
                    {hasScore && (
                      <Area type="monotone" dataKey="score" name="Score" stroke="#a78bfa" strokeWidth={2.5} fill="url(#areaScore)" dot={false} activeDot={{ r: 5, fill: "#a78bfa", stroke: "#fff", strokeWidth: 2 }} />
                    )}
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
        padding: "10px 18px 14px",
        fontSize: 10, color: "rgba(255,255,255,0.2)",
      }}>
        <RiSparklingLine size={11} color="#a78bfa" />
        Powered by Athena AI · Updates with your task activity
      </div>
    </motion.div>
  );
}
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiRobot2Line, RiBrainLine, RiSendPlaneFill, RiLoader4Line,
  RiFileCopyLine, RiCheckLine, RiDownloadLine, RiRefreshLine,
  RiSparklingLine, RiLightbulbLine, RiDeleteBinLine, RiAlertLine,
} from "react-icons/ri";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ChatWidget from "../components/ChatWidget";

import aiService from "../services/aiService";

const T = {
  bg: "#080812", surface: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.07)", text: "#fff", muted: "rgba(255,255,255,0.4)",
};

const SUGGESTIONS = [
  "Plan my week around 3 high priority tasks and 2 meetings",
  "Create a focused deep work schedule for tomorrow",
  "Break down my project into daily milestones for the next 5 days",
  "Suggest a balanced schedule mixing work and breaks",
];

function TypingCursor() {
  return (
    <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
      style={{ display: "inline-block", width: 2, height: 16, background: "#a78bfa", marginLeft: 2, verticalAlign: "middle", borderRadius: 1 }} />
  );
}

function PlanSection({ title, content, accent = "#a78bfa" }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 3, height: 16, borderRadius: 2, background: accent }} />
        <h3 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</h3>
      </div>
      {Array.isArray(content) ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {content.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: accent, minWidth: 20, paddingTop: 1 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.6 }}>{typeof item === "string"
    ? item
    : (
        <>
            <strong>{item.title}</strong>
            {item.description && (
                <>
                    <br />
                    {item.description}
                </>
            )}
            {item.priority && (
                <>
                    <br />
                    Priority: {item.priority}
                </>
            )}
            {item.deadline && (
                <>
                    <br />
                    Deadline: {item.deadline}
                </>
            )}
            {item.estimated_time && (
                <>
                    <br />
                    Time: {item.estimated_time}
                </>
            )}
        </>
    )}</span>
            </motion.div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, margin: 0, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {String(content)}
        </p>
      )}
    </div>
  );
}

function PlanCard({ plan, onRegenerate, onClear, prompt }) {
  const [copied, setCopied] = useState(false);

  const planText = typeof plan === "string" ? plan : JSON.stringify(plan, null, 2);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(planText); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch {}
  };

  const handleDownload = () => {
    const blob = new Blob([`ATHENA AI — GENERATED PLAN\n${"─".repeat(40)}\nPrompt: ${prompt}\n\n${planText}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "athena-plan.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  // Parse structured plan sections
  const isObj = plan && typeof plan === "object";
  const sections = isObj ? Object.entries(plan).filter(([, v]) => v !== null && v !== undefined) : null;

  const SECTION_COLORS = ["#a78bfa", "#60a5fa", "#34d399", "#fbbf24", "#f87171", "#fb923c"];

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 22, overflow: "hidden", backdropFilter: "blur(20px)" }}>

      {/* Gradient top bar */}
      <div style={{ height: 3, background: "linear-gradient(90deg,#7c3aed,#3b82f6,#7c3aed)", backgroundSize: "200%", animation: "shimmer 3s linear infinite" }} />

      {/* Card header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "linear-gradient(135deg,rgba(124,58,237,0.07),rgba(59,130,246,0.04))", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RiRobot2Line size={20} color="#fff" />
          </motion.div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, background: "linear-gradient(90deg,#c4b5fd,#93c5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Generated Plan</div>
            <div style={{ fontSize: 11, color: T.muted }}>Athena AI · Just now</div>
          </div>
        </div>
        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { icon: copied ? RiCheckLine : RiFileCopyLine, label: copied ? "Copied" : "Copy", color: copied ? "#34d399" : T.muted, action: handleCopy },
            { icon: RiDownloadLine, label: "Download", color: T.muted, action: handleDownload },
            { icon: RiRefreshLine, label: "Regenerate", color: "#a78bfa", action: onRegenerate },
            { icon: RiDeleteBinLine, label: "Clear", color: "#f87171", action: onClear },
          ].map(({ icon: Icon, label, color, action }) => (
            <motion.button key={label} onClick={action} whileHover={{ scale: 1.06, color }} whileTap={{ scale: 0.94 }}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.04)", color, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "color 0.2s" }}>
              <Icon size={13} />{label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Plan content */}
      <div style={{ padding: "22px 24px" }}>
        {sections ? (
          sections.map(([key, val], i) => (
            <PlanSection key={key} title={key.replace(/_/g, " ")} content={val} accent={SECTION_COLORS[i % SECTION_COLORS.length]} />
          ))
        ) : (
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.78)", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{planText}</p>
        )}
      </div>

      <style>{`@keyframes shimmer { 0%{background-position:0%} 100%{background-position:200%} }`}</style>
    </motion.div>
  );
}

export default function Planner() {
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [prompt, setPrompt]     = useState("");
  const [plan, setPlan]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const textareaRef             = useRef(null);

  const generate = async (customPrompt) => {
    const p = (customPrompt ?? prompt).trim();
    if (!p) return;
    setLoading(true); setError(null); setPlan(null);
    try {
      const res = await aiService.planner(p);
      const data = res.data;

      if (data.success && data.plan) {
          setPlan(data.plan);
      }
      else if (data.success && data.tasks) {
          setPlan({
              Overview: "AI Generated Task Plan",
              Tasks: data.tasks.map((task, index) => ({
                  title: task.title || task.task || `Task ${index + 1}`,
                  description: task.description || "",
                  priority: task.priority || "Medium",
                  deadline: task.deadline || "",
                  estimated_time: task.estimated_time || "",
              })),
          });
      }
      else if (data.response) {
          setPlan({
              Summary: data.response,
          });
      }
      else {
          setPlan(data);
      }
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to generate plan. Try again.");
    } finally { setLoading(false); }
  };

  const handleSuggestion = (s) => { setPrompt(s); textareaRef.current?.focus(); };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter',system-ui,sans-serif", display: "flex" }}>
      <Sidebar onWidthChange={setSidebarWidth} />
      <div style={{ flex: 1, marginLeft: sidebarWidth, transition: "margin-left 0.28s ease" }}>
        <Navbar sidebarWidth={sidebarWidth} />
        <main style={{ padding: "88px 28px 48px", maxWidth: 860, margin: "0 auto" }}>
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32, textAlign: "center" }}>
            <motion.div animate={{ boxShadow: ["0 0 0 0 rgba(124,58,237,0)","0 0 0 14px rgba(124,58,237,0.08)","0 0 0 0 rgba(124,58,237,0)"] }} transition={{ duration: 2.5, repeat: Infinity }}
              style={{ width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg,#7c3aed,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <RiBrainLine size={28} color="#fff" />
            </motion.div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px", background: "linear-gradient(90deg,#c4b5fd,#93c5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Planner</h1>
            <p style={{ fontSize: 14, color: T.muted, margin: 0 }}>Describe what you need to accomplish — Athena will build your plan.</p>
          </motion.div>

          {/* Prompt area */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, overflow: "hidden", marginBottom: 20, backdropFilter: "blur(20px)" }}>
            <textarea ref={textareaRef} value={prompt} onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) generate(); }}
              placeholder="e.g. Plan my week with 3 high-priority tasks and 2 team meetings. I work best in the morning..."
              rows={5}
              style={{ width: "100%", boxSizing: "border-box", background: "transparent", border: "none", outline: "none", color: T.text, fontSize: 14, lineHeight: 1.7, padding: "20px 22px 12px", resize: "none", fontFamily: "inherit" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 14px", borderTop: "1px solid rgba(255,255,255,0.05)", flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
                <kbd style={{ background: "rgba(255,255,255,0.07)", borderRadius: 4, padding: "1px 5px", fontFamily: "inherit" }}>⌘</kbd> + <kbd style={{ background: "rgba(255,255,255,0.07)", borderRadius: 4, padding: "1px 5px", fontFamily: "inherit" }}>Enter</kbd> to generate
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {prompt && (
                  <motion.button onClick={() => setPrompt("")} whileHover={{ scale: 1.04 }} style={{ padding: "8px 14px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.09)", background: "transparent", color: T.muted, fontSize: 12, cursor: "pointer" }}>
                    Clear
                  </motion.button>
                )}
                <motion.button onClick={() => generate()} disabled={!prompt.trim() || loading} whileHover={prompt.trim() && !loading ? { scale: 1.04 } : {}} whileTap={prompt.trim() && !loading ? { scale: 0.96 } : {}}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 22px", borderRadius: 10, border: "none", background: prompt.trim() && !loading ? "linear-gradient(135deg,#7c3aed,#3b82f6)" : "rgba(255,255,255,0.07)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: prompt.trim() && !loading ? "pointer" : "default", boxShadow: prompt.trim() && !loading ? "0 4px 20px rgba(124,58,237,0.35)" : "none" }}>
                  {loading
                    ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RiLoader4Line size={16} /></motion.div>
                    : <RiSendPlaneFill size={15} />}
                  {loading ? "Generating…" : "Generate Plan"}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Suggestions */}
          {!plan && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }} style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                <RiLightbulbLine size={14} color="#fbbf24" />
                <span style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>Try a prompt</span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SUGGESTIONS.map((s, i) => (
                  <motion.button key={i} onClick={() => handleSuggestion(s)} whileHover={{ scale: 1.03, borderColor: "rgba(167,139,250,0.4)" }} whileTap={{ scale: 0.97 }}
                    style={{ padding: "7px 14px", borderRadius: 20, border: "1px solid rgba(124,58,237,0.2)", background: "rgba(124,58,237,0.07)", color: "rgba(255,255,255,0.55)", fontSize: 12, cursor: "pointer", transition: "border-color 0.2s", textAlign: "left" }}>
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Loading animation */}
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 20, padding: "36px 24px", textAlign: "center" }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block", marginBottom: 16 }}>
                  <RiSparklingLine size={36} color="#a78bfa" />
                </motion.div>
                <p style={{ fontSize: 14, color: T.muted, margin: "0 0 8px" }}>Athena is thinking<TypingCursor /></p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", margin: 0 }}>Analysing your prompt and building a personalised plan…</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && !loading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderRadius: 14, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.22)", marginBottom: 20 }}>
                <RiAlertLine size={18} color="#f87171" />
                <span style={{ fontSize: 13, color: "#f87171" }}>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Plan result */}
          <AnimatePresence>
            {plan && !loading && (
              <PlanCard plan={plan} prompt={prompt} onRegenerate={() => generate()} onClear={() => { setPlan(null); setError(null); }} />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
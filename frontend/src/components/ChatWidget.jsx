import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiRobot2Line,
  RiUserLine,
  RiSendPlaneFill,
  RiLoader4Line,
  RiSparklingLine,
  RiBrainLine,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiRefreshLine,
  RiMicLine,
} from "react-icons/ri";

const BASE_URL = "http://127.0.0.1:5000";
const api = axios.create({ baseURL: BASE_URL });

// ─── Suggested prompts ────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "What should I focus on today?",
  "Summarise my pending tasks",
  "Help me plan my week",
  "What are my high priority tasks?",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function extractReply(data) {
  return (
    data?.response ??
    data?.message ??
    data?.reply ??
    data?.content ??
    data?.text ??
    data?.answer ??
    (typeof data === "string" ? data : null) ??
    "I received your message but couldn't generate a response."
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 2px" }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#a78bfa",
          }}
        />
      ))}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ role }) {
  const isUser = role === "user";
  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: isUser ? "50%" : 10,
        background: isUser
          ? "linear-gradient(135deg,#7c3aed,#3b82f6)"
          : "rgba(124,58,237,0.2)",
        border: isUser ? "none" : "1px solid rgba(124,58,237,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {isUser ? (
        <RiUserLine size={15} color="#fff" />
      ) : (
        <RiRobot2Line size={16} color="#a78bfa" />
      )}
    </div>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <motion.button
      onClick={handleCopy}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title="Copy message"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: copied ? "#34d399" : "rgba(255,255,255,0.25)",
        display: "flex",
        alignItems: "center",
        padding: 0,
        transition: "color 0.2s",
      }}
    >
      {copied ? <RiCheckLine size={13} /> : <RiFileCopyLine size={13} />}
    </motion.button>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, onRetry }) {
  const [actionsVisible, setActionsVisible] = useState(false);
  const isUser = msg.role === "user";
  const isError = msg.error;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setActionsVisible(true)}
      onHoverEnd={() => setActionsVisible(false)}
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        gap: 10,
        maxWidth: "100%",
      }}
    >
      <Avatar role={msg.role} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
          gap: 4,
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Sender label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexDirection: isUser ? "row-reverse" : "row",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: isUser ? "#c4b5fd" : "#a78bfa",
              letterSpacing: "0.03em",
            }}
          >
            {isUser ? "You" : "Athena"}
          </span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
            {formatTime(msg.ts)}
          </span>
        </div>

        {/* Bubble */}
        <div
          style={{
            position: "relative",
            maxWidth: "85%",
            padding: "11px 15px",
            borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            background: isUser
              ? "linear-gradient(135deg,#7c3aed,#3b82f6)"
              : isError
              ? "rgba(248,113,113,0.1)"
              : "rgba(255,255,255,0.05)",
            border: isUser
              ? "none"
              : isError
              ? "1px solid rgba(248,113,113,0.25)"
              : "1px solid rgba(255,255,255,0.08)",
            boxShadow: isUser
              ? "0 4px 20px rgba(124,58,237,0.25)"
              : "none",
          }}
        >
          {isError ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <RiErrorWarningLine size={14} color="#f87171" />
              <span style={{ fontSize: 13, color: "#f87171", lineHeight: 1.55 }}>
                {msg.text}
              </span>
            </div>
          ) : (
            <p
              style={{
                fontSize: 13,
                color: isUser ? "#fff" : "rgba(255,255,255,0.82)",
                lineHeight: 1.65,
                margin: 0,
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {msg.text}
            </p>
          )}
        </div>

        {/* Actions */}
        <AnimatePresence>
          {actionsVisible && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexDirection: isUser ? "row-reverse" : "row",
              }}
            >
              <CopyButton text={msg.text} />
              {isError && onRetry && (
                <motion.button
                  onClick={onRetry}
                  whileHover={{ scale: 1.1 }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.25)",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 11,
                    padding: 0,
                  }}
                >
                  <RiRefreshLine size={13} />
                  Retry
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Suggestions ──────────────────────────────────────────────────────────────
function SuggestionChips({ onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        justifyContent: "center",
        padding: "8px 0 4px",
      }}
    >
      {SUGGESTIONS.map((s, i) => (
        <motion.button
          key={i}
          onClick={() => onSelect(s)}
          whileHover={{ scale: 1.03, borderColor: "rgba(167,139,250,0.5)" }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: "rgba(124,58,237,0.08)",
            border: "1px solid rgba(124,58,237,0.22)",
            borderRadius: 20,
            padding: "6px 14px",
            fontSize: 12,
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
            transition: "border-color 0.2s, color 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          {s}
        </motion.button>
      ))}
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onSelect }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: "24px 16px",
        textAlign: "center",
      }}
    >
      <motion.div
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(124,58,237,0)",
            "0 0 0 12px rgba(124,58,237,0.08)",
            "0 0 0 0 rgba(124,58,237,0)",
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity }}
        style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <RiBrainLine size={28} color="#fff" />
      </motion.div>

      <div>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#fff",
            margin: "0 0 6px",
            background: "linear-gradient(90deg,#c4b5fd,#93c5fd)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Ask Athena anything
        </h3>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", margin: 0, lineHeight: 1.6 }}>
          Your AI productivity coach is ready.<br />
          Try one of the prompts below to get started.
        </p>
      </div>

      <SuggestionChips onSelect={onSelect} />
    </div>
  );
}

// ─── ChatWidget ───────────────────────────────────────────────────────────────
export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUserMsg, setLastUserMsg] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text ?? input).trim();
      if (!trimmed || loading) return;

      const userMsg = { role: "user", text: trimmed, ts: Date.now() };
      setLastUserMsg(trimmed);
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);
      inputRef.current?.focus();

      try {
        const res = await api.post("/ai/chat", { message: trimmed });
        const reply = extractReply(res.data);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: reply, ts: Date.now() },
        ]);
      } catch (err) {
        const status = err?.response?.status;
        const errText =
          status === 429
            ? "Too many requests. Please wait a moment and try again."
            : status >= 500
            ? "Server error. Please try again shortly."
            : "Couldn't reach Athena. Check your connection and retry.";

        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: errText, ts: Date.now(), error: true },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading]
  );

  const handleRetry = () => {
    if (lastUserMsg) sendMessage(lastUserMsg);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setLastUserMsg(null);
    inputRef.current?.focus();
  };

  const isEmpty = messages.length === 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 480,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        overflow: "hidden",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(124,58,237,0)",
                "0 0 0 5px rgba(124,58,237,0.12)",
                "0 0 0 0 rgba(124,58,237,0)",
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity }}
            style={{
              width: 34,
              height: 34,
              borderRadius: 11,
              background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RiRobot2Line size={18} color="#fff" />
          </motion.div>

          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                background: "linear-gradient(90deg,#c4b5fd,#93c5fd)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Athena AI
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#34d399",
                }}
              />
              <span style={{ fontSize: 10, color: "#34d399", fontWeight: 500 }}>
                Online
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.2)",
              borderRadius: 8,
              padding: "3px 9px",
            }}
          >
            <RiSparklingLine size={11} color="#a78bfa" />
            <span style={{ fontSize: 10, color: "#a78bfa", fontWeight: 600 }}>AI</span>
          </div>

          {!isEmpty && (
            <motion.button
              onClick={handleClear}
              whileHover={{ scale: 1.05, color: "#f87171" }}
              title="Clear chat"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                width: 30,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(255,255,255,0.3)",
                transition: "color 0.2s",
              }}
            >
              <RiDeleteBinLine size={14} />
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: isEmpty ? 0 : "20px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(124,58,237,0.2) transparent",
        }}
      >
        {isEmpty ? (
          <EmptyState onSelect={(s) => sendMessage(s)} />
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble
                key={i}
                msg={msg}
                onRetry={msg.error ? handleRetry : null}
              />
            ))}

            {/* Typing indicator */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
                >
                  <Avatar role="assistant" />
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "16px 16px 16px 4px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Suggestions (after first message) ── */}
      {!isEmpty && messages.length === 1 && !loading && (
        <div style={{ padding: "0 18px 4px", flexShrink: 0 }}>
          <SuggestionChips onSelect={(s) => sendMessage(s)} />
        </div>
      )}

      {/* ── Input area ── */}
      <div
        style={{
          padding: "12px 14px 14px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-end",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${input ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.09)"}`,
            borderRadius: 14,
            padding: "10px 10px 10px 14px",
            transition: "border-color 0.25s",
            boxShadow: input ? "0 0 0 3px rgba(124,58,237,0.08)" : "none",
          }}
        >
          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Athena..."
            rows={1}
            disabled={loading}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: 13,
              resize: "none",
              lineHeight: 1.6,
              maxHeight: 120,
              overflowY: "auto",
              fontFamily: "inherit",
              scrollbarWidth: "none",
              opacity: loading ? 0.5 : 1,
            }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
          />

          {/* Mic (cosmetic) */}
          <motion.button
            whileHover={{ color: "#a78bfa" }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
              transition: "color 0.2s",
              flexShrink: 0,
            }}
          >
            <RiMicLine size={17} />
          </motion.button>

          {/* Send */}
          <motion.button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            whileHover={input.trim() && !loading ? { scale: 1.06 } : {}}
            whileTap={input.trim() && !loading ? { scale: 0.93 } : {}}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: "none",
              background:
                input.trim() && !loading
                  ? "linear-gradient(135deg,#7c3aed,#3b82f6)"
                  : "rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: input.trim() && !loading ? "pointer" : "default",
              transition: "background 0.2s",
              flexShrink: 0,
              boxShadow:
                input.trim() && !loading
                  ? "0 4px 14px rgba(124,58,237,0.35)"
                  : "none",
            }}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RiLoader4Line size={16} color="rgba(255,255,255,0.6)" />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="send"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <RiSendPlaneFill
                    size={16}
                    color={input.trim() ? "#fff" : "rgba(255,255,255,0.25)"}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Footer hint */}
        <div
          style={{
            textAlign: "center",
            fontSize: 10,
            color: "rgba(255,255,255,0.15)",
            marginTop: 8,
          }}
        >
          Press <kbd style={{ fontFamily: "inherit", background: "rgba(255,255,255,0.07)", borderRadius: 4, padding: "1px 5px" }}>Enter</kbd> to send
          · <kbd style={{ fontFamily: "inherit", background: "rgba(255,255,255,0.07)", borderRadius: 4, padding: "1px 5px" }}>Shift+Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
}
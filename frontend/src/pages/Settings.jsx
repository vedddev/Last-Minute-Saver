import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiSettings4Line, RiUserLine, RiMailLine, RiLockLine,
  RiLogoutBoxLine, RiDeleteBinLine, RiSaveLine, RiLoader4Line,
  RiAlertLine, RiCheckLine, RiImageLine, RiEyeLine, RiEyeOffLine,
  RiMoonLine, RiBellLine, RiRobot2Line, RiCalendarLine,
  RiShieldLine, RiEditLine, RiCloseLine,
} from "react-icons/ri";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#080812", surface: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.07)", text: "#fff", muted: "rgba(255,255,255,0.4)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Spinner({ size = 24 }) {
  return (
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ display: "inline-flex" }}>
      <RiLoader4Line size={size} color="#7c3aed" />
    </motion.div>
  );
}

function Toast({ message, type = "success", onDone }) {
  const color = type === "error" ? "#f87171" : type === "warn" ? "#fbbf24" : "#34d399";
  const bg    = type === "error" ? "rgba(248,113,113,0.12)" : type === "warn" ? "rgba(251,191,36,0.12)" : "rgba(52,211,153,0.12)";
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
      style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 9, background: bg, border: `1px solid ${color}30`, borderRadius: 12, padding: "11px 20px", fontSize: 13, color, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 400, backdropFilter: "blur(14px)", whiteSpace: "nowrap" }}>
      {type === "error" ? <RiAlertLine size={15} /> : <RiCheckLine size={15} />}
      {message}
    </motion.div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ icon: Icon, title, accent = "#a78bfa", children, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, overflow: "hidden", backdropFilter: "blur(20px)", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 22px", borderBottom: `1px solid ${T.border}`, background: `linear-gradient(135deg,${accent}08,transparent)` }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={17} color={accent} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{title}</span>
      </div>
      <div style={{ padding: "22px 22px" }}>{children}</div>
    </motion.div>
  );
}

// ─── Input field ──────────────────────────────────────────────────────────────
function Field({ label, type = "text", value, onChange, placeholder, disabled, right }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.muted, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 7 }}>{label}</label>}
      <div style={{ position: "relative" }}>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.04)", border: `1px solid ${focused ? "rgba(124,58,237,0.5)" : T.border}`, borderRadius: 11, padding: right ? "10px 42px 10px 14px" : "10px 14px", color: T.text, fontSize: 13, outline: "none", fontFamily: "inherit", boxShadow: focused ? "0 0 0 3px rgba(124,58,237,0.1)" : "none", transition: "border-color 0.2s, box-shadow 0.2s", opacity: disabled ? 0.5 : 1 }} />
        {right && <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>{right}</div>}
      </div>
    </div>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ value, onChange, label, sub, accent = "#7c3aed" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: T.muted }}>{sub}</div>}
      </div>
      <motion.div onClick={() => onChange(!value)} whileTap={{ scale: 0.92 }}
        style={{ width: 46, height: 26, borderRadius: 13, background: value ? `linear-gradient(135deg,${accent},#3b82f6)` : "rgba(255,255,255,0.1)", cursor: "pointer", position: "relative", flexShrink: 0, border: `1px solid ${value ? "transparent" : T.border}`, boxShadow: value ? `0 2px 12px ${accent}40` : "none", transition: "background 0.3s, box-shadow 0.3s" }}>
        <motion.div animate={{ x: value ? 22 : 2 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}
          style={{ position: "absolute", top: 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
      </motion.div>
    </div>
  );
}

// ─── Avatar uploader ──────────────────────────────────────────────────────────
function AvatarUploader({ name }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const initials = (name ?? "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 22 }}>
      <div style={{ position: "relative" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: preview ? "transparent" : "linear-gradient(135deg,#7c3aed,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#fff", overflow: "hidden", border: "2px solid rgba(124,58,237,0.4)" }}>
          {preview ? <img src={preview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
        </div>
        <motion.button onClick={() => fileRef.current?.click()} whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.93 }}
          style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%", background: "#7c3aed", border: "2px solid #080812", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <RiImageLine size={13} color="#fff" />
        </motion.button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 3 }}>{name || "Your Name"}</div>
        <div style={{ fontSize: 12, color: T.muted }}>Click the icon to change photo</div>
        <motion.button onClick={() => fileRef.current?.click()} whileHover={{ scale: 1.04 }}
          style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8, padding: "5px 12px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, color: T.muted, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
          <RiImageLine size={12} />Upload photo
        </motion.button>
      </div>
    </div>
  );
}

// ─── Delete confirmation modal ─────────────────────────────────────────────────
function DeleteModal({ onConfirm, onClose, loading }) {
  const [typed, setTyped] = useState("");
  const confirmed = typed === "DELETE";
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20 }}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        style={{ width: "100%", maxWidth: 420, background: "rgba(14,14,28,0.98)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 22, padding: "28px 28px 24px", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(248,113,113,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RiAlertLine size={22} color="#f87171" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: 0 }}>Delete Account</h3>
        </div>
        <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.7, marginBottom: 18 }}>
          This action is <strong style={{ color: "#f87171" }}>permanent and irreversible</strong>. All your tasks, schedules, and data will be deleted forever.
        </p>
        <p style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>Type <strong style={{ color: "#f87171" }}>DELETE</strong> to confirm:</p>
        <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="DELETE"
          style={{ width: "100%", boxSizing: "border-box", background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, padding: "10px 14px", color: "#f87171", fontSize: 13, outline: "none", fontFamily: "inherit", marginBottom: 20 }} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <motion.button onClick={onClose} whileHover={{ scale: 1.03 }}
            style={{ padding: "9px 18px", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontSize: 13, cursor: "pointer" }}>
            Cancel
          </motion.button>
          <motion.button onClick={onConfirm} disabled={!confirmed || loading} whileHover={confirmed && !loading ? { scale: 1.03 } : {}}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 10, border: "none", background: confirmed && !loading ? "#ef4444" : "rgba(248,113,113,0.2)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: confirmed && !loading ? "pointer" : "default" }}>
            {loading ? <Spinner size={15} /> : <RiDeleteBinLine size={15} />}
            Delete My Account
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Change Password modal ────────────────────────────────────────────────────
function PasswordModal({ onClose, onSave, saving }) {
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k) => setShow((s) => ({ ...s, [k]: !s[k] }));
  const match = form.newPass === form.confirm;
  const valid = form.current && form.newPass.length >= 6 && match;

  const EyeBtn = ({ k }) => (
    <motion.button type="button" onClick={() => toggle(k)} whileHover={{ scale: 1.1 }} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex" }}>
      {show[k] ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
    </motion.button>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20 }}>
      <motion.div initial={{ scale: 0.93, y: 18 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 18 }}
        style={{ width: "100%", maxWidth: 420, background: "rgba(14,14,28,0.98)", border: `1px solid ${T.border}`, borderRadius: 22, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${T.border}`, background: "linear-gradient(135deg,rgba(124,58,237,0.08),transparent)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <RiLockLine size={16} color="#a78bfa" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Change Password</span>
          </div>
          <motion.button onClick={onClose} whileHover={{ scale: 1.1 }} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex" }}>
            <RiCloseLine size={20} />
          </motion.button>
        </div>
        <div style={{ padding: "22px 24px" }}>
          <Field label="Current Password" type={show.current ? "text" : "password"} value={form.current} onChange={(e) => set("current", e.target.value)} placeholder="Enter current password" right={<EyeBtn k="current" />} />
          <Field label="New Password" type={show.newPass ? "text" : "password"} value={form.newPass} onChange={(e) => set("newPass", e.target.value)} placeholder="Min. 6 characters" right={<EyeBtn k="newPass" />} />
          <Field label="Confirm New Password" type={show.confirm ? "text" : "password"} value={form.confirm} onChange={(e) => set("confirm", e.target.value)} placeholder="Repeat new password" right={<EyeBtn k="confirm" />} />
          {form.confirm && !match && <p style={{ fontSize: 12, color: "#f87171", margin: "-8px 0 12px" }}>Passwords do not match.</p>}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "0 24px 22px" }}>
          <motion.button onClick={onClose} whileHover={{ scale: 1.03 }} style={{ padding: "9px 18px", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontSize: 13, cursor: "pointer" }}>Cancel</motion.button>
          <motion.button onClick={() => onSave(form)} disabled={!valid || saving} whileHover={valid && !saving ? { scale: 1.03 } : {}}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 10, border: "none", background: valid && !saving ? "linear-gradient(135deg,#7c3aed,#3b82f6)" : "rgba(255,255,255,0.07)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: valid && !saving ? "pointer" : "default", boxShadow: valid && !saving ? "0 4px 16px rgba(124,58,237,0.3)" : "none" }}>
            {saving ? <Spinner size={15} /> : <RiSaveLine size={15} />}Update Password
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Settings page ────────────────────────────────────────────────────────────
export default function Settings() {
  const [sidebarWidth, setSidebarWidth]   = useState(240);
  const [profile, setProfile]             = useState({ name: "", email: "" });
  const [prefs, setPrefs]                 = useState({ dark_mode: true, notifications: true, ai_suggestions: true, auto_scheduling: false });
  const [profileLoading, setProfileLoading] = useState(false);
  const [showPwModal, setShowPwModal]     = useState(false);
  const [pwSaving, setPwSaving]           = useState(false);
  const [showDelete, setShowDelete]       = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast]                 = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // Fetch profile on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/user/profile");
        const d = res.data;
        setProfile({ name: d?.name ?? d?.username ?? "", email: d?.email ?? "" });
        if (d?.preferences) setPrefs((p) => ({ ...p, ...d.preferences }));
      } catch { /* profile endpoint may not exist yet */ }
      finally { setLoadingProfile(false); }
    })();
  }, []);

  const saveProfile = async () => {
    setProfileLoading(true);
    try {
      await api.put("/user/profile", profile);
      showToast("Profile updated.");
    } catch (e) { showToast(e?.response?.data?.message ?? "Save failed.", "error"); }
    finally { setProfileLoading(false); }
  };

  const savePrefs = async (key, val) => {
    const updated = { ...prefs, [key]: val };
    setPrefs(updated);
    try { await api.put("/user/preferences", updated); showToast("Preference saved."); }
    catch { showToast("Could not save preference.", "warn"); }
  };

  const changePassword = async (form) => {
    setPwSaving(true);
    try {
      await api.put("/user/password", { current_password: form.current, new_password: form.newPass });
      showToast("Password updated.");
      setShowPwModal(false);
    } catch (e) { showToast(e?.response?.data?.message ?? "Password change failed.", "error"); }
    finally { setPwSaving(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.delete("/user/account");
      localStorage.clear();
      window.location.href = "/login";
    } catch (e) { showToast(e?.response?.data?.message ?? "Delete failed.", "error"); setDeleteLoading(false); setShowDelete(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter',system-ui,sans-serif", display: "flex" }}>
      <Sidebar onWidthChange={setSidebarWidth} />

      <div style={{ flex: 1, marginLeft: sidebarWidth, transition: "margin-left 0.28s ease" }}>
        <Navbar sidebarWidth={sidebarWidth} />

        <main style={{ padding: "88px 28px 60px", maxWidth: 760, margin: "0 auto" }}>
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 30 }}>
            <div style={{ width: 40, height: 40, borderRadius: 13, background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <RiSettings4Line size={21} color="#a78bfa" />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Settings</h1>
              <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>Manage your profile, preferences, and account</p>
            </div>
          </motion.div>

          {/* ── Profile ── */}
          <Section icon={RiUserLine} title="Profile" accent="#a78bfa" delay={0}>
            {loadingProfile ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 20 }}><Spinner /></div>
            ) : (
              <>
                <AvatarUploader name={profile.name} />
                <Field label="Full Name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} placeholder="Your name" />
                <Field label="Email Address" type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} placeholder="you@example.com" />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                  <motion.button onClick={saveProfile} disabled={profileLoading} whileHover={!profileLoading ? { scale: 1.04 } : {}} whileTap={!profileLoading ? { scale: 0.96 } : {}}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 22px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#7c3aed,#3b82f6)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: profileLoading ? "default" : "pointer", boxShadow: "0 4px 18px rgba(124,58,237,0.3)" }}>
                    {profileLoading ? <Spinner size={15} /> : <RiSaveLine size={15} />}
                    Save Profile
                  </motion.button>
                </div>
              </>
            )}
          </Section>

          {/* ── Account ── */}
          <Section icon={RiLockLine} title="Account" accent="#60a5fa" delay={0.08}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Change password */}
              <motion.button onClick={() => setShowPwModal(true)} whileHover={{ scale: 1.02, borderColor: "rgba(96,165,250,0.4)" }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, cursor: "pointer", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(96,165,250,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <RiLockLine size={16} color="#60a5fa" />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Change Password</div>
                    <div style={{ fontSize: 11, color: T.muted }}>Update your login credentials</div>
                  </div>
                </div>
                <RiEditLine size={16} color={T.muted} />
              </motion.button>

              {/* Logout */}
              <motion.button onClick={handleLogout} whileHover={{ scale: 1.02, borderColor: "rgba(251,191,36,0.35)" }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, cursor: "pointer", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(251,191,36,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <RiLogoutBoxLine size={16} color="#fbbf24" />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Log Out</div>
                    <div style={{ fontSize: 11, color: T.muted }}>Sign out of this device</div>
                  </div>
                </div>
                <RiLogoutBoxLine size={16} color="#fbbf24" />
              </motion.button>
            </div>
          </Section>

          {/* ── Preferences ── */}
          <Section icon={RiShieldLine} title="Preferences" accent="#34d399" delay={0.16}>
            <Toggle value={prefs.dark_mode}      onChange={(v) => savePrefs("dark_mode", v)}      accent="#7c3aed" label="Dark Mode"        sub="Use dark theme across the app" />
            <Toggle value={prefs.notifications}  onChange={(v) => savePrefs("notifications", v)}  accent="#60a5fa" label="Notifications"     sub="Receive task reminders and alerts" />
            <Toggle value={prefs.ai_suggestions} onChange={(v) => savePrefs("ai_suggestions", v)} accent="#a78bfa" label="AI Suggestions"    sub="Let Athena suggest tasks and priorities" />
            <Toggle value={prefs.auto_scheduling} onChange={(v) => savePrefs("auto_scheduling", v)} accent="#34d399" label="Auto Scheduling"  sub="Automatically schedule tasks with AI" />
            {/* Remove last border */}
            <div style={{ borderBottom: "none" }} />
          </Section>

          {/* ── Danger Zone ── */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.42 }}
            style={{ background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 22px", borderBottom: "1px solid rgba(248,113,113,0.15)", background: "rgba(248,113,113,0.05)" }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(248,113,113,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <RiAlertLine size={17} color="#f87171" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#f87171" }}>Danger Zone</span>
            </div>
            <div style={{ padding: "22px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 3 }}>Delete Account</div>
                  <div style={{ fontSize: 12, color: T.muted }}>Permanently remove your account and all associated data. This cannot be undone.</div>
                </div>
                <motion.button onClick={() => setShowDelete(true)} whileHover={{ scale: 1.04, boxShadow: "0 4px 20px rgba(248,113,113,0.25)" }} whileTap={{ scale: 0.97 }}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 20px", borderRadius: 11, border: "1px solid rgba(248,113,113,0.4)", background: "rgba(248,113,113,0.1)", color: "#f87171", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                  <RiDeleteBinLine size={15} />Delete Account
                </motion.button>
              </div>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showPwModal && <PasswordModal onClose={() => setShowPwModal(false)} onSave={changePassword} saving={pwSaving} />}
        {showDelete  && <DeleteModal onClose={() => setShowDelete(false)} onConfirm={handleDeleteAccount} loading={deleteLoading} />}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key={toast.msg} message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
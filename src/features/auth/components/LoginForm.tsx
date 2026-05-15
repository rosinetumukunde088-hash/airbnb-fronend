import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types";

const BASE_URL = "http://localhost:5000";

interface Props {
  onSuccess: () => void;
}

const ROLES: { value: UserRole; icon: string; label: string; desc: string }[] = [
  { value: "GUEST", icon: "🧳", label: "Guest", desc: "I want to book stays" },
  { value: "HOST", icon: "🏠", label: "Host", desc: "I manage properties" },
];

const LoginForm = ({ onSuccess }: Props) => {
  const { loginWithToken } = useAuth();
  const [role, setRole] = useState<UserRole>("GUEST");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        // ✅ Backend login succeeded — use real JWT
        const data = await res.json();
        loginWithToken(
          { id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role },
          data.token
        );
        onSuccess();
      } else if (res.status === 401) {
        // ❌ Wrong credentials — show error, do NOT fall back silently
        const data = await res.json();
        setError(data.error ?? data.message ?? "Invalid email or password");
      } else {
        // Other backend error — show the message, do NOT fall back to tokenless login
        const data = await res.json();
        setError(data.error ?? data.message ?? "Login failed.");
      }
    } catch {
      // Backend not reachable — show error instead of fake login
      setError("Cannot connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotMsg("If that email exists, a reset link has been sent.");
  };

  if (showForgot) {
    return (
      <form onSubmit={handleForgot} style={s.form}>
        <div style={s.forgotHeader}>
          <span style={s.forgotIcon}>🔑</span>
          <div>
            <p style={s.forgotTitle}>Forgot password?</p>
            <p style={s.forgotSub}>We'll send a reset link to your email.</p>
          </div>
        </div>
        {forgotMsg && <div style={s.successBox}>{forgotMsg}</div>}
        <div style={s.field}>
          <label style={s.label}>Email address</label>
          <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@example.com" style={s.input} autoFocus />
        </div>
        <button type="submit" style={s.btn}>Send Reset Link</button>
        <button type="button" style={s.ghostBtn} onClick={() => { setShowForgot(false); setForgotMsg(""); }}>← Back to Login</button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={s.form}>
      {error && <div style={s.errorBox}>⚠️ {error}</div>}

      {/* Role selector */}
      <div style={s.roleRow}>
        {ROLES.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRole(r.value)}
            style={{ ...s.roleBtn, ...(role === r.value ? s.roleBtnActive : {}) }}
          >
            <span style={s.roleIcon}>{r.icon}</span>
            <span style={s.roleLabel}>{r.label}</span>
            <span style={s.roleDesc}>{r.desc}</span>
            {role === r.value && <span style={s.roleCheck}>✓</span>}
          </button>
        ))}
      </div>

      <div style={s.field}>
        <label style={s.label}>Email address</label>
        <div style={s.inputWrap}>
          <span style={s.inputIcon}>✉️</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={s.inputWithIcon} autoFocus />
        </div>
      </div>

      <div style={s.field}>
        <div style={s.labelRow}>
          <label style={s.label}>Password</label>
          <button type="button" style={s.forgotLink} onClick={() => { setShowForgot(true); setForgotEmail(email); }}>Forgot password?</button>
        </div>
        <div style={s.inputWrap}>
          <span style={s.inputIcon}></span>
          <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={s.inputWithIcon} />
          <button type="button" style={s.eyeBtn} onClick={() => setShowPw((v) => !v)}>{showPw ? "🙈" : "👁️"}</button>
        </div>
      </div>

      <button type="submit" style={{ ...s.btn, ...(loading ? s.btnLoading : {}) }} disabled={loading}>
        {loading ? <span style={s.spinner} /> : "Login"}
      </button>

     
    </form>
  );
};

export default LoginForm;

const s = {
  form: { display: "flex", flexDirection: "column" as const, gap: "18px" },
  roleRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  roleBtn: { position: "relative" as const, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "4px", padding: "12px 10px", borderRadius: "14px", border: "2px solid #e8e8e8", background: "#fafafa", cursor: "pointer" },
  roleBtnActive: { border: "2px solid #ff385c", background: "linear-gradient(135deg,#fff0f3,#fff)", boxShadow: "0 4px 12px rgba(255,56,92,0.12)" },
  roleIcon: { fontSize: "22px" },
  roleLabel: { fontSize: "13px", fontWeight: 700, color: "#222" },
  roleDesc: { fontSize: "11px", color: "#888" },
  roleCheck: { position: "absolute" as const, top: "8px", right: "10px", fontSize: "12px", color: "#ff385c", fontWeight: 800 },
  field: { display: "flex", flexDirection: "column" as const, gap: "7px" },
  labelRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: "13px", fontWeight: 700, color: "#333" },
  forgotLink: { background: "none", border: "none", color: "#ff385c", fontSize: "12px", fontWeight: 600, cursor: "pointer", padding: 0 },
  inputWrap: { position: "relative" as const, display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute" as const, left: "14px", fontSize: "15px", pointerEvents: "none" as const },
  inputWithIcon: { width: "100%", padding: "13px 44px 13px 42px", borderRadius: "14px", border: "1.5px solid #e8e8e8", fontSize: "14px", outline: "none", background: "#fafafa", boxSizing: "border-box" as const },
  input: { width: "100%", padding: "13px 16px", borderRadius: "14px", border: "1.5px solid #e8e8e8", fontSize: "14px", outline: "none", background: "#fafafa", boxSizing: "border-box" as const },
  eyeBtn: { position: "absolute" as const, right: "12px", background: "none", border: "none", cursor: "pointer", fontSize: "16px", padding: 0 },
  btn: { padding: "14px", background: "linear-gradient(135deg, #ff385c, #e8294a)", color: "#fff", border: "none", borderRadius: "14px", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(255,56,92,0.35)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50px" },
  btnLoading: { opacity: 0.8, cursor: "not-allowed" },
  spinner: { width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block" },
  ghostBtn: { background: "none", border: "none", color: "#888", fontSize: "13px", cursor: "pointer", textAlign: "center" as const, fontWeight: 600, padding: "4px" },
  errorBox: { background: "#fff0f0", border: "1px solid #ffd0d0", color: "#cc0000", borderRadius: "12px", padding: "12px 14px", fontSize: "13px" },
  successBox: { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", borderRadius: "12px", padding: "12px 14px", fontSize: "13px" },
  forgotHeader: { display: "flex", gap: "14px", alignItems: "flex-start" },
  forgotIcon: { fontSize: "28px" },
  forgotTitle: { fontSize: "17px", fontWeight: 700, color: "#222", margin: 0 },
  forgotSub: { fontSize: "13px", color: "#888", margin: "4px 0 0" },
  hint: { background: "#f8f9fa", borderRadius: "10px", padding: "12px 14px", border: "1px solid #e8e8e8" },
  hintTitle: { fontSize: "11px", fontWeight: 700, color: "#888", margin: "0 0 6px", textTransform: "uppercase" as const, letterSpacing: "0.5px" },
  hintText: { fontSize: "12px", color: "#555", margin: "2px 0", fontFamily: "monospace" },
} as const;

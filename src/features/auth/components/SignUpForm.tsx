import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types";

const BASE_URL = "http://localhost:5000";

interface Props {
  onSuccess: () => void;
}

const ROLES: { value: UserRole; icon: string; label: string; desc: string }[] = [
  { value: "GUEST", icon: "🧳", label: "Guest", desc: "Browse & book" },
  { value: "HOST",  icon: "🏠", label: "Host",  desc: "List & manage" },
];

const SignUpForm = ({ onSuccess }: Props) => {
  const { loginWithToken } = useAuth();
  const [role, setRole]         = useState<UserRole>("GUEST");
  const [name, setName]         = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColor = ["#eee", "#ff385c", "#f59e0b", "#22c55e"][pwStrength];
  const strengthLabel = ["", "Weak", "Fair", "Strong"][pwStrength];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !username || !email || !phone || !password || !confirm) {
      setError("Please fill in all fields."); return;
    }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, phone, password, role }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Registration failed.");
        return;
      }

      const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        setError("Registered but could not log in. Please sign in manually.");
        return;
      }

      const loginData = await loginRes.json();
      loginWithToken(
        { id: loginData.user.id, name: loginData.user.name, email: loginData.user.email, role: loginData.user.role },
        loginData.token
      );
      onSuccess();
    } catch {
      setError("Cannot connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={s.form}>
      {error && <div style={s.errorBox}>⚠️ {error}</div>}

      {/* Role selector */}
      <div style={s.roleRow}>
        {ROLES.map((r) => (
          <button key={r.value} type="button" onClick={() => setRole(r.value)}
            style={{ ...s.roleBtn, ...(role === r.value ? s.roleBtnActive : {}) }}>
            <span style={s.roleIcon}>{r.icon}</span>
            <span style={s.roleLabel}>{r.label}</span>
            <span style={s.roleDesc}>{r.desc}</span>
            {role === r.value && <span style={s.roleCheck}>✓</span>}
          </button>
        ))}
      </div>

      <div style={s.grid2}>
        <div style={s.field}>
          <label style={s.label}>Full Name *</label>
          <input style={s.input} placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div style={s.field}>
          <label style={s.label}>Username *</label>
          <input style={s.input} placeholder="janedoe" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
      </div>

      <div style={s.field}>
        <label style={s.label}>Email address *</label>
        <div style={s.inputWrap}>
          <span style={s.inputIcon}>✉️</span>
          <input type="email" style={s.inputWithIcon} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      <div style={s.field}>
        <label style={s.label}>Phone number *</label>
        <input style={s.input} placeholder="+1 234 567 890" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div style={s.grid2}>
        <div style={s.field}>
          <label style={s.label}>Password *</label>
          <div style={s.inputWrap}>
            <input type={showPw ? "text" : "password"} style={s.input} placeholder="Min. 8 chars" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" style={s.eyeBtn} onClick={() => setShowPw((v) => !v)}>{showPw ? "🙈" : "👁️"}</button>
          </div>
          {password.length > 0 && (
            <div style={s.strengthRow}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ ...s.strengthBar, background: i <= pwStrength ? strengthColor : "#eee" }} />
              ))}
              <span style={{ ...s.strengthText, color: strengthColor }}>{strengthLabel}</span>
            </div>
          )}
        </div>
        <div style={s.field}>
          <label style={s.label}>Confirm Password *</label>
          <div style={s.inputWrap}>
            <input
              type={showPw ? "text" : "password"}
              style={{
                ...s.input,
                ...(confirm && confirm !== password ? { borderColor: "#ff385c" } : {}),
                ...(confirm && confirm === password  ? { borderColor: "#22c55e" } : {}),
              }}
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <button type="submit" style={{ ...s.btn, ...(loading ? s.btnLoading : {}) }} disabled={loading}>
        {loading ? <span style={s.spinner} /> : `Sign Up as ${role === "HOST" ? "🏠 Host" : "🧳 Guest"}`}
      </button>
    </form>
  );
};

export default SignUpForm;

const s = {
  form: { display: "flex", flexDirection: "column" as const, gap: "16px" },
  roleRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  roleBtn: { position: "relative" as const, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "4px", padding: "14px 10px", borderRadius: "16px", border: "2px solid #e8e8e8", background: "#fafafa", cursor: "pointer" },
  roleBtnActive: { border: "2px solid #ff385c", background: "#fff0f3", boxShadow: "0 4px 16px rgba(255,56,92,0.15)" },
  roleIcon: { fontSize: "24px" },
  roleLabel: { fontSize: "14px", fontWeight: 700, color: "#222" },
  roleDesc: { fontSize: "11px", color: "#888" },
  roleCheck: { position: "absolute" as const, top: "8px", right: "10px", fontSize: "12px", color: "#ff385c", fontWeight: 800 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  field: { display: "flex", flexDirection: "column" as const, gap: "7px" },
  label: { fontSize: "12px", fontWeight: 700, color: "#444" },
  inputWrap: { position: "relative" as const, display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute" as const, left: "13px", fontSize: "14px", pointerEvents: "none" as const },
  inputWithIcon: { width: "100%", padding: "12px 40px 12px 38px", borderRadius: "14px", border: "1.5px solid #e8e8e8", fontSize: "13px", outline: "none", background: "#fafafa", boxSizing: "border-box" as const },
  input: { width: "100%", padding: "12px 14px", borderRadius: "14px", border: "1.5px solid #e8e8e8", fontSize: "13px", outline: "none", background: "#fafafa", boxSizing: "border-box" as const },
  eyeBtn: { position: "absolute" as const, right: "10px", background: "none", border: "none", cursor: "pointer", fontSize: "15px", padding: 0 },
  strengthRow: { display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" },
  strengthBar: { flex: 1, height: "3px", borderRadius: "4px" },
  strengthText: { fontSize: "11px", fontWeight: 600, minWidth: "36px" },
  btn: { padding: "14px", background: "#ff385c", color: "#fff", border: "none", borderRadius: "14px", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(255,56,92,0.35)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50px", marginTop: "4px" },
  btnLoading: { opacity: 0.8, cursor: "not-allowed" },
  spinner: { width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block" },
  errorBox: { background: "#fff0f0", border: "1px solid #ffd0d0", color: "#cc0000", borderRadius: "12px", padding: "12px 14px", fontSize: "13px" },
} as const;

import { useNavigate, Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      {/* Left panel - form */}
      <div style={styles.left}>
        <div style={styles.formBox}>
          <div style={styles.logo}>List<span style={styles.accent}>On.</span></div>
          <h2 style={styles.heading}>Welcome back</h2>
          <p style={styles.sub}>Sign in to your account</p>
          <LoginForm onSuccess={() => navigate("/")} />
          <p style={styles.footer}>
            Don't have an account?{" "}
            <Link to="/signup" style={styles.link}>Sign up</Link>
          </p>
        </div>
      </div>

      {/* Right panel - image */}
      <div style={styles.right}>
        <div style={styles.overlay} />
        <div style={styles.rightContent}>
          <h2 style={styles.tagline}>Your next adventure starts here</h2>
          <p style={styles.taglineSub}>
            Discover unique stays and experiences around the world. Sign in to manage your bookings and listings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "sans-serif",
  },
  left: {
    width: "480px",
    minWidth: "480px",
    background: "#fff",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "48px 40px",
    overflowY: "auto" as const,
  },
  formBox: { width: "100%" },
  logo: { fontSize: "28px", fontWeight: 800, color: "#222", marginBottom: "28px" },
  accent: { color: "#ff385c" },
  heading: { fontSize: "24px", fontWeight: 700, color: "#222", margin: "0 0 6px" },
  sub: { fontSize: "14px", color: "#888", marginBottom: "28px" },
  footer: { marginTop: "20px", fontSize: "13px", color: "#888", textAlign: "center" as const },
  link: { color: "#ff385c", fontWeight: 600, textDecoration: "none" },
  right: {
    flex: 1,
    position: "relative" as const,
    backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "flex-end",
    padding: "48px",
  },
  overlay: {
    position: "absolute" as const,
    inset: 0,
    background: "rgba(255,56,92,0.6)",
  },
  rightContent: {
    position: "relative" as const,
    zIndex: 1,
    color: "#fff",
    maxWidth: "420px",
  },
  tagline: { fontSize: "28px", fontWeight: 700, lineHeight: 1.3, margin: "0 0 16px" },
  taglineSub: { fontSize: "15px", opacity: 0.85, lineHeight: 1.7 },
} as const;

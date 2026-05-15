import { useNavigate, Link } from "react-router-dom";
import SignUpForm from "../components/SignUpForm";

const SignUpPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      {/* Right panel - form */}
      <div style={styles.right}>
        <div style={styles.formBox}>
          <h2 style={styles.heading}>Create an account</h2>
          <p style={styles.sub}>Join as a guest or host</p>
          <SignUpForm onSuccess={() => navigate("/login")} />
          <p style={styles.footer}>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>Sign in</Link>
          </p>
        </div>
      </div>

      {/* Left panel - image */}
      <div style={styles.left}>
        <div style={styles.overlay} />
        <div style={styles.leftContent}>
          <div style={styles.brand}>List<span style={styles.accent}>On.</span></div>
          <h2 style={styles.tagline}>Find your perfect place to stay</h2>
          <p style={styles.taglineSub}>
            Join thousands of guests and hosts on ListOn. Whether you're traveling or hosting, we've got you covered.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "sans-serif",
  },
  left: {
    flex: 1,
    position: "relative" as const,
    backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "flex-end",
    padding: "48px",
  },
  overlay: {
    position: "absolute" as const,
    inset: 0,
    background: "rgba(255,56,92,0.65)",
  },
  leftContent: {
    position: "relative" as const,
    zIndex: 1,
    color: "#fff",
    maxWidth: "420px",
  },
  brand: { fontSize: "32px", fontWeight: 800, marginBottom: "24px" },
  accent: { color: "#ffd6de" },
  tagline: { fontSize: "28px", fontWeight: 700, lineHeight: 1.3, margin: "0 0 16px" },
  taglineSub: { fontSize: "15px", opacity: 0.85, lineHeight: 1.7 },
  right: {
    width: "480px",
    minWidth: "480px",
    background: "#fff",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "48px 40px",
    overflowY: "auto" as const,
  },
  formBox: {
    width: "100%",
  },
  heading: { fontSize: "24px", fontWeight: 700, color: "#222", margin: "0 0 6px" },
  sub: { fontSize: "14px", color: "#888", marginBottom: "28px" },
  footer: { marginTop: "20px", fontSize: "13px", color: "#888", textAlign: "center" as const },
  link: { color: "#ff385c", fontWeight: 600, textDecoration: "none" },
} as const;

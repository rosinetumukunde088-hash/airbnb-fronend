import { Link } from "react-router-dom";

const NotFound = () => (
  <div style={styles.page}>
    <h1 style={styles.code}>404</h1>
    <p style={styles.msg}>Oops! Page not found.</p>
    <Link to="/" style={styles.link}>← Back to Home</Link>
  </div>
);

export default NotFound;

const styles = {
  page: {
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
  },
  code: { fontSize: "96px", fontWeight: 800, color: "#ff385c", margin: 0 },
  msg: { fontSize: "20px", color: "#666" },
  link: {
    padding: "12px 28px",
    backgroundColor: "#ff385c",
    color: "#fff",
    borderRadius: "25px",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "15px",
  },
} as const;

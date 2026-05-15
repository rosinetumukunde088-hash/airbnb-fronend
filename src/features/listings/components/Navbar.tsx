import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        List<span style={styles.logoAccent}>On.</span>
      </div>

      <ul style={styles.links}>
        <li><Link to="/" style={styles.link}>Home</Link></li>
       
        <li><Link to="/listings" style={styles.link}>Listings</Link></li>
        <li><Link to="/explore" style={styles.link}>Explore</Link></li>
      </ul>

      <div style={styles.actions}>
        <button style={styles.button}>Add Listing</button>
      </div>
    </nav>
  );
};

export default Navbar;

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 48px",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    position: "sticky" as const,
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: "26px",
    fontWeight: "bold",
    color: "#222",
  },
  logoAccent: {
    color: "#ff385c",
  },
  links: {
    listStyle: "none",
    display: "flex",
    gap: "28px",
    margin: 0,
    padding: 0,
  },
  link: {
    textDecoration: "none",
    color: "#222",
    fontWeight: 500,
    fontSize: "15px",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  button: {
    padding: "10px 22px",
    border: "none",
    backgroundColor: "#ff385c",
    color: "#fff",
    borderRadius: "25px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
  },
};

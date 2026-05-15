import { Link } from "react-router-dom";
import { FaFacebookF, FaLinkedinIn, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";
import { FiMapPin, FiPhone, FiMail, FiClock } from "react-icons/fi";
import { BsHouseDoor } from "react-icons/bs";

const SOCIALS = [
  { icon: <FaFacebookF size={14} />, href: "#" },
  { icon: <FaInstagram size={14} />, href: "#" },
  { icon: <FaTwitter size={14} />, href: "#" },
  { icon: <FaLinkedinIn size={14} />, href: "#" },
  { icon: <FaYoutube size={14} />, href: "#" },
];

const QUICK_LINKS = [
  { label: "Home", path: "/" },
  { label: "Listings", path: "/listings" },
  { label: "Explore", path: "/explore" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Create Listing", path: "/create-listing" },
];

const CATEGORIES = ["Beach", "Mountain", "City", "Countryside", "Luxury"];

const CONTACT = [
  { icon: <FiMapPin size={14} />, text: "123 Travel Street, New York" },
  { icon: <FiPhone size={14} />, text: "+1 (800) 123-4567" },
  { icon: <FiMail size={14} />, text: "hello@liston.com" },
  { icon: <FiClock size={14} />, text: "Mon–Fri, 9am–6pm" },
];

const Footer = () => (
  <footer style={s.footer}>
    <div style={s.top}>

      {/* Brand */}
      <div style={s.brand}>
        <div style={s.logo}>
          <BsHouseDoor size={22} color="#ff385c" style={{ marginRight: 8 }} />
          List<span style={s.accent}>On.</span>
        </div>
        <p style={s.tagline}>
          We're here to help you navigate while traveling. Find the best places to stay around the world.
        </p>
        <div style={s.socials}>
          {SOCIALS.map(({ icon, href }, i) => (
            <a key={i} href={href} style={s.socialBtn}>{icon}</a>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div style={s.col}>
        <h4 style={s.colTitle}>Quick Links</h4>
        {QUICK_LINKS.map(({ label, path }) => (
          <Link key={label} to={path} style={s.colLink}>→ {label}</Link>
        ))}
      </div>

      {/* Categories */}
      <div style={s.col}>
        <h4 style={s.colTitle}>Categories</h4>
        {CATEGORIES.map((c) => (
          <Link key={c} to="/listings" style={s.colLink}>→ {c}</Link>
        ))}
      </div>

      {/* Contact */}
      <div style={s.col}>
        <h4 style={s.colTitle}>Contact Us</h4>
        {CONTACT.map(({ icon, text }) => (
          <div key={text} style={s.contactItem}>
            <span style={s.contactIcon}>{icon}</span>
            {text}
          </div>
        ))}
      </div>
    </div>

    <div style={s.bottom}>
      <span>© {new Date().getFullYear()} List<span style={s.accent}>On.</span> All rights reserved.</span>
      <div style={s.bottomLinks}>
        {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
          <a key={l} href="#" style={s.bottomLink}>{l}</a>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;

const s = {
  footer: { backgroundColor: "#1a1a2e", color: "#ccc", padding: "60px 48px 24px", fontFamily: "'Segoe UI', system-ui, sans-serif" },
  top: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "40px", marginBottom: "40px" },
  brand: { display: "flex", flexDirection: "column" as const, gap: "14px" },
  logo: { fontSize: "26px", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center" },
  accent: { color: "#ff385c" },
  tagline: { fontSize: "14px", lineHeight: 1.7, color: "#aaa", margin: 0 },
  socials: { display: "flex", gap: "10px", marginTop: "4px" },
  socialBtn: {
    width: "36px", height: "36px", borderRadius: "50%",
    backgroundColor: "#2a2a3e", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    textDecoration: "none", transition: "background 0.2s",
  },
  col: { display: "flex", flexDirection: "column" as const, gap: "10px" },
  colTitle: { color: "#fff", fontSize: "16px", fontWeight: 700, margin: "0 0 6px" },
  colLink: { color: "#aaa", textDecoration: "none", fontSize: "14px" },
  contactItem: { display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#aaa" },
  contactIcon: { display: "flex", alignItems: "center", color: "#ff385c", flexShrink: 0 },
  bottom: { borderTop: "1px solid #2a2a3e", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", color: "#666", flexWrap: "wrap" as const, gap: "12px" },
  bottomLinks: { display: "flex", gap: "20px" },
  bottomLink: { color: "#666", textDecoration: "none", fontSize: "13px" },
} as const;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiMapPin } from "react-icons/fi";
import { FaUmbrellaBeach, FaMountain, FaCity, FaLeaf } from "react-icons/fa";
import { MdOutlineBedroomParent, MdOutlineCalendarMonth, MdOutlineVerified } from "react-icons/md";
import { HiOutlineUsers, HiOutlineGlobe, HiOutlineStar } from "react-icons/hi";
import { BsHouseDoor } from "react-icons/bs";

const FEATURES = [
  { icon: <FaUmbrellaBeach size={32} color="#ff385c" />, title: "Beach Getaways", desc: "Oceanfront villas and beachside retreats for the perfect escape." },
  { icon: <FaMountain size={32} color="#6366f1" />, title: "Mountain Cabins", desc: "Cozy alpine lodges surrounded by breathtaking scenery." },
  { icon: <FaCity size={32} color="#f59e0b" />, title: "City Apartments", desc: "Modern stays in the heart of the world's greatest cities." },
  { icon: <FaLeaf size={32} color="#22c55e" />, title: "Countryside Homes", desc: "Peaceful rural retreats away from the hustle and bustle." },
];

const STATS = [
  { num: "10K+", label: "Listings", icon: <BsHouseDoor size={22} color="#ff385c" /> },
  { num: "50K+", label: "Happy Guests", icon: <HiOutlineUsers size={22} color="#ff385c" /> },
  { num: "120+", label: "Countries", icon: <HiOutlineGlobe size={22} color="#ff385c" /> },
  { num: "4.9★", label: "Avg Rating", icon: <HiOutlineStar size={22} color="#ff385c" /> },
];

const STEPS = [
  { step: "01", icon: <FiSearch size={28} color="#ff385c" />, title: "Search", desc: "Browse thousands of unique listings by location, price, or category." },
  { step: "02", icon: <MdOutlineCalendarMonth size={28} color="#ff385c" />, title: "Book", desc: "Select your dates, add guests, and confirm your booking instantly." },
  { step: "03", icon: <MdOutlineBedroomParent size={28} color="#ff385c" />, title: "Stay", desc: "Check in and enjoy your perfect stay with 24/7 guest support." },
];

const Home = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(query.trim() ? `/listings?q=${encodeURIComponent(query.trim())}` : "/listings");
  };

  return (
    <div style={s.page}>

      {/* ── Hero ── */}
      <div style={s.hero}>
        <div style={s.heroOverlay} />
        <div style={s.heroContent}>
          <span style={s.heroBadge}>
            <MdOutlineVerified size={14} style={{ marginRight: 6 }} />
            Trusted by 50,000+ travellers
          </span>
          <h1 style={s.heroHeading}>
            Find Your Perfect<br />
            <em style={s.heroItalic}>Place to Stay</em>
          </h1>
          <p style={s.heroSub}>Discover unique homes, villas, and experiences around the world.</p>

          <div style={s.searchBox}>
            <FiMapPin size={16} color="#ff385c" style={{ flexShrink: 0 }} />
            <input
              style={s.searchInput}
              type="text"
              placeholder="Search by location or listing name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button style={s.searchBtn} onClick={handleSearch}>
              <FiSearch size={15} style={{ marginRight: 6 }} />
              Search
            </button>
          </div>

          <div style={s.heroTags}>
            {["Bali", "Paris", "New York", "Tokyo", "Maldives"].map((tag) => (
              <button key={tag} style={s.tag} onClick={() => navigate(`/listings?q=${tag}`)}>
                <FiMapPin size={11} style={{ marginRight: 4 }} />{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={s.statsBar}>
        {STATS.map((st) => (
          <div key={st.label} style={s.statItem}>
            <span style={s.statIcon}>{st.icon}</span>
            <span style={s.statNum}>{st.num}</span>
            <span style={s.statLabel}>{st.label}</span>
          </div>
        ))}
      </div>

      {/* ── Features ── */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Explore by Category</h2>
          <p style={s.sectionSub}>Find the perfect stay for every type of trip</p>
        </div>
        <div style={s.featuresGrid}>
          {FEATURES.map((f) => (
            <Link key={f.title} to="/listings" style={s.featureCard}>
              <span style={s.featureIcon}>{f.icon}</span>
              <h3 style={s.featureTitle}>{f.title}</h3>
              <p style={s.featureDesc}>{f.desc}</p>
              <span style={s.featureArrow}>Browse →</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>How ListOn Works</h2>
          <p style={s.sectionSub}>Book your dream stay in 3 simple steps</p>
        </div>
        <div style={s.stepsGrid}>
          {STEPS.map((item) => (
            <div key={item.step} style={s.stepCard}>
              <span style={s.stepNum}>{item.step}</span>
              <span style={s.stepIconWrap}>{item.icon}</span>
              <h3 style={s.stepTitle}>{item.title}</h3>
              <p style={s.stepDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div style={s.bottomCta}>
        <div style={s.bottomCtaOverlay} />
        <div style={s.bottomCtaContent}>
          <h2 style={s.bottomCtaTitle}>Ready to find your next adventure?</h2>
          <p style={s.bottomCtaSub}>Join 50,000+ travellers who trust ListOn for their stays.</p>
          <Link to="/listings" style={s.bottomCtaBtn}>
            <FiSearch size={16} style={{ marginRight: 8 }} />
            Browse All Listings
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Home;

const s = {
  page: { fontFamily: "'Segoe UI', system-ui, sans-serif" },
  hero: { position: "relative" as const, minHeight: "580px", backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400&q=80')", backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center" },
  heroOverlay: { position: "absolute" as const, inset: 0, background: "rgba(20,20,40,0.65)" },
  heroContent: { position: "relative" as const, zIndex: 1, textAlign: "center" as const, color: "#fff", padding: "0 24px", maxWidth: "760px" },
  heroBadge: { display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "20px", padding: "6px 16px", fontSize: "13px", fontWeight: 600, marginBottom: "20px" },
  heroHeading: { fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 800, lineHeight: 1.15, margin: "0 0 16px" },
  heroItalic: { fontStyle: "italic", color: "#ffd6de", textDecoration: "underline", textDecorationColor: "#ff385c", textUnderlineOffset: "6px" },
  heroSub: { fontSize: "17px", opacity: 0.9, marginBottom: "32px", lineHeight: 1.6 },
  searchBox: { display: "flex", alignItems: "center", background: "#fff", borderRadius: "50px", padding: "8px 8px 8px 20px", gap: "10px", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", maxWidth: "560px", margin: "0 auto 20px" },
  searchInput: { flex: 1, border: "none", outline: "none", fontSize: "14px", color: "#333", background: "transparent", minWidth: 0 },
  searchBtn: { padding: "12px 24px", background: "#ff385c", color: "#fff", border: "none", borderRadius: "50px", cursor: "pointer", fontWeight: 700, fontSize: "14px", whiteSpace: "nowrap" as const, flexShrink: 0, display: "flex", alignItems: "center" },
  heroTags: { display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" as const },
  tag: { padding: "6px 14px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "20px", color: "#fff", fontSize: "13px", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center" },

  statsBar: { display: "flex", justifyContent: "center", background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", padding: "24px 48px" },
  statItem: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "4px", flex: 1, borderRight: "1px solid #f0f0f0", padding: "0 32px" },
  statIcon: { marginBottom: "4px" },
  statNum: { fontSize: "26px", fontWeight: 800, color: "#ff385c" },
  statLabel: { fontSize: "13px", color: "#888", fontWeight: 500 },

  section: { padding: "64px 48px", maxWidth: "1200px", margin: "0 auto" },
  sectionHeader: { textAlign: "center" as const, marginBottom: "40px" },
  sectionTitle: { fontSize: "32px", fontWeight: 800, color: "#111", margin: "0 0 10px" },
  sectionSub: { fontSize: "16px", color: "#888" },

  featuresGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" },
  featureCard: { display: "flex", flexDirection: "column" as const, gap: "12px", padding: "28px 24px", background: "#fff", borderRadius: "20px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", textDecoration: "none", border: "1.5px solid #f0f0f0", cursor: "pointer" },
  featureIcon: { display: "flex" },
  featureTitle: { fontSize: "17px", fontWeight: 700, color: "#111", margin: 0 },
  featureDesc: { fontSize: "13px", color: "#666", lineHeight: 1.6, margin: 0, flex: 1 },
  featureArrow: { fontSize: "13px", color: "#ff385c", fontWeight: 700 },

  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" },
  stepCard: { display: "flex", flexDirection: "column" as const, gap: "12px", padding: "32px 28px", background: "#fff", borderRadius: "20px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1.5px solid #f0f0f0", position: "relative" as const },
  stepNum: { fontSize: "48px", fontWeight: 800, color: "#f0f0f0", lineHeight: 1, position: "absolute" as const, top: "20px", right: "24px" },
  stepIconWrap: { display: "flex", width: "52px", height: "52px", background: "#fff5f7", borderRadius: "14px", alignItems: "center", justifyContent: "center" },
  stepTitle: { fontSize: "18px", fontWeight: 700, color: "#111", margin: 0 },
  stepDesc: { fontSize: "14px", color: "#666", lineHeight: 1.6, margin: 0 },

  bottomCta: { position: "relative" as const, minHeight: "280px", backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80')", backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center" },
  bottomCtaOverlay: { position: "absolute" as const, inset: 0, background: "rgba(20,20,40,0.7)" },
  bottomCtaContent: { position: "relative" as const, zIndex: 1, textAlign: "center" as const, color: "#fff", padding: "0 24px" },
  bottomCtaTitle: { fontSize: "36px", fontWeight: 800, margin: "0 0 12px" },
  bottomCtaSub: { fontSize: "16px", opacity: 0.85, marginBottom: "28px" },
  bottomCtaBtn: { display: "inline-flex", alignItems: "center", padding: "14px 36px", background: "#ff385c", color: "#fff", borderRadius: "50px", fontWeight: 700, fontSize: "16px", textDecoration: "none", boxShadow: "0 4px 20px rgba(255,56,92,0.4)" },
} as const;

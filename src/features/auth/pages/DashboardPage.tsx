import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authApi } from "../../../services/api";
import {
  MdDashboard, MdMessage, MdPerson, MdLogout,
  MdBookOnline, MdBookmark, MdStar, MdAddHome,
  MdFormatListBulleted, MdBarChart, MdRateReview,
} from "react-icons/md";
import { FiClock, FiCalendar, FiDollarSign } from "react-icons/fi";
import type { ReactNode } from "react";

interface NavItem { label: string; icon: ReactNode; path: string; badge?: number; }

const GUEST_NAV_MAIN: NavItem[] = [
  { label: "Dashboard", icon: <MdDashboard size={18} />, path: "/dashboard" },
  { label: "My Bookings", icon: <MdBookOnline size={18} />, path: "#" },
  { label: "Saved Listings", icon: <MdBookmark size={18} />, path: "#" },
  { label: "Messages", icon: <MdMessage size={18} />, path: "#", badge: 2 },
];

const GUEST_NAV_ACCOUNT: NavItem[] = [
  { label: "My Reviews", icon: <MdStar size={18} />, path: "#" },
  { label: "Profile", icon: <MdPerson size={18} />, path: "/profile" },
];

const HOST_NAV_MAIN: NavItem[] = [
  { label: "Dashboard", icon: <MdDashboard size={18} />, path: "/dashboard" },
  { label: "Add Listing", icon: <MdAddHome size={18} />, path: "/add-listing" },
  { label: "My Listings", icon: <MdFormatListBulleted size={18} />, path: "/my-listings" },
  { label: "Bookings", icon: <MdBookOnline size={18} />, path: "#" },
];

const HOST_NAV_MANAGE: NavItem[] = [
  { label: "Reviews", icon: <MdRateReview size={18} />, path: "#" },
  { label: "Analytics", icon: <MdBarChart size={18} />, path: "#" },
  { label: "Messages", icon: <MdMessage size={18} />, path: "#", badge: 2 },
];

const HOST_NAV_ACCOUNT: NavItem[] = [
  { label: "Profile", icon: <MdPerson size={18} />, path: "/profile" },
];

const StatCard = ({ label, value, icon }: { label: string; value: string; icon: ReactNode }) => (
  <div style={styles.statCard}>
    <div>
      <p style={styles.statLabel}>{label}</p>
      <p style={styles.statValue}>{value}</p>
    </div>
    <span style={styles.statIcon}>{icon}</span>
  </div>
);

const ChatBubble = ({ from, msg, isMe }: { from: string; msg: string; isMe: boolean }) => (
  <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: "10px" }}>
    <div style={{
      maxWidth: "70%", padding: "10px 14px", borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
      background: isMe ? "#ff385c" : "#f0f0f0", color: isMe ? "#fff" : "#222", fontSize: "13px",
    }}>
      {!isMe && <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, color: "#888" }}>{from}</p>}
      {msg}
    </div>
  </div>
);

const DashboardPage = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("Dashboard");
  const [chatMsg, setChatMsg] = useState("");
  const [messages, setMessages] = useState([
    { from: "Host Alex", msg: "Hi! Feel free to ask about the listing.", isMe: false },
    { from: "Me", msg: "Thanks! Is early check-in available?", isMe: true },
    { from: "Host Alex", msg: "Yes, from 11am if the room is ready!", isMe: false },
  ]);

  const isHost = user?.role === "HOST";
  const handleLogout = () => { logout(); navigate("/"); };

  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [hostListings, setHostListings] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !token) return;
    if (isHost) {
      authApi.getListings()
        .then((res) => {
          const mine = (res.data ?? []).filter((l: any) => l.hostId === user.id);
          setHostListings(mine);
        })
        .catch(() => setHostListings([]));
    } else {
      setBookingsLoading(true);
      authApi.getMyBookings(user.id, token)
        .then((res) => setBookings(res.data ?? []))
        .catch(() => setBookings([]))
        .finally(() => setBookingsLoading(false));
    }
  }, [user, token, isHost]);

  const renderNav = (items: NavItem[]) =>
    items.map(({ label, icon, path, badge }) => (
      <Link key={label} to={path}
        style={{ ...styles.navItem, ...(active === label ? styles.navItemActive : {}) }}
        onClick={() => setActive(label)}
      >
        <span style={{ ...styles.navIcon, ...(active === label ? styles.navIconActive : {}) }}>{icon}</span>
        <span style={styles.navLabel}>{label}</span>
        {badge && <span style={styles.badge}>{badge}</span>}
      </Link>
    ));

  const sendMessage = () => {
    if (!chatMsg.trim()) return;
    setMessages((prev) => [...prev, { from: "Me", msg: chatMsg, isMe: true }]);
    setChatMsg("");
  };

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <Link to="/" style={{ textDecoration: "none", color: "#222" }}>
            List<span style={styles.accent}>On.</span>
          </Link>
        </div>

        <p style={styles.sectionLabel}>MAIN MENU</p>
        {isHost ? renderNav(HOST_NAV_MAIN) : renderNav(GUEST_NAV_MAIN)}

        <p style={styles.sectionLabel}>{isHost ? "MANAGE" : "ACTIVITY"}</p>
        {isHost ? renderNav(HOST_NAV_MANAGE) : renderNav(GUEST_NAV_ACCOUNT)}

        {isHost && (
          <>
            <p style={styles.sectionLabel}>ACCOUNT</p>
            {renderNav(HOST_NAV_ACCOUNT)}
          </>
        )}

        <button style={styles.logoutBtn} onClick={handleLogout}>
          <MdLogout size={16} /> Log Out
        </button>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        {/* Banner */}
        <div style={{ ...styles.banner, background: isHost ? "#f97316" : "#ff385c" }}>
          <div style={styles.bannerText}>
            <p style={styles.bannerTitle}>
              {isHost ? "Manage Your Properties" : "Your Travel Hub"}
            </p>
            <p style={styles.bannerSub}>
              {isHost
                ? "Add listings, track bookings, respond to reviews and grow your hosting business."
                : "Browse listings, manage your bookings, and chat with hosts — all in one place."}
            </p>
            <Link to={isHost ? "/add-listing" : "/listings"} style={styles.bannerBtn}>
              {isHost ? "Add New Listing" : "Browse Listings"}
            </Link>
          </div>

        </div>

        {/* HOST view */}
        {isHost ? (
          <>
            <div style={styles.statsRow}>
              <StatCard label="Total Listings" value={String(hostListings.length)} icon={<MdFormatListBulleted size={28} color="#f97316" />} />
              <StatCard label="Active Bookings" value={String(hostListings.filter((l) => l.available).length)} icon={<FiCalendar size={28} color="#f97316" />} />
              <StatCard label="Total Revenue" value="—" icon={<FiDollarSign size={28} color="#f97316" />} />
              <StatCard label="Avg. Rating" value="—" icon={<MdStar size={28} color="#f97316" />} />
            </div>
          </>
        ) : (
          /* GUEST view */
          <>
            <div style={styles.statsRow}>
              <StatCard label="Total Bookings" value={String(bookings.length)} icon={<MdBookOnline size={28} color="#ff385c" />} />
              <StatCard label="Confirmed" value={String(bookings.filter((b) => b.status === "CONFIRMED").length)} icon={<MdBookmark size={28} color="#ff385c" />} />
              <StatCard label="Pending" value={String(bookings.filter((b) => b.status === "PENDING").length)} icon={<MdStar size={28} color="#ff385c" />} />
              <StatCard label="Cancelled" value={String(bookings.filter((b) => b.status === "CANCELLED").length)} icon={<FiClock size={28} color="#ff385c" />} />
            </div>

            {/* Bookings table */}
            <div style={styles.card}>
              <p style={styles.cardTitle}>My Bookings</p>
              {bookingsLoading ? (
                <p style={{ color: "#888", fontSize: "13px" }}>Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <div style={styles.emptyBookings}>
                  <p style={{ color: "#aaa", fontSize: "14px", margin: 0 }}>No bookings yet.</p>
                  <Link to="/listings" style={styles.browseLink}>Browse listings →</Link>
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["Listing", "Check-in", "Check-out", "Guests", "Status"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b, i) => (
                      <tr key={i}>
                        <td style={styles.td}>{b.listing?.title ?? b.listingId}</td>
                        <td style={styles.td}>{b.checkIn ? new Date(b.checkIn).toLocaleDateString() : "—"}</td>
                        <td style={styles.td}>{b.checkOut ? new Date(b.checkOut).toLocaleDateString() : "—"}</td>
                        <td style={styles.td}>{b.guests ?? 1}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusPill,
                            background: b.status === "CONFIRMED" ? "#dcfce7" : b.status === "PENDING" ? "#fef9c3" : "#fee2e2",
                            color: b.status === "CONFIRMED" ? "#16a34a" : b.status === "PENDING" ? "#ca8a04" : "#dc2626",
                          }}>{b.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Chat with host */}
            <div style={styles.card}>
              <p style={styles.cardTitle}>Chat with Host</p>
              <div style={styles.chatBox}>
                {messages.map((m, i) => <ChatBubble key={i} {...m} />)}
              </div>
              <div style={styles.chatInput}>
                <input
                  style={styles.chatField}
                  placeholder="Type a message..."
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button style={styles.sendBtn} onClick={sendMessage}>Send</button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;

const styles = {
  layout: { display: "flex", minHeight: "100vh", background: "#f5f6fa", fontFamily: "sans-serif" },
  sidebar: {
    width: "260px", minWidth: "260px", background: "#fff",
    boxShadow: "2px 0 12px rgba(0,0,0,0.06)", display: "flex",
    flexDirection: "column" as const, padding: "24px 16px", gap: "4px",
  },
  sidebarLogo: { fontSize: "26px", fontWeight: 800, color: "#222", marginBottom: "28px", paddingLeft: "8px" },
  accent: { color: "#ff385c" },
  sectionLabel: { fontSize: "11px", fontWeight: 700, color: "#aaa", letterSpacing: "1px", margin: "16px 0 6px 8px" },
  navItem: {
    display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px",
    borderRadius: "10px", textDecoration: "none", color: "#555", fontSize: "14px", fontWeight: 500,
  },
  navItemActive: { background: "#fff0f3", color: "#ff385c", fontWeight: 700 },
  navIcon: { display: "flex", alignItems: "center", color: "#888" },
  navIconActive: { color: "#ff385c" },
  navLabel: { flex: 1 },
  badge: {
    background: "#22c55e", color: "#fff", borderRadius: "50%",
    width: "20px", height: "20px", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "11px", fontWeight: 700,
  },
  logoutBtn: {
    marginTop: "auto", padding: "10px 12px", background: "transparent",
    border: "1.5px solid #eee", borderRadius: "10px", color: "#cc0000",
    fontWeight: 600, fontSize: "14px", cursor: "pointer",
    display: "flex", alignItems: "center", gap: "8px",
  },
  main: { flex: 1, padding: "28px 36px", display: "flex", flexDirection: "column" as const, gap: "24px", overflowY: "auto" as const },
  banner: {
    borderRadius: "16px", padding: "32px 40px", display: "flex",
    justifyContent: "space-between", alignItems: "center", color: "#fff",
  },
  bannerText: { maxWidth: "520px" },
  bannerTitle: { fontSize: "22px", fontWeight: 800, margin: "0 0 10px" },
  bannerSub: { fontSize: "14px", opacity: 0.9, margin: "0 0 20px", lineHeight: 1.6 },
  bannerBtn: {
    display: "inline-block", padding: "11px 24px", background: "#fff",
    color: "#ff385c", borderRadius: "25px", fontWeight: 700, fontSize: "14px", textDecoration: "none",
  },
  bannerIllustration: { fontSize: "80px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" },
  statCard: {
    background: "#fff", borderRadius: "14px", padding: "20px 24px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  statLabel: { fontSize: "12px", color: "#888", margin: "0 0 6px" },
  statValue: { fontSize: "24px", fontWeight: 800, color: "#222", margin: 0 },
  statIcon: { display: "flex", alignItems: "center" },
  metricsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" },
  metricCard: { background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
  metricHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  metricTitle: { fontSize: "14px", color: "#888", fontWeight: 500 },
  metricValue: { fontSize: "32px", fontWeight: 800, color: "#222", margin: 0 },
  metricUnit: { fontSize: "14px", color: "#aaa", fontWeight: 400 },
  card: { background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
  cardTitle: { fontSize: "16px", fontWeight: 700, color: "#222", margin: "0 0 16px" },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: { textAlign: "left" as const, fontSize: "12px", color: "#888", fontWeight: 600, padding: "8px 12px", borderBottom: "1px solid #f0f0f0" },
  td: { fontSize: "13px", color: "#444", padding: "12px", borderBottom: "1px solid #f9f9f9" },
  statusPill: { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 },
  emptyBookings: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "10px", padding: "24px 0" },
  browseLink: { color: "#ff385c", fontWeight: 600, fontSize: "13px", textDecoration: "none" },
  chatBox: { height: "220px", overflowY: "auto" as const, padding: "8px 0", marginBottom: "12px" },
  chatInput: { display: "flex", gap: "10px" },
  chatField: {
    flex: 1, padding: "10px 14px", borderRadius: "10px",
    border: "1px solid #ddd", fontSize: "14px", outline: "none",
  },
  sendBtn: {
    padding: "10px 20px", background: "#ff385c", color: "#fff",
    border: "none", borderRadius: "10px", fontWeight: 600, cursor: "pointer", fontSize: "14px",
  },
} as const;

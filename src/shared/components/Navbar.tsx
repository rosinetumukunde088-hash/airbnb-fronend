import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { MdPerson, MdLogout, MdSettings } from "react-icons/md";

const NAV_LINKS = [
  { path: "/", label: "Home", end: true },
  { path: "/listings", label: "Listings", end: false },
  { path: "/explore", label: "Explore", end: false },
];

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <nav style={styles.nav}>
      <NavLink to="/" style={styles.logo}>
        List<span style={styles.accent}>On.</span>
      </NavLink>

      <ul style={styles.links}>
        {NAV_LINKS.map(({ path, label, end }) => (
          <li key={path}>
            <NavLink
              to={path}
              end={end}
              style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.linkActive : {}) })}
            >
              {label}
            </NavLink>
          </li>
        ))}
        {isAuthenticated && (
          <li>
            <NavLink
              to="/dashboard"
              style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.linkActive : {}) })}
            >
              Dashboard
            </NavLink>
          </li>
        )}
      </ul>

      <div style={styles.actions}>
        {isAuthenticated ? (
          <div style={styles.profileWrap} ref={dropdownRef}>
            {/* Clickable profile trigger */}
            <button style={styles.profileBtn} onClick={() => setOpen((v) => !v)}>
              <div style={styles.avatar}>
                {user?.avatar
                  ? <img src={user.avatar} alt="avatar" style={styles.avatarImg} />
                  : <span>{user?.name?.[0]?.toUpperCase() ?? "U"}</span>
                }
              </div>
              <div style={styles.userInfo}>
                <p style={styles.userName}>{user?.name}</p>
                <p style={styles.userRole}>{user?.role}</p>
              </div>
              <span style={styles.chevron}>{open ? "▲" : "▼"}</span>
            </button>

            {/* Dropdown */}
            {open && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  <div style={styles.dropAvatar}>
                    {user?.avatar
                      ? <img src={user.avatar} alt="avatar" style={styles.avatarImg} />
                      : <span>{user?.name?.[0]?.toUpperCase() ?? "U"}</span>
                    }
                  </div>
                  <div>
                    <p style={styles.dropName}>{user?.name}</p>
                    <p style={styles.dropEmail}>{user?.email}</p>
                  </div>
                </div>
                <div style={styles.dropDivider} />
                <Link to="/profile" style={styles.dropItem} onClick={() => setOpen(false)}>
                  <MdPerson size={16} /> My Profile
                </Link>
                <Link to="/profile" style={styles.dropItem} onClick={() => setOpen(false)}>
                  <MdSettings size={16} /> Settings
                </Link>
                <div style={styles.dropDivider} />
                <button style={styles.dropLogout} onClick={handleLogout}>
                  <MdLogout size={16} /> Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <NavLink to="/login" style={styles.outlineLink}>Log In</NavLink>
            <NavLink to="/signup" style={styles.button}>Sign Up</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

const styles = {
  nav: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 48px", backgroundColor: "#ffffff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)", position: "sticky" as const, top: 0, zIndex: 100,
  },
  logo: { fontSize: "26px", fontWeight: "bold" as const, color: "#222", textDecoration: "none" },
  accent: { color: "#ff385c" },
  links: { listStyle: "none", display: "flex", gap: "4px", margin: 0, padding: 0 },
  link: {
    textDecoration: "none", color: "#666", fontWeight: 500, fontSize: "14px",
    display: "flex", alignItems: "center", gap: "6px",
    padding: "8px 14px", borderRadius: "10px",
  },
  linkActive: { color: "#ff385c", fontWeight: 700, background: "#fff0f3" },
  actions: { display: "flex", alignItems: "center", gap: "10px" },

  /* Profile trigger */
  profileWrap: { position: "relative" as const },
  profileBtn: {
    display: "flex", alignItems: "center", gap: "10px",
    background: "#f9f9f9", border: "1.5px solid #eee",
    borderRadius: "50px", padding: "6px 14px 6px 6px",
    cursor: "pointer",
  },
  avatar: {
    width: "36px", height: "36px", borderRadius: "50%", background: "#ff385c",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: "14px", overflow: "hidden", flexShrink: 0,
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" as const },
  userInfo: { display: "flex", flexDirection: "column" as const, textAlign: "left" as const },
  userName: { margin: 0, fontWeight: 700, fontSize: "13px", color: "#222" },
  userRole: { margin: 0, fontSize: "11px", color: "#888", textTransform: "capitalize" as const },
  chevron: { fontSize: "10px", color: "#888" },

  /* Dropdown */
  dropdown: {
    position: "absolute" as const, top: "calc(100% + 10px)", right: 0,
    background: "#fff", borderRadius: "14px", boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
    minWidth: "220px", zIndex: 200, overflow: "hidden",
    border: "1px solid #f0f0f0",
  },
  dropdownHeader: { display: "flex", alignItems: "center", gap: "12px", padding: "16px" },
  dropAvatar: {
    width: "44px", height: "44px", borderRadius: "50%", background: "#ff385c",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: "18px", overflow: "hidden", flexShrink: 0,
  },
  dropName: { margin: 0, fontWeight: 700, fontSize: "14px", color: "#222" },
  dropEmail: { margin: 0, fontSize: "12px", color: "#888" },
  dropDivider: { height: "1px", background: "#f0f0f0" },
  dropItem: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "12px 16px", fontSize: "14px", color: "#444",
    textDecoration: "none", fontWeight: 500,
    cursor: "pointer",
  },
  dropLogout: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "12px 16px", fontSize: "14px", color: "#cc0000",
    background: "none", border: "none", width: "100%",
    textAlign: "left" as const, fontWeight: 600, cursor: "pointer",
  },

  button: {
    padding: "9px 18px", backgroundColor: "#ff385c", color: "#fff",
    borderRadius: "25px", fontWeight: 600, fontSize: "14px", textDecoration: "none",
  },
  outlineLink: {
    padding: "8px 18px", border: "1.5px solid #ddd", backgroundColor: "transparent",
    color: "#444", borderRadius: "25px", fontWeight: 600, fontSize: "14px", textDecoration: "none",
  },
} as const;

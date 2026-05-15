import { useState, useRef, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { MdEdit, MdSave, MdClose, MdCameraAlt, MdPerson } from "react-icons/md";

const ProfilePage = () => {
  const { user, token, updateProfile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token || !user) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`http://localhost:5000/users/${user.id}/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setAvatarPreview(data.avatar);
      await updateProfile({ avatar: data.avatar });
      setSuccess("Avatar updated!");
    } catch (err: any) {
      setError(err.message || "Avatar upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await updateProfile({ name, username, phone, bio });
      setSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (err: any) {
      setError(err.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name ?? "");
    setUsername(user?.username ?? "");
    setPhone(user?.phone ?? "");
    setBio(user?.bio ?? "");
    setEditing(false);
    setError("");
  };

  return (
    <div style={styles.page}>
      <div style={styles.topLogo}>
        <Link to="/" style={styles.logoLink}>List<span style={styles.accent}>On.</span></Link>
      </div>

      <div style={styles.card}>
        {/* Avatar section */}
        <div style={styles.avatarSection}>
          <div style={styles.avatarWrap}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar" style={styles.avatarImg} />
            ) : (
              <div style={styles.avatarFallback}>
                {user?.name?.[0]?.toUpperCase() ?? <MdPerson size={36} />}
              </div>
            )}
            <button
              style={styles.cameraBtn}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              title="Change photo"
            >
              {uploading ? "..." : <MdCameraAlt size={16} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
          </div>
          <div>
            <h2 style={styles.name}>{user?.name}</h2>
            <span style={styles.rolePill}>{user?.role}</span>
            <p style={styles.email}>{user?.email}</p>
          </div>
        </div>

        {success && <p style={styles.success}>{success}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSave} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!editing}
                style={{ ...styles.input, ...(editing ? {} : styles.inputDisabled) }}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!editing}
                style={{ ...styles.input, ...(editing ? {} : styles.inputDisabled) }}
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input value={user?.email ?? ""} disabled style={{ ...styles.input, ...styles.inputDisabled }} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!editing}
                style={{ ...styles.input, ...(editing ? {} : styles.inputDisabled) }}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={!editing}
              rows={3}
              placeholder="Tell us about yourself..."
              style={{ ...styles.textarea, ...(editing ? {} : styles.inputDisabled) }}
            />
          </div>

          <div style={styles.actions}>
            {editing ? (
              <>
                <button type="submit" style={styles.saveBtn} disabled={saving}>
                  <MdSave size={16} /> {saving ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" style={styles.cancelBtn} onClick={handleCancel}>
                  <MdClose size={16} /> Cancel
                </button>
              </>
            ) : (
              <button type="button" style={styles.editBtn} onClick={() => setEditing(true)}>
                <MdEdit size={16} /> Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;

const styles = {
  page: { minHeight: "80vh", background: "#f5f6fa", padding: "40px 24px", display: "flex", flexDirection: "column" as const, alignItems: "center", fontFamily: "sans-serif" },
  topLogo: { width: "100%", maxWidth: "640px", marginBottom: "16px" },
  logoLink: { fontSize: "26px", fontWeight: 800, color: "#222", textDecoration: "none" },
  accent: { color: "#ff385c" },
  card: { background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "40px", width: "100%", maxWidth: "640px" },
  avatarSection: { display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px" },
  avatarWrap: { position: "relative" as const, flexShrink: 0 },
  avatarImg: { width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover" as const, border: "3px solid #ff385c" },
  avatarFallback: {
    width: "90px", height: "90px", borderRadius: "50%", background: "#ff385c",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "36px", fontWeight: 800,
  },
  cameraBtn: {
    position: "absolute" as const, bottom: 0, right: 0,
    width: "28px", height: "28px", borderRadius: "50%",
    background: "#222", color: "#fff", border: "2px solid #fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", padding: 0,
  },
  name: { margin: "0 0 6px", fontSize: "20px", fontWeight: 700, color: "#222" },
  rolePill: { padding: "3px 12px", background: "#fff0f3", color: "#ff385c", borderRadius: "20px", fontSize: "12px", fontWeight: 700 },
  email: { margin: "6px 0 0", fontSize: "13px", color: "#888" },
  form: { display: "flex", flexDirection: "column" as const, gap: "16px" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  field: { display: "flex", flexDirection: "column" as const, gap: "6px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#444" },
  input: { padding: "11px 14px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", outline: "none", background: "#fff", color: "#222" },
  textarea: { padding: "11px 14px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", outline: "none", background: "#fff", color: "#222", resize: "vertical" as const, fontFamily: "sans-serif" },
  inputDisabled: { background: "#f9f9f9", color: "#888", cursor: "not-allowed" },
  actions: { display: "flex", gap: "12px", marginTop: "8px" },
  editBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "11px 24px", background: "#ff385c", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "14px", cursor: "pointer" },
  saveBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "11px 24px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "14px", cursor: "pointer" },
  cancelBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "11px 24px", background: "#f0f0f0", color: "#444", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "14px", cursor: "pointer" },
  success: { color: "#16a34a", background: "#dcfce7", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", margin: 0 },
  error: { color: "#cc0000", background: "#fee2e2", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", margin: 0 },
} as const;

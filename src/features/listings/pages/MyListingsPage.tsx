import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { authApi, type CreateListingPayload } from "../../../services/api";
import {
  MdEdit, MdDelete, MdClose, MdSave, MdAddHome,
  MdLocationOn, MdAttachMoney, MdPeople, MdHome,
} from "react-icons/md";
import { useNavigate, Link } from "react-router-dom";

const TYPES = ["APARTMENT", "HOUSE", "VILLA", "CABIN"] as const;

const MyListingsPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CreateListingPayload>>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await authApi.getListings();
      const mine = (res.data ?? []).filter((l: any) => l.hostId === user?.id);
      setListings(mine);
    } catch {
      setError("Failed to load listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const startEdit = (l: any) => {
    setEditId(l.id);
    setEditForm({
      title: l.title, location: l.location,
      pricePerNight: l.pricePerNight, guest: l.guest,
      type: l.type, description: l.description ?? "", amenities: l.amenities ?? [],
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: name === "pricePerNight" || name === "guest" ? Number(value) : value }));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editId || !token) return;
    setSaving(true);
    try {
      await authApi.updateListing(editId, editForm, token);
      setEditId(null);
      fetchListings();
    } catch (err: any) {
      setError(err.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await authApi.deleteListing(id, token);
      setDeleteId(null);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err: any) {
      setError(err.message || "Delete failed.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.topLogo}>
        <Link to="/" style={styles.logoLink}>List<span style={styles.accent}>On.</span></Link>
      </div>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>My Listings</h2>
          <p style={styles.sub}>{listings.length} listing{listings.length !== 1 ? "s" : ""} published</p>
        </div>
        <button style={styles.addBtn} onClick={() => navigate("/add-listing")}>
          <MdAddHome size={18} /> Add New Listing
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {loading ? (
        <p style={styles.loading}>Loading your listings...</p>
      ) : listings.length === 0 ? (
        <div style={styles.empty}>
          <MdHome size={48} color="#ddd" />
          <p>You haven't added any listings yet.</p>
          <button style={styles.addBtn} onClick={() => navigate("/add-listing")}>Add Your First Listing</button>
        </div>
      ) : (
        <div style={styles.grid}>
          {listings.map((l) => (
            <div key={l.id} style={styles.card}>
              <img
                src={l.photos?.[0]?.url ?? "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=220&fit=crop"}
                alt={l.title}
                style={styles.img}
              />
              <div style={styles.cardBody}>
                <div style={styles.typePill}>{l.type}</div>
                <h3 style={styles.cardTitle}>{l.title}</h3>
                <p style={styles.cardLocation}><MdLocationOn size={13} color="#ff385c" /> {l.location}</p>
                <div style={styles.cardMeta}>
                  <span><MdAttachMoney size={13} /> ${l.pricePerNight}/night</span>
                  <span><MdPeople size={13} /> {l.guest} guests</span>
                </div>
                <div style={styles.cardActions}>
                  <button style={styles.editBtn} onClick={() => startEdit(l)}>
                    <MdEdit size={15} /> Edit
                  </button>
                  <button style={styles.deleteBtn} onClick={() => setDeleteId(l.id)}>
                    <MdDelete size={15} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editId && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Edit Listing</h3>
              <button style={styles.closeBtn} onClick={() => setEditId(null)}><MdClose size={20} /></button>
            </div>
            <form onSubmit={handleSave} style={styles.form}>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}><MdHome size={13} style={{ color: "#ff385c" }} /> Title</label>
                  <input name="title" value={editForm.title ?? ""} onChange={handleEditChange} style={styles.input} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}><MdLocationOn size={13} style={{ color: "#ff385c" }} /> Location</label>
                  <input name="location" value={editForm.location ?? ""} onChange={handleEditChange} style={styles.input} required />
                </div>
              </div>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}><MdAttachMoney size={13} style={{ color: "#ff385c" }} /> Price/Night ($)</label>
                  <input name="pricePerNight" type="number" min={1} value={editForm.pricePerNight ?? 0} onChange={handleEditChange} style={styles.input} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}><MdPeople size={13} style={{ color: "#ff385c" }} /> Max Guests</label>
                  <input name="guest" type="number" min={1} value={editForm.guest ?? 1} onChange={handleEditChange} style={styles.input} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Type</label>
                  <select name="type" value={editForm.type ?? "APARTMENT"} onChange={handleEditChange} style={styles.input}>
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea name="description" value={editForm.description ?? ""} onChange={handleEditChange} rows={3} style={styles.textarea} />
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setEditId(null)}>Cancel</button>
                <button type="submit" style={styles.saveBtn} disabled={saving}>
                  <MdSave size={15} /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: "400px" }}>
            <h3 style={styles.modalTitle}>Delete Listing</h3>
            <p style={{ color: "#555", fontSize: "14px", margin: "12px 0 24px" }}>
              Are you sure you want to delete this listing? This action cannot be undone.
            </p>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
              <button style={styles.confirmDeleteBtn} onClick={() => handleDelete(deleteId)}>
                <MdDelete size={15} /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListingsPage;

const styles = {
  page: { padding: "32px 48px", fontFamily: "sans-serif", background: "#f5f6fa", minHeight: "80vh" },
  topLogo: { marginBottom: "24px" },
  logoLink: { fontSize: "26px", fontWeight: 800, color: "#222", textDecoration: "none" },
  accent: { color: "#ff385c" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" },
  title: { fontSize: "22px", fontWeight: 700, color: "#222", margin: "0 0 4px" },
  sub: { fontSize: "13px", color: "#888", margin: 0 },
  addBtn: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "11px 22px", background: "#ff385c", color: "#fff",
    border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "14px", cursor: "pointer",
  },
  loading: { color: "#888", fontSize: "14px" },
  empty: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "12px", padding: "60px", color: "#aaa", fontSize: "14px" },
  error: { color: "#cc0000", background: "#fee2e2", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" },
  card: { background: "#fff", borderRadius: "14px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" },
  img: { width: "100%", height: "180px", objectFit: "cover" as const, display: "block" },
  cardBody: { padding: "16px" },
  typePill: { display: "inline-block", padding: "3px 10px", background: "#fff0f3", color: "#ff385c", borderRadius: "20px", fontSize: "11px", fontWeight: 700, marginBottom: "8px" },
  cardTitle: { fontSize: "15px", fontWeight: 700, color: "#222", margin: "0 0 6px" },
  cardLocation: { display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#666", marginBottom: "8px" },
  cardMeta: { display: "flex", gap: "12px", fontSize: "12px", color: "#555", marginBottom: "12px" },
  cardActions: { display: "flex", gap: "8px" },
  editBtn: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
    padding: "8px", background: "#f0f0f0", color: "#222",
    border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "13px", cursor: "pointer",
  },
  deleteBtn: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
    padding: "8px", background: "#fee2e2", color: "#cc0000",
    border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "13px", cursor: "pointer",
  },
  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "24px" },
  modal: { background: "#fff", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto" as const },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  modalTitle: { fontSize: "18px", fontWeight: 700, color: "#222", margin: 0 },
  closeBtn: { background: "none", border: "none", cursor: "pointer", color: "#888", display: "flex" },
  form: { display: "flex", flexDirection: "column" as const, gap: "16px" },
  row: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" },
  field: { display: "flex", flexDirection: "column" as const, gap: "5px" },
  label: { fontSize: "12px", fontWeight: 600, color: "#444", display: "flex", alignItems: "center", gap: "4px" },
  input: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", outline: "none" },
  textarea: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", outline: "none", resize: "vertical" as const, fontFamily: "sans-serif" },
  modalActions: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" },
  cancelBtn: { padding: "10px 20px", background: "#f0f0f0", color: "#444", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "13px", cursor: "pointer" },
  saveBtn: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "10px 20px", background: "#22c55e", color: "#fff",
    border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer",
  },
  confirmDeleteBtn: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "10px 20px", background: "#cc0000", color: "#fff",
    border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer",
  },
} as const;

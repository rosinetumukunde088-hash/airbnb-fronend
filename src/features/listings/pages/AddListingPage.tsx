import { useState, useRef, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { authApi, type CreateListingPayload } from "../../../services/api";
import {
  MdTitle, MdLocationOn, MdAttachMoney, MdPeople, MdHome,
  MdDescription, MdWifi, MdKitchen, MdLocalParking, MdPool,
  MdAcUnit, MdLocalLaundryService, MdTv, MdFitnessCenter,
  MdPublish, MdArrowBack, MdAddPhotoAlternate, MdClose,
} from "react-icons/md";

const TYPES = ["APARTMENT", "HOUSE", "VILLA", "CABIN"] as const;

const AMENITIES = [
  { label: "WiFi", icon: <MdWifi size={15} /> },
  { label: "Kitchen", icon: <MdKitchen size={15} /> },
  { label: "Parking", icon: <MdLocalParking size={15} /> },
  { label: "Pool", icon: <MdPool size={15} /> },
  { label: "Air conditioning", icon: <MdAcUnit size={15} /> },
  { label: "Washer", icon: <MdLocalLaundryService size={15} /> },
  { label: "TV", icon: <MdTv size={15} /> },
  { label: "Gym", icon: <MdFitnessCenter size={15} /> },
];

const AddListingPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const [form, setForm] = useState<CreateListingPayload>({
    title: "", location: "", pricePerNight: 0,
    guest: 1, type: "APARTMENT", amenities: [], description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "pricePerNight" || name === "guest" ? Number(value) : value,
    }));
  };

  const toggleAmenity = (a: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (!token) { setError("You must be logged in to upload photos."); return; }
    setError("");
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("image", file);
        const res = await fetch("http://localhost:5000/upload/listing-photo", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? data.message ?? "Photo upload failed.");
          return;
        }
        if (data.url) urls.push(data.url);
      }
      setPhotos((prev) => [...prev, ...urls]);
    } catch (err: any) {
      setError(err.message ?? "Photo upload failed. Check your connection.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removePhoto = (url: string) => setPhotos((prev) => prev.filter((p) => p !== url));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) { setError("You must be logged in to add a listing."); return; }
    if (photos.length === 0) { setError("Please upload at least one photo."); return; }
    setLoading(true);
    try {
      const listing = await authApi.createListing(form, token);
      // Save photos linked to the listing
      await Promise.all(
        photos.map((url) =>
          fetch(`http://localhost:5000/listings/${listing.id}/photos`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ url }),
          })
        )
      );
      navigate("/listings");
    } catch (err: any) {
      setError(err.message || "Failed to create listing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.topLogo}>
        <Link to="/" style={styles.logoLink}>List<span style={styles.accent}>On.</span></Link>
      </div>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Add New Listing</h2>
            <p style={styles.sub}>Fill in the details to publish your property</p>
          </div>
          <MdHome size={40} color="#ff385c" />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Photos */}
          <div style={styles.field}>
            <label style={styles.label}><MdAddPhotoAlternate size={14} style={styles.labelIcon} /> Photos</label>
            <div style={styles.photoGrid}>
              {photos.map((url) => (
                <div key={url} style={styles.photoThumb}>
                  <img src={url} alt="listing" style={styles.thumbImg} />
                  <button type="button" style={styles.removeBtn} onClick={() => removePhoto(url)}>
                    <MdClose size={14} />
                  </button>
                </div>
              ))}
              <button type="button" style={styles.uploadBtn} onClick={() => fileRef.current?.click()} disabled={uploading}>
                <MdAddPhotoAlternate size={28} color="#ff385c" />
                <span style={styles.uploadText}>{uploading ? "Uploading..." : "Add Photo"}</span>
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handlePhotoUpload} />
          </div>

          {/* Title & Location */}
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}><MdTitle size={14} style={styles.labelIcon} /> Title</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="Cozy Apartment in Kigali" style={styles.input} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}><MdLocationOn size={14} style={styles.labelIcon} /> Location</label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="Kigali, Rwanda" style={styles.input} required />
            </div>
          </div>

          {/* Price, Guests, Type */}
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}><MdAttachMoney size={14} style={styles.labelIcon} /> Price per Night ($)</label>
              <input name="pricePerNight" type="number" min={1} value={form.pricePerNight} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}><MdPeople size={14} style={styles.labelIcon} /> Max Guests</label>
              <input name="guest" type="number" min={1} value={form.guest} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}><MdHome size={14} style={styles.labelIcon} /> Type</label>
              <select name="type" value={form.type} onChange={handleChange} style={styles.input}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={styles.field}>
            <label style={styles.label}><MdDescription size={14} style={styles.labelIcon} /> Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe your property..." style={styles.textarea} />
          </div>

          {/* Amenities */}
          <div style={styles.field}>
            <label style={styles.label}>Amenities</label>
            <div style={styles.amenitiesGrid}>
              {AMENITIES.map(({ label, icon }) => (
                <button key={label} type="button" onClick={() => toggleAmenity(label)}
                  style={{ ...styles.amenityBtn, ...(form.amenities.includes(label) ? styles.amenityActive : {}) }}>
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={() => navigate(-1)}>
              <MdArrowBack size={16} /> Cancel
            </button>
            <button type="submit" style={styles.submitBtn} disabled={loading || uploading}>
              <MdPublish size={16} /> {loading ? "Publishing..." : "Publish Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddListingPage;

const styles = {
  page: { minHeight: "80vh", background: "#f5f6fa", padding: "40px 24px", display: "flex", flexDirection: "column" as const, alignItems: "center", fontFamily: "sans-serif" },
  topLogo: { width: "100%", maxWidth: "720px", marginBottom: "16px" },
  logoLink: { fontSize: "26px", fontWeight: 800, color: "#222", textDecoration: "none" },
  accent: { color: "#ff385c" },
  card: { background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "40px", width: "100%", maxWidth: "720px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" },
  title: { fontSize: "22px", fontWeight: 700, color: "#222", margin: "0 0 6px" },
  sub: { fontSize: "14px", color: "#888", margin: 0 },
  form: { display: "flex", flexDirection: "column" as const, gap: "20px" },
  row: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" },
  field: { display: "flex", flexDirection: "column" as const, gap: "6px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#444", display: "flex", alignItems: "center", gap: "4px" },
  labelIcon: { color: "#ff385c" },
  input: { padding: "11px 14px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", outline: "none", background: "#fff" },
  textarea: { padding: "11px 14px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", outline: "none", resize: "vertical" as const, fontFamily: "sans-serif" },
  photoGrid: { display: "flex", flexWrap: "wrap" as const, gap: "10px" },
  photoThumb: { position: "relative" as const, width: "100px", height: "80px", borderRadius: "10px", overflow: "hidden" },
  thumbImg: { width: "100%", height: "100%", objectFit: "cover" as const },
  removeBtn: {
    position: "absolute" as const, top: "4px", right: "4px",
    background: "rgba(0,0,0,0.6)", color: "#fff", border: "none",
    borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
  },
  uploadBtn: {
    width: "100px", height: "80px", borderRadius: "10px",
    border: "2px dashed #ddd", background: "#fafafa",
    display: "flex", flexDirection: "column" as const, alignItems: "center",
    justifyContent: "center", cursor: "pointer", gap: "4px",
  },
  uploadText: { fontSize: "11px", color: "#888", fontWeight: 600 },
  amenitiesGrid: { display: "flex", flexWrap: "wrap" as const, gap: "8px" },
  amenityBtn: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "7px 14px", borderRadius: "20px", border: "1.5px solid #ddd",
    background: "#fff", fontSize: "13px", cursor: "pointer", color: "#555", fontWeight: 500,
  },
  amenityActive: { borderColor: "#ff385c", background: "#fff0f3", color: "#ff385c", fontWeight: 700 },
  actions: { display: "flex", gap: "12px", justifyContent: "flex-end" },
  cancelBtn: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "11px 24px", background: "#f0f0f0", color: "#444",
    border: "none", borderRadius: "10px", fontWeight: 600, fontSize: "14px", cursor: "pointer",
  },
  submitBtn: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "11px 28px", background: "#ff385c", color: "#fff",
    border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "14px", cursor: "pointer",
  },
  error: { color: "#cc0000", fontSize: "13px", background: "#fee2e2", padding: "10px 14px", borderRadius: "8px", margin: "0 0 8px" },
} as const;

import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../../store/StoreContext";
import { useAuth } from "../../auth/hooks/useAuth";
import type { Listing } from "../../listings/types";
import toast from "react-hot-toast";

// ─── Types matching the DB schema ────────────────────────────────────────────
type ListingType = "APARTMENT" | "HOUSE" | "VILLA" | "CABIN";

const LISTING_TYPES: { value: ListingType; icon: string; label: string; desc: string }[] = [
  { value: "APARTMENT", icon: "🏢", label: "Apartment", desc: "Flat or condo unit" },
  { value: "HOUSE",     icon: "🏠", label: "House",     desc: "Full standalone home" },
  { value: "VILLA",     icon: "🏖️", label: "Villa",     desc: "Luxury villa or resort" },
  { value: "CABIN",     icon: "🏔️", label: "Cabin",     desc: "Rustic mountain cabin" },
];

const AMENITY_OPTIONS = [
  "WiFi", "Kitchen", "Air Conditioning", "Heating", "Washer",
  "Dryer", "Free Parking", "Pool", "Hot Tub", "Gym",
  "TV", "Workspace", "BBQ Grill", "Fireplace", "Beach Access",
];

interface FormData {
  title: string;
  description: string;
  location: string;
  pricePerNight: string;
  guest: string;
  type: ListingType;
  amenities: string[];
  img: string;
}

const INITIAL: FormData = {
  title: "",
  description: "",
  location: "",
  pricePerNight: "",
  guest: "1",
  type: "APARTMENT",
  amenities: [],
  img: "",
};

// ─── Component ────────────────────────────────────────────────────────────────
const CreateListingPage = () => {
  const navigate = useNavigate();
  const { dispatch } = useStore();
  const { token } = useAuth();

  const [form, setForm] = useState<FormData>(INITIAL);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleAmenity = (a: string) =>
    set("amenities", form.amenities.includes(a)
      ? form.amenities.filter((x) => x !== a)
      : [...form.amenities, a]
    );

  const handleImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      set("img", result);
    };
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (form.title.trim().length < 5)       e.title = "Title must be at least 5 characters";
    if (!form.description.trim())            e.description = "Description is required";
    if (form.location.trim().length < 3)     e.location = "Location is required";
    if (!form.pricePerNight || Number(form.pricePerNight) < 1) e.pricePerNight = "Price must be at least $1";
    if (!form.guest || Number(form.guest) < 1) e.guest = "At least 1 guest required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const typeToCategory: Record<ListingType, Listing["category"]> = {
      APARTMENT: "city", HOUSE: "countryside", VILLA: "beach", CABIN: "mountain",
    };

    const payload = {
      title:        form.title.trim(),
      description:  form.description.trim(),
      location:     form.location.trim(),
      pricePerNight: Number(form.pricePerNight),
      guest:        Number(form.guest),
      type:         form.type,
      amenities:    form.amenities,
    };

    try {
      if (token) {
        const res = await fetch("http://localhost:5000/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? data.detail ?? data.error ?? "Failed to create listing");

        dispatch({
          type: "ADD_LISTING",
          payload: {
            id: data.id, title: data.title, location: data.location,
            price: data.pricePerNight, rating: 0, superhost: false,
            available: true, availableFrom: new Date().toISOString().split("T")[0]!,
            img: form.img || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=260&fit=crop",
            category: typeToCategory[form.type],
          },
        });
      } else {
        // No backend session — save locally only
        await new Promise((r) => setTimeout(r, 600));
        dispatch({
          type: "ADD_LISTING",
          payload: {
            id: String(Date.now()), title: payload.title, location: payload.location,
            price: payload.pricePerNight, rating: 0, superhost: false,
            available: true, availableFrom: new Date().toISOString().split("T")[0]!,
            img: form.img || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=260&fit=crop",
            category: typeToCategory[form.type],
          },
        });
      }

      toast.success("Listing created successfully! 🎉");
      navigate("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <div>
          <h1 style={s.pageTitle}>Create New Listing</h1>
          <p style={s.pageSub}>Fill in all details to publish your property</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={s.layout}>

        {/* ── LEFT ── */}
        <div style={s.left}>

          {/* Basic Info */}
          <Card title="📝 Basic Information">
            <Field label="Title *" error={errors.title}>
              <div style={s.inputWrap}>
                <input
                  style={{ ...s.input, ...(errors.title ? s.inputErr : {}) }}
                  placeholder="e.g. Cozy Apartment in Downtown"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  maxLength={100}
                />
                <span style={s.charCount}>{form.title.length}/100</span>
              </div>
            </Field>

            <Field label="Description *" error={errors.description}>
              <textarea
                style={{ ...s.textarea, ...(errors.description ? s.inputErr : {}) }}
                placeholder="Describe your property — what makes it special, nearby attractions, house rules..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
              />
            </Field>

            <Field label="Location *" error={errors.location}>
              <input
                style={{ ...s.input, ...(errors.location ? s.inputErr : {}) }}
                placeholder="e.g. New York, USA"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </Field>

            <div style={s.grid2}>
              <Field label="Price per Night ($) *" error={errors.pricePerNight}>
                <input
                  type="number"
                  min={1}
                  style={{ ...s.input, ...(errors.pricePerNight ? s.inputErr : {}) }}
                  placeholder="e.g. 120"
                  value={form.pricePerNight}
                  onChange={(e) => set("pricePerNight", e.target.value)}
                />
              </Field>

              <Field label="Max Guests *" error={errors.guest}>
                <input
                  type="number"
                  min={1}
                  max={20}
                  style={{ ...s.input, ...(errors.guest ? s.inputErr : {}) }}
                  placeholder="e.g. 4"
                  value={form.guest}
                  onChange={(e) => set("guest", e.target.value)}
                />
              </Field>
            </div>
          </Card>

          {/* Listing Type */}
          <Card title="🏷️ Listing Type">
            <div style={s.typeGrid}>
              {LISTING_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set("type", t.value)}
                  style={{ ...s.typeBtn, ...(form.type === t.value ? s.typeBtnActive : {}) }}
                >
                  {form.type === t.value && <span style={s.typeCheck}>✓</span>}
                  <span style={s.typeIcon}>{t.icon}</span>
                  <span style={s.typeLabel}>{t.label}</span>
                  <span style={s.typeDesc}>{t.desc}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Amenities */}
          <Card title="✨ Amenities">
            <div style={s.amenitiesGrid}>
              {AMENITY_OPTIONS.map((a) => {
                const checked = form.amenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    style={{ ...s.amenityBtn, ...(checked ? s.amenityBtnActive : {}) }}
                  >
                    {checked ? "✓ " : ""}{a}
                  </button>
                );
              })}
            </div>
            {form.amenities.length > 0 && (
              <p style={s.amenityCount}>{form.amenities.length} amenity{form.amenities.length !== 1 ? "ies" : ""} selected</p>
            )}
          </Card>
        </div>

        {/* ── RIGHT ── */}
        <div style={s.right}>

          {/* Photo */}
          <Card title="📸 Listing Photo">
            <div style={s.uploadBox}>
              {preview ? (
                <div style={s.previewWrap}>
                  <img src={preview} alt="preview" style={s.previewImg} />
                  <div style={s.previewOverlay}>
                    <label style={s.changeBtn}>
                      📷 Change
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageFile} />
                    </label>
                    <button type="button" style={s.removeBtn} onClick={() => { setPreview(""); set("img", ""); }}>
                      ✕ Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label style={s.uploadLabel}>
                  <span style={s.uploadIcon}>🖼️</span>
                  <span style={s.uploadTitle}>Upload a photo</span>
                  <span style={s.uploadSub}>JPG, PNG · Max 5MB</span>
                  <span style={s.uploadBtnEl}>Choose File</span>
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageFile} />
                </label>
              )}
            </div>

            <div style={s.orRow}><span style={s.orLine} /><span style={s.orText}>or paste URL</span><span style={s.orLine} /></div>

            <input
              style={s.input}
              placeholder="https://images.unsplash.com/..."
              value={preview ? "" : form.img}
              onChange={(e) => { set("img", e.target.value); setPreview(""); }}
            />
          </Card>

          {/* Live Preview */}
          {(form.title || preview || form.img) && (
            <Card title="👁️ Live Preview">
              <div style={s.previewCard}>
                <div style={s.previewCardImgWrap}>
                  {(preview || form.img) ? (
                    <img src={preview || form.img} alt="preview" style={s.previewCardImg} />
                  ) : (
                    <div style={s.previewCardImgPlaceholder}>🖼️</div>
                  )}
                  <span style={s.previewType}>{form.type}</span>
                </div>
                <div style={s.previewCardBody}>
                  <p style={s.previewCardTitle}>{form.title || "Your listing title"}</p>
                  {form.location && <p style={s.previewCardLoc}>📍 {form.location}</p>}
                  <div style={s.previewCardMeta}>
                    {form.pricePerNight && <span style={s.previewPrice}>${form.pricePerNight}<small>/night</small></span>}
                    {form.guest && <span style={s.previewGuests}>👥 {form.guest} guests</span>}
                  </div>
                  {form.amenities.length > 0 && (
                    <div style={s.previewAmenities}>
                      {form.amenities.slice(0, 3).map((a) => (
                        <span key={a} style={s.previewAmenityTag}>{a}</span>
                      ))}
                      {form.amenities.length > 3 && <span style={s.previewAmenityTag}>+{form.amenities.length - 3}</span>}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Submit */}
          <button
            type="submit"
            style={{ ...s.submitBtn, ...(submitting ? s.submitBtnDisabled : {}) }}
            disabled={submitting}
          >
            {submitting ? <><span style={s.spinner} /> Publishing…</> : "🚀 Publish Listing"}
          </button>
          <p style={s.submitNote}>Your listing will be visible to guests immediately.</p>
        </div>
      </form>
    </div>
  );
};

// ─── Helper Components ────────────────────────────────────────────────────────
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={s.card}>
    <h3 style={s.cardTitle}>{title}</h3>
    <div style={s.cardBody}>{children}</div>
  </div>
);

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div style={s.field}>
    <label style={s.fieldLabel}>{label}</label>
    {children}
    {error && <span style={s.errorText}>{error}</span>}
  </div>
);

export default CreateListingPage;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: { padding: "32px 48px", maxWidth: "1100px", margin: "0 auto", fontFamily: "'Segoe UI', system-ui, sans-serif" },
  header: { display: "flex", alignItems: "flex-start", gap: "20px", marginBottom: "32px" },
  backBtn: { background: "none", border: "none", color: "#ff385c", fontWeight: 700, fontSize: "15px", cursor: "pointer", padding: "4px 0", marginTop: "4px" },
  pageTitle: { fontSize: "26px", fontWeight: 800, color: "#111", margin: "0 0 4px" },
  pageSub: { fontSize: "14px", color: "#888", margin: 0 },

  layout: { display: "grid", gridTemplateColumns: "1fr 360px", gap: "28px", alignItems: "start" },
  left: { display: "flex", flexDirection: "column" as const, gap: "20px" },
  right: { display: "flex", flexDirection: "column" as const, gap: "20px", position: "sticky" as const, top: "90px" },

  card: { background: "#fff", borderRadius: "20px", padding: "24px 28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  cardTitle: { fontSize: "16px", fontWeight: 800, color: "#111", margin: "0 0 20px", paddingBottom: "12px", borderBottom: "1px solid #f0f0f0" },
  cardBody: { display: "flex", flexDirection: "column" as const, gap: "16px" },

  field: { display: "flex", flexDirection: "column" as const, gap: "7px" },
  fieldLabel: { fontSize: "13px", fontWeight: 700, color: "#444" },
  errorText: { fontSize: "12px", color: "#cc0000" },

  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },

  inputWrap: { position: "relative" as const },
  input: { width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e8e8e8", fontSize: "14px", outline: "none", background: "#fafafa", boxSizing: "border-box" as const },
  textarea: { width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e8e8e8", fontSize: "14px", outline: "none", background: "#fafafa", boxSizing: "border-box" as const, resize: "vertical" as const, fontFamily: "inherit" },
  inputErr: { borderColor: "#ff385c", background: "#fff8f8" },
  charCount: { position: "absolute" as const, right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "11px", color: "#bbb" },

  typeGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  typeBtn: { position: "relative" as const, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "6px", padding: "16px 12px", borderRadius: "16px", border: "2px solid #e8e8e8", background: "#fafafa", cursor: "pointer" },
  typeBtnActive: { border: "2px solid #ff385c", background: "#fff0f3", boxShadow: "0 4px 16px rgba(255,56,92,0.12)" },
  typeCheck: { position: "absolute" as const, top: "8px", right: "10px", fontSize: "12px", color: "#ff385c", fontWeight: 800 },
  typeIcon: { fontSize: "28px" },
  typeLabel: { fontSize: "14px", fontWeight: 700, color: "#222" },
  typeDesc: { fontSize: "11px", color: "#888" },

  amenitiesGrid: { display: "flex", flexWrap: "wrap" as const, gap: "8px" },
  amenityBtn: { padding: "7px 14px", borderRadius: "20px", border: "1.5px solid #e8e8e8", background: "#fafafa", fontSize: "13px", cursor: "pointer", color: "#555", fontWeight: 500 },
  amenityBtnActive: { border: "1.5px solid #ff385c", background: "#fff0f3", color: "#ff385c", fontWeight: 700 },
  amenityCount: { fontSize: "12px", color: "#888", margin: "4px 0 0" },

  uploadBox: { border: "2px dashed #e0e0e0", borderRadius: "14px", overflow: "hidden", minHeight: "160px", display: "flex", alignItems: "center", justifyContent: "center" },
  uploadLabel: { display: "flex", flexDirection: "column" as const, alignItems: "center", padding: "28px", cursor: "pointer", gap: "8px", width: "100%" },
  uploadIcon: { fontSize: "32px" },
  uploadTitle: { fontSize: "15px", fontWeight: 700, color: "#333" },
  uploadSub: { fontSize: "12px", color: "#aaa" },
  uploadBtnEl: { marginTop: "6px", padding: "8px 20px", background: "#ff385c", color: "#fff", borderRadius: "20px", fontSize: "13px", fontWeight: 600 },
  previewWrap: { position: "relative" as const, width: "100%" },
  previewImg: { width: "100%", height: "180px", objectFit: "cover" as const, display: "block" },
  previewOverlay: { position: "absolute" as const, bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", padding: "12px", display: "flex", gap: "8px", justifyContent: "center" },
  changeBtn: { padding: "6px 14px", background: "#fff", color: "#222", borderRadius: "20px", fontSize: "12px", fontWeight: 700, cursor: "pointer" },
  removeBtn: { padding: "6px 14px", background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "20px", fontSize: "12px", fontWeight: 700, cursor: "pointer" },

  orRow: { display: "flex", alignItems: "center", gap: "10px", margin: "8px 0" },
  orLine: { flex: 1, height: "1px", background: "#eee" },
  orText: { fontSize: "12px", color: "#aaa", fontWeight: 600 },

  previewCard: { borderRadius: "12px", overflow: "hidden", border: "1.5px solid #f0f0f0" },
  previewCardImgWrap: { position: "relative" as const },
  previewCardImg: { width: "100%", height: "140px", objectFit: "cover" as const, display: "block" },
  previewCardImgPlaceholder: { width: "100%", height: "140px", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" },
  previewType: { position: "absolute" as const, top: "8px", right: "8px", background: "#ff385c", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px" },
  previewCardBody: { padding: "12px" },
  previewCardTitle: { fontSize: "14px", fontWeight: 700, color: "#111", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
  previewCardLoc: { fontSize: "12px", color: "#666", margin: "0 0 8px" },
  previewCardMeta: { display: "flex", gap: "12px", marginBottom: "8px" },
  previewPrice: { fontSize: "15px", fontWeight: 800, color: "#111" },
  previewGuests: { fontSize: "13px", color: "#666" },
  previewAmenities: { display: "flex", flexWrap: "wrap" as const, gap: "4px" },
  previewAmenityTag: { padding: "2px 8px", background: "#f0f0f0", borderRadius: "10px", fontSize: "11px", color: "#555" },

  submitBtn: { width: "100%", padding: "16px", background: "#ff385c", color: "#fff", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(255,56,92,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
  submitBtnDisabled: { opacity: 0.7, cursor: "not-allowed" },
  spinner: { width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block" },
  submitNote: { fontSize: "12px", color: "#aaa", textAlign: "center" as const, margin: 0 },
} as const;

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { authApi } from "../../../services/api";
import dayjs from "dayjs";
import { FaStar, FaMapMarkerAlt, FaCheck } from "react-icons/fa";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Step1 { checkIn: string; checkOut: string; guests: number }
interface Step2 { name: string; email: string; phone: string; photo: string | null }
interface Step3 { card: string; expiry: string; cvv: string }

const STEPS = [
  { label: "Dates", icon: "📅" },
  { label: "Guest Info", icon: "👤" },
  { label: "Payment", icon: "💳" },
  { label: "Confirm", icon: "✅" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [listing, setListing] = useState<any>(null);
  const [listingLoading, setListingLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [step1, setStep1] = useState<Step1>({ checkIn: "", checkOut: "", guests: 1 });
  const [step2, setStep2] = useState<Step2>({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "", photo: null });
  const [step3, setStep3] = useState<Step3>({ card: "", expiry: "", cvv: "" });
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/listings/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setListing({
          id: data.id,
          title: data.title,
          location: data.location,
          price: data.pricePerNight,
          rating: data.rating ?? 4.5,
          superhost: false,
          img: data.photos?.[0]?.url ?? "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=260&fit=crop",
          category: data.type?.toLowerCase() ?? "apartment",
        });
      })
      .catch(() => setListing(null))
      .finally(() => setListingLoading(false));
  }, [id]);

  if (listingLoading) {
    return <div style={s.center}><p style={{ color: "#888" }}>Loading listing...</p></div>;
  }

  if (!listing) {
    return (
      <div style={s.center}>
        <h2 style={{ color: "#222" }}>Listing not found</h2>
        <button style={s.backBtn} onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  const nights = step1.checkIn && step1.checkOut
    ? Math.max(1, dayjs(step1.checkOut).diff(dayjs(step1.checkIn), "day"))
    : 1;
  const subtotal = nights * listing.price;
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + serviceFee;

  const handleConfirm = async () => {
    setBookingError("");
    if (!user || !token) {
      setBookingError("You must be logged in to book.");
      return;
    }
    if (!id) return;
    setSubmitting(true);
    try {
      await authApi.createBooking({
        checkIn: step1.checkIn,
        checkOut: step1.checkOut,
        guestId: user.id,
        listingId: id,
        guests: step1.guests,
      }, token);
      navigate("/dashboard");
    } catch (err: any) {
      setBookingError(err.message || "Booking failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <h1 style={s.pageTitle}>Complete your booking</h1>
      </div>

      <div style={s.layout}>
        {/* ── Left: Steps ── */}
        <div style={s.left}>
          {/* Step indicator */}
          <div style={s.stepBar}>
            {STEPS.map((st, i) => (
              <div key={i} style={s.stepItem}>
                <div style={{ ...s.stepCircle, ...(i < step ? s.stepDone : i === step ? s.stepActive : s.stepIdle) }}>
                  {i < step ? <FaCheck size={12} /> : <span>{st.icon}</span>}
                </div>
                <span style={{ ...s.stepLabel, ...(i === step ? s.stepLabelActive : {}) }}>{st.label}</span>
                {i < STEPS.length - 1 && <div style={{ ...s.stepLine, ...(i < step ? s.stepLineDone : {}) }} />}
              </div>
            ))}
          </div>

          {/* ── Step 1: Dates & Guests ── */}
          {step === 0 && (
            <div style={s.card}>
              <h2 style={s.cardTitle}>📅 Select dates & guests</h2>

              <div style={s.grid2}>
                <Field label="Check-in">
                  <input
                    type="date"
                    style={s.input}
                    value={step1.checkIn}
                    min={dayjs().format("YYYY-MM-DD")}
                    onChange={(e) => setStep1({ ...step1, checkIn: e.target.value })}
                  />
                </Field>
                <Field label="Check-out">
                  <input
                    type="date"
                    style={s.input}
                    value={step1.checkOut}
                    min={step1.checkIn || dayjs().format("YYYY-MM-DD")}
                    onChange={(e) => setStep1({ ...step1, checkOut: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="Number of guests">
                <div style={s.guestRow}>
                  <button style={s.guestBtn} onClick={() => setStep1({ ...step1, guests: Math.max(1, step1.guests - 1) })}>−</button>
                  <span style={s.guestCount}>{step1.guests}</span>
                  <button style={s.guestBtn} onClick={() => setStep1({ ...step1, guests: Math.min(16, step1.guests + 1) })}>+</button>
                  <span style={s.guestLabel}>{step1.guests === 1 ? "guest" : "guests"}</span>
                </div>
              </Field>

              {step1.checkIn && step1.checkOut && (
                <div style={s.nightsBox}>
                  🌙 <strong>{nights}</strong> night{nights !== 1 ? "s" : ""} ·{" "}
                  {dayjs(step1.checkIn).format("MMM D")} → {dayjs(step1.checkOut).format("MMM D, YYYY")}
                </div>
              )}

              <button
                style={{ ...s.nextBtn, ...((!step1.checkIn || !step1.checkOut) ? s.btnDisabled : {}) }}
                disabled={!step1.checkIn || !step1.checkOut}
                onClick={() => {
                  if (dayjs(step1.checkOut) <= dayjs(step1.checkIn)) {
                    setBookingError("Check-out must be after check-in");
                    return;
                  }
                  setBookingError("");
                  setStep(1);
                }}
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── Step 2: Guest Info ── */}
          {step === 1 && (
            <div style={s.card}>
              <h2 style={s.cardTitle}>👤 Your information</h2>

              <div style={s.grid2}>
                <Field label="Full Name">
                  <input style={s.input} placeholder="Jane Doe" value={step2.name} onChange={(e) => setStep2({ ...step2, name: e.target.value })} />
                </Field>
                <Field label="Phone">
                  <input style={s.input} placeholder="+1 234 567 890" value={step2.phone} onChange={(e) => setStep2({ ...step2, phone: e.target.value })} />
                </Field>
              </div>

              <Field label="Email address">
                <input type="email" style={s.input} placeholder="you@example.com" value={step2.email} onChange={(e) => setStep2({ ...step2, email: e.target.value })} />
              </Field>

              <Field label="Profile photo (optional, max 5MB)">
                <div style={s.uploadBox}>
                  {step2.photo ? (
                    <div style={s.photoPreviewWrap}>
                      <img src={step2.photo} alt="preview" style={s.photoPreview} />
                      <button style={s.removePhoto} onClick={() => setStep2({ ...step2, photo: null })}>✕ Remove</button>
                    </div>
                  ) : (
                    <label style={s.uploadLabel}>
                      <span style={s.uploadIcon}>📷</span>
                      <span style={s.uploadText}>Click to upload photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) { setBookingError("File must be under 5MB"); return; }
                          const reader = new FileReader();
                          reader.onload = () => setStep2({ ...step2, photo: reader.result as string });
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  )}
                </div>
              </Field>

              <div style={s.btnRow}>
                <button style={s.outlineBtn} onClick={() => setStep(0)}>← Back</button>
                <button
                  style={{ ...s.nextBtn, ...((!step2.name || !step2.email || !step2.phone) ? s.btnDisabled : {}) }}
                  disabled={!step2.name || !step2.email || !step2.phone}
                  onClick={() => setStep(2)}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Payment ── */}
          {step === 2 && (
            <div style={s.card}>
              <h2 style={s.cardTitle}>💳 Payment details</h2>
              <div style={s.secureNote}>🔒 Your payment info is encrypted and secure</div>

              <Field label="Card number">
                <input
                  style={s.input}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={step3.card}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                    setStep3({ ...step3, card: v.replace(/(.{4})/g, "$1 ").trim() });
                  }}
                />
              </Field>

              <div style={s.grid2}>
                <Field label="Expiry (MM/YY)">
                  <input
                    style={s.input}
                    placeholder="12/26"
                    maxLength={5}
                    value={step3.expiry}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                      if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                      setStep3({ ...step3, expiry: v });
                    }}
                  />
                </Field>
                <Field label="CVV">
                  <input
                    style={s.input}
                    placeholder="123"
                    maxLength={3}
                    type="password"
                    value={step3.cvv}
                    onChange={(e) => setStep3({ ...step3, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })}
                  />
                </Field>
              </div>

              <div style={s.cardBrands}>
                {["💳 Visa", "💳 Mastercard", "💳 Amex"].map((b) => (
                  <span key={b} style={s.cardBrand}>{b}</span>
                ))}
              </div>

              <div style={s.btnRow}>
                <button style={s.outlineBtn} onClick={() => setStep(1)}>← Back</button>
                <button
                  style={{ ...s.nextBtn, ...((!step3.card || !step3.expiry || !step3.cvv) ? s.btnDisabled : {}) }}
                  disabled={!step3.card || !step3.expiry || !step3.cvv}
                  onClick={() => setStep(3)}
                >
                  Review Booking →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Confirmation ── */}
          {step === 3 && (
            <div style={s.card}>
              <h2 style={s.cardTitle}>✅ Review & confirm</h2>

              <div style={s.summarySection}>
                <SummaryRow icon="📅" label="Check-in" value={dayjs(step1.checkIn).format("dddd, MMM D, YYYY")} />
                <SummaryRow icon="📅" label="Check-out" value={dayjs(step1.checkOut).format("dddd, MMM D, YYYY")} />
                <SummaryRow icon="🌙" label="Duration" value={`${nights} night${nights !== 1 ? "s" : ""}`} />
                <SummaryRow icon="👥" label="Guests" value={`${step1.guests} guest${step1.guests !== 1 ? "s" : ""}`} />
                <div style={s.divider} />
                <SummaryRow icon="👤" label="Name" value={step2.name} />
                <SummaryRow icon="✉️" label="Email" value={step2.email} />
                <SummaryRow icon="📱" label="Phone" value={step2.phone} />
                <div style={s.divider} />
                <SummaryRow icon="💳" label="Card" value={`•••• •••• •••• ${step3.card.replace(/\s/g, "").slice(-4)}`} />
                <div style={s.divider} />
                <SummaryRow icon="🏠" label={`$${listing.price} × ${nights} nights`} value={`$${subtotal}`} />
                <SummaryRow icon="🛎️" label="Service fee (12%)" value={`$${serviceFee}`} />
                <SummaryRow icon="💰" label="Total" value={`$${total}`} bold />
              </div>

              {bookingError && <p style={{ color: "#cc0000", fontSize: "13px", background: "#fee2e2", padding: "10px 14px", borderRadius: "8px" }}>{bookingError}</p>}

              <div style={s.btnRow}>
                <button style={s.outlineBtn} onClick={() => setStep(2)}>← Back</button>
                <button style={{ ...s.confirmBtn, ...(submitting ? s.btnDisabled : {}) }} disabled={submitting} onClick={handleConfirm}>
                  {submitting ? (
                    <><span style={s.spinner} /> Confirming…</>
                  ) : (
                    "Confirm Booking 🎉"
                  )}
                </button>
              </div>

              <p style={s.terms}>
                By confirming, you agree to our <a href="#" style={s.termsLink}>Terms of Service</a> and <a href="#" style={s.termsLink}>Cancellation Policy</a>.
              </p>
            </div>
          )}
        </div>

        {/* ── Right: Listing Summary Card ── */}
        <div style={s.right}>
          <div style={s.summaryCard}>
            <img src={listing.img} alt={listing.title} style={s.summaryImg} />
            <div style={s.summaryBody}>
              {listing.superhost && <span style={s.superhostTag}>⭐ Superhost</span>}
              <h3 style={s.summaryTitle}>{listing.title}</h3>
              <p style={s.summaryLocation}><FaMapMarkerAlt color="#ff385c" size={12} /> {listing.location}</p>
              <div style={s.summaryMeta}>
                <span style={s.summaryRating}><FaStar color="#ff385c" size={12} /> {listing.rating}</span>
                <span style={s.summaryCategory}>{listing.category}</span>
              </div>
              <div style={s.priceLine}>
                <span style={s.priceAmount}>${listing.price}</span>
                <span style={s.priceNight}> / night</span>
              </div>

              {step1.checkIn && step1.checkOut && (
                <div style={s.priceBreakdown}>
                  <div style={s.breakdownRow}>
                    <span>${listing.price} × {nights} nights</span>
                    <span>${subtotal}</span>
                  </div>
                  <div style={s.breakdownRow}>
                    <span>Service fee</span>
                    <span>${serviceFee}</span>
                  </div>
                  <div style={s.breakdownDivider} />
                  <div style={{ ...s.breakdownRow, ...s.breakdownTotal }}>
                    <span>Total</span>
                    <span>${total}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={s.helpCard}>
            <p style={s.helpTitle}>Need help?</p>
            <p style={s.helpText}>Our support team is available 24/7 to assist you with your booking.</p>
            <a href="#" style={s.helpLink}>Contact Support →</a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Helper Components ────────────────────────────────────────────────────────
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={s.field}>
    <label style={s.fieldLabel}>{label}</label>
    {children}
  </div>
);

const SummaryRow = ({ icon, label, value, bold }: { icon: string; label: string; value: string; bold?: boolean }) => (
  <div style={s.summaryRow}>
    <span style={s.summaryRowLeft}><span style={s.summaryIcon}>{icon}</span>{label}</span>
    <span style={{ ...s.summaryRowValue, ...(bold ? s.summaryRowBold : {}) }}>{value}</span>
  </div>
);

export default BookingPage;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: { padding: "32px 48px", maxWidth: "1100px", margin: "0 auto", fontFamily: "'Segoe UI', system-ui, sans-serif" },
  center: { display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "16px" },
  header: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" },
  pageTitle: { fontSize: "24px", fontWeight: 800, color: "#111", margin: 0 },
  backBtn: { background: "none", border: "none", color: "#ff385c", fontWeight: 700, fontSize: "15px", cursor: "pointer", padding: 0, whiteSpace: "nowrap" as const },

  layout: { display: "grid", gridTemplateColumns: "1fr 360px", gap: "32px", alignItems: "start" },
  left: { display: "flex", flexDirection: "column" as const, gap: "24px" },
  right: { display: "flex", flexDirection: "column" as const, gap: "16px", position: "sticky" as const, top: "90px" },

  // Step bar
  stepBar: { display: "flex", alignItems: "center", background: "#fff", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  stepItem: { display: "flex", alignItems: "center", flex: 1 },
  stepCircle: { width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, flexShrink: 0 },
  stepIdle: { background: "#f0f0f0", color: "#aaa" },
  stepActive: { background: "#ff385c", color: "#fff", boxShadow: "0 4px 12px rgba(255,56,92,0.4)" },
  stepDone: { background: "#22c55e", color: "#fff" },
  stepLabel: { fontSize: "11px", color: "#aaa", marginLeft: "8px", fontWeight: 600, whiteSpace: "nowrap" as const },
  stepLabelActive: { color: "#ff385c" },
  stepLine: { flex: 1, height: "2px", background: "#f0f0f0", margin: "0 8px" },
  stepLineDone: { background: "#22c55e" },

  // Card
  card: { background: "#fff", borderRadius: "20px", padding: "28px 32px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column" as const, gap: "20px" },
  cardTitle: { fontSize: "20px", fontWeight: 800, color: "#111", margin: 0 },

  // Fields
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  field: { display: "flex", flexDirection: "column" as const, gap: "7px" },
  fieldLabel: { fontSize: "13px", fontWeight: 700, color: "#444" },
  input: { padding: "13px 16px", borderRadius: "14px", border: "1.5px solid #e8e8e8", fontSize: "14px", outline: "none", background: "#fafafa", width: "100%", boxSizing: "border-box" as const },

  // Guests
  guestRow: { display: "flex", alignItems: "center", gap: "12px" },
  guestBtn: { width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid #ddd", background: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 },
  guestCount: { fontSize: "18px", fontWeight: 700, color: "#222", minWidth: "24px", textAlign: "center" as const },
  guestLabel: { fontSize: "14px", color: "#666" },

  nightsBox: { background: "#fff5f7", border: "1px solid #ffd6de", borderRadius: "12px", padding: "12px 16px", fontSize: "14px", color: "#ff385c", fontWeight: 500 },

  // Upload
  uploadBox: { border: "2px dashed #e0e0e0", borderRadius: "14px", overflow: "hidden" },
  uploadLabel: { display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "28px", cursor: "pointer", gap: "8px" },
  uploadIcon: { fontSize: "28px" },
  uploadText: { fontSize: "13px", color: "#888", fontWeight: 500 },
  photoPreviewWrap: { display: "flex", flexDirection: "column" as const, alignItems: "center", padding: "16px", gap: "12px" },
  photoPreview: { width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover" as const, border: "3px solid #ff385c" },
  removePhoto: { background: "none", border: "none", color: "#cc0000", fontSize: "12px", cursor: "pointer", fontWeight: 600 },

  // Payment
  secureNote: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#16a34a", fontWeight: 500 },
  cardBrands: { display: "flex", gap: "8px" },
  cardBrand: { padding: "4px 12px", background: "#f5f5f5", borderRadius: "8px", fontSize: "12px", color: "#555", fontWeight: 500 },

  // Summary section
  summarySection: { display: "flex", flexDirection: "column" as const, gap: "12px", background: "#fafafa", borderRadius: "14px", padding: "20px" },
  summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  summaryRowLeft: { display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#555" },
  summaryIcon: { fontSize: "15px" },
  summaryRowValue: { fontSize: "14px", fontWeight: 600, color: "#222" },
  summaryRowBold: { fontSize: "16px", fontWeight: 800, color: "#ff385c" },
  divider: { height: "1px", background: "#eee", margin: "4px 0" },

  // Buttons
  btnRow: { display: "flex", gap: "12px" },
  nextBtn: { flex: 1, padding: "14px", background: "#ff385c", color: "#fff", border: "none", borderRadius: "14px", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(255,56,92,0.3)" },
  outlineBtn: { flex: "0 0 auto", padding: "14px 20px", background: "#fff", color: "#444", border: "1.5px solid #ddd", borderRadius: "14px", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  confirmBtn: { flex: 1, padding: "14px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "14px", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  spinner: { width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block" },
  terms: { fontSize: "12px", color: "#aaa", textAlign: "center" as const, marginTop: "4px" },
  termsLink: { color: "#ff385c", textDecoration: "none", fontWeight: 600 },

  // Right summary card
  summaryCard: { background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.09)" },
  summaryImg: { width: "100%", height: "200px", objectFit: "cover" as const, display: "block" },
  summaryBody: { padding: "20px" },
  superhostTag: { display: "inline-block", background: "#fff5f7", color: "#ff385c", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", marginBottom: "8px" },
  summaryTitle: { fontSize: "16px", fontWeight: 700, color: "#111", margin: "0 0 6px" },
  summaryLocation: { display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#666", marginBottom: "8px" },
  summaryMeta: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" },
  summaryRating: { display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 600 },
  summaryCategory: { fontSize: "12px", background: "#f0f0f0", color: "#555", padding: "2px 10px", borderRadius: "20px" },
  priceLine: { marginBottom: "16px" },
  priceAmount: { fontSize: "22px", fontWeight: 800, color: "#111" },
  priceNight: { fontSize: "14px", color: "#888" },
  priceBreakdown: { background: "#fafafa", borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column" as const, gap: "8px" },
  breakdownRow: { display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#555" },
  breakdownDivider: { height: "1px", background: "#eee" },
  breakdownTotal: { fontWeight: 700, color: "#111", fontSize: "15px" },

  helpCard: { background: "#fff", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  helpTitle: { fontSize: "14px", fontWeight: 700, color: "#222", margin: "0 0 6px" },
  helpText: { fontSize: "13px", color: "#888", lineHeight: 1.6, margin: "0 0 10px" },
  helpLink: { fontSize: "13px", color: "#ff385c", fontWeight: 600, textDecoration: "none" },
} as const;

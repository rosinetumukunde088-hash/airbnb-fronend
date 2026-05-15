import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { FaStar, FaMapMarkerAlt, FaHeart, FaRegHeart } from "react-icons/fa";
import { useFavorites } from "../hooks/useFavorites";
import { useAuth } from "../../auth/hooks/useAuth";

const BASE_URL = "http://localhost:5000";

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toggle, isSaved } = useFavorites();
  const { user } = useAuth();

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${BASE_URL}/listings/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data || !data.id) { setNotFound(true); return; }
        setListing({
          id: data.id,
          title: data.title,
          location: data.location,
          price: data.pricePerNight,
          rating: data.rating ?? 4.5,
          superhost: data.superhost ?? false,
          available: data.available ?? true,
          availableFrom: data.availableFrom ?? new Date().toISOString(),
          category: data.type?.toLowerCase() ?? "apartment",
          amenities: data.amenities ?? [],
          description: data.description ?? "",
          guest: data.guest ?? 1,
          img: data.photos?.[0]?.url ?? "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop",
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div style={styles.center}><p style={{ color: "#888" }}>Loading listing...</p></div>;
  }

  if (notFound || !listing) {
    return (
      <div style={styles.notFound}>
        <h2>Listing not found</h2>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  const saved = isSaved(listing.id);
  const { title, location, price, rating, superhost, available, availableFrom, img } = listing;

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>

      <div style={styles.card}>
        <div style={styles.imgWrap}>
          <img src={img} alt={title} style={styles.img} />
          {superhost && <span style={styles.superhostBadge}>⭐ Superhost</span>}
          <button style={styles.heart} onClick={() => toggle(listing.id, title)}>
            {saved ? <FaHeart color="#ff385c" size={20} /> : <FaRegHeart color="#fff" size={20} />}
          </button>
        </div>

        <div style={styles.body}>
          <h1 style={styles.title}>{title}</h1>
          <p style={styles.location}><FaMapMarkerAlt color="#ff385c" /> {location}</p>

          <div style={styles.metaRow}>
            <span style={styles.rating}><FaStar color="#ff385c" /> {rating}</span>
            <span style={{ ...styles.status, ...(available ? {} : styles.statusBooked) }}>
              {available ? "Available" : "Booked"}
            </span>
          </div>

          {listing.description && (
            <p style={styles.description}>{listing.description}</p>
          )}

          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Price per night</span>
              <span style={styles.infoValue}>${price}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Available from</span>
              <span style={styles.infoValue}>{dayjs(availableFrom).format("MMMM D, YYYY")}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Category</span>
              <span style={styles.infoValue}>{listing.category}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Max guests</span>
              <span style={styles.infoValue}>{listing.guest}</span>
            </div>
          </div>

          {listing.amenities.length > 0 && (
            <div style={styles.amenitiesWrap}>
              <p style={styles.amenitiesTitle}>Amenities</p>
              <div style={styles.amenitiesList}>
                {listing.amenities.map((a: string) => (
                  <span key={a} style={styles.amenityTag}>{a}</span>
                ))}
              </div>
            </div>
          )}

          <div style={styles.actions}>
            <button
              style={{ ...styles.saveBtn, ...(saved ? styles.saveBtnSaved : {}) }}
              onClick={() => toggle(listing.id, title)}
            >
              {saved ? "❤️ Saved" : "🤍 Save"}
            </button>

            {available ? (
              user ? (
                <button
                  style={styles.bookBtn}
                  onClick={() => navigate(`/book/${listing.id}`)}
                >
                  Book Now
                </button>
              ) : (
                <button
                  style={styles.bookBtn}
                  onClick={() => navigate("/login")}
                >
                  Login to Book
                </button>
              )
            ) : (
              <button style={{ ...styles.bookBtn, ...styles.bookBtnDisabled }} disabled>
                Not Available
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;

const styles = {
  page: { padding: "32px 48px", maxWidth: "860px", margin: "0 auto" },
  center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" },
  notFound: { padding: "80px", textAlign: "center" as const },
  backBtn: { background: "none", border: "none", color: "#ff385c", fontWeight: 700, fontSize: "15px", cursor: "pointer", marginBottom: "24px", padding: 0 },
  card: { background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", overflow: "hidden" },
  imgWrap: { position: "relative" as const },
  img: { width: "100%", height: "420px", objectFit: "cover" as const, display: "block" },
  superhostBadge: { position: "absolute" as const, top: "16px", left: "16px", background: "#fff", color: "#222", fontWeight: 700, fontSize: "13px", padding: "6px 12px", borderRadius: "20px" },
  heart: { position: "absolute" as const, top: "16px", right: "16px", background: "rgba(0,0,0,0.35)", border: "none", borderRadius: "50%", width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  body: { padding: "32px" },
  title: { fontSize: "28px", fontWeight: 800, color: "#222", marginBottom: "12px" },
  location: { display: "flex", alignItems: "center", gap: "6px", color: "#666", fontSize: "15px", marginBottom: "16px" },
  metaRow: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" },
  rating: { display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, fontSize: "16px" },
  status: { padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, background: "#e6f9f0", color: "#00a550" },
  statusBooked: { background: "#ffeaea", color: "#cc0000" },
  description: { fontSize: "14px", color: "#555", lineHeight: 1.7, marginBottom: "24px" },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" },
  infoItem: { display: "flex", flexDirection: "column" as const, gap: "4px" },
  infoLabel: { fontSize: "12px", color: "#888", textTransform: "uppercase" as const, letterSpacing: "0.5px" },
  infoValue: { fontSize: "16px", fontWeight: 700, color: "#222" },
  amenitiesWrap: { marginBottom: "28px" },
  amenitiesTitle: { fontSize: "14px", fontWeight: 700, color: "#333", marginBottom: "10px" },
  amenitiesList: { display: "flex", flexWrap: "wrap" as const, gap: "8px" },
  amenityTag: { padding: "5px 12px", background: "#f5f5f5", borderRadius: "20px", fontSize: "13px", color: "#555" },
  actions: { display: "flex", gap: "12px" },
  saveBtn: { flex: 1, padding: "14px", backgroundColor: "#fff", color: "#ff385c", border: "2px solid #ff385c", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: "pointer" },
  saveBtnSaved: { backgroundColor: "#fff0f3" },
  bookBtn: { flex: 2, padding: "14px", backgroundColor: "#ff385c", color: "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: "pointer" },
  bookBtnDisabled: { backgroundColor: "#ccc", cursor: "not-allowed" },
} as const;

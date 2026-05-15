import { useMemo, useState, useCallback } from "react";
import { useStore } from "../../../store/StoreContext";
import { useListings } from "../hooks/useListings";
import { useFavorites } from "../hooks/useFavorites";
import ListingCard from "../components/ListingCard";
import SearchBar from "../components/SearchBar";
import SavedBadge from "../components/SavedBadge";
import SavedListings from "../components/SavedListings";
import Spinner from "../../../shared/components/Spinner";
import type { Listing } from "../types";

const COLUMNS = 3;

const ListingsPage = () => {
  useListings();
  const { state, dispatch } = useStore();
  const { count } = useFavorites();
  const [showSaved, setShowSaved] = useState(false);

  const filtered = useMemo(
    () =>
      state.listings.filter(({ title, location }) =>
        [title, location].some((f) =>
          f.toLowerCase().includes(state.filter.toLowerCase())
        )
      ),
    [state.listings, state.filter]
  );

  const rows = useMemo(() => {
    const result: Listing[][] = [];
    for (let i = 0; i < filtered.length; i += COLUMNS) {
      result.push(filtered.slice(i, i + COLUMNS));
    }
    return result;
  }, [filtered]);

  const renderRow = useCallback(
    (row: Listing[], idx: number) => (
      <div key={idx} style={styles.row}>
        {row.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    ),
    []
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.heading}>Listings</h2>
        <div style={styles.controls}>
          <SearchBar />
          <SavedBadge count={count} />
          <button style={styles.toggleBtn} onClick={() => setShowSaved((v) => !v)}>
            {showSaved ? "Hide Saved" : "Saved Panel"}
          </button>
          <button style={styles.resetBtn} onClick={() => dispatch({ type: "RESET" })}>
            Clear All
          </button>
        </div>
      </div>

      {state.loading ? (
        <Spinner />
      ) : (
        <>
          <p style={styles.count}>
            {filtered.length} listing{filtered.length !== 1 ? "s" : ""} found
          </p>
          {filtered.length === 0 ? (
            <div style={styles.empty}>No listings match your search.</div>
          ) : (
            <div style={styles.virtualContainer}>
              {rows.map((row, idx) => renderRow(row, idx))}
            </div>
          )}
        </>
      )}

      <SavedListings show={showSaved} />
    </div>
  );
};

export default ListingsPage;

const styles = {
  page: { padding: "32px 48px", fontFamily: "sans-serif" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    flexWrap: "wrap" as const,
    gap: "12px",
  },
  heading: { fontSize: "24px", fontWeight: 700, margin: 0 },
  controls: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" as const },
  toggleBtn: { padding: "8px 18px", backgroundColor: "#222", color: "#fff", border: "none", borderRadius: "25px", cursor: "pointer", fontSize: "13px", fontWeight: 600 },
  resetBtn: { padding: "8px 18px", backgroundColor: "#f0f0f0", color: "#222", border: "none", borderRadius: "25px", cursor: "pointer", fontSize: "13px", fontWeight: 600 },
  count: { color: "#888", fontSize: "13px", marginBottom: "20px" },
  empty: { textAlign: "center" as const, padding: "60px", color: "#888", fontSize: "16px" },
  virtualContainer: { display: "flex", flexDirection: "column" as const, gap: "24px" },
  row: { display: "grid", gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`, gap: "24px" },
} as const;

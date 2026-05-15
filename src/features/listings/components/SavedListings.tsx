import { Transition } from "@headlessui/react";
import { useStore } from "../../../store/StoreContext";

interface Props {
  show: boolean;
}

const SavedListings = ({ show }: Props) => {
  const { state } = useStore();
  const savedListings = state.listings.filter((l) => state.saved.includes(l.id));

  return (
    <Transition
      show={show}
      enter="transition-all duration-300 ease-out"
      enterFrom="opacity-0 translate-x-full"
      enterTo="opacity-100 translate-x-0"
      leave="transition-all duration-200 ease-in"
      leaveFrom="opacity-100 translate-x-0"
      leaveTo="opacity-0 translate-x-full"
    >
      <div style={styles.panel}>
        <h3 style={styles.heading}>Saved Listings ({savedListings.length})</h3>
        {savedListings.length === 0 ? (
          <p style={styles.empty}>No saved listings yet.</p>
        ) : (
          <ul style={styles.list}>
            {savedListings.map((l) => (
              <li key={l.id} style={styles.item}>
                <strong style={styles.title}>{l.title}</strong>
                <span style={styles.meta}>{l.location}</span>
                <span style={styles.price}>${l.price}/night</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Transition>
  );
};

export default SavedListings;

const styles = {
  panel: {
    position: "fixed" as const,
    top: 0,
    right: 0,
    width: "300px",
    height: "100vh",
    background: "#fff",
    boxShadow: "-4px 0 20px rgba(0,0,0,0.12)",
    padding: "24px",
    overflowY: "auto" as const,
    zIndex: 100,
  },
  heading: { fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "#222" },
  empty: { color: "#888", fontSize: "14px" },
  list: { listStyle: "none", padding: 0, margin: 0 },
  item: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
    padding: "12px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  title: { fontSize: "14px", color: "#222" },
  meta: { fontSize: "12px", color: "#888" },
  price: { fontSize: "13px", fontWeight: 600, color: "#ff385c" },
};

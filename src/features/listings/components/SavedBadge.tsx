interface Props {
  count: number;
}

const SavedBadge = ({ count }: Props) => {
  if (count === 0) return null;
  return (
    <span style={styles.badge}>
      {count} {count === 1 ? "saved" : "saved"}
    </span>
  );
};

export default SavedBadge;

const styles = {
  badge: {
    backgroundColor: "#ff385c",
    color: "#fff",
    borderRadius: "20px",
    padding: "4px 12px",
    fontSize: "13px",
    fontWeight: 600,
  },
};

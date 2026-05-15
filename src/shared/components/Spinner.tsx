const Spinner = () => (
  <div style={styles.wrap}>
    <div style={styles.spinner} />
  </div>
);

export default Spinner;

const styles = {
  wrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "80px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f0f0f0",
    borderTop: "4px solid #ff385c",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
} as const;

// inject keyframes once
const style = document.createElement("style");
style.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
document.head.appendChild(style);

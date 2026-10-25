import Button from "./Button";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null; // Conditional rendering: returns null when closed

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(15, 23, 42, 0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "16px"
    }}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside modal
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "480px",
          padding: "24px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>{title || "Hospital Notice"}</h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#64748b"
            }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: "20px" }}>{children}</div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

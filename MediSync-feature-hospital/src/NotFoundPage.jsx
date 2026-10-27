import { Link } from "react-router-dom";

// ==========================================================
// VIVA TOPIC: React Router - 404 Not Found Page
// - Catch-all route path="*" renders this page for invalid URLs
// ==========================================================

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <h1 style={{ fontSize: "64px", margin: "0 0 8px 0", color: "#0284c7" }}>404</h1>
      <h2 style={{ fontSize: "22px", margin: "0 0 14px 0", color: "#0f172a" }}>Page Not Found</h2>
      <p style={{ color: "#64748b", margin: "0 auto 20px auto", maxWidth: "400px" }}>
        The hospital portal page you requested does not exist.
      </p>
      <Link
        to="/history"
        style={{
          display: "inline-block",
          background: "#0284c7",
          color: "#fff",
          padding: "10px 18px",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: 600
        }}
      >
        ← Return to Medical History
      </Link>
    </div>
  );
}

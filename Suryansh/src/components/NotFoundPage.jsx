import { Link } from "react-router-dom";

// NotFoundPage: Catches any unmatched route ('*') and provides helpful recovery links
function NotFoundPage() {
  return (
    <div className="page-container" style={{ textAlign: "center", padding: "48px 16px" }}>
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔍</div>
      <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>404 - Page Not Found</h2>
      <p className="subtitle" style={{ marginBottom: "24px" }}>
        The page you are looking for does not exist in the hospital portal.
      </p>

      {/* Quick recovery navigation buttons */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
        <Link
          to="/beds"
          className="doc-tab-btn active"
          style={{ textDecoration: "none", display: "inline-flex" }}
        >
          <span>🛏️</span> Go to Beds
        </Link>
        <Link
          to="/patients"
          className="doc-tab-btn"
          style={{ textDecoration: "none", display: "inline-flex", background: "#f1f5f9" }}
        >
          <span>👥</span> View Patients
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;

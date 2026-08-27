import React from "react";

export default function Navbar({ username, role, activePage, onNavigate, onLogout }) {
  const links = ["History", "Doctors", "Appointments", "Medicines", "Emergency"];

  return (
    <nav className="app-nav">
      <div className="home-logo" onClick={() => onNavigate("History")} style={{ cursor: "pointer" }}>
        <div className="home-logo-icon">+</div>
        <div>
          <div className="home-logo-text">MediSync</div>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Patient Portal</div>
        </div>
      </div>

      <div className="app-nav-links">
        {links.map((l) => (
          <span
            key={l}
            onClick={() => onNavigate(l)}
            className={`app-nav-link ${activePage === l ? "active" : ""}`}
          >
            {l === "History" && "📜 "}
            {l === "Doctors" && "🩺 "}
            {l === "Appointments" && "📅 "}
            {l === "Medicines" && "💊 "}
            {l === "Emergency" && "🆘 "}
            {l}
          </span>
        ))}
      </div>

      <div className="app-nav-right">
        <span className="app-nav-user">👤 {username}</span>
        <button className="app-nav-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

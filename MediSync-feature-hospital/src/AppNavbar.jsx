import React from "react";
import { useUser } from "./context/UserContext";

// ==========================================================
// VIVA TOPIC: Context API Consumption
// - Reads { user } from UserContext using useUser()
// - Demonstrates global patient state across Navbar & Pages
// ==========================================================

export default function AppNavbar({ activePage, onNavigate, subtitle }) {
  const links = ["History", "Appointments", "Medicines", "Emergency"];
  const { user } = useUser();

  return (
    <nav className="app-nav">
      <div className="home-logo" onClick={() => onNavigate("History")} style={{ cursor: "pointer" }}>
        <div className="home-logo-icon">+</div>
        <div>
          <div className="home-logo-text">MediSync</div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>Hospital Portal · {subtitle}</div>
        </div>
      </div>

      <div className="app-nav-links">
        {links.map((l) => (
          <span
            key={l}
            onClick={() => onNavigate(l)}
            className={`app-nav-link ${activePage === l ? "active" : ""}`}
            style={{ cursor: "pointer" }}
          >
            {l === "History" && "📜 "}
            {l === "Appointments" && "📅 "}
            {l === "Medicines" && "💊 "}
            {l === "Emergency" && "🆘 "}
            {l}
          </span>
        ))}
      </div>

      <div className="app-nav-right">
        <span className="app-nav-user" style={{ fontSize: "13px", fontWeight: 600 }}>
          👤 {user.name}
        </span>
      </div>
    </nav>
  );
}
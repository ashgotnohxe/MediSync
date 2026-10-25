import React from "react";
import { useTheme } from "../context/ThemeContext";


export default function Navbar({ username, role, activePage, onNavigate, onLogout }) {
  const links = ["History", "Doctors", "Appointments", "Medicines", "Emergency"];
  const { theme, toggleTheme } = useTheme();

  function handleLinkClick(linkName) {

    if (!username && linkName !== "Emergency") {
      onNavigate("Auth");
    } else {
      onNavigate(linkName);
    }
  }

  return (
    <nav className="app-nav">
      <div
        className="home-logo"
        onClick={() => onNavigate(username ? "History" : "Home")}
        style={{ cursor: "pointer" }}
      >
        <div className="home-logo-icon">+</div>
        <div>
          <div className="home-logo-text">MediSync</div>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Hospital Patient Portal</div>
        </div>
      </div>

      <div className="app-nav-links">
        {links.map((l) => (
          <span
            key={l}
            onClick={() => handleLinkClick(l)}
            className={`app-nav-link ${activePage === l ? "active" : ""}`}
            style={{ cursor: "pointer" }}
            title={!username && l !== "Emergency" ? "Login required" : ""}
          >
            {l === "History" && "📜 "}
            {l === "Doctors" && "🩺 "}
            {l === "Appointments" && "📅 "}
            {l === "Medicines" && "💊 "}
            {l === "Emergency" && "🆘 "}
            {l === "History" ? "Dashboard" : l}
          </span>
        ))}
      </div>

      <div className="app-nav-right" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Context API Theme Switcher Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title="Toggle Theme (Context API Demo)"
          style={{
            background: theme === "dark" ? "#1e293b" : "#f1f5f9",
            color: theme === "dark" ? "#f8fafc" : "#334155",
            border: "1.5px solid #cbd5e1",
            borderRadius: "20px",
            padding: "5px 12px",
            fontSize: "12px",
            cursor: "pointer",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>

        {username ? (
          <>
            <span className="app-nav-user">👤 {username}</span>
            <button className="app-nav-logout" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <button
            className="app-nav-logout"
            onClick={() => onNavigate("Auth")}
            style={{ background: "#0284c7", color: "#ffffff", border: "none" }}
          >
            Sign In / Login
          </button>
        )}
      </div>
    </nav>
  );
}

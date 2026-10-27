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
        {/* Redux-powered Dark / Light Mode Toggle Button */}
        <button
          type="button"
          id="theme-toggle-btn"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Currently ${theme === "dark" ? "Dark" : "Light"} mode. Click to switch to ${theme === "dark" ? "Light" : "Dark"} mode.`}
          aria-label={`Toggle theme (currently ${theme})`}
        >
          <span className="theme-toggle-icon" aria-hidden="true">
            {theme === "dark" ? "☀️" : "🌙"}
          </span>
          <span className="theme-toggle-label">
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </span>
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

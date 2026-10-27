import { NavLink, useNavigate } from "react-router-dom";

// DoctorNavbar: Navigation bar child component for the Doctor Portal
// Receives doctorName and onLogout as props from parent Layout
function DoctorNavbar({ doctorName, onLogout }) {
  const navigate = useNavigate();

  // Links configuration for doctor routes
  const navItems = [
    { to: "/", label: "Dashboard", icon: "📊", end: true },
    { to: "/beds", label: "Beds Management", icon: "🛏️" },
    { to: "/patients", label: "Patients", icon: "👥" },
    { to: "/register-patient", label: "Register Patient", icon: "➕" },
    { to: "/directory", label: "Directory", icon: "🩺" },
  ];

  // Reset to root route when doctor logs out
  function handleLogoutClick() {
    onLogout();
    navigate("/");
  }

  return (
    <header className="doc-top-nav">
      {/* Brand logo & title */}
      <div className="home-logo">
        <div className="home-logo-icon">+</div>
        <div>
          <div className="home-logo-text">MediSync Doctor</div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>Hospital Administration</div>
        </div>
      </div>

      {/* NavLink buttons with active styling via className callback */}
      <nav className="doc-top-tabs">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `doc-tab-btn ${isActive ? "active" : ""}`}
            style={{ textDecoration: "none" }}
          >
            <span>{item.icon}</span> {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Doctor profile info & logout button */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
          🧑‍⚕️ {doctorName || "Dr. Staff"}
        </span>
        <button className="app-nav-logout" onClick={handleLogoutClick}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default DoctorNavbar;

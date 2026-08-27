export default function AppNavbar({ username, activePage, onNavigate, subtitle }) {
  const links = ["History", "Appointments", "Medicines", "Emergency"];
  return (
    <nav className="app-nav">
      <div className="home-logo">
        <div className="home-logo-icon">+</div>
        <div>
          <div className="home-logo-text">MediSync</div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>{subtitle}</div>
        </div>
      </div>
      <div className="app-nav-links">
        {links.map((l) => (
          <span
            key={l}
            onClick={() => onNavigate(l)}
            className={`app-nav-link ${activePage === l ? "active" : ""}`}
          >
            {l}
          </span>
        ))}
      </div>
      <div className="app-nav-right">
        <span className="app-nav-user">{username}</span>
       
      </div>
    </nav>
  );
}
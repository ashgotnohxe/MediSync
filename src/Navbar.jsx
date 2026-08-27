export default function NavBar({ username, activePage, onNavigate, onLogout }) {
  const links = ["History", "Doctors"];

  return (
    <nav className="app-nav">
      <div className="app-nav-left">
        <button className="app-nav-back" onClick={() => window.history.back()}>
          ← Back
        </button>
        <div className="home-logo">
          <div className="home-logo-icon">+</div>
          <div className="home-logo-text">MediSync</div>
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
        <button className="app-nav-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
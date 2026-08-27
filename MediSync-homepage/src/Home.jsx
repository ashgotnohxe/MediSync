import "./App.css";

export default function Home({ onGetStarted }) {
  return (
    <div className="home-page">
      <div className="home-nav">
        <div className="home-logo">
          <div className="home-logo-icon">+</div>
          <span className="home-logo-text">MediSync</span>
        </div>
        <button className="home-signin" onClick={onGetStarted}>
          Sign in
        </button>
      </div>

      <div className="home-hero">
        <span className="home-badge">HEALTHCARE, ON YOUR TIME</span>

        <h1 className="home-title">
          A doctor, a pharmacy and an ambulance —{" "}
          <span className="home-title-pink">one tap away.</span>
        </h1>

        <p className="home-subtitle">
          MediSync connects you to real consultations, appointment booking,
          quick medicine delivery, and emergency support, all from home.
        </p>
        <p className="home-subtitle">
          Any problem? MediSync is here to solve it. You can do everything
          online, no need to go out — every emergency case is solved.
        </p>

        <svg viewBox="0 0 600 140" className="heartbeat-svg">
          <path
            className="heartbeat-path"
            d="M0,70 L110,70 L140,20 L170,120 L200,45 L225,70 L340,70 L365,10 L392,130 L420,70 L600,70"
            fill="none"
            stroke="#ec4899"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle className="heartbeat-dot" cx="392" cy="130" r="5" fill="#db2777" />
        </svg>

        <button className="home-cta" onClick={onGetStarted}>
          Get started — it's free
        </button>

        <div className="home-features">
          <div className="home-feature-card">
            <div className="home-feature-icon">🩺</div>
            <div className="home-feature-title">Talk to a Doctor</div>
            <div className="home-feature-desc">
              Voice consults with real doctors, in minutes, from anywhere.
            </div>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">📅</div>
            <div className="home-feature-title">Book Appointments</div>
            <div className="home-feature-desc">
              Pick a time slot and book a visit with your preferred doctor.
            </div>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">💊</div>
            <div className="home-feature-title">Order Medicines</div>
            <div className="home-feature-desc">
              Get medicines suggested and delivered straight to your door.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
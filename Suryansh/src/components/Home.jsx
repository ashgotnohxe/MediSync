import React from "react";

export default function Home({ onGetStarted }) {
  return (
    <div className="home-page">
      <div className="home-nav">
        <div className="home-logo">
          <div className="home-logo-icon">+</div>
          <span className="home-logo-text">MediSync</span>
        </div>
        <button className="home-signin" onClick={onGetStarted}>
          Sign In / Portal
        </button>
      </div>

      <div className="home-hero">
        <span className="home-badge">HEALTHCARE, ON YOUR TIME</span>

        <h1 className="home-title">
          A doctor, a pharmacy and an ambulance —{" "}
          <span className="home-title-accent">one tap away.</span>
        </h1>

        <p className="home-subtitle">
          MediSync connects you to real-time doctor consultations, instant appointment booking,
          fast medicine delivery, and live hospital bed emergency support.
        </p>

        <svg viewBox="0 0 600 140" className="heartbeat-svg">
          <path
            className="heartbeat-path"
            d="M0,70 L110,70 L140,20 L170,120 L200,45 L225,70 L340,70 L365,10 L392,130 L420,70 L600,70"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle className="heartbeat-dot" cx="392" cy="130" r="5" fill="#0284c7" />
        </svg>

        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button className="home-cta" onClick={onGetStarted}>
            Get Started — It's Free
          </button>
        </div>

        <div className="home-features">
          <div className="home-feature-card">
            <div className="home-feature-icon">🩺</div>
            <div className="home-feature-title">Talk to a Doctor</div>
            <div className="home-feature-desc">
              Voice, video, and chat consults with verified doctors, right from home.
            </div>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">📅</div>
            <div className="home-feature-title">Book Appointments</div>
            <div className="home-feature-desc">
              Pick a convenient time slot and instantly queue your consultation visit.
            </div>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">💊</div>
            <div className="home-feature-title">Order Medicines</div>
            <div className="home-feature-desc">
              Get symptom-based medicine recommendations and 5-minute home delivery.
            </div>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">🚑</div>
            <div className="home-feature-title">Emergency & Beds</div>
            <div className="home-feature-desc">
              Check real-time hospital bed availability and dispatch instant SOS alerts.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

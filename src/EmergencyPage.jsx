import { useState, useEffect } from "react";

const DEFAULT_HOSPITALS = [
  { name: "City Care Hospital", distance: 1.2, available: 14, total: 60 },
  { name: "Medisync Multispeciality", distance: 2.8, available: 3, total: 40 },
  { name: "Sunrise Children's Hospital", distance: 3.5, available: 9, total: 30 },
  { name: "Apex Trauma Centre", distance: 4.1, available: 1, total: 25 },
];

const EMERGENCY_TYPES = [
  { label: "Accident", icon: "🚗" },
  { label: "Cardiac Arrest", icon: "❤️" },
  { label: "Breathing Issue", icon: "🫁" },
  { label: "Severe Injury", icon: "🩹" },
  { label: "Other", icon: "⚠️" },
];

const EMERGENCY_CONTACTS = [
  { label: "Ambulance", number: "108", icon: "🚑" },
  { label: "Police", number: "100", icon: "🚓" },
  { label: "Fire Brigade", number: "101", icon: "🚒" },
  { label: "Women Helpline", number: "1091", icon: "📞" },
];

const FIRST_AID_TIPS = [
  "Bleeding: Apply direct pressure with a clean cloth and keep the wound elevated.",
  "Burns: Run cool water over the area for 10 minutes. Do not apply ice.",
  "Fainting: Lay the person flat on their back and slightly raise their legs.",
  "Choking: Give firm back blows between the shoulder blades, repeat 5 times.",
];

export default function EmergencyPage({ username }) {
  const [hospitals, setHospitals] = useState([]);
  const [selectedType, setSelectedType] = useState(EMERGENCY_TYPES[0].label);
  const [reported, setReported] = useState(false);
  const [reportedAt, setReportedAt] = useState(null);

  useEffect(() => { loadBeds(); }, []);

  function loadBeds() {
    const b = localStorage.getItem("beds");
    setHospitals(b ? JSON.parse(b) : DEFAULT_HOSPITALS);
  }

  function reportSOS() {
    const entry = { type: selectedType, time: Date.now() };

    const s = localStorage.getItem(`sos_${username}`);
    const list = s ? JSON.parse(s) : [];
    localStorage.setItem(`sos_${username}`, JSON.stringify([...list, entry]));

    const sa = localStorage.getItem("sos_all");
    const listAll = sa ? JSON.parse(sa) : [];
    localStorage.setItem("sos_all", JSON.stringify([...listAll, { ...entry, patient: username }]));

    setReported(true);
    setReportedAt(entry.time);
  }

  return (
    <div className="emg-page">
      <div className="emg-header">
        <h2 className="emg-heading">What's the emergency?</h2>
        <p className="emg-subheading">Select a type, then report to alert nearby hospitals instantly.</p>
      </div>

      <div className="emg-type-row">
        {EMERGENCY_TYPES.map((t) => (
          <button
            key={t.label}
            onClick={() => setSelectedType(t.label)}
            className={`emg-type-btn ${selectedType === t.label ? "selected" : ""}`}
          >
            <span className="emg-type-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <button onClick={reportSOS} className="emg-sos-btn">
        <span className="emg-sos-icon">🚨</span>
        <span className="emg-sos-text">
          <span className="emg-sos-title">Report {selectedType}</span>
          <span className="emg-sos-desc">
            Tap to alert nearby hospitals — an ambulance will be dispatched immediately
          </span>
        </span>
      </button>

      {reported && (
        <div className="emg-confirm-box">
          <span className="emg-confirm-icon">✅</span>
          <span>
            Your report has been sent at <strong>{new Date(reportedAt).toLocaleTimeString()}</strong>.
            Help is on the way — stay calm and stay on the line if contacted.
          </span>
        </div>
      )}

      <h3 className="emg-section-title">Emergency Contacts</h3>
      <div className="emg-contacts-grid">
        {EMERGENCY_CONTACTS.map((c, i) => (
          <a key={i} href={`tel:${c.number}`} className="emg-contact-card">
            <span className="emg-contact-icon">{c.icon}</span>
            <span className="emg-contact-label">{c.label}</span>
            <span className="emg-contact-number">{c.number}</span>
          </a>
        ))}
      </div>

      <h3 className="emg-section-title">Nearby Hospitals</h3>
      <div className="emg-hospitals-grid">
        {hospitals.map((h, i) => {
          const pct = (h.available / h.total) * 100;
          const low = pct < 20;
          return (
            <div key={i} className="emg-hospital-card">
              <div className="emg-hospital-top">
                <h4 className="emg-hospital-name">{h.name}</h4>
                <span className="emg-badge">24x7</span>
              </div>
              <p className="emg-distance">📍 {h.distance} km away</p>
              <div className="emg-beds-row">
                <span>Beds available</span>
                <span className={`emg-beds-count ${low ? "low" : "ok"}`}>{h.available} / {h.total}</span>
              </div>
              <div className="emg-bar-track">
                <div className={`emg-bar-fill ${low ? "low" : "ok"}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="emg-section-title">Quick First Aid Tips</h3>
      <div className="emg-tips-box">
        {FIRST_AID_TIPS.map((tip, i) => (
          <div key={i} className="emg-tip-item">
            <span className="emg-tip-dot">•</span>
            <span>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
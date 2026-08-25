import { useState } from "react";
const EMERGENCY_TYPES = [
  { id: "accident", label: "Accident", icon: "🚗" },
  { id: "cardiac", label: "Cardiac", icon: "❤️" },
  { id: "breathing", label: "Breathing", icon: "🫁" },
  { id: "injury", label: "Injury", icon: "🩹" },
  { id: "other", label: "Other", icon: "⚠️" },
];
const CONTACTS = [
  { label: "Ambulance", number: "108", icon: "🚑" },
  { label: "Police", number: "100", icon: "🚓" },
  { label: "Fire", number: "101", icon: "🚒" },
  { label: "Women Helpline", number: "1091", icon: "📞" },
];
const HOSPITALS = [
  { name: "City Care Hospital", beds: 6, totalBeds: 20 },
  { name: "Sunrise Multispeciality", beds: 2, totalBeds: 15 },
  { name: "Apollo Clinic", beds: 11, totalBeds: 18 },
];
export default function EmergencyPage({ username }) {
  const [selectedType, setSelectedType] = useState(null);
  const [confirmedMsg, setConfirmedMsg] = useState("");
  function sendSOS() {
    const entry = {
      type: selectedType
        ? EMERGENCY_TYPES.find((t) => t.id === selectedType)?.label
        : "General SOS",
      time: Date.now(),
    };
    const raw = localStorage.getItem(`sos_${username}`);
    const list = raw ? JSON.parse(raw) : [];
    localStorage.setItem(`sos_${username}`, JSON.stringify([...list, entry]));
    setConfirmedMsg("Nearby hospitals have been alerted.");
  }
  return (
    <div className="emg-page">
      <div className="emg-header">
        <h2 className="emg-heading">Emergency</h2>
        <p className="emg-subheading">Get help fast — one tap alerts nearby hospitals</p>
      </div>
      <div className="emg-type-row">
        {EMERGENCY_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedType(t.id)}
            className={`emg-type-btn ${selectedType === t.id ? "selected" : ""}`}
          >
            <span className="emg-type-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
      <button className="emg-sos-btn" onClick={sendSOS}>
        <span className="emg-sos-icon">🆘</span>
        <span className="emg-sos-text">
          <span className="emg-sos-title">Send SOS</span>
          <span className="emg-sos-desc">Alert nearby hospitals instantly</span>
        </span>
      </button>
      {confirmedMsg && (
        <div className="emg-confirm-box">
          <span className="emg-confirm-icon">✅</span>
          <span>{confirmedMsg}</span>
        </div>
      )}
      <h3 className="emg-section-title">Nearby hospitals</h3>
      <div className="emg-hospitals-grid">
        {HOSPITALS.map((h) => {
          const pct = Math.round((h.beds / h.totalBeds) * 100);
          const low = h.beds <= 3;
          return (
            <div key={h.name} className="emg-hospital-card">
              <div className="emg-hospital-top">
                <span className="emg-hospital-name">{h.name}</span>
              </div>
              <div className="emg-beds-row">
                <span>Beds available</span>
                <span className={`emg-beds-count ${low ? "low" : "ok"}`}>{h.beds}/{h.totalBeds}</span>
              </div>
              <div className="emg-bar-track">
                <div className={`emg-bar-fill ${low ? "low" : "ok"}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <h3 className="emg-section-title">Emergency contacts</h3>
      <div className="emg-contacts-grid">
        {CONTACTS.map((c) => (
          <a key={c.label} href={`tel:${c.number}`} className="emg-contact-card">
            <span className="emg-contact-icon">{c.icon}</span>
            <span className="emg-contact-label">{c.label}</span>
            <span className="emg-contact-number">{c.number}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
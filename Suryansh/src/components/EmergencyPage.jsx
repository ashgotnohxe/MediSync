import { useState, useEffect } from "react";
import { loadData, saveData, HOSPITALS_SEED } from "../mock-storage";

const EMERGENCY_TYPES = [
  { id: "accident", label: "Accident / Trauma", icon: "🚗" },
  { id: "cardiac", label: "Cardiac Emergency", icon: "❤️" },
  { id: "breathing", label: "Breathing Distress", icon: "🫁" },
  { id: "injury", label: "Severe Injury", icon: "🩹" },
  { id: "other", label: "Other Critical", icon: "⚠️" },
];

const CONTACTS = [
  { label: "Ambulance", number: "108", icon: "🚑" },
  { label: "Emergency Central", number: "112", icon: "🚨" },
  { label: "Police Assistance", number: "100", icon: "🚓" },
  { label: "Fire & Rescue", number: "101", icon: "🚒" },
  { label: "Women Helpline", number: "1091", icon: "📞" },
];

export default function EmergencyPage({ username }) {
  const [selectedType, setSelectedType] = useState(null);
  const [confirmedMsg, setConfirmedMsg] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [loadingBeds, setLoadingBeds] = useState(true);

  useEffect(() => {
    loadBeds();
  }, []);

  async function loadBeds() {
    setLoadingBeds(true);
    const data = await loadData("beds", true, HOSPITALS_SEED);
    setHospitals(data);
    setLoadingBeds(false);
  }

  async function sendSOS() {
    const typeLabel = selectedType
      ? EMERGENCY_TYPES.find((t) => t.id === selectedType)?.label
      : "General SOS Emergency";

    const entry = {
      type: typeLabel,
      patient: username,
      time: Date.now(),
    };

    // Personal SOS log
    const raw = localStorage.getItem(`sos_${username}`);
    const list = raw ? JSON.parse(raw) : [];
    localStorage.setItem(`sos_${username}`, JSON.stringify([...list, entry]));

    // Shared SOS log for hospital/doctors
    const sharedRaw = await loadData("sos_all", true, []);
    await saveData("sos_all", [entry, ...sharedRaw], true);

    setConfirmedMsg(`✅ High-priority SOS alert sent for "${typeLabel}". Nearby hospitals & ambulances alerted.`);
    setTimeout(() => setConfirmedMsg(""), 6000);
  }

  return (
    <div className="emg-page">
      <div className="emg-header">
        <h2 className="emg-heading">Emergency & Live Hospital Beds</h2>
        <p className="emg-subheading">
          Instant ambulance dispatch, emergency hotlines, and real-time hospital bed status
        </p>
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
          <span className="emg-sos-title">Dispatch Instant SOS Alert</span>
          <span className="emg-sos-desc">Sends GPS & medical distress alert to nearest ambulance & hospital</span>
        </span>
      </button>

      {confirmedMsg && (
        <div className="emg-confirm-box">
          <span className="emg-confirm-icon">🚨</span>
          <span>{confirmedMsg}</span>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px", marginBottom: "16px" }}>
        <h3 className="emg-section-title" style={{ margin: 0 }}>
          🏥 Connected Hospital Bed Availability (Live)
        </h3>
        <button onClick={loadBeds} className="hist-refresh-btn">
          🔄 Refresh Beds
        </button>
      </div>

      {loadingBeds ? (
        <p style={{ color: "#64748b" }}>Loading hospital bed status...</p>
      ) : (
        <div className="emg-hospitals-grid">
          {hospitals.map((h) => {
            const available = h.available !== undefined ? h.available : (h.beds !== undefined ? h.beds : 0);
            const total = h.total !== undefined ? h.total : (h.totalBeds !== undefined ? h.totalBeds : 20);
            const pct = Math.round((available / total) * 100);
            const isLow = available <= 3;

            return (
              <div key={h.id || h.name} className="emg-hospital-card">
                <div className="emg-hospital-top">
                  <span className="emg-hospital-name">{h.name}</span>
                  {h.distance && <span className="emg-hospital-dist">{h.distance}</span>}
                </div>
                <div className="emg-beds-row">
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Emergency Beds Available</span>
                  <span className={`emg-beds-count ${isLow ? "low" : "ok"}`}>
                    {available} / {total} free
                  </span>
                </div>
                <div className="emg-bar-track">
                  <div
                    className={`emg-bar-fill ${isLow ? "low" : "ok"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h3 className="emg-section-title" style={{ marginTop: "32px" }}>
        📞 Emergency Hotlines & Rescue Numbers
      </h3>
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

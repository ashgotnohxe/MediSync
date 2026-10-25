import { useState, useEffect } from "react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function HistoryPage({ username, displayName }) {
  useDocumentTitle("Patient Dashboard & History");
  const [appts, setAppts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sos, setSos] = useState([]);
  const [consults, setConsults] = useState([]);

  useEffect(() => {
    loadAll();
  }, [username]);

  function loadAll() {
    try {
      const a = localStorage.getItem(`appts_${username}`);
      setAppts(a ? JSON.parse(a) : []);

      const o = localStorage.getItem(`medorders_${username}`);
      setOrders(o ? JSON.parse(o) : []);

      const s = localStorage.getItem(`sos_${username}`);
      setSos(s ? JSON.parse(s) : []);

      const c = localStorage.getItem(`consults_${username}`) || localStorage.getItem(`hist_${username}`);
      setConsults(c ? JSON.parse(c) : []);
    } catch (e) {
      console.error("Error loading history", e);
    }
  }

  const historyItems = [
    ...consults.map((c) => ({
      type: "consult",
      title: `Consultation with ${c.doctor}`,
      subtitle: `Prescription: ${c.medicine || "Consultation complete"} (${c.duration || "5:00"})`,
      time: c.time || Date.now(),
    })),
    ...appts.map((a) => ({
      type: "appointment",
      title: `Appointment with Dr. ${a.doctor}`,
      subtitle: `Scheduled Slot: ${a.slot || a.time}`,
      time: a.bookedAt || a.time || Date.now(),
    })),
    ...orders.map((o) => ({
      type: "medicine",
      title: `Medicine Order · ${o.items ? o.items.length : 1} item(s)`,
      subtitle: `Total: ₹${o.total}`,
      time: o.placedAt || Date.now(),
    })),
    ...sos.map((s) => ({
      type: "sos",
      title: s.type || "Accident / SOS Report",
      subtitle: "Emergency alert sent to nearby hospitals",
      time: s.time || Date.now(),
    })),
  ].sort((a, b) => b.time - a.time);

  return (
    <div className="hist-page">
      <div className="hist-banner">
        <p className="hist-banner-sub">Welcome back,</p>
        <p className="hist-banner-name">{displayName || username || "Patient"}</p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 className="hist-section-title" style={{ margin: 0 }}>Medical History</h3>
        <button onClick={loadAll} className="hist-refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {historyItems.length === 0 ? (
        <div className="hist-empty-box">
          <p style={{ fontSize: "16px", fontWeight: 600, color: "#1e293b", marginBottom: "6px" }}>
            No history yet!
          </p>
          <p style={{ fontSize: "14px", color: "#64748b" }}>
            Your doctor consultations, appointment bookings, medicine orders, and SOS reports will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="hist-list">
          {historyItems.map((item, i) => (
            <div key={i} className={`hist-item hist-item-${item.type}`}>
              <div>
                <p className="hist-item-title">{item.title}</p>
                <p className="hist-item-subtitle">{item.subtitle}</p>
              </div>
              <span className="hist-item-time">
                {new Date(item.time).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

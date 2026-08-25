import { useState, useEffect } from "react";
export default function HistoryPage({ username, displayName }) {
  const [appts, setAppts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sos, setSos] = useState([]);
  useEffect(() => { loadAll(); }, []);
  function loadAll() {
    const a = localStorage.getItem(`appts_${username}`);
    setAppts(a ? JSON.parse(a) : []);
    const o = localStorage.getItem(`medorders_${username}`);
    setOrders(o ? JSON.parse(o) : []);
    const s = localStorage.getItem(`sos_${username}`);
    setSos(s ? JSON.parse(s) : []);
  }
  const historyItems = [
    ...appts.map((a) => ({
      type: "appointment",
      title: `Appointment with Dr ${a.doctor}`,
      subtitle: a.slot,
      time: a.bookedAt,
    })),
    ...orders.map((o) => ({
      type: "medicine",
      title: `Medicine order · ${o.items.length} items`,
      subtitle: `₹${o.total}`,
      time: o.placedAt,
    })),
    ...sos.map((s) => ({
      type: "sos",
      title: s.type || "Accident / SOS Report",
      subtitle: "Emergency reported",
      time: s.time,
    })),
  ].sort((a, b) => b.time - a.time);
  return (
    <div className="hist-page">
      <div className="hist-banner">
        <p className="hist-banner-sub">Welcome back,</p>
        <p className="hist-banner-name">{displayName || username}</p>
      </div>
      <h3 className="hist-section-title">Medical History</h3>
      {historyItems.length === 0 ? (
        <div className="hist-empty-box">
          No history yet. It will appear here after your first consultation.
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
                {new Date(item.time).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
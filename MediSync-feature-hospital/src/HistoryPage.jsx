import { useState, useEffect } from "react";
import { useUser } from "./context/UserContext";
import { useDocumentTitle } from "./hooks/useDocumentTitle";

// ==========================================================
// VIVA TOPIC: Medical History / Dashboard Component
// - Demonstrates Context API consumption via useUser()
// - Demonstrates custom hook useDocumentTitle()
// - Demonstrates useState and useEffect for loading patient records
// ==========================================================

export default function HistoryPage({ username, displayName }) {
  useDocumentTitle("Medical History & Dashboard");

  // Context API: reads global user information without prop drilling
  const { user } = useUser();

  const [appts, setAppts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sos, setSos] = useState([]);

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
    } catch (e) {
      console.error("Error loading history:", e);
    }
  }

  const historyItems = [
    ...appts.map((a) => ({
      type: "appointment",
      title: `Appointment with ${a.doctor}`,
      subtitle: `${a.slot} ${a.date ? `(${a.date})` : ""}`,
      time: a.bookedAt || Date.now(),
    })),
    ...orders.map((o) => ({
      type: "medicine",
      title: `Medicine order · ${o.items ? o.items.length : 1} item(s)`,
      subtitle: `Total: ₹${o.total}`,
      time: o.placedAt || Date.now(),
    })),
    ...sos.map((s) => ({
      type: "sos",
      title: s.type || "Accident / SOS Report",
      subtitle: "Emergency alert sent to nearby hospital",
      time: s.time || Date.now(),
    })),
  ].sort((a, b) => b.time - a.time);

  return (
    <div className="hist-page" style={{ maxWidth: "760px", margin: "0 auto", padding: "16px" }}>
      <div className="hist-banner">
        <p className="hist-banner-sub">Welcome back,</p>
        <p className="hist-banner-name">{displayName || user.name || username}</p>
        <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0 0" }}>
          {user.role} · Blood Group: {user.bloodGroup} · {user.hospitalBranch} (Context API)
        </p>
      </div>

      <h3 className="hist-section-title">Your Hospital Medical History</h3>

      {historyItems.length === 0 ? (
        <div className="hist-empty-box">
          No medical records yet. Your scheduled appointments, medicine orders, and SOS alerts will appear here.
        </div>
      ) : (
        <div className="hist-list">
          {historyItems.map((item, i) => (
            <div key={i} className={`hist-item hist-item-${item.type}`}>
              <div>
                <p className="hist-item-title">{item.title}</p>
                <p className="hist-item-sub">{item.subtitle}</p>
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
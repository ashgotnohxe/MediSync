import { useState, useEffect } from "react";

export default function HistoryPage({ username }) {
  const [consults, setConsults] = useState([]);

  useEffect(() => {
    const c = localStorage.getItem(`consults_${username}`);
    setConsults(c ? JSON.parse(c) : []);
  }, [username]);

  const sorted = [...consults].sort((a, b) => b.time - a.time);

  return (
    <div className="hist-page">
      <div className="hist-banner">
        <p className="hist-banner-sub">Welcome back,</p>
        <p className="hist-banner-name">{username}</p>
      </div>

      <h3 className="hist-section-title">Consultation History</h3>

      {sorted.length === 0 ? (
        <div className="hist-empty-box">
          No history yet. It will appear here after your first consultation.
        </div>
      ) : (
        <div className="hist-list">
          {sorted.map((c, i) => (
            <div key={i} className="hist-item hist-item-consult">
              <div>
                <p className="hist-item-title">Consultation with {c.doctor}</p>
                <p className="hist-item-subtitle">
                  {c.medicineOrdered
                    ? `${c.medicine} · Ordered · Duration ${c.duration}`
                    : `${c.medicine} · Duration ${c.duration}`}
                </p>
              </div>
              <span className="hist-item-time">
                {new Date(c.time).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
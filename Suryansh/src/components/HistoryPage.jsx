import { useState, useEffect } from "react";

const tabs = [
  { id: "all", label: "All" },
  { id: "consult", label: "Consultations" },
  { id: "appointment", label: "Appointments" },
  { id: "medicine", label: "Medicines" },
  { id: "sos", label: "SOS" },
];

export default function HistoryPage({ username, displayName }) {
  const [appts, setAppts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sos, setSos] = useState([]);
  const [consults, setConsults] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    loadAll();
  }, [username]);

  function loadAll() {
    setLoading(true);
    setError("");
    setTimeout(() => {
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
        setError("Could not load your history. Please try again.");
      }
      setLoading(false);
    }, 400);
  }

  // Delete (CRUD)
  function deleteItem(item) {
    const sources = {
      consult: { key: "consults_", list: consults, set: setConsults },
      appointment: { key: "appts_", list: appts, set: setAppts },
      medicine: { key: "medorders_", list: orders, set: setOrders },
      sos: { key: "sos_", list: sos, set: setSos },
    };
    const src = sources[item.type];
    const updated = src.list.filter((_, i) => i !== item.index);
    localStorage.setItem(src.key + username, JSON.stringify(updated));
    src.set(updated);
  }

  const historyItems = [
    ...consults.map((c, i) => ({
      type: "consult",
      index: i,
      title: `Consultation with ${c.doctor}`,
      subtitle: `Prescription: ${c.medicine || "Consultation complete"} (${c.duration || "5:00"})`,
      time: c.time || Date.now(),
    })),
    ...appts.map((a, i) => ({
      type: "appointment",
      index: i,
      title: `Appointment with Dr. ${a.doctor}`,
      subtitle: `Scheduled Slot: ${a.slot || a.time}`,
      time: a.bookedAt || a.time || Date.now(),
    })),
    ...orders.map((o, i) => ({
      type: "medicine",
      index: i,
      title: `Medicine Order · ${o.items ? o.items.length : 1} item(s)`,
      subtitle: `Total: ₹${o.total}`,
      time: o.placedAt || Date.now(),
    })),
    ...sos.map((s, i) => ({
      type: "sos",
      index: i,
      title: s.type || "Accident / SOS Report",
      subtitle: "Emergency alert sent to nearby hospitals",
      time: s.time || Date.now(),
    })),
  ];

  // Tab filter -> Search -> Sort
  const visibleItems = historyItems
    .filter((item) => activeTab === "all" || item.type === activeTab)
    .filter((item) => {
      const q = search.trim().toLowerCase();
      return q === "" || item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q);
    })
    .sort((a, b) => (sortOrder === "newest" ? b.time - a.time : a.time - b.time));

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

      {/* Tabs */}
      <div className="doc-filters" style={{ marginBottom: "12px" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`doc-filter-pill ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + Sort */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <input
          className="auth-input"
          style={{ flex: 1, minWidth: "200px", marginBottom: 0 }}
          placeholder="🔍 Search history..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="auth-input"
          style={{ width: "180px", marginBottom: 0 }}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {/* Loading / Error / Empty / List */}
      {loading ? (
        <p style={{ padding: "30px", textAlign: "center" }}>⏳ Loading history...</p>
      ) : error ? (
        <div style={{ padding: "30px", textAlign: "center" }}>
          <p className="appt-error">{error}</p>
          <button onClick={loadAll} className="hist-refresh-btn">
            Retry
          </button>
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="hist-empty-box">
          <p style={{ fontSize: "16px", fontWeight: 600, color: "#1e293b", marginBottom: "6px" }}>
            {historyItems.length === 0 ? "No history yet!" : "Nothing matches your search"}
          </p>
          <p style={{ fontSize: "14px", color: "#64748b" }}>
            Your doctor consultations, appointment bookings, medicine orders, and SOS reports will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="hist-list">
          {visibleItems.map((item) => (
            <div key={item.type + item.index} className={`hist-item hist-item-${item.type}`}>
              <div>
                <p className="hist-item-title">{item.title}</p>
                <p className="hist-item-subtitle">{item.subtitle}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className="hist-item-time">
                  {new Date(item.time).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <button
                  onClick={() => deleteItem(item)}
                  style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "16px" }}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

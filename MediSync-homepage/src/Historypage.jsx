import { useState, useEffect } from "react";

const tabs = [
  { id: "all", label: "All" },
  { id: "ordered", label: "Medicine ordered" },
  { id: "notordered", label: "Consult only" },
];

export default function HistoryPage({ username }) {
  const [consults, setConsults] = useState([]);

  // loading, error, tabs, search, sort
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  function loadAll() {
    setLoading(true);
    setError("");
    // chhota delay taaki loading state dikhe (API jaisa)
    setTimeout(() => {
      try {
        const c = localStorage.getItem(`consults_${username}`);
        setConsults(c ? JSON.parse(c) : []);
      } catch (e) {
        console.error("Error loading history", e);
        setError("Could not load your history. Please try again.");
      }
      setLoading(false);
    }, 400);
  }

  // Delete (CRUD)
  function deleteItem(index) {
    const updated = consults.filter((_, i) => i !== index);
    localStorage.setItem(`consults_${username}`, JSON.stringify(updated));
    setConsults(updated);
  }

  // index yaad rakhte hain taaki sahi item delete ho
  const items = consults.map((c, i) => ({ ...c, index: i }));

  // Tab filter -> Search -> Sort
  const visibleItems = items
    .filter((c) => {
      if (activeTab === "ordered") return c.medicineOrdered;
      if (activeTab === "notordered") return !c.medicineOrdered;
      return true;
    })
    .filter((c) => {
      const q = search.trim().toLowerCase();
      return (
        q === "" ||
        (c.doctor || "").toLowerCase().includes(q) ||
        (c.medicine || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (sortOrder === "newest" ? b.time - a.time : a.time - b.time));

  return (
    <div className="hist-page">
      <div className="hist-banner">
        <p className="hist-banner-sub">Welcome back,</p>
        <p className="hist-banner-name">{username}</p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3 className="hist-section-title" style={{ margin: 0 }}>Consultation History</h3>
        <button className="med-add-btn" style={{ padding: "8px 16px", fontSize: "13px" }} onClick={loadAll}>
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="appt-doctors">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={"appt-doc-btn" + (activeTab === t.id ? " selected" : "")}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + Sort */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <input
          className="med-search-input"
          placeholder="Search by doctor or medicine..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="med-search-input"
          style={{ flex: "0 0 180px" }}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {/* Loading / Error / Empty / List */}
      {loading ? (
        <div className="hist-empty-box">Loading history...</div>
      ) : error ? (
        <div className="hist-empty-box">
          <p className="appt-error">{error}</p>
          <button className="med-add-btn" style={{ padding: "8px 20px" }} onClick={loadAll}>
            Retry
          </button>
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="hist-empty-box">
          {consults.length === 0
            ? "No history yet. It will appear here after your first consultation."
            : "Nothing matches your search."}
        </div>
      ) : (
        <div className="hist-list">
          {visibleItems.map((c) => (
            <div key={c.index} className="hist-item hist-item-consult">
              <div>
                <p className="hist-item-title">Consultation with {c.doctor}</p>
                <p className="hist-item-subtitle">
                  {c.medicineOrdered
                    ? `${c.medicine} · Ordered · Duration ${c.duration}`
                    : `${c.medicine} · Duration ${c.duration}`}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className="hist-item-time">{new Date(c.time).toLocaleDateString()}</span>
                <button
                  onClick={() => deleteItem(c.index)}
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

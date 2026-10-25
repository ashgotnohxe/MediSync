import { useState, useEffect } from "react";
import Card from "./common/Card";
import Button from "./common/Button";

const FALLBACK_TIPS = [
  { id: 101, title: "Stay Hydrated", body: "Drink at least 2-3 liters of clean water daily to prevent dehydration." },
  { id: 102, title: "Routine Health Checks", body: "Check blood pressure and sugar levels every 6 months." },
  { id: 103, title: "Emergency Readiness", body: "Keep emergency hotline numbers (108 / 112) handy at home." }
];

export default function HealthTips() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch data on component mount
  useEffect(() => {
    fetchHealthTips();
  }, []);

  async function fetchHealthTips() {
    setLoading(true);
    setError("");

    try {
      // Using standard public JSON API for demonstration
      const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=3");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Map API fields to readable health bulletin cards
      const formattedTips = data.map((item, index) => ({
        id: item.id,
        title: `Health Advisory #${index + 1}: ` + item.title.slice(0, 30),
        body: item.body.slice(0, 80) + "..."
      }));

      setTips(formattedTips);
    } catch (err) {
      console.warn("API request failed, using offline hospital advisory:", err.message);
      setError("Note: Live API offline. Displaying local hospital advisory.");
      setTips(FALLBACK_TIPS);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      title="Hospital Health Advisory Bulletin"
      subtitle="Live advisory fetched via standard REST API (fetch + useEffect)"
      icon="📢"
      className="health-tips-card"
    >
      <div style={{ marginBottom: "12px", display: "flex", justifyContent: "flex-end" }}>
        <Button variant="secondary" onClick={fetchHealthTips} disabled={loading}>
          {loading ? "Refreshing..." : "🔄 Refresh API Data"}
        </Button>
      </div>

      {/* 1. Loading State */}
      {loading && (
        <div className="api-status-box loading">
          <p>⏳ Fetching latest health bulletin from server...</p>
        </div>
      )}

      {/* 2. Error Message */}
      {error && !loading && (
        <div className="api-status-box error">
          <p>{error}</p>
        </div>
      )}

      {/* 3. Display Fetched Data */}
      {!loading && (
        <div className="tips-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
          {tips.map((tip) => (
            <div key={tip.id} className="tip-card" style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
              <h5 style={{ margin: "0 0 6px 0", fontSize: "14px", color: "#0284c7" }}>{tip.title}</h5>
              <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>{tip.body}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

import { useState, useEffect } from "react";
import Card from "./Card";
import Button from "./Button";

// ==========================================================
// VIVA TOPIC: API Handling with fetch() and useEffect
// 1. useEffect with [] dependency array runs on mount
// 2. Three essential states:
//    - loading: true while waiting for response
//    - error: stores error message if network fails
//    - data (advisories): stores the array of items
// 3. Graceful offline fallback ensures app never breaks in viva!
// ==========================================================

const FALLBACK_ADVISORIES = [
  { id: 1, title: "Emergency Hospital Readiness", body: "24x7 trauma centers and ambulances are on standby across all branches." },
  { id: 2, title: "Seasonal Fever Guidelines", body: "Stay hydrated and consult OPD within 24 hours if body temperature exceeds 101°F." },
  { id: 3, title: "OPD Booking Notice", body: "Please arrive 15 minutes prior to your scheduled consultation slot." }
];

export default function HospitalBulletin() {
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBulletins();
  }, []);

  async function fetchBulletins() {
    setLoading(true);
    setError("");

    try {
      // Standard public REST API
      const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=3");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const formatted = data.map((item, index) => ({
        id: item.id,
        title: `Advisory #${index + 1}: ` + item.title.slice(0, 32),
        body: item.body.slice(0, 80) + "..."
      }));
      setAdvisories(formatted);
    } catch (err) {
      console.warn("API request offline, using local hospital advisory:", err.message);
      setError("Notice: Live network offline. Displaying local hospital advisory bulletin.");
      setAdvisories(FALLBACK_ADVISORIES);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      title="Hospital Live Advisory Bulletin"
      subtitle="Fetched via REST API (demonstrating fetch + useEffect)"
      icon="📢"
      style={{ marginTop: "24px" }}
    >
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
        <Button variant="secondary" onClick={fetchBulletins} disabled={loading} style={{ fontSize: "12px", padding: "6px 12px" }}>
          {loading ? "Refreshing..." : "🔄 Refresh API Data"}
        </Button>
      </div>

      {loading && (
        <div style={{ padding: "12px", background: "#f0f9ff", borderRadius: "8px", color: "#0369a1", fontSize: "13px" }}>
          ⏳ Fetching latest hospital advisories from server...
        </div>
      )}

      {error && !loading && (
        <div style={{ padding: "10px", background: "#fff1f2", borderRadius: "8px", color: "#be123c", fontSize: "12px", marginBottom: "10px" }}>
          {error}
        </div>
      )}

      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
          {advisories.map((item) => (
            <div key={item.id} style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <strong style={{ fontSize: "13px", color: "#0284c7", display: "block", marginBottom: "4px" }}>
                {item.title}
              </strong>
              <p style={{ margin: 0, fontSize: "12px", color: "#475569", lineHeight: "1.5" }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

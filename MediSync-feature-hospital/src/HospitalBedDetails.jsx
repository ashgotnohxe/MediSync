import { useParams, Link } from "react-router-dom";
import { HOSPITALS_SEED } from "./mock-storage";
import { useDocumentTitle } from "./hooks/useDocumentTitle";
import Card from "./components/common/Card";

// ==========================================================
// VIVA TOPIC: Dynamic Routing & useParams()
// - Route: <Route path="/emergency/:id" element={<HospitalBedDetails />} />
// - useParams(): reads the ':id' parameter from the URL path
// ==========================================================

export default function HospitalBedDetails() {
  const { id } = useParams(); // Reads dynamic route parameter ':id'

  const hospital = HOSPITALS_SEED.find((h) => String(h.id) === String(id)) || {
    id: id,
    name: `Hospital #${id}`,
    distance: "Near your location",
    type: "24x7 Emergency Care",
    available: 5,
    total: 30,
    phone: "108"
  };

  useDocumentTitle(`${hospital.name} - Bed Status`);

  return (
    <div style={{ maxWidth: "650px", margin: "24px auto", padding: "0 16px" }}>
      <div style={{ marginBottom: "16px" }}>
        <Link to="/emergency" style={{ color: "#0284c7", textDecoration: "none", fontWeight: 600, fontSize: "14px" }}>
          ← Back to All Hospital Beds
        </Link>
      </div>

      <Card
        title={hospital.name}
        subtitle={hospital.type}
        icon="🏥"
        badge={`${hospital.available} / ${hospital.total} Beds Free`}
      >
        <div style={{ lineHeight: "1.8", margin: "14px 0", color: "#334155" }}>
          <p><strong>Hospital ID:</strong> {id} (Read dynamically from URL via <code>useParams()</code>)</p>
          <p><strong>Distance:</strong> {hospital.distance}</p>
          <p><strong>Emergency Availability:</strong> {hospital.available} ICU & Ward beds available right now</p>
          <p><strong>Emergency Contact Hotline:</strong> {hospital.phone || "108"}</p>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
          <a
            href={`tel:${hospital.phone || "108"}`}
            style={{
              background: "#ef4444",
              color: "#fff",
              padding: "9px 16px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "14px"
            }}
          >
            🚑 Call Ambulance Dispatch
          </a>
          <Link
            to="/appointments"
            style={{
              background: "#f1f5f9",
              color: "#0f172a",
              border: "1px solid #cbd5e1",
              padding: "9px 16px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "14px"
            }}
          >
            📅 Book OPD Appointment
          </Link>
        </div>
      </Card>
    </div>
  );
}

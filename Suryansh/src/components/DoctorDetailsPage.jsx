import { useParams, Link } from "react-router-dom";
import { DOCTORS } from "../mock-storage";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import Card from "./common/Card";
import Button from "./common/Button";

// ==========================================================
// VIVA TOPIC: React Router - Dynamic Routing & useParams()
// - Route definition: <Route path="/doctors/:id" element={<DoctorDetailsPage />} />
// - useParams(): React Router hook to read URL path parameter ':id'
// - Link: Client-side navigation without full page reload
// ==========================================================

export default function DoctorDetailsPage() {
  // 1. Read the dynamic route parameter ':id' from the URL
  const { id } = useParams();

  // Find doctor matching the id from URL
  const doctor = DOCTORS.find((d) => String(d.id) === String(id)) || {
    id: id,
    name: `Dr. Specialist #${id}`,
    specialty: "Consultant Physician",
    experience: "10 yrs",
    rating: 4.8
  };

  // Custom hook to set document title
  useDocumentTitle(doctor.name);

  return (
    <div style={{ maxWidth: "700px", margin: "24px auto", padding: "0 16px" }}>
      <div style={{ marginBottom: "16px" }}>
        <Link to="/doctors" style={{ color: "#0284c7", textDecoration: "none", fontWeight: 600 }}>
          ← Back to All Doctors
        </Link>
      </div>

      <Card
        title={doctor.name}
        subtitle={doctor.specialty}
        icon="🩺"
        badge={`⭐ ${doctor.rating} / 5.0`}
      >
        <div style={{ margin: "16px 0", lineHeight: 1.8 }}>
          <p><strong>Doctor ID:</strong> {id} (Read dynamically from URL via <code>useParams()</code>)</p>
          <p><strong>Department:</strong> {doctor.specialty}</p>
          <p><strong>Clinical Experience:</strong> {doctor.experience}</p>
          <p><strong>Consultation Days:</strong> Monday – Saturday</p>
          <p><strong>OPD Timings:</strong> 09:00 AM – 05:00 PM</p>
          <p><strong>Hospital Branch:</strong> MediSync Central Healthcare, Wing B</p>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
          <Link to="/appointments">
            <Button variant="primary">📅 Book Appointment Now</Button>
          </Link>
          <Link to="/emergency">
            <Button variant="secondary">🏥 Check Live Bed Availability</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

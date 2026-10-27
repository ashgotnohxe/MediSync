// RegisterPatientPage: Patient registration page mounted at route /register-patient
// Step 1 establishes this route; Step 3 will implement the full controlled form with validation
function RegisterPatientPage() {
  return (
    <div className="page-container">
      <h2>Register New Patient</h2>
      <p className="subtitle">Add a new patient record to the MediSync network.</p>

      <div className="card" style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px" }}>
          Registration form will be connected in Step 3.
        </p>
        <div style={{ padding: "16px", background: "#f0f9ff", borderRadius: "8px", border: "1px dashed #0284c7" }}>
          <p style={{ margin: 0, color: "#0369a1", fontWeight: 500, fontSize: "14px" }}>
            📌 Route <code>/register-patient</code> is configured in React Router and ready for Step 3 form implementation!
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPatientPage;

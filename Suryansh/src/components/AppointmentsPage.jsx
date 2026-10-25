import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { loadData, saveData, DOCTORS } from "../mock-storage";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import Card from "./common/Card";
import Button from "./common/Button";
import Input from "./common/Input";
import Modal from "./common/Modal";
import DoctorFilterTabs from "./DoctorFilterTabs";

const TIME_SLOTS = ["9:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "05:00 PM"];

const SPECIALTY_CATEGORIES = ["All Specialties", "General Physician", "Cardiologist", "Pediatrician", "Neurologist", "Orthopedic", "Dermatologist"];

export default function AppointmentsPage({ username }) {
  // 1. Custom Hook - updates tab title
  useDocumentTitle("Hospital Appointments");

  // 2. useState - Managing appointments & selection state
  const [selectedDoc, setSelectedDoc] = useState(DOCTORS[0].name);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [myAppts, setMyAppts] = useState([]);
  const [docSearch, setDocSearch] = useState("");
  const [docSort, setDocSort] = useState("none");
  const [activeCategory, setActiveCategory] = useState("All Specialties");
  const [slotFilter, setSlotFilter] = useState("all");

  // 3. useState - Modal open/close state
  const [isGuidelineModalOpen, setIsGuidelineModalOpen] = useState(false);

  // 4. useState - Controlled Form Inputs & Validation
  const [formData, setFormData] = useState({
    patientName: username || "",
    email: "",
    appointmentDate: new Date().toISOString().split("T")[0],
    reason: "Routine Medical Checkup"
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // 5. useRef - For directly focusing an input element
  const patientNameInputRef = useRef(null);

  // Focus input helper function (demonstrating useRef)
  function handleFocusNameInput() {
    if (patientNameInputRef.current) {
      patientNameInputRef.current.focus();
    }
  }

  // 6. useEffect - Load existing saved appointments when component mounts
  useEffect(() => {
    loadAppointments();
  }, [username]);

  function loadAppointments() {
    try {
      const saved = localStorage.getItem(`appts_${username}`);
      setMyAppts(saved ? JSON.parse(saved) : []);
    } catch (e) {
      console.error("Could not load appointments:", e);
      setMyAppts([]);
    }
  }

  // 7. useMemo - Memoizes the filtered doctor list so it's not re-computed on every render
  const visibleDoctors = useMemo(() => {
    let docs = DOCTORS.filter((doctor) => {
      const matchesSearch = doctor.name.toLowerCase().includes(docSearch.toLowerCase());
      const matchesCategory =
        activeCategory === "All Specialties" || doctor.specialty === activeCategory;
      return matchesSearch && matchesCategory;
    });

    if (docSort === "ratingHigh") {
      docs = [...docs].sort((a, b) => b.rating - a.rating);
    } else if (docSort === "ratingLow") {
      docs = [...docs].sort((a, b) => a.rating - b.rating);
    }

    return docs;
  }, [docSearch, docSort, activeCategory]);

  // 8. useCallback - Memoizes function reference to avoid recreating on each render
  const handleResetFilters = useCallback(() => {
    setDocSearch("");
    setDocSort("none");
    setActiveCategory("All Specialties");
    setSlotFilter("all");
  }, []);

  // Filter slots (AM/PM)
  const visibleSlots = TIME_SLOTS.filter((slot) => {
    if (slotFilter === "am") return slot.includes("AM");
    if (slotFilter === "pm") return slot.includes("PM");
    return true;
  });

  // Check if patient already has an appointment with selected doctor
  const existingApptWithDoc = myAppts.find((a) => a.doctor === selectedDoc);

  // Controlled form input change handler
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear field-specific error as user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  // Form Validation (Normal JavaScript validation, no heavy libraries)
  function validateForm() {
    const errors = {};

    if (!formData.patientName.trim()) {
      errors.patientName = "Patient full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address (e.g. name@example.com)";
    }

    if (!formData.appointmentDate) {
      errors.appointmentDate = "Appointment date is required";
    }

    if (!selectedSlot) {
      errors.slot = "Please select an available time slot below";
    }

    return errors;
  }

  // Handle Form Submission
  async function handleBookingSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validate inputs
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (existingApptWithDoc) {
      setErrorMessage(`You already have an active appointment scheduled with ${selectedDoc}.`);
      return;
    }

    const newAppointment = {
      id: Date.now(),
      doctor: selectedDoc,
      slot: selectedSlot,
      time: selectedSlot,
      date: formData.appointmentDate,
      patient: formData.patientName,
      patientName: formData.patientName,
      email: formData.email,
      reason: formData.reason,
      status: "waiting",
      bookedAt: Date.now()
    };

    try {
      // Sync with shared hospital queue in mock storage
      const latestQueue = await loadData("queue", true, []);
      await saveData("queue", [...latestQueue, newAppointment], true);

      // Save locally to user's appointments
      const updatedList = [...myAppts, newAppointment];
      localStorage.setItem(`appts_${username}`, JSON.stringify(updatedList));

      setMyAppts(updatedList);
      setSuccessMessage(`✅ Appointment successfully scheduled with ${selectedDoc} on ${formData.appointmentDate} at ${selectedSlot}!`);
      setSelectedSlot(null);
      setFormErrors({});

      // Auto dismiss success banner after 4 seconds
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Booking error:", err);
      setErrorMessage("Could not confirm appointment. Please try again.");
    }
  }

  // Cancel Appointment handler
  async function cancelAppointment(docName) {
    const newMyAppts = myAppts.filter((a) => a.doctor !== docName);
    try {
      localStorage.setItem(`appts_${username}`, JSON.stringify(newMyAppts));
      setMyAppts(newMyAppts);
      setSelectedSlot(null);
      setSuccessMessage(`Appointment with ${docName} cancelled successfully.`);
      setTimeout(() => setSuccessMessage(""), 3000);

      const latestQueue = await loadData("queue", true, []);
      const newQueue = latestQueue.filter(
        (a) => !(a.doctor === docName && (a.patient === username || a.patientName === username))
      );
      await saveData("queue", newQueue, true);
    } catch (e) {
      console.error("Cancel failed:", e);
    }
  }

  return (
    <div className="appt-page" style={{ maxWidth: "860px", margin: "0 auto", padding: "20px" }}>
      {/* Page Title & Guidelines Modal Trigger */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 className="appt-title" style={{ margin: 0 }}>🏥 Hospital Appointments & OPD Booking</h2>
          <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>
            Book confirmed consultation slots with hospital specialists
          </p>
        </div>
        <Button variant="secondary" onClick={() => setIsGuidelineModalOpen(true)}>
          ℹ️ Visit Guidelines (Modal)
        </Button>
      </div>

      {/* Reusable Modal Component Demonstration */}
      <Modal
        isOpen={isGuidelineModalOpen}
        onClose={() => setIsGuidelineModalOpen(false)}
        title="Hospital OPD Visit Guidelines"
      >
        <p><strong>Please review the following hospital policies before your visit:</strong></p>
        <ul style={{ paddingLeft: "20px", color: "#334155", lineHeight: "1.7" }}>
          <li>Arrive at the OPD reception at least 15 minutes before your scheduled slot.</li>
          <li>Carry your government ID and any previous medical test reports.</li>
          <li>Face masks are recommended inside hospital consultation rooms.</li>
          <li>Cancellations are permitted up to 2 hours prior to the slot.</li>
        </ul>
      </Modal>

      {/* Success Notification Banner */}
      {successMessage && (
        <div style={{ background: "#dcfce7", color: "#166534", border: "1.5px solid #86efac", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontWeight: 500 }}>
          {successMessage}
        </div>
      )}

      {/* Error Notification Banner */}
      {errorMessage && (
        <div style={{ background: "#fee2e2", color: "#991b1b", border: "1.5px solid #fca5a5", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontWeight: 500 }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* SECTION 1: Doctor Selection & Lifting State Up (DoctorFilterTabs) */}
      <Card title="1. Select Hospital Doctor" icon="🩺" subtitle="Filter by specialty or search by doctor name">
        {/* Lifting State Up: Child component (DoctorFilterTabs) updates parent state via onSelectCategory */}
        <DoctorFilterTabs
          categories={SPECIALTY_CATEGORIES}
          activeCategory={activeCategory}
          onSelectCategory={(cat) => setActiveCategory(cat)}
        />

        {/* Search & Sort Controls */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "14px 0" }}>
          <input
            style={{ flex: 1, minWidth: "220px", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1" }}
            value={docSearch}
            onChange={(e) => setDocSearch(e.target.value)}
            placeholder="🔍 Search doctor by name..."
          />

          <select
            style={{ padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", background: "#fff" }}
            value={docSort}
            onChange={(e) => setDocSort(e.target.value)}
          >
            <option value="none">Sort: Default</option>
            <option value="ratingHigh">Rating: High to Low</option>
            <option value="ratingLow">Rating: Low to High</option>
          </select>

          <Button variant="secondary" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </div>

        {/* Doctor Selection Grid */}
        <div className="appt-doctors" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px", marginTop: "12px" }}>
          {visibleDoctors.map((doc) => (
            <button
              type="button"
              key={doc.name}
              onClick={() => {
                setSelectedDoc(doc.name);
                setSelectedSlot(null);
                setErrorMessage("");
              }}
              className={`appt-doc-btn ${selectedDoc === doc.name ? "selected" : ""}`}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: selectedDoc === doc.name ? "2px solid #0284c7" : "1.5px solid #cbd5e1",
                background: selectedDoc === doc.name ? "#f0f9ff" : "#ffffff",
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              <div style={{ fontWeight: 600, color: "#0f172a" }}>{doc.name}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>{doc.specialty}</div>
              <div style={{ fontSize: "12px", color: "#f59e0b", marginTop: "4px" }}>⭐ {doc.rating.toFixed(1)}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* SECTION 2: Booking Form with Controlled Inputs & Native Validation */}
      <div style={{ marginTop: "24px" }}>
        <Card title="2. Appointment Details & Booking Form" icon="📝" subtitle="Demonstrating Controlled Form Inputs and useRef">
          {/* Helper button to demonstrate useRef input focus */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
            <button
              type="button"
              onClick={handleFocusNameInput}
              style={{ background: "#e0f2fe", color: "#0369a1", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
            >
              🎯 Focus Patient Name (useRef Demo)
            </button>
          </div>

          <form onSubmit={handleBookingSubmit} noValidate>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              {/* Controlled Input 1: Patient Name (with inputRef) */}
              <Input
                label="Patient Full Name"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                placeholder="Enter patient full name"
                inputRef={patientNameInputRef}
                error={formErrors.patientName}
                required
              />

              {/* Controlled Input 2: Patient Email */}
              <Input
                label="Email Address (for appointment confirmation)"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g. rahul@example.com"
                error={formErrors.email}
                required
              />

              {/* Controlled Input 3: Appointment Date */}
              <Input
                label="Preferred Appointment Date"
                name="appointmentDate"
                type="date"
                value={formData.appointmentDate}
                onChange={handleInputChange}
                error={formErrors.appointmentDate}
                required
              />

              {/* Controlled Input 4: Reason / Department */}
              <div className="reusable-input-group">
                <label className="reusable-input-label">Consultation Reason</label>
                <input
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="reusable-input-field"
                  placeholder="e.g. Chest pain, Fever, Routine check"
                />
              </div>
            </div>

            {/* Time Slot Selection */}
            <div style={{ marginTop: "20px" }}>
              <label style={{ fontWeight: 600, fontSize: "14px", display: "block", marginBottom: "8px" }}>
                Select Preferred Time Slot <span style={{ color: "#ef4444" }}>*</span>
              </label>

              {/* Slot Filter Chips */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                {[
                  ["all", "All Slots"],
                  ["am", "Morning (AM)"],
                  ["pm", "Afternoon (PM)"]
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSlotFilter(key)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      border: slotFilter === key ? "2px solid #0f172a" : "1.5px solid #cbd5e1",
                      background: slotFilter === key ? "#0f172a" : "#fff",
                      color: slotFilter === key ? "#fff" : "#0f172a",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Slots buttons */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {visibleSlots.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => {
                      setSelectedSlot(slot);
                      if (formErrors.slot) {
                        setFormErrors((prev) => ({ ...prev, slot: "" }));
                      }
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: selectedSlot === slot ? "2px solid #0284c7" : "1.5px solid #cbd5e1",
                      background: selectedSlot === slot ? "#0284c7" : "#f8fafc",
                      color: selectedSlot === slot ? "#fff" : "#1e293b",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {formErrors.slot && (
                <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "6px", display: "block" }}>
                  {formErrors.slot}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: "24px" }}>
              <Button type="submit" variant="primary" style={{ width: "100%", padding: "12px", fontSize: "15px" }}>
                {selectedSlot
                  ? `📅 Confirm Booking with ${selectedDoc} (${selectedSlot})`
                  : "Select a time slot and submit"}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* SECTION 3: Scheduled Appointments List */}
      <div style={{ marginTop: "28px" }}>
        <h3 style={{ fontSize: "18px", color: "#0f172a", marginBottom: "12px" }}>
          📋 Your Scheduled Appointments ({myAppts.length})
        </h3>

        {myAppts.length === 0 ? (
          <div style={{ padding: "24px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", textAlign: "center", color: "#64748b" }}>
            No appointments booked yet. Select a doctor above to reserve your slot.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {myAppts.map((appt) => (
              <div
                key={appt.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#ffffff",
                  padding: "16px",
                  borderRadius: "10px",
                  border: "1.5px solid #e2e8f0"
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "#0f172a" }}>🩺 {appt.doctor}</div>
                  <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                    👤 {appt.patient || appt.patientName} {appt.email && `· ✉️ ${appt.email}`}
                  </div>
                  <div style={{ fontSize: "12px", color: "#0284c7", marginTop: "4px", fontWeight: 500 }}>
                    ⏰ {appt.slot || appt.time} {appt.date && `on ${appt.date}`}
                  </div>
                </div>

                <Button
                  variant="danger"
                  onClick={() => cancelAppointment(appt.doctor)}
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                >
                  Cancel
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

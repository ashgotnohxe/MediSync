import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { loadData, saveData, DOCTORS } from "./mock-storage";
import { useDocumentTitle } from "./hooks/useDocumentTitle";
import Card from "./components/common/Card";
import Button from "./components/common/Button";
import Input from "./components/common/Input";
import FilterTabs from "./components/common/FilterTabs";

// ==========================================================
// VIVA TOPIC: Hospital Appointments Component
// - Hooks: useState, useEffect, useRef, useMemo, useCallback
// - Custom Hook: useDocumentTitle
// - Components & Props: Card, Button, Input, FilterTabs
// - Lifting State Up: FilterTabs communicates tab selection to parent
// - Controlled Form with native JavaScript validation (NO debounce)
// ==========================================================

const TIME_SLOTS = ["9:00 AM", "10:00 AM", "11:30 AM", "2:00 PM", "3:30 PM", "5:00 PM"];
const SLOT_CATEGORIES = ["All Slots", "Morning (AM)", "Afternoon (PM)"];

export default function AppointmentsPage({ username }) {
  // 1. Custom Hook - sets document tab title
  useDocumentTitle("Hospital Appointments");

  // 2. useState - Managing selection and appointment list
  const [selectedDoc, setSelectedDoc] = useState(DOCTORS[0].name);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [myAppts, setMyAppts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [slotCategory, setSlotCategory] = useState("All Slots");

  // 3. Controlled Form Inputs & Validation State
  const [formData, setFormData] = useState({
    patientName: username || "",
    email: "",
    appointmentDate: new Date().toISOString().split("T")[0]
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 4. useRef - Directly focus the patient name input element
  const nameInputRef = useRef(null);

  function handleFocusInput() {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }

  // 5. useEffect - Load saved appointments from storage on component mount
  useEffect(() => {
    loadAppts();
  }, [username]);

  async function loadAppts() {
    try {
      const saved = localStorage.getItem(`appts_${username}`);
      setMyAppts(saved ? JSON.parse(saved) : []);
    } catch (e) {
      console.error("Could not load appointments:", e);
      setMyAppts([]);
    }
  }

  // 6. useMemo - Simple filter for doctors list based on search term (NO debounce)
  const filteredDoctors = useMemo(() => {
    return DOCTORS.filter((doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // 7. useCallback - Memoizes reset function reference
  const handleResetSearch = useCallback(() => {
    setSearchTerm("");
    setSlotCategory("All Slots");
  }, []);

  // Filter slots (AM / PM)
  const visibleSlots = TIME_SLOTS.filter((slot) => {
    if (slotCategory === "Morning (AM)") return slot.includes("AM");
    if (slotCategory === "Afternoon (PM)") return slot.includes("PM");
    return true;
  });

  const existingApptWithDoc = myAppts.find((a) => a.doctor === selectedDoc);

  // Controlled input change handler
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  // Normal JavaScript Form Validation (No heavy libraries)
  function validateForm() {
    const errors = {};
    if (!formData.patientName.trim()) {
      errors.patientName = "Patient name is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!formData.email.includes("@") || !formData.email.includes(".")) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.appointmentDate) {
      errors.appointmentDate = "Appointment date is required";
    }
    if (!selectedSlot) {
      errors.slot = "Please select an available time slot";
    }
    return errors;
  }

  // Form submission handler
  async function handleConfirm(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (existingApptWithDoc) {
      setErrorMsg(`You already have an appointment booked with ${selectedDoc}.`);
      return;
    }

    const newAppointment = {
      id: Date.now(),
      doctor: selectedDoc,
      slot: selectedSlot,
      patient: formData.patientName,
      email: formData.email,
      date: formData.appointmentDate,
      bookedAt: Date.now()
    };

    try {
      const raw = localStorage.getItem("queue");
      const latestQueue = raw ? JSON.parse(raw) : [];
      localStorage.setItem("queue", JSON.stringify([...latestQueue, newAppointment]));

      const updatedList = [...myAppts, newAppointment];
      localStorage.setItem(`appts_${username}`, JSON.stringify(updatedList));

      setMyAppts(updatedList);
      setSelectedSlot(null);
      setSuccessMsg(`✅ Appointment confirmed with ${selectedDoc} on ${formData.appointmentDate} at ${selectedSlot}!`);
      setFormErrors({});

      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Failed to book appointment. Please try again.");
    }
  }

  // Cancel appointment handler
  function cancelAppointment(docName) {
    const newMyAppts = myAppts.filter((a) => a.doctor !== docName);
    localStorage.setItem(`appts_${username}`, JSON.stringify(newMyAppts));
    setMyAppts(newMyAppts);

    const raw = localStorage.getItem("queue");
    const latestQueue = raw ? JSON.parse(raw) : [];
    const newQueue = latestQueue.filter((a) => !(a.doctor === docName && a.patient === username));
    localStorage.setItem("queue", JSON.stringify(newQueue));
  }

  return (
    <div className="appt-page" style={{ maxWidth: "800px", margin: "0 auto", padding: "16px" }}>
      <h2 className="appt-title">Book a Hospital Consultation</h2>
      <p style={{ color: "#64748b", margin: "0 0 16px 0" }}>
        Select a doctor, fill patient details, and reserve an OPD slot.
      </p>

      {/* Success Notification */}
      {successMsg && (
        <div style={{ background: "#dcfce7", color: "#166534", border: "1px solid #86efac", padding: "12px", borderRadius: "8px", marginBottom: "14px" }}>
          {successMsg}
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5", padding: "12px", borderRadius: "8px", marginBottom: "14px" }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* 1. Doctor Selection & Search */}
      <Card title="1. Select Hospital Specialist" icon="🩺" subtitle="Search doctors by name or specialty">
        <div style={{ display: "flex", gap: "8px", margin: "10px 0" }}>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search doctor or specialty..."
            style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "14px" }}
          />
          {searchTerm && (
            <Button variant="secondary" onClick={handleResetSearch} style={{ fontSize: "12px", padding: "6px 12px" }}>
              Clear
            </Button>
          )}
        </div>

        <div className="appt-doctors" style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
          {filteredDoctors.map((doc) => (
            <button
              type="button"
              key={doc.name}
              onClick={() => {
                setSelectedDoc(doc.name);
                setSelectedSlot(null);
                setErrorMsg("");
              }}
              className={`appt-doc-btn ${selectedDoc === doc.name ? "selected" : ""}`}
            >
              {doc.name} · ⭐ {doc.rating}
            </button>
          ))}
        </div>
      </Card>

      {/* 2. Patient Booking Form */}
      <Card title="2. Patient Details & Time Slot" icon="📝" subtitle="Demonstrating Controlled Form Inputs and useRef" style={{ marginTop: "20px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
          <button
            type="button"
            onClick={handleFocusInput}
            style={{ background: "#e0f2fe", color: "#0369a1", border: "none", padding: "5px 10px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
          >
            🎯 Focus Name Input (useRef)
          </button>
        </div>

        <form onSubmit={handleConfirm} noValidate>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
            <Input
              label="Patient Full Name"
              name="patientName"
              value={formData.patientName}
              onChange={handleInputChange}
              placeholder="e.g. Neha Garg"
              inputRef={nameInputRef}
              error={formErrors.patientName}
              required
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g. patient@example.com"
              error={formErrors.email}
              required
            />
            <Input
              label="Appointment Date"
              name="appointmentDate"
              type="date"
              value={formData.appointmentDate}
              onChange={handleInputChange}
              error={formErrors.appointmentDate}
              required
            />
          </div>

          {/* Time Slot Selection & Lifting State Up (FilterTabs) */}
          <div style={{ marginTop: "16px" }}>
            <label style={{ fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>
              Filter Slots by Time (Lifting State Up):
            </label>
            <FilterTabs
              tabs={SLOT_CATEGORIES}
              activeTab={slotCategory}
              onTabChange={(tab) => setSlotCategory(tab)}
            />

            <div className="appt-slots" style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
              {visibleSlots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => {
                    setSelectedSlot(slot);
                    if (formErrors.slot) setFormErrors((prev) => ({ ...prev, slot: "" }));
                  }}
                  className={`appt-slot-btn ${selectedSlot === slot ? "selected" : ""}`}
                >
                  {slot}
                </button>
              ))}
            </div>
            {formErrors.slot && (
              <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
                {formErrors.slot}
              </span>
            )}
          </div>

          <div style={{ marginTop: "20px" }}>
            <Button type="submit" variant="primary" style={{ width: "100%", padding: "12px" }}>
              {selectedSlot ? `Confirm Booking with ${selectedDoc} (${selectedSlot})` : "Select a slot and confirm"}
            </Button>
          </div>
        </form>
      </Card>

      {/* 3. Booked Appointments List */}
      <div style={{ marginTop: "24px" }}>
        <h3 className="appt-section-title">Your Scheduled Appointments ({myAppts.length})</h3>
        {myAppts.length === 0 ? (
          <p className="appt-empty">No appointments booked yet.</p>
        ) : (
          <div className="appt-list">
            {myAppts.map((a, i) => (
              <div key={a.id || i} className="appt-row">
                <div className="appt-row-info">
                  <span className="appt-row-doc">🩺 {a.doctor}</span>
                  <span className="appt-row-slot">⏰ {a.slot} {a.date && `on ${a.date}`}</span>
                  {a.patient && <span style={{ fontSize: "12px", color: "#64748b" }}>👤 {a.patient}</span>}
                </div>
                <button className="appt-cancel-btn-sm" onClick={() => cancelAppointment(a.doctor)}>
                  Cancel
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { loadData, saveData } from "../mock-storage";

const DOCTORS = [
  { name: "Dr. Ananya Rao", rating: 4.9 },
  { name: "Dr. Vikram Sen", rating: 4.7 },
  { name: "Dr. Meera Iyer", rating: 4.8 },
  { name: "Dr. Farhan Ali", rating: 4.6 },
  { name: "Dr. Kavita Joshi", rating: 4.9 },
  { name: "Dr. Rohan Das", rating: 4.5 },
  { name: "Dr. Priya Nair", rating: 4.8 },
  { name: "Dr. Sanjay Mehta", rating: 4.4 },
  { name: "Dr. Neha Kapoor", rating: 4.7 },
  { name: "Dr. Arjun Singh", rating: 4.6 },
];

const TIME_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "11:00 AM",
  "12:30 PM",
  "2:00 PM",
  "3:30 PM",
  "5:00 PM",
];

const controlsRow = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 14,
};

const searchBox = {
  flex: 1,
  minWidth: 200,
  font: "inherit",
  padding: "10px 12px",
  boxSizing: "border-box",
  border: "2.5px solid #0f172a",
  borderRadius: 12,
  background: "#fff",
  color: "#0f172a",
};

const selectBox = {
  font: "inherit",
  fontWeight: 600,
  padding: "10px 12px",
  border: "2.5px solid #0f172a",
  borderRadius: 12,
  background: "#fff",
  color: "#0f172a",
};

function chipStyle(on) {
  return {
    font: "inherit",
    fontWeight: 600,
    cursor: "pointer",
    padding: "6px 14px",
    borderRadius: 999,
    border: `2.5px solid ${on ? "#0f172a" : "#cbd5e1"}`,
    background: on ? "#0f172a" : "#fff",
    color: on ? "#fff" : "#0f172a",
  };
}

export default function AppointmentsPage({ username }) {
  const [selectedDoc, setSelectedDoc] = useState(DOCTORS[0].name);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [myAppts, setMyAppts] = useState([]);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const [docSearch, setDocSearch] = useState("");
  const [docSort, setDocSort] = useState("none");
  const [slotFilter, setSlotFilter] = useState("all");

  useEffect(() => {
    loadAppts();
  }, [username]);

  function loadAppts() {
    try {
      const saved = localStorage.getItem(`appts_${username}`);
      setMyAppts(saved ? JSON.parse(saved) : []);
    } catch (e) {
      console.error("Could not load appointments:", e);
      setMyAppts([]);
    }
  }

  const existingApptWithDoc = myAppts.find(
    (a) => a.doctor === selectedDoc
  );

  
  let visibleDoctors = DOCTORS.filter((doctor) =>
    doctor.name.toLowerCase().includes(docSearch.toLowerCase())
  );

  
  if (docSort === "ratingHigh") {
    visibleDoctors = [...visibleDoctors].sort(
      (a, b) => b.rating - a.rating
    );
  } else if (docSort === "ratingLow") {
    visibleDoctors = [...visibleDoctors].sort(
      (a, b) => a.rating - b.rating
    );
  }

  const visibleSlots = TIME_SLOTS.filter(
    (slot) =>
      slotFilter === "all" ||
      (slotFilter === "am" && slot.includes("AM")) ||
      (slotFilter === "pm" && slot.includes("PM"))
  );

  async function confirm() {
    if (!selectedSlot || existingApptWithDoc) return;

    setError("");

    const entry = {
      id: Date.now(),
      doctor: selectedDoc,
      slot: selectedSlot,
      time: selectedSlot,
      patient: username,
      patientName: username,
      status: "waiting",
      bookedAt: Date.now(),
    };

    try {
      const latestQueue = await loadData("queue", true, []);
      await saveData("queue", [...latestQueue, entry], true);

      const newMyAppts = [...myAppts, entry];

      localStorage.setItem(
        `appts_${username}`,
        JSON.stringify(newMyAppts)
      );

      setMyAppts(newMyAppts);
      setSelectedSlot(null);
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 2500);
    } catch (e) {
      console.error("Booking failed:", e);
      setError("Could not confirm appointment. Please try again.");
    }
  }

  async function cancelAppointment(doc) {
    const appointment = myAppts.find((a) => a.doctor === doc);
    const newMyAppts = myAppts.filter((a) => a.doctor !== doc);

    try {
      localStorage.setItem(
        `appts_${username}`,
        JSON.stringify(newMyAppts)
      );

      setMyAppts(newMyAppts);
      setSelectedSlot(null);
      setError("");

      const latestQueue = await loadData("queue", true, []);
      const newQueue = latestQueue.filter(
        (a) =>
          !(
            a.doctor === doc &&
            (a.patient === username || a.patientName === username) &&
            (!appointment || a.id === appointment.id)
          )
      );

      await saveData("queue", newQueue, true);
    } catch (e) {
      console.error("Cancellation update failed:", e);
      setError(
        "Appointment was removed locally, but the shared queue may not have updated."
      );
    }
  }

  return (
    <div className="appt-page">
      <h2 className="appt-title">Book an Appointment</h2>

      <p style={{ color: "#64748b", marginBottom: 20 }}>
        Select a doctor and reserved time slot for tomorrow.
      </p>

      <div style={controlsRow}>
        <input
          style={searchBox}
          value={docSearch}
          onChange={(e) => setDocSearch(e.target.value)}
          placeholder="Search doctor by name..."
          aria-label="Search doctor by name"
        />

        <select
          style={selectBox}
          value={docSort}
          onChange={(e) => setDocSort(e.target.value)}
          aria-label="Sort doctors by rating"
        >
          <option value="none">Sort: default</option>
          <option value="ratingHigh">Rating: Highest first</option>
          <option value="ratingLow">Rating: Lowest first</option>
        </select>
      </div>

      <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 10px" }}>
        Showing {visibleDoctors.length} of {DOCTORS.length} doctors
      </p>

      {visibleDoctors.length === 0 && (
        <p style={{ color: "#64748b" }}>
          No doctor found. Try another name.
        </p>
      )}

      <div className="appt-doctors">
        {visibleDoctors.map((doc) => (
          <button
            type="button"
            key={doc.name}
            onClick={() => {
              setSelectedDoc(doc.name);
              setSelectedSlot(null);
              setError("");
              setConfirmed(false);
            }}
            className={`appt-doc-btn ${
              selectedDoc === doc.name ? "selected" : ""
            }`}
          >
            {doc.name} · ⭐ {doc.rating.toFixed(1)}
            {myAppts.some((a) => a.doctor === doc.name) && " ✓"}
          </button>
        ))}
      </div>

      <div className="appt-slot-box">
        <p className="appt-slot-label">
          Available Slots for Tomorrow
        </p>

        {existingApptWithDoc ? (
          <div className="appt-existing-box">
            <div className="appt-existing-info">
              <span className="appt-existing-icon">📅</span>
              <div>
                <p className="appt-existing-title">
                  You already have a slot with {selectedDoc}
                </p>
                <p className="appt-existing-slot">
                  {existingApptWithDoc.slot || existingApptWithDoc.time}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="appt-cancel-btn"
              onClick={() => cancelAppointment(selectedDoc)}
            >
              Cancel Appointment
            </button>
          </div>
        ) : (
          <>
            {confirmed && (
              <p className="appt-success" style={{ marginBottom: 12 }}>
                ✅ Appointment confirmed with {selectedDoc}!
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              {[
                ["all", "All slots"],
                ["am", "Morning (AM)"],
                ["pm", "Afternoon (PM)"],
              ].map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  style={chipStyle(slotFilter === key)}
                  onClick={() => {
                    setSlotFilter(key);
                    setSelectedSlot(null);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="appt-slots">
              {visibleSlots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => {
                    setSelectedSlot(slot);
                    setError("");
                  }}
                  className={`appt-slot-btn ${
                    selectedSlot === slot ? "selected" : ""
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>

            {error && <p className="appt-error">{error}</p>}

            <button
              type="button"
              disabled={!selectedSlot}
              onClick={confirm}
              className={`appt-confirm-btn ${
                selectedSlot ? "enabled" : ""
              }`}
            >
              {selectedSlot
                ? `Confirm Slot (${selectedSlot}) with ${selectedDoc}`
                : "Select a time slot above"}
            </button>
          </>
        )}
      </div>

      <h3 className="appt-section-title">
        Your Scheduled Appointments
      </h3>

      {myAppts.length === 0 ? (
        <p className="appt-empty">No appointments booked yet.</p>
      ) : (
        <div className="appt-list">
          {myAppts.map((appointment, index) => (
            <div
              key={appointment.id || index}
              className="appt-row"
            >
              <div className="appt-row-info">
                <span className="appt-row-doc">
                  🩺 {appointment.doctor}
                </span>
                <span className="appt-row-slot">
                  ⏰ {appointment.slot || appointment.time}
                </span>
              </div>

              <button
                type="button"
                className="appt-cancel-btn-sm"
                onClick={() => cancelAppointment(appointment.doctor)}
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

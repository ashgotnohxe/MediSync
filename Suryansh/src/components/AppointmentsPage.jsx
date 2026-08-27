import { useState, useEffect } from "react";
import { loadData, saveData } from "../mock-storage";

const DOCTORS = [
  "Dr. Ananya Rao",
  "Dr. Vikram Sen",
  "Dr. Meera Iyer",
  "Dr. Farhan Ali",
  "Dr. Kavita Joshi",
  "Dr. Rohan Das",
  "Dr. Priya Nair",
  "Dr. Sanjay Mehta",
  "Dr. Neha Kapoor",
  "Dr. Arjun Singh",
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

export default function AppointmentsPage({ username }) {
  const [selectedDoc, setSelectedDoc] = useState(DOCTORS[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [myAppts, setMyAppts] = useState([]);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    loadAppts();
  }, [username]);

  function loadAppts() {
    try {
      const m = localStorage.getItem(`appts_${username}`);
      setMyAppts(m ? JSON.parse(m) : []);
    } catch (e) {
      console.error(e);
    }
  }

  const existingApptWithDoc = myAppts.find((a) => a.doctor === selectedDoc);

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

    // 1. Write to shared queue for Doctor Dashboard (Aryash's page)
    const latestQueue = await loadData("queue", true, []);
    const updatedQueue = [...latestQueue, entry];
    await saveData("queue", updatedQueue, true);

    // 2. Write to personal patient appointments
    const newMyAppts = [...myAppts, entry];
    localStorage.setItem(`appts_${username}`, JSON.stringify(newMyAppts));

    setMyAppts(newMyAppts);
    setSelectedSlot(null);
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 2500);
  }

  async function cancelAppointment(doc) {
    const newMyAppts = myAppts.filter((a) => a.doctor !== doc);
    localStorage.setItem(`appts_${username}`, JSON.stringify(newMyAppts));
    setMyAppts(newMyAppts);

    // Remove from shared queue as well
    const latestQueue = await loadData("queue", true, []);
    const newQueue = latestQueue.filter((a) => !(a.doctor === doc && (a.patient === username || a.patientName === username)));
    await saveData("queue", newQueue, true);
  }

  return (
    <div className="appt-page">
      <h2 className="appt-title">Book an Appointment</h2>
      <p style={{ color: "#64748b", marginBottom: "20px" }}>
        Select a doctor and reserved time slot for tomorrow
      </p>

      <div className="appt-doctors">
        {DOCTORS.map((doc) => (
          <button
            key={doc}
            onClick={() => {
              setSelectedDoc(doc);
              setSelectedSlot(null);
              setError("");
            }}
            className={`appt-doc-btn ${selectedDoc === doc ? "selected" : ""}`}
          >
            {doc}
          </button>
        ))}
      </div>

      <div className="appt-slot-box">
        <p className="appt-slot-label">Available Slots for Tomorrow</p>

        {existingApptWithDoc ? (
          <div className="appt-existing-box">
            <div className="appt-existing-info">
              <span className="appt-existing-icon">📅</span>
              <div>
                <p className="appt-existing-title">You already have a slot with {selectedDoc}</p>
                <p className="appt-existing-slot">{existingApptWithDoc.slot}</p>
              </div>
            </div>
            <button className="appt-cancel-btn" onClick={() => cancelAppointment(selectedDoc)}>
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

            <div className="appt-slots">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`appt-slot-btn ${selectedSlot === slot ? "selected" : ""}`}
                >
                  {slot}
                </button>
              ))}
            </div>

            {error && <p className="appt-error">{error}</p>}

            <button
              disabled={!selectedSlot}
              onClick={confirm}
              className={`appt-confirm-btn ${selectedSlot ? "enabled" : ""}`}
            >
              {selectedSlot ? `Confirm Slot (${selectedSlot}) with ${selectedDoc}` : "Select a time slot above"}
            </button>
          </>
        )}
      </div>

      <h3 className="appt-section-title">Your Scheduled Appointments</h3>
      {myAppts.length === 0 ? (
        <p className="appt-empty">No appointments booked yet.</p>
      ) : (
        <div className="appt-list">
          {myAppts.map((a, i) => (
            <div key={i} className="appt-row">
              <div className="appt-row-info">
                <span className="appt-row-doc">🩺 {a.doctor}</span>
                <span className="appt-row-slot">⏰ {a.slot || a.time}</span>
              </div>
              <button className="appt-cancel-btn-sm" onClick={() => cancelAppointment(a.doctor)}>
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

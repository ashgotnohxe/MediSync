import { useState, useEffect } from "react";

const DOCTORS = ["Rao","Sen","Iyer","Ali","Joshi","Das","Nair","Mehta","Kapoor","Singh","Menon","Malhotra"];
const TIME_SLOTS = ["9:00 AM","9:30 AM","10:00 AM","11:00 AM","12:30 PM","2:00 PM","3:30 PM","5:00 PM"];

export default function AppointmentsPage({ username }) {
  const [selectedDoc, setSelectedDoc] = useState(DOCTORS[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [myAppts, setMyAppts] = useState([]);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => { loadAppts(); }, []);

  function loadAppts() {
    const m = localStorage.getItem(`appts_${username}`);
    setMyAppts(m ? JSON.parse(m) : []);
  }

  const existingApptWithDoc = myAppts.find((a) => a.doctor === selectedDoc);

  function confirm() {
    if (!selectedSlot || existingApptWithDoc) return;
    setError("");

    const entry = { doctor: selectedDoc, slot: selectedSlot, patient: username, bookedAt: Date.now() };

    const raw = localStorage.getItem("queue");
    const latestQueue = raw ? JSON.parse(raw) : [];
    localStorage.setItem("queue", JSON.stringify([...latestQueue, entry]));

    const newMyAppts = [...myAppts, entry];
    localStorage.setItem(`appts_${username}`, JSON.stringify(newMyAppts));

    setMyAppts(newMyAppts);
    setSelectedSlot(null);
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 2500);
  }

  function cancelAppointment(doc) {
    const newMyAppts = myAppts.filter((a) => a.doctor !== doc);
    localStorage.setItem(`appts_${username}`, JSON.stringify(newMyAppts));
    setMyAppts(newMyAppts);

    const raw = localStorage.getItem("queue");
    const latestQueue = raw ? JSON.parse(raw) : [];
    const newQueue = latestQueue.filter((a) => !(a.doctor === doc && a.patient === username));
    localStorage.setItem("queue", JSON.stringify(newQueue));
  }

  return (
    <div className="appt-page">
      <h2 className="appt-title">Book an appointment</h2>

      <div className="appt-doctors">
        {DOCTORS.map((doc) => (
          <button
            key={doc}
            onClick={() => { setSelectedDoc(doc); setSelectedSlot(null); setError(""); }}
            className={`appt-doc-btn ${selectedDoc === doc ? "selected" : ""}`}
          >
            Dr {doc}
          </button>
        ))}
      </div>

      <div className="appt-slot-box">
        <p className="appt-slot-label">Available slots — Tomorrow</p>

        {existingApptWithDoc ? (
          <div className="appt-existing-box">
            <div className="appt-existing-info">
              <span className="appt-existing-icon">📅</span>
              <div>
                <p className="appt-existing-title">You have a slot with Dr {selectedDoc}</p>
                <p className="appt-existing-slot">{existingApptWithDoc.slot}</p>
              </div>
            </div>
            <button className="appt-cancel-btn" onClick={() => cancelAppointment(selectedDoc)}>
              Cancel appointment
            </button>
          </div>
        ) : (
          <>
            {confirmed && (
              <p className="appt-success" style={{ marginBottom: 10 }}>
                Appointment confirmed with Dr {selectedDoc}!
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
              Confirm slot with {selectedDoc}
            </button>
          </>
        )}
      </div>

      <h3 className="appt-section-title">Your appointments</h3>
      {myAppts.length === 0 ? (
        <p className="appt-empty">No appointments booked yet.</p>
      ) : (
        <div className="appt-list">
          {myAppts.map((a, i) => (
            <div key={i} className="appt-row">
              <div className="appt-row-info">
                <span className="appt-row-doc">Dr {a.doctor}</span>
                <span className="appt-row-slot">{a.slot}</span>
              </div>
              <button className="appt-cancel-btn-sm" onClick={() => cancelAppointment(a.doctor)}>
                Cancel appointment
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
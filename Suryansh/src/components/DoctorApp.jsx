import { useState, useEffect } from "react";
import { loadData, saveData, QUEUE_SEED } from "../mock-storage";
import DoctorPatientsPage from "./DoctorPatientsPage";
import DoctorBedsPage from "./DoctorBedsPage";
import DoctorDirectoryPage from "./DoctorDirectoryPage";

function StatCard({ icon, value, label, accentClass }) {
  return (
    <div className="doc-stat-card">
      <div className="doc-stat-icon">{icon}</div>
      <div className={`doc-stat-val ${accentClass}`}>{value}</div>
      <div className="doc-stat-label">{label}</div>
    </div>
  );
}

function QueueRow({ appt, onAction, actionLabel }) {
  const patientName = appt.patientName || appt.patient || "Patient";
  const time = appt.time || appt.slot || "Today";

  return (
    <div className="doc-queue-row">
      <div className="doc-queue-left">
        <div className="doc-queue-avatar">👤</div>
        <div>
          <div className="doc-queue-name">{patientName}</div>
          <div className="doc-queue-time">⏰ {time}</div>
        </div>
      </div>
      {appt.status === "waiting" ? (
        <button
          onClick={() => onAction(appt.id)}
          className="doc-queue-action-btn"
        >
          {actionLabel}
        </button>
      ) : (
        <span className="doc-queue-done-badge">
          ✅ Completed
        </span>
      )}
    </div>
  );
}

export function DoctorDashboard({ queue, markDone, doctorName }) {
  const total = queue.length;
  const waiting = queue.filter((a) => a.status === "waiting");
  const completed = total - waiting.length;
  const nextInQueue = waiting.slice(0, 3);

  return (
    <div>
      <div className="doc-profile-banner">
        <div className="doc-profile-avatar">🩺</div>
        <div>
          <div className="doc-profile-name">{doctorName || "Dr. Wsed"}</div>
          <div className="doc-profile-spec">Senior Consultant · Hospital Staff Portal</div>
        </div>
      </div>

      <div className="doc-stats-grid">
        <StatCard icon="📅" value={total} label="Today's Appts" accentClass="text-blue" />
        <StatCard icon="⏳" value={waiting.length} label="Waiting in Queue" accentClass="text-pink" />
        <StatCard icon="👥" value={completed} label="Completed" accentClass="text-green" />
      </div>

      <h3 className="doc-section-heading">Next Patients in Queue</h3>
      <div className="doc-queue-list">
        {nextInQueue.length === 0 ? (
          <div className="doc-empty-queue">
            No patients waiting in queue right now.
          </div>
        ) : (
          nextInQueue.map((a) => (
            <QueueRow key={a.id} appt={a} onAction={markDone} actionLabel="Start Consult" />
          ))
        )}
      </div>
    </div>
  );
}

export function AppointmentsList({ queue, markDone }) {
  return (
    <div>
      <h3 className="doc-section-heading">All Scheduled Queue Appointments ({queue.length})</h3>
      <p style={{ color: "#64748b", marginBottom: "16px", fontSize: "14px" }}>
        Live appointment bookings made by patients across all departments
      </p>
      <div className="doc-queue-list">
        {queue.length === 0 ? (
          <div className="doc-empty-queue">
            No appointments booked in the queue yet.
          </div>
        ) : (
          queue.map((a) => (
            <QueueRow key={a.id} appt={a} onAction={markDone} actionLabel="Mark Done" />
          ))
        )}
      </div>
    </div>
  );
}

const DOCTOR_NAV = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "appointments", label: "Appts Queue", icon: "📋" },
  { key: "patients", label: "Patients", icon: "👥" },
  { key: "beds", label: "Beds Management", icon: "🛏️" },
  { key: "directory", label: "Directory", icon: "🩺" },
];

export default function DoctorApp({ doctorName, onLogout }) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    loadQueueData();
  }, []);

  async function loadQueueData() {
    setLoading(true);
    const data = await loadData("queue", true, QUEUE_SEED);
    setQueue(data);
    setLoading(false);
  }

  async function markDone(id) {
    const updated = queue.map((a) =>
      a.id === id ? { ...a, status: "done" } : a
    );
    setQueue(updated);
    await saveData("queue", updated, true);
  }

  return (
    <div className="doc-portal-layout">
      {/* Top Header */}
      <header className="doc-top-nav">
        <div className="home-logo">
          <div className="home-logo-icon">+</div>
          <div>
            <div className="home-logo-text">MediSync Doctor</div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>Hospital Administration</div>
          </div>
        </div>

        <div className="doc-top-tabs">
          {DOCTOR_NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => setTab(n.key)}
              className={`doc-tab-btn ${tab === n.key ? "active" : ""}`}
            >
              <span>{n.icon}</span> {n.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
            🧑‍⚕️ {doctorName || "Dr. Staff"}
          </span>
          <button className="app-nav-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="doc-portal-main">
        {loading ? (
          <div className="doc-loading">Loading live hospital queue...</div>
        ) : tab === "dashboard" ? (
          <DoctorDashboard queue={queue} markDone={markDone} doctorName={doctorName} />
        ) : tab === "appointments" ? (
          <AppointmentsList queue={queue} markDone={markDone} />
        ) : tab === "patients" ? (
          <DoctorPatientsPage />
        ) : tab === "beds" ? (
          <DoctorBedsPage />
        ) : (
          <DoctorDirectoryPage />
        )}
      </main>
    </div>
  );
}

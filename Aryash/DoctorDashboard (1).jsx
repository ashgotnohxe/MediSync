import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Heart,
  LayoutDashboard,
  ClipboardList,
  LogOut,
  User,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Shared storage key. This is the SAME key Person 2's AppointmentsPage writes
// to when a patient books a slot. Person 3 (this file) only ever reads it and,
// in markDone, re-writes the WHOLE array back — never a partial update.
// ---------------------------------------------------------------------------
const QUEUE_KEY = "queue";

// Fallback data so this file can be previewed standalone before Person 2's
// booking flow exists / has written anything to the shared key yet.
const seedQueue = [
  { id: 1, patientName: "Rahul Verma", time: "10:30 AM", status: "waiting" },
  { id: 2, patientName: "Sneha Kapoor", time: "11:00 AM", status: "waiting" },
  { id: 3, patientName: "Aditi Sharma", time: "9:15 AM", status: "done" },
];

async function loadQueue() {
  try {
    const res = await window.storage.get(QUEUE_KEY, true); // shared = true
    return res ? JSON.parse(res.value) : seedQueue;
  } catch {
    // Key doesn't exist yet (nobody has booked anything) — seed it so the
    // dashboard has something to show, and so the shared key exists for
    // Person 2's page to read/write too.
    await window.storage.set(QUEUE_KEY, JSON.stringify(seedQueue), true);
    return seedQueue;
  }
}

async function saveQueue(queue) {
  try {
    await window.storage.set(QUEUE_KEY, JSON.stringify(queue), true);
  } catch (e) {
    console.error("Failed to save queue", e);
  }
}

function StatCard({ icon: Icon, value, label, accent }) {
  return (
    <div className="flex-1 border-2 border-black rounded-2xl p-5 flex flex-col items-center bg-white">
      <Icon size={20} className={accent} />
      <div className="text-2xl font-bold mt-1">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function QueueRow({ appt, onAction, actionLabel }) {
  return (
    <div className="border-2 border-black rounded-2xl p-4 flex items-center justify-between bg-white">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center shrink-0">
          <User size={16} />
        </div>
        <div>
          <div className="font-semibold">{appt.patientName}</div>
          <div className="text-xs text-gray-500">{appt.time}</div>
        </div>
      </div>
      {appt.status === "waiting" ? (
        <button
          onClick={() => onAction(appt.id)}
          className="bg-pink-500 hover:bg-pink-600 transition-colors text-white text-sm font-semibold px-5 py-2 rounded-full"
        >
          {actionLabel}
        </button>
      ) : (
        <span className="text-emerald-600 text-sm font-semibold border-2 border-emerald-500 px-4 py-1.5 rounded-full">
          Done
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DoctorDashboard — stats cards computed at render time from `queue`, plus a
// short "Next in Queue" preview (first two still-waiting appointments).
// ---------------------------------------------------------------------------
function DoctorDashboard({ queue, markDone }) {
  const total = queue.length;
  const waiting = queue.filter((a) => a.status === "waiting");
  const completed = total - waiting.length;
  const nextInQueue = waiting.slice(0, 2);

  return (
    <div>
      <div className="border-2 border-black rounded-2xl p-5 flex items-center gap-4 mb-6 bg-white">
        <div className="w-14 h-14 rounded-full bg-sky-400 flex items-center justify-center text-2xl">
          🩺
        </div>
        <div>
          <div className="font-bold text-lg">Dr. Wsed</div>
          <div className="text-sm text-gray-500">
            General Physician · 8 yrs experience
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <StatCard icon={Calendar} value={total} label="Today's Appts" accent="text-indigo-500" />
        <StatCard icon={Clock} value={waiting.length} label="Waiting" accent="text-pink-500" />
        <StatCard icon={Users} value={completed} label="Completed" accent="text-emerald-500" />
      </div>

      <h2 className="font-bold text-lg mb-3">Next in Queue</h2>
      <div className="flex flex-col gap-3">
        {nextInQueue.length === 0 && (
          <div className="text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center">
            No one waiting right now.
          </div>
        )}
        {nextInQueue.map((a) => (
          <QueueRow key={a.id} appt={a} onAction={markDone} actionLabel="Start" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Full "Appointments" tab — every entry in the shared queue, Complete button
// for anything still waiting.
// ---------------------------------------------------------------------------
function AppointmentsList({ queue, markDone }) {
  return (
    <div>
      <h2 className="font-bold text-lg mb-4">All Appointments</h2>
      <div className="flex flex-col gap-3">
        {queue.length === 0 && (
          <div className="text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center">
            No appointments in the queue.
          </div>
        )}
        {queue.map((a) => (
          <QueueRow key={a.id} appt={a} onAction={markDone} actionLabel="Complete" />
        ))}
      </div>
    </div>
  );
}

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "appointments", label: "Appts", icon: ClipboardList },
  { key: "patients", label: "Patients", icon: Users },
];

// ---------------------------------------------------------------------------
// DoctorApp — the "appointments" case (and "dashboard") is Person 3's scope.
// "patients" is left as a stub placeholder pointing at Person 4's territory —
// not implemented here on purpose.
// ---------------------------------------------------------------------------
export default function DoctorApp() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");

  // Load the shared queue once on mount.
  useEffect(() => {
    loadQueue().then((q) => {
      setQueue(q);
      setLoading(false);
    });
  }, []);

  // Read-modify-write: never patch a single remote field, always resave the
  // whole array.
  function markDone(id) {
    const updated = queue.map((a) =>
      a.id === id ? { ...a, status: "done" } : a
    );
    setQueue(updated);
    saveQueue(updated);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-3xl w-full mx-auto p-6 pb-24">
        {loading ? (
          <div className="text-gray-400 text-sm p-10 text-center">
            Loading queue…
          </div>
        ) : tab === "dashboard" ? (
          <DoctorDashboard queue={queue} markDone={markDone} />
        ) : tab === "appointments" ? (
          <AppointmentsList queue={queue} markDone={markDone} />
        ) : (
          <div className="text-gray-400 text-sm p-10 text-center">
            Patients / Beds / Directory are out of scope here (Person 4's pages).
          </div>
        )}
      </div>

      <nav className="border-t-2 border-black bg-white sticky bottom-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2 font-bold text-pink-500">
            <Heart size={18} fill="currentColor" /> CareBridge
          </div>
          <div className="flex gap-2">
            {NAV.map((n) => (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
                className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border-2 transition-colors ${
                  tab === n.key
                    ? "border-pink-500 text-pink-500 bg-pink-50"
                    : "border-transparent text-gray-500"
                }`}
              >
                <n.icon size={15} /> {n.label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 text-sm font-semibold border-2 border-black rounded-full px-4 py-1.5">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </nav>
    </div>
  );
}

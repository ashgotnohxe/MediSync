import { useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import Home from "./Home";
import Auth from "./Auth";
import Navbar from "./Navbar";
import HistoryPage from "./HistoryPage";
import DoctorsPage from "./DoctorsPage";
import AppointmentsPage from "./AppointmentsPage";
import MedicinesPage from "./MedicinesPage";
import EmergencyPage from "./EmergencyPage";
import DoctorApp from "./DoctorApp";
import { useAuth } from "../mock-storage";
import "../App.css";

// ---------- Layout route ----------
// Patient ke saare pages me Navbar + SOS button same rehta hai, beech ka page (Outlet) badalta hai.
function PatientLayout() {
  const { user } = useAuth(); // Context API se login user
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // page badalne par upar scroll
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  // protected route: login nahi hai to /auth, doctor hai to /doctor
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role === "doctor") return <Navigate to="/doctor" replace />;

  return (
    <div className="app-container">
      <Navbar />

      <main className="app-main-content">
        <Outlet />
      </main>

      {/* Quick Emergency Floating Action Button */}
      {pathname !== "/emergency" && (
        <button
          className="floating-sos-btn"
          onClick={() => navigate("/emergency")}
          title="Quick Emergency & Ambulance SOS"
        >
          🆘 SOS
        </button>
      )}
    </div>
  );
}

// Login ho chuka hai to Home / Auth dikhane ki zarurat nahi
function PublicOnly({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === "doctor" ? "/doctor" : "/history"} replace />;
  return children;
}

function HomeRoute() {
  const navigate = useNavigate();
  return <Home onGetStarted={() => navigate("/auth")} />;
}

// Doctor / Staff portal
function DoctorRoute() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== "doctor") return <Navigate to="/history" replace />;

  return (
    <DoctorApp
      doctorName={user.username}
      onLogout={() => {
        logout();
        navigate("/");
      }}
    />
  );
}

// Jin pages ko abhi bhi `username` prop chahiye, unke chhote wrappers
function AppointmentsRoute() {
  const { user } = useAuth();
  return <AppointmentsPage username={user.username} />;
}

function MedicinesRoute() {
  const { user } = useAuth();
  return <MedicinesPage username={user.username} />;
}

function EmergencyRoute() {
  const { user } = useAuth();
  return <EmergencyPage username={user.username} />;
}

export default function App() {
  return (
    <Routes>
      {/* public pages */}
      <Route path="/" element={<PublicOnly><HomeRoute /></PublicOnly>} />
      <Route path="/auth" element={<PublicOnly><Auth /></PublicOnly>} />

      {/* doctor portal */}
      <Route path="/doctor" element={<DoctorRoute />} />

      {/* patient pages (Layout ke andar) */}
      <Route element={<PatientLayout />}>
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/appointments" element={<AppointmentsRoute />} />
        <Route path="/medicines" element={<MedicinesRoute />} />
        <Route path="/emergency" element={<EmergencyRoute />} />
      </Route>

      {/* galat URL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectTheme } from "../redux/slices/themeSlice";
import Home from "./Home";
import Auth from "./Auth";
import Navbar from "./Navbar";
import HistoryPage from "./HistoryPage";
import DoctorsPage from "./DoctorsPage";
import DoctorDetailsPage from "./DoctorDetailsPage";
import AppointmentsPage from "./AppointmentsPage";
import MedicinesPage from "./MedicinesPage";
import EmergencyPage from "./EmergencyPage";
import DoctorApp from "./DoctorApp";
import NotFoundPage from "./NotFoundPage";
import "../App.css";

// ==========================================================
// VIVA TOPIC: Combined Application State Architecture
// 1. Redux Toolkit (themeSlice): Central theme state ('light' | 'dark')
// 2. DOM Sync (useEffect): Sets [data-theme] attribute on <html> element
//    allowing instant CSS variables switching across all pages
// 3. User Session: Persisted in localStorage ('cb_session', 'cb_role')
// ==========================================================

export default function App() {
  const [username, setUsername] = useState(() => localStorage.getItem("cb_session"));
  const [role, setRole] = useState(() => localStorage.getItem("cb_role") || "patient");

  const navigate = useNavigate();
  const location = useLocation();

  // Redux: Global Theme state subscription
  const theme = useSelector(selectTheme);

  // Sync theme mode to DOM document element and body
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.className = theme === "dark" ? "dark-theme" : "light-theme";
  }, [theme]);

  // Determine active tab name from current URL path
  const currentPath = location.pathname;
  let activePage = "Home";
  if (currentPath === "/history" || currentPath === "/dashboard") activePage = "History";
  else if (currentPath.startsWith("/doctors")) activePage = "Doctors";
  else if (currentPath.startsWith("/appointments")) activePage = "Appointments";
  else if (currentPath.startsWith("/medicines")) activePage = "Medicines";
  else if (currentPath === "/emergency") activePage = "Emergency";

  // Keep state synced with stored session on initial mount
  useEffect(() => {
    const savedUser = localStorage.getItem("cb_session");
    const savedRole = localStorage.getItem("cb_role") || "patient";
    if (savedUser) {
      setUsername(savedUser);
      setRole(savedRole);
    }
  }, []);

  function handleLogin(uname, userRole) {
    setUsername(uname);
    const assignedRole = userRole || "patient";
    setRole(assignedRole);
    localStorage.setItem("cb_session", uname);
    localStorage.setItem("cb_role", assignedRole);

    if (assignedRole === "doctor") {
      navigate("/doctor-portal");
    } else {
      navigate("/history");
    }
  }

  function handleLogout() {
    localStorage.removeItem("cb_session");
    localStorage.removeItem("cb_role");
    setUsername(null);
    setRole("patient");
    navigate("/");
  }

  function handleNavigate(pageName) {
    // If not logged in and trying to go to any page other than Emergency or Home, redirect to Auth/Login
    if (!username && pageName !== "Emergency" && pageName !== "Home") {
      navigate("/auth");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const routeMap = {
      History: "/history",
      Doctors: "/doctors",
      Appointments: "/appointments",
      Medicines: "/medicines",
      Emergency: "/emergency",
      Home: "/",
      Auth: "/auth"
    };
    navigate(routeMap[pageName] || "/history");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // 1. Doctor / Staff Portal View
  if (username && role === "doctor" && location.pathname === "/doctor-portal") {
    return <DoctorApp doctorName={username} onLogout={handleLogout} />;
  }

  // 2. Patient Portal or Public Navigation
  return (
    <div className={`app-container ${theme === "dark" ? "dark-theme theme-dark" : "light-theme theme-light"}`} data-theme={theme}>
      {/* Show Navbar when logged in OR visiting portal/emergency pages (except public home and auth) */}
      {(username || location.pathname !== "/") && location.pathname !== "/auth" && (
        <Navbar
          username={username}
          role={role}
          activePage={activePage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}

      <main className="app-main-content">
        <Routes>
          {/* Public Home Page */}
          <Route path="/" element={<Home onGetStarted={() => navigate(username ? "/history" : "/auth")} />} />

          {/* Auth / Login Page */}
          <Route path="/auth" element={<Auth onLogin={handleLogin} onBack={() => navigate("/")} />} />

          {/* Emergency & Hospital Beds: Publicly accessible via SOS without login */}
          <Route path="/emergency" element={<EmergencyPage username={username || "guest"} />} />

          {/* Protected Routes: Require Login, else redirect to /auth */}
          <Route
            path="/dashboard"
            element={username ? <HistoryPage username={username} /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/history"
            element={username ? <HistoryPage username={username} /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/doctors"
            element={username ? <DoctorsPage username={username} /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/doctors/:id"
            element={username ? <DoctorDetailsPage /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/appointments"
            element={username ? <AppointmentsPage username={username} /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/medicines"
            element={username ? <MedicinesPage username={username} /> : <Navigate to="/auth" replace />}
          />

          {/* Doctor Portal */}
          <Route
            path="/doctor-portal"
            element={
              username && role === "doctor" ? (
                <DoctorApp doctorName={username} onLogout={handleLogout} />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          {/* 404 Not Found Catch-All Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Floating Emergency SOS Action Button */}
      {location.pathname !== "/emergency" && location.pathname !== "/auth" && (
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

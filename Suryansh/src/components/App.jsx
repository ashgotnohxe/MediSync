import { useState, useEffect } from "react";
import Home from "./Home";
import Auth from "./Auth";
import Navbar from "./Navbar";
import HistoryPage from "./HistoryPage";
import DoctorsPage from "./DoctorsPage";
import AppointmentsPage from "./AppointmentsPage";
import MedicinesPage from "./MedicinesPage";
import EmergencyPage from "./EmergencyPage";
import DoctorApp from "./DoctorApp";
import "../App.css";

export default function App() {
  const [username, setUsername] = useState(() => localStorage.getItem("cb_session"));
  const [role, setRole] = useState(() => localStorage.getItem("cb_role") || "patient");
  const [page, setPage] = useState("Home");

  // Keep state synced with stored session
  useEffect(() => {
    const savedUser = localStorage.getItem("cb_session");
    const savedRole = localStorage.getItem("cb_role") || "patient";
    if (savedUser) {
      setUsername(savedUser);
      setRole(savedRole);
      if (savedRole === "doctor") {
        setPage("DoctorPortal");
      } else {
        setPage("History");
      }
    } else {
      setPage("Home");
    }
  }, []);

  function handleLogin(uname, userRole) {
    setUsername(uname);
    setRole(userRole || "patient");
    localStorage.setItem("cb_session", uname);
    localStorage.setItem("cb_role", userRole || "patient");

    if (userRole === "doctor") {
      setPage("DoctorPortal");
    } else {
      setPage("History");
    }
  }

  function handleLogout() {
    localStorage.removeItem("cb_session");
    localStorage.removeItem("cb_role");
    setUsername(null);
    setRole("patient");
    setPage("Home");
  }

  function handleNavigate(pageName) {
    setPage(pageName);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // 1. Doctor / Staff Portal
  if (username && role === "doctor") {
    return <DoctorApp doctorName={username} onLogout={handleLogout} />;
  }

  // 2. Patient Logged-In Pages
  if (username && role === "patient") {
    return (
      <div className="app-container">
        <Navbar
          username={username}
          role={role}
          activePage={page}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />

        <main className="app-main-content">
          {page === "History" && <HistoryPage username={username} />}
          {page === "Doctors" && <DoctorsPage username={username} />}
          {page === "Appointments" && <AppointmentsPage username={username} />}
          {page === "Medicines" && <MedicinesPage username={username} />}
          {page === "Emergency" && <EmergencyPage username={username} />}
        </main>

        {/* Quick Emergency Floating Action Button */}
        {page !== "Emergency" && (
          <button
            className="floating-sos-btn"
            onClick={() => handleNavigate("Emergency")}
            title="Quick Emergency & Ambulance SOS"
          >
            🆘 SOS
          </button>
        )}
      </div>
    );
  }

  // 3. Auth Page
  if (page === "Auth") {
    return <Auth onLogin={handleLogin} onBack={() => setPage("Home")} />;
  }

  // 4. Public Home Page
  return <Home onGetStarted={() => setPage("Auth")} />;
}

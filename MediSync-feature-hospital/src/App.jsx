import { useState } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import AppNavbar from "./AppNavbar.jsx";
import AppointmentsPage from "./AppointmentsPage.jsx";
import MedicinesPage from "./MedicinesPage.jsx";
import HistoryPage from "./HistoryPage.jsx";
import EmergencyPage from "./EmergencyPage.jsx";
import HospitalBedDetails from "./HospitalBedDetails.jsx";
import NotFoundPage from "./NotFoundPage.jsx";

// ==========================================================
// VIVA TOPIC: React Router Configuration
// 1. BrowserRouter wraps the App in main.jsx
// 2. Routes & Route map paths to components:
//    - /history -> HistoryPage (Medical History)
//    - /appointments -> AppointmentsPage (OPD Booking)
//    - /medicines -> MedicinesPage (Pharmacy & Orders)
//    - /emergency -> EmergencyPage (Beds & Hotline)
//    - /emergency/:id -> HospitalBedDetails (Dynamic Route with useParams)
//    - * -> NotFoundPage (404 Fallback)
// 3. useNavigate & useLocation for smooth client-side routing
// ==========================================================

export default function App() {
  const [username] = useState("neha");
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active page label based on current route
  let activePage = "History";
  if (location.pathname.startsWith("/appointments")) activePage = "Appointments";
  else if (location.pathname.startsWith("/medicines")) activePage = "Medicines";
  else if (location.pathname.startsWith("/emergency")) activePage = "Emergency";
  else if (location.pathname === "/history" || location.pathname === "/") activePage = "History";

  function handleNavigate(pageName) {
    const pathMap = {
      History: "/history",
      Appointments: "/appointments",
      Medicines: "/medicines",
      Emergency: "/emergency",
    };
    navigate(pathMap[pageName] || "/history");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <AppNavbar
        activePage={activePage}
        onNavigate={handleNavigate}
        subtitle={activePage}
      />

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/history" replace />} />
          <Route path="/history" element={<HistoryPage username={username} />} />
          <Route path="/appointments" element={<AppointmentsPage username={username} />} />
          <Route path="/medicines" element={<MedicinesPage username={username} />} />
          <Route path="/emergency" element={<EmergencyPage username={username} />} />

          {/* Dynamic route demonstrating useParams (:id) */}
          <Route path="/emergency/:id" element={<HospitalBedDetails />} />

          {/* 404 Not Found Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
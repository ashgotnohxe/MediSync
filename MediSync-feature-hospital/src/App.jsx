import { useState, useEffect } from "react";

import AppNavbar from "./AppNavbar.jsx";
import AppointmentsPage from "./AppointmentsPage.jsx";
import MedicinesPage from "./MedicinesPage.jsx";
import HistoryPage from "./HistoryPage.jsx";
import EmergencyPage from "./EmergencyPage.jsx";

// URL path se page nikaalne ka helper
function getPageFromPath(path) {
  const map = {
    "/history": "History",
    "/appointments": "Appointments",
    "/medicines": "Medicines",
    "/emergency": "Emergency",
    "/doctors": "Doctors",
  };
  return map[path] || "History"; // default = History (patient page)
}

export default function App() {
  const [page, setPage] = useState(() => getPageFromPath(window.location.pathname));
  const [username] = useState("neha");
  const [displayName] = useState("");

  // browser ke back/forward button ke liye
  useEffect(() => {
    const onPopState = () => setPage(getPageFromPath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // agar root pe koi aaye to seedha /history pe le jao
  useEffect(() => {
    if (window.location.pathname === "/") {
      window.history.replaceState({}, "", "/history");
    }
  }, []);

  function navigate(pageName) {
    const pathMap = {
      History: "/history",
      Appointments: "/appointments",
      Medicines: "/medicines",
      Emergency: "/emergency",
      Doctors: "/doctors",
    };
    const path = pathMap[pageName] || "/history";
    window.history.pushState({}, "", path); // URL change karo
    setPage(pageName); // component render karo
  }

  return (
    <div>
      <AppNavbar
        username={displayName}
        activePage={page}
        onNavigate={navigate}
        subtitle={page}
      />

      {page === "History" && (
        <HistoryPage username={username} displayName={displayName} />
      )}
      {page === "Appointments" && <AppointmentsPage username={username} />}
      {page === "Medicines" && <MedicinesPage username={username} />}
      {page === "Emergency" && <EmergencyPage username={username} />}
      {page === "Doctors" && (
        <div style={{ padding: 24 }}>Doctors page (Person 1 ka scope)</div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import AppNavbar from "./AppNavbar.jsx";
import AppointmentsPage from "./AppointmentsPage.jsx";
import MedicinesPage from "./MedicinesPage.jsx";
import HistoryPage from "./HistoryPage.jsx";
import EmergencyPage from "./EmergencyPage.jsx";
import DoctorsPage from "./DoctorsPage.jsx";

function getPageFromPath(path) {
  const map = {
    "/history": "History",
    "/appointments": "Appointments",
    "/medicines": "Medicines",
    "/emergency": "Emergency",
    "/doctors": "Doctors",
  };
  return map[path] || "History";
}

export default function Dashboard({ username }) {
  const [page, setPage] = useState(() => getPageFromPath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setPage(getPageFromPath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

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
    window.history.pushState({}, "", path);
    setPage(pageName);
  }

  return (
    <div>
      <AppNavbar
        username={username}
        activePage={page}
        onNavigate={navigate}
        subtitle={page}
      />
      {page === "History" && <HistoryPage username={username} displayName={username} />}
      {page === "Appointments" && <AppointmentsPage username={username} />}
      {page === "Doctors" && <DoctorsPage username={username} />}
      {page === "Medicines" && <MedicinesPage username={username} />}
      {page === "Emergency" && <EmergencyPage username={username} />}
    </div>
  );
}
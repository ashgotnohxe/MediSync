import { useState } from "react";

import AppNavbar from "./AppNavbar.jsx";
import AppointmentsPage from "./AppointmentsPage.jsx";
import MedicinesPage from "./MedicinesPage.jsx";
import HistoryPage from "./HistoryPage.jsx";
import EmergencyPage from "./EmergencyPage.jsx";


export default function App() {
  const [page, setPage] = useState("Home"); 
  const [username] = useState("neha"); 
  const [displayName] = useState(""); 

  function goToApp() {
    setPage("History"); 
  }

  if (page === "Home") {
    return <HomePage onGetStarted={goToApp} />;
  }

  return (
    <div>
      <AppNavbar
        username={displayName}
        activePage={page}
        onNavigate={setPage}
        subtitle={page === "History" ? "My Health History" : page}
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
import { Outlet } from "react-router-dom";
import DoctorNavbar from "./DoctorNavbar";

// Layout: Common frame with persistent navigation and an <Outlet /> for child route components
function Layout({ doctorName, onLogout }) {
  return (
    <div className="doc-portal-layout">
      {/* Top persistent navigation */}
      <DoctorNavbar doctorName={doctorName} onLogout={onLogout} />

      {/* Renders the matched child route component (Beds, Patients, Register, 404, etc.) */}
      <main className="doc-portal-main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

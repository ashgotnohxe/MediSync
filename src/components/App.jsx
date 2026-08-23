import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import DoctorPatientsPage from './DoctorPatientsPage';
import DoctorBedsPage from './DoctorBedsPage';
import DoctorDirectoryPage from './DoctorDirectoryPage';
import '../index.css';

const PlaceholderPage = ({ title }) => (
  <div className="page-container">
    <div className="header-card">
      <p>Welcome back,</p>
      <h1>Dr. Ananya Rao</h1>
    </div>
    <h2>{title}</h2>
    <div className="empty-state">
      <p>This page is implemented by another team member.</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        
        {/* Floating SOS button */}
        <div className="sos-btn">SOS</div>

        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/patients" replace />} />
            <Route path="/dashboard" element={<PlaceholderPage title="Doctor Dashboard" />} />
            <Route path="/appointments" element={<PlaceholderPage title="Appointments Queue" />} />
            <Route path="/patients" element={<DoctorPatientsPage />} />
            <Route path="/beds" element={<DoctorBedsPage />} />
            <Route path="/directory" element={<DoctorDirectoryPage />} />
          </Routes>
        </main>

        {/* Bottom Navbar matching the screenshot */}
        <nav className="navbar">
          <div className="logo">
            <span className="logo-main">CareBridge</span>
            <span className="logo-sub">My Health History</span>
          </div>
          
          <div className="nav-links">
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span className="nav-icon">📋</span> Dashboard
            </NavLink>
            <NavLink to="/appointments" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span className="nav-icon">📅</span> Appts
            </NavLink>
            <NavLink to="/patients" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span className="nav-icon">👥</span> Patients
            </NavLink>
            <NavLink to="/beds" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span className="nav-icon">🛏️</span> Beds
            </NavLink>
            <NavLink to="/directory" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span className="nav-icon">🩺</span> Directory
            </NavLink>
          </div>
          
          <div className="nav-right">
            <span className="logo-sub">My Health History</span>
            <button className="logout-btn">
              <span>↪</span> Logout
            </button>
          </div>
        </nav>
      </div>
    </BrowserRouter>
  );
}

export default App;

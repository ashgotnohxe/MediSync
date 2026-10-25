import { useState } from "react";
import { loadData, saveData } from "../mock-storage";

export default function Auth({ onLogin, onBack }) {
  const [mode, setMode] = useState("signup"); // signup or login
  const [role, setRole] = useState("patient"); // patient or doctor
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [error, setError] = useState("");



  async function handleSubmit() {
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill username and password");
      return;
    }

    let users = {};
    const savedUsers = localStorage.getItem("cb_users");
    if (savedUsers !== null) {
      try {
        users = JSON.parse(savedUsers);
      } catch (e) {
        users = {};
      }
    }

    if (mode === "signup") {
      if (users[username]) {
        setError("Username already exists. Please login.");
        setMode("login");
        return;
      }

      users[username] = {
        password: password,
        role: role,
        phone: phone || "+91 9876543210",
        age: age || "28",
        bloodGroup: bloodGroup
      };
      localStorage.setItem("cb_users", JSON.stringify(users));
      localStorage.setItem("cb_session", username);
      localStorage.setItem("cb_role", role);

      // If registered as patient, push to shared patients_registry for DoctorPatientsPage
      if (role === "patient") {
        const currentPatients = await loadData("patients_registry", true, []);
        const exists = currentPatients.some((p) => p.name.toLowerCase() === username.toLowerCase());
        if (!exists) {
          const newPatient = {
            id: "p_" + Date.now(),
            name: username,
            phone: phone || "+91 9876543210",
            age: age || "28",
            bloodGroup: bloodGroup
          };
          const updated = [newPatient, ...currentPatients];
          await saveData("patients_registry", updated, true);
        }
      }

      onLogin(username, role);
    } else {
      const account = users[username];
      if (!account) {
        // Quick fallback for demo accounts
        if (username.toLowerCase().includes("doc") || role === "doctor") {
          localStorage.setItem("cb_session", username);
          localStorage.setItem("cb_role", "doctor");
          onLogin(username, "doctor");
          return;
        }
        setError("No account found. Please sign up.");
        setMode("signup");
        return;
      }
      if (account.password !== password) {
        setError("Wrong password");
        return;
      }
      localStorage.setItem("cb_session", username);
      localStorage.setItem("cb_role", account.role || role);
      onLogin(username, account.role || role);
    }
  }

  return (
    <div className="auth-page">
      <div className="home-nav">
        <div className="home-logo" onClick={onBack} style={{ cursor: "pointer" }}>
          <div className="home-logo-icon">+</div>
          <span className="home-logo-text">MediSync</span>
        </div>
        <button className="auth-back-btn" onClick={onBack}>
          ← Back to Home
        </button>
      </div>

      <div className="auth-wrap">
        <div className="auth-box">
          <h2 className="auth-title">Welcome to MediSync</h2>
          <p className="auth-subtitle">Healthcare & Hospital Management Portal</p>

          <div className="auth-tabs">
            <button
              className={mode === "signup" ? "auth-tab auth-tab-active" : "auth-tab"}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
            <button
              className={mode === "login" ? "auth-tab auth-tab-active" : "auth-tab"}
              onClick={() => setMode("login")}
            >
              Login
            </button>
          </div>

          <div className="auth-role-row">
            <button
              className={role === "patient" ? "auth-role-btn auth-role-btn-active" : "auth-role-btn"}
              onClick={() => setRole("patient")}
            >
              👤 Patient
            </button>
            <button
              className={role === "doctor" ? "auth-role-btn auth-role-btn-active" : "auth-role-btn"}
              onClick={() => setRole("doctor")}
            >
              🩺 Doctor / Staff
            </button>
          </div>

          <label className="auth-label">Username / Name</label>
          <input
            className="auth-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. Rahul Verma"
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />

          {mode === "signup" && role === "patient" && (
            <>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label className="auth-label">Age</label>
                  <input
                    className="auth-input"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="28"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="auth-label">Blood Group</label>
                  <select
                    className="auth-input"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
              <label className="auth-label">Phone Number</label>
              <input
                className="auth-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
              />
            </>
          )}

          {error !== "" && <p className="appt-error">{error}</p>}

          <button className="auth-submit-btn" onClick={handleSubmit}>
            {mode === "signup" ? `Create ${role === "doctor" ? "Doctor" : "Patient"} Account` : "Login to Portal"}
          </button>
        </div>
      </div>
    </div>
  );
}

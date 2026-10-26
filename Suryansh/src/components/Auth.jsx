import { useState } from "react";
import { loadData, saveData } from "../mock-storage";

// Reusable input component
function FormInput({ label, error, ...props }) {
  return (
    <div>
      <label className="auth-label">{label}</label>
      <input className="auth-input" {...props} />
      {error && <p className="appt-error">{error}</p>}
    </div>
  );
}

export default function Auth({ onLogin, onBack }) {
  const [mode, setMode] = useState("signup");
  const [role, setRole] = useState("patient");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};

    if (!username.trim()) e.username = "Username is required";
    else if (mode === "signup" && username.trim().length < 3)
      e.username = "Username must be at least 3 characters";

    if (!password.trim()) e.password = "Password is required";
    else if (mode === "signup" && password.length < 6)
      e.password = "Password must be at least 6 characters";

    if (mode === "signup" && role === "patient") {
      if (age && (Number(age) < 1 || Number(age) > 120))
        e.age = "Age must be between 1 and 120";
      if (phone && !/^(\+91\s?)?[6-9]\d{9}$/.test(phone.trim()))
        e.phone = "Enter a valid 10 digit Indian number";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setError("");
    if (!validate()) return;

    setLoading(true);

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
        setLoading(false);
        return;
      }

      users[username] = {
        password: password,
        role: role,
        phone: phone || "+91 9876543210",
        age: age || "28",
        bloodGroup: bloodGroup,
      };
      localStorage.setItem("cb_users", JSON.stringify(users));
      localStorage.setItem("cb_session", username);
      localStorage.setItem("cb_role", role);

      if (role === "patient") {
        const currentPatients = await loadData("patients_registry", true, []);
        const exists = currentPatients.some((p) => p.name.toLowerCase() === username.toLowerCase());
        if (!exists) {
          const newPatient = {
            id: "p_" + Date.now(),
            name: username,
            phone: phone || "+91 9876543210",
            age: age || "28",
            bloodGroup: bloodGroup,
          };
          const updated = [newPatient, ...currentPatients];
          await saveData("patients_registry", updated, true);
        }
      }

      setLoading(false);
      onLogin(username, role);
    } else {
      const account = users[username];
      if (!account) {
        if (username.toLowerCase().includes("doc") || role === "doctor") {
          localStorage.setItem("cb_session", username);
          localStorage.setItem("cb_role", "doctor");
          setLoading(false);
          onLogin(username, "doctor");
          return;
        }
        setError("No account found. Please sign up.");
        setMode("signup");
        setLoading(false);
        return;
      }
      if (account.password !== password) {
        setError("Wrong password");
        setLoading(false);
        return;
      }
      localStorage.setItem("cb_session", username);
      localStorage.setItem("cb_role", account.role || role);
      setLoading(false);
      onLogin(username, account.role || role);
    }
  }

  function switchMode(newMode) {
    setMode(newMode);
    setErrors({});
    setError("");
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
              onClick={() => switchMode("signup")}
            >
              Sign Up
            </button>
            <button
              className={mode === "login" ? "auth-tab auth-tab-active" : "auth-tab"}
              onClick={() => switchMode("login")}
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

          <FormInput
            label="Username / Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. Rahul Verma"
            error={errors.username}
          />

          <FormInput
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            error={errors.password}
          />
          <label style={{ fontSize: "13px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />{" "}
            Show password
          </label>

          {mode === "signup" && role === "patient" && (
            <>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <FormInput
                    label="Age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="28"
                    error={errors.age}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="auth-label">Blood Group</label>
                  <select
                    className="auth-input"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                  >
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <FormInput
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                error={errors.phone}
              />
            </>
          )}

          {error !== "" && <p className="appt-error">{error}</p>}

          <button className="auth-submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "signup"
              ? `Create ${role === "doctor" ? "Doctor" : "Patient"} Account`
              : "Login to Portal"}
          </button>
        </div>
      </div>
    </div>
  );
}

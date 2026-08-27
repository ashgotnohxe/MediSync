import { useState } from "react";
import "./App.css";

export default function Auth({ onLogin, onBack }) {
  const [mode, setMode] = useState("signup"); // signup or login
  const [role, setRole] = useState("patient"); // patient or doctor
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    setError("");

    if (username === "" || password === "") {
      setError("Please fill username and password");
      return;
    }

    let users = {};
    const savedUsers = localStorage.getItem("cb_users");
    if (savedUsers !== null) {
      users = JSON.parse(savedUsers);
    }

    if (mode === "signup") {
      if (users[username]) {
        setError("Username already exists. Please login.");
        setMode("login");
        return;
      }
      users[username] = { password: password, role: role };
      localStorage.setItem("cb_users", JSON.stringify(users));
      localStorage.setItem("cb_session", username);
      onLogin(username, role);
    } else {
      const account = users[username];
      if (!account) {
        setError("No account found. Please sign up.");
        setMode("signup");
        return;
      }
      if (account.password !== password) {
        setError("Wrong password");
        return;
      }
      localStorage.setItem("cb_session", username);
      onLogin(username, account.role);
    }
  }

  return (
    <div className="auth-page">
      <div className="home-nav">
        <div className="home-logo">
          <div className="home-logo-icon">+</div>
          <span className="home-logo-text">MediSync</span>
        </div>
      </div>

      <div className="auth-wrap">
        <div className="auth-box">
          <h2 className="auth-title">Welcome to MediSync</h2>
          <p className="auth-subtitle">Healthcare from home</p>

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
              Patient
            </button>
            <button
              className={role === "doctor" ? "auth-role-btn auth-role-btn-active" : "auth-role-btn"}
              onClick={() => setRole("doctor")}
            >
              Doctor / Staff
            </button>
          </div>

          <label className="auth-label">Username</label>
          <input
            className="auth-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />

          {error !== "" && <p className="appt-error">{error}</p>}

          <button className="auth-submit-btn" onClick={handleSubmit}>
            {mode === "signup" ? "Create Account" : "Login"}
          </button>

          <button className="auth-back-btn" onClick={onBack}>
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
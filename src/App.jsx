import { useState, useEffect } from "react";
import Home from "./Home.jsx";
import Auth from "./Auth.jsx";
import Dashboard from "./Dashboard.jsx"; // this is your friend's old App.jsx, renamed

export default function App() {
  const [username, setUsername] = useState(null);
  const [view, setView] = useState("home"); // home or auth

  // check if someone is already logged in
  useEffect(() => {
    const savedSession = localStorage.getItem("cb_session");
    if (savedSession !== null) {
      setUsername(savedSession);
    }
  }, []);

  function handleLogin(uname) {
    setUsername(uname);
  }

  // once logged in, show the full app (History/Appointments/Doctors/Medicines/Emergency)
  if (username !== null) {
    return <Dashboard username={username} />;
  }

  if (view === "home") {
    return <Home onGetStarted={() => setView("auth")} />;
  }

  return <Auth onLogin={handleLogin} onBack={() => setView("home")} />;
}
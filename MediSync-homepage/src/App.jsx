import { useState, useEffect } from "react";
import Home from "./Home.jsx";
import Auth from "./Auth.jsx";
import HistoryPage from "./HistoryPage.jsx";
import DoctorsPage from "./DoctorsPage.jsx";
import NavBar from "./NavBar.jsx";
import "./App.css";


// only these pages exist in this standalone bundle
const DASHBOARD_PAGES = ["History", "Doctors"];

function getPageFromPath(path) {
  const map = {
    "/": "Home",
    "/auth": "Auth",
    "/history": "History",
    "/doctors": "Doctors",
  };
  return map[path] || "Home";
}

function getPathFromPage(pageName) {
  const map = {
    Home: "/",
    Auth: "/auth",
    History: "/history",
    Doctors: "/doctors",
  };
  return map[pageName] || "/";
}

export default function App() {
  const [username, setUsername] = useState(() => localStorage.getItem("cb_session"));
  const [page, setPage] = useState(() => getPageFromPath(window.location.pathname));

  // browser back / forward buttons
  useEffect(() => {
    function onPopState() {
      setPage(getPageFromPath(window.location.pathname));
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // route guarding
  useEffect(() => {
    if (username !== null && (page === "Home" || page === "Auth")) {
      navigate("History");
    }
    if (username === null && DASHBOARD_PAGES.includes(page)) {
      navigate("Auth");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, page]);

  function navigate(pageName) {
    const path = getPathFromPage(pageName);
    window.history.pushState({}, "", path);
    setPage(pageName);
  }

  function handleLogin(uname) {
    setUsername(uname);
    navigate("History");
  }

  function handleLogout() {
    localStorage.removeItem("cb_session");
    setUsername(null);
    navigate("Home");
  }

  if (username !== null && DASHBOARD_PAGES.includes(page)) {
    return (
      <div>
        <NavBar username={username} activePage={page} onNavigate={navigate} onLogout={handleLogout} />
        {page === "History" && <HistoryPage username={username} />}
        {page === "Doctors" && <DoctorsPage username={username} />}
      </div>
    );
  }

  if (page === "Auth") {
    return <Auth onLogin={handleLogin} onBack={() => navigate("Home")} />;
  }

  return <Home onGetStarted={() => navigate("Auth")} />;
}

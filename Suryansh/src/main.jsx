import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";
import App from "./components/App.jsx";

// ==========================================================
// VIVA TOPIC: App Root Configuration
// - BrowserRouter: Provides client-side routing context for all pages
// - ThemeProvider: Provides global Context API state (ThemeContext)
// ==========================================================

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);

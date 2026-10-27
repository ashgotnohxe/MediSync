import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import { UserProvider } from "./context/UserContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./index.css";
import App from "./components/App.jsx";

// ==========================================================
// VIVA TOPIC: Application Root Architecture & Hierarchy
// 1. Provider (Redux Toolkit):
//    Supplies global shared state (themeSlice, preferencesSlice)
// 2. BrowserRouter (React Router):
//    Provides client-side routing context for all app routes
// 3. UserProvider (React Context API):
//    Provides scoped patient/user session data (UserContext)
// 4. ThemeProvider (Context API Bridge):
//    Supplies theme context to components consuming useTheme()
// ==========================================================

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <UserProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </UserProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);

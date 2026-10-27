import { createContext, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectTheme, toggleTheme, setTheme } from "../redux/slices/themeSlice";

// ==========================================================
// VIVA TOPIC: Context API & Redux Toolkit Bridge
// - Single Source of Truth: Theme state lives in Redux (themeSlice)
// - ThemeProvider bridges Redux state into React Context
// - Preserves existing useTheme() custom hook API for backward compatibility
// - Avoids state duplication: ThemeContext reads directly from Redux!
// ==========================================================

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();

  const handleToggle = () => dispatch(toggleTheme());
  const handleSetTheme = (mode) => dispatch(setTheme(mode));

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme: handleToggle,
        setTheme: handleSetTheme,
        isDark: theme === "dark",
      }}
    >
      <div className={`theme-wrapper ${theme === "dark" ? "theme-dark dark-theme" : "theme-light light-theme"}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

// Custom hook to consume theme with missing provider check
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider wrapped inside Redux Provider.");
  }
  return context;
}

export default ThemeContext;

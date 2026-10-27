import { createContext, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectTheme,
  toggleTheme,
  setTheme,
} from "../redux/slices/themeSlice";

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
      <div
        className={`theme-wrapper ${
          theme === "dark"
            ? "theme-dark dark-theme"
            : "theme-light light-theme"
        }`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used within a ThemeProvider wrapped inside Redux Provider."
    );
  }

  return context;
}

export default ThemeContext;
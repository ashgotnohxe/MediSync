import { createSlice } from "@reduxjs/toolkit";

// ==========================================================
// VIVA TOPIC: Redux Toolkit (RTK) - Theme Slice
// - createSlice generates action creators and action types automatically
// - Uses Immer library under the hood: allows direct state mutation syntax
// - Manages global theme state ('light' | 'dark')
// - Automatically syncs user preference to localStorage
// ==========================================================

function getInitialTheme() {
  try {
    const saved = localStorage.getItem("medisync_theme");
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    // Check OS / Browser preference as fallback
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch (err) {
    console.warn("Could not read theme from localStorage:", err);
  }
  return "light";
}

const initialState = {
  mode: getInitialTheme(),
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("medisync_theme", state.mode);
      } catch (err) {
        console.warn("Could not persist theme to localStorage:", err);
      }
    },
    setTheme: (state, action) => {
      const newMode = action.payload === "dark" ? "dark" : "light";
      state.mode = newMode;
      try {
        localStorage.setItem("medisync_theme", newMode);
      } catch (err) {
        console.warn("Could not persist theme to localStorage:", err);
      }
    },
  },
});

// Export action creators for dispatching
export const { toggleTheme, setTheme } = themeSlice.actions;

// Export selectors for useSelector
export const selectTheme = (state) => state.theme.mode;
export const selectIsDarkMode = (state) => state.theme.mode === "dark";

// Export the reducer to configure the store
export default themeSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

// ==========================================================
// VIVA TOPIC: Redux Toolkit (RTK) - Shared Preferences Slice
// - Demonstrates having multiple feature slices combined in one store
// - Handles application-wide user preferences:
//   * compactView: toggle dense layout for doctor lists & beds
//   * notificationsEnabled: toggle toast alerts & reminders
// - Persists preferences to localStorage
// ==========================================================

function getInitialPreferences() {
  try {
    const saved = localStorage.getItem("medisync_preferences");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn("Could not load preferences from localStorage:", err);
  }
  return {
    compactView: false,
    notificationsEnabled: true,
  };
}

const initialState = getInitialPreferences();

export const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    toggleCompactView: (state) => {
      state.compactView = !state.compactView;
      try {
        localStorage.setItem("medisync_preferences", JSON.stringify(state));
      } catch (err) {
        console.warn("Could not save preferences:", err);
      }
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
      try {
        localStorage.setItem("medisync_preferences", JSON.stringify(state));
      } catch (err) {
        console.warn("Could not save preferences:", err);
      }
    },
    setPreferences: (state, action) => {
      Object.assign(state, action.payload);
      try {
        localStorage.setItem("medisync_preferences", JSON.stringify(state));
      } catch (err) {
        console.warn("Could not save preferences:", err);
      }
    },
  },
});

export const { toggleCompactView, toggleNotifications, setPreferences } = preferencesSlice.actions;

export const selectPreferences = (state) => state.preferences;
export const selectCompactView = (state) => state.preferences.compactView;
export const selectNotificationsEnabled = (state) => state.preferences.notificationsEnabled;

export default preferencesSlice.reducer;

import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import preferencesReducer from "./slices/preferencesSlice";

// ==========================================================
// VIVA TOPIC: Redux Toolkit (RTK) - Central Store
// 1. Single Source of Truth: The entire application's shared state
//    is stored in a single object tree within this store.
// 2. configureStore():
//    - Automatically combines reducers into rootReducer
//    - Sets up redux-thunk middleware by default
//    - Enables Redux DevTools Extension for state inspection
//    - Catches accidental state mutations in development
// 3. Separation of Concerns:
//    - Redux handles: Shared application state (Theme, UI preferences)
//    - Context API handles: User/session state (Patient profile, branch)
// ==========================================================

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    preferences: preferencesReducer,
  },
});

export default store;

import { createContext, useContext, useState } from "react";

// ==========================================================
// VIVA TOPIC: React Context API (UserContext)
// Purpose: Manages Patient Identity & Session Information
//
// CONTEXT API vs REDUX ARCHITECTURAL SEPARATION:
// - Context API: Best for low-frequency identity/session data
//   (User profile, authentication state, patient blood group).
//   Lightweight, built directly into React, eliminates prop drilling.
//
// - Redux Toolkit: Best for frequently accessed/updated shared UI state
//   (Theme mode, UI preferences, global filters, modals).
//   Provides time-travel debugging, middleware, and predictable actions.
//
// KEY CONCEPTS:
// 1. createContext: creates the context object
// 2. UserProvider: wraps components and provides state down the tree
// 3. useUser: custom hook that safely consumes context and guards
//    against missing providers with clear descriptive errors.
// ==========================================================

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("medisync_user");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load user from localStorage:", e);
    }
    return {
      name: "Neha Garg",
      role: "Hospital Patient",
      bloodGroup: "O+",
      hospitalBranch: "MediSync Central Hospital"
    };
  });

  // Helper method for clean partial user updates
  const updateUser = (updates) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updates };
      try {
        localStorage.setItem("medisync_user", JSON.stringify(nextUser));
      } catch (e) {
        console.warn("Could not save user to localStorage:", e);
      }
      return nextUser;
    });
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error(
      "useUser must be used within a UserProvider. Ensure that your component tree is wrapped by <UserProvider>."
    );
  }
  return context;
}

export default UserContext;

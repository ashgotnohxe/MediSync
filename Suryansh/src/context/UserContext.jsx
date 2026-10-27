import { createContext, useContext, useState } from "react";

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
      hospitalBranch: "MediSync Central Hospital",
    };
  });

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
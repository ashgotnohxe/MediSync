import { createContext, useContext, useState } from "react";

// ==========================================================
// VIVA TOPIC: React Context API (UserContext)
// Solves 'prop drilling' by sharing user info across components
// 1. createContext: creates the context object
// 2. UserProvider: provides user state to all child components
// 3. useUser: custom hook to consume user context easily
// ==========================================================

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    name: "Neha Garg",
    role: "Hospital Patient",
    bloodGroup: "O+",
    hospitalBranch: "MediSync Central Hospital"
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

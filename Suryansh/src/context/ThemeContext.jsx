import { createContext, useContext, useState } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // useState to manage active theme: 'light' or 'dark'
    const [theme, setTheme] = useState("light");

    function toggleTheme() {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <div className={`theme-wrapper ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

// Simple custom hook to easily read theme & toggle function
export function useTheme() {
    return useContext(ThemeContext);
}

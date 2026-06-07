"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { DESIGN_SYSTEM } from "../config/design-system";

const ThemeContext = createContext({
  theme: "default",
  toggleTheme: () => {},
  activeColors: DESIGN_SYSTEM.themes.default,
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("default");

  // Read theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("portfolio-theme");
    if (savedTheme === "charcoal") {
      setTheme("charcoal");
      document.body.classList.add("theme-charcoal");
    } else {
      setTheme("default");
      document.body.classList.remove("theme-charcoal");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "default") {
      setTheme("charcoal");
      localStorage.setItem("portfolio-theme", "charcoal");
      document.body.classList.add("theme-charcoal");
    } else {
      setTheme("default");
      localStorage.setItem("portfolio-theme", "default");
      document.body.classList.remove("theme-charcoal");
    }
  };

  const activeColors = theme === "charcoal" ? DESIGN_SYSTEM.themes.charcoal : DESIGN_SYSTEM.themes.default;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, activeColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

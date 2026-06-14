"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { flushSync } from "react-dom";
import { DESIGN_SYSTEM } from "../config/design-system";

const ThemeContext = createContext({
  theme: "default",
  toggleTheme: () => {},
  activeColors: DESIGN_SYSTEM.themes.default,
  // Ruler transition API. See startThemeRulerTransition below.
  pendingRulerId: 0,
  isRulerAnimating: false,
  startThemeRulerTransition: () => Promise.resolve(),
  setRulerAnimating: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("default");
  // pendingRulerId: number — incremented each time a transition starts.
  // The overlay watches this to mount; the toggle watches it to lock.
  const [pendingRulerId, setPendingRulerId] = useState(0);
  // Set true while the overlay is animating. The overlay's
  // onAnimationEnd is the single source of truth that clears it.
  const [isRulerAnimating, setIsRulerAnimating] = useState(false);

  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Restore saved theme on mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("portfolio-theme");
      if (saved === "charcoal") {
        const timer = setTimeout(() => {
          setTheme("charcoal");
          document.body.classList.add("theme-charcoal");
        }, 0);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // localStorage may be blocked; non-fatal.
    }
  }, []);

  const applyTheme = useCallback((next) => {
    setTheme(next);
    if (next === "charcoal") {
      document.body.classList.add("theme-charcoal");
    } else {
      document.body.classList.remove("theme-charcoal");
    }
    try {
      localStorage.setItem("portfolio-theme", next);
    } catch (e) {
      // ignore
    }
  }, []);

  // Plain toggle (no animation). Kept as a programmatic fallback.
  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "default" ? "charcoal" : "default";
      applyTheme(next);
      return next;
    });
  }, [applyTheme]);

  // The ruler transition. Uses document.startViewTransition where
  // available (Chrome / Edge / Safari 18+) so the browser handles
  // the theme snapshot + flip. The CSS `::view-transition-new(root)`
  // in app/globals.css clips that flip to a growing triangle from
  // the top-left, which IS the visual theme reveal. The ruler div
  // is a separate decorative element that animates in parallel.
  const startThemeRulerTransition = useCallback(() => {
    const next = themeRef.current === "default" ? "charcoal" : "default";

    // Bump the ruler id so the overlay mounts a fresh element.
    setPendingRulerId((id) => id + 1);
    setIsRulerAnimating(true);

    // Modern path: View Transitions API does the snapshot + flip.
    if (
      typeof document !== "undefined" &&
      typeof document.startViewTransition === "function"
    ) {
      const transition = document.startViewTransition(() => {
        flushSync(() => {
          setTheme(next);
          if (next === "charcoal") {
            document.body.classList.add("theme-charcoal");
          } else {
            document.body.classList.remove("theme-charcoal");
          }
        });
      });

      try {
        localStorage.setItem("portfolio-theme", next);
      } catch (e) {}

      return transition.finished.catch(() => {
        // Some browsers reject the promise on abort; treat as done.
      });
    }

    // Fallback: swap the theme class mid-animation so the visual
    // change coincides with the ruler passing the center.
    const swap = () => applyTheme(next);
    const totalMs = 1000;
    const halfMs = totalMs / 2;
    const handle = window.setTimeout(swap, halfMs);
    return new Promise((resolve) => {
      window.setTimeout(() => {
        window.clearTimeout(handle);
        resolve();
      }, totalMs);
    });
  }, [applyTheme]);

  // Exposed for the overlay's onAnimationEnd to flip the lock off.
  const setRulerAnimating = useCallback((value) => {
    setIsRulerAnimating(value);
  }, []);

  const activeColors =
    theme === "charcoal"
      ? DESIGN_SYSTEM.themes.charcoal
      : DESIGN_SYSTEM.themes.default;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        activeColors,
        pendingRulerId,
        isRulerAnimating,
        startThemeRulerTransition,
        setRulerAnimating,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

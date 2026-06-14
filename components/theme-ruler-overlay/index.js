"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/theme-context";
import styles from "./theme-ruler-overlay.module.css";

// Diagonal Drafting Ruler — theme transition overlay
// --------------------------------------------------------------
// A skeuomorphic wooden ruler that sweeps from the top-left corner
// of the viewport to the bottom-right, exactly along the 45°
// diagonal. As it sweeps, the new theme is "revealed" by the
// ::view-transition-new(root) clip-path animation defined in
// app/globals.css. The ruler is a decorative flourish that visually
// coincides with that reveal — its leading edge is the leading
// edge of the new theme.
//
// Lifecycle (single source of truth: the onAnimationEnd handler):
//   1. Theme toggle calls startThemeRulerTransition() → context
//      increments pendingRulerId, sets isRulerAnimating=true, and
//      triggers document.startViewTransition() (the actual
//      theme snapshot+flip).
//   2. This overlay watches pendingRulerId. When it changes, it
//      mounts a fresh ruler div whose CSS animation runs for
//      1200ms with cubic-bezier easing.
//   3. When the CSS animation ends, the onAnimationEnd handler:
//        - clears isRulerAnimating (unlocks the toggle button)
//        - sets activeId=null (unmounts the ruler div)
//      A 16ms setTimeout in between lets the final frame commit
//      before the element disappears, preventing a 1-frame flash.

const RULER_DURATION_MS = 1000;

export default function ThemeRulerOverlay() {
  const { pendingRulerId, setRulerAnimating } = useTheme();
  const [activeId, setActiveId] = useState(null);
  const [isHidden, setIsHidden] = useState(true);
  const lastIdRef = useRef(0);

  // Keep the component mounted to avoid React commit timing hitches
  // during the most sensitive part of the theme transition.
  useEffect(() => {
    if (pendingRulerId === 0) return;
    if (pendingRulerId === lastIdRef.current) return;

    lastIdRef.current = pendingRulerId;
    setActiveId(pendingRulerId);
    setIsHidden(false);
  }, [pendingRulerId]);

  // Still render nothing when never triggered (saves work)
  if (activeId === null) return null;

  return (
    <div
      className={`${styles.overlay} ${isHidden ? styles.hidden : ""}`}
      aria-hidden="true"
      data-ruler-id={activeId}
    >
      <div
        className={styles.stick}
        onAnimationEnd={(e) => {
          if (e.target !== e.currentTarget) return;

          // Let the final frame paint before hiding.
          window.setTimeout(() => {
            setRulerAnimating(false);
            setIsHidden(true);

            // Allow the next transition id to mount a fresh animation.
            lastIdRef.current = 0;
            setActiveId(null);
          }, 16);
        }}
      >
        <div className={styles.ticks}>
          {Array.from({ length: 11 }).map((_, i) => (
            <span key={i}>{String(i * 10).padStart(2, "0")}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export { RULER_DURATION_MS };

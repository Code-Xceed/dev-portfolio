"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../../context/theme-context";
import { useAudio } from "../../../context/audio-context";
import styles from "./theme-toggle.module.css";

// Hand-drawn sun / moon toggle that matches the sketchbook design
// language. The icon is a single SVG that morphs between two celestial
// states via CSS opacity transitions on layered groups — no SMIL, no
// JS animation, so it stays sharp on every device.
//
// When the user clicks, we ask the theme context to run the
// diagonal-drafting-ruler transition (see components/theme-ruler-overlay).
// The actual theme change is driven by the View Transitions API where
// supported, with a setTimeout-based mid-sweep swap as a fallback.

export default function ThemeToggle() {
  const { theme, startThemeRulerTransition, isRulerAnimating } = useTheme();
  const { playSFX, unlockAudio } = useAudio();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef(null);

  // First click also unlocks audio (same pattern the original used).
  useEffect(() => {
    const handlePointer = () => {
      unlockAudio();
      setIsPressed(true);
      window.setTimeout(() => setIsPressed(false), 150);
    };
    const button = buttonRef.current;
    if (button) {
      button.addEventListener("mousedown", handlePointer);
      button.addEventListener("touchstart", handlePointer);
      return () => {
        button.removeEventListener("mousedown", handlePointer);
        button.removeEventListener("touchstart", handlePointer);
      };
    }
  }, [unlockAudio]);

  const handleToggle = () => {
    if (isRulerAnimating) return; // ignore double-clicks while sweeping
    playSFX("bounce");
    startThemeRulerTransition();
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const isDark = theme === "charcoal";

  return (
    <button
      ref={buttonRef}
      className={`${styles.widgetButton} ${isDark ? styles.charcoal : ""} ${
        isRulerAnimating ? styles.locked : ""
      }`}
      onClick={handleToggle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-pressed={isDark}
    >
      <div className={`${styles.widgetInner} ${isPressed ? styles.pressed : ""}`}>
        {/* Hand-drawn sun/moon icon. viewBox is 50x50 but rendered at 26x26
            to give a bit more breathing room than the previous 24x24. */}
        <div className={styles.iconWrapper}>
          <svg
            viewBox="0 0 50 50"
            className={`${styles.widgetSvg} ${isHovered ? styles.hovered : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {/* ---- Sun rays (visible only in light mode) ---- */}
            <g
              className={`${styles.rays} ${isDark ? styles.muted : styles.shining}`}
            >
              {/* 8 wobbly radiating lines drawn as small Q/L paths so
                  they feel hand-scribbled, not ruler-straight. */}
              <path d="M 25 4.5 Q 26 6 25 8" />
              <path d="M 25 42 Q 24 44 25 45.5" />
              <path d="M 4.5 25 Q 6 26 8 25" />
              <path d="M 42 25 Q 44 24 45.5 25" />
              <path d="M 10 10 Q 12 11.5 14 13.5" />
              <path d="M 40 10 Q 38 11.5 36 13.5" />
              <path d="M 10 40 Q 12 38.5 14 36.5" />
              <path d="M 40 40 Q 38 38.5 36 36.5" />
            </g>

            {/* ---- Sun body (visible in light mode) ---- */}
            <circle
              cx="25"
              cy="25"
              r="9"
              className={`${styles.sunBody} ${isDark ? styles.muted : styles.shining}`}
            />

            {/* ---- Sun inner detail (light mode only) ----
                 A small off-center "smiley" pencil dot to give the
                 sun some character — like a notebook doodle. */}
            <g
              className={`${styles.sunFace} ${isDark ? styles.muted : styles.shining}`}
            >
              <circle cx="22" cy="23" r="0.9" fill="currentColor" stroke="none" />
              <circle cx="28" cy="23" r="0.9" fill="currentColor" stroke="none" />
              <path d="M 22 28 Q 25 30.5 28 28" />
            </g>

            {/* ---- Moon crescent (visible in dark mode) ----
                 A filled crescent: outer arc + inner arc, drawn as a
                 single closed path. */}
            <g
              className={`${styles.moon} ${isDark ? styles.shining : styles.muted}`}
            >
              <path
                d="M 30 16
                   A 10 10 0 1 0 30 34
                   A 7.5 7.5 0 0 1 30 16 Z"
                fill="currentColor"
                fillOpacity="0.18"
                strokeWidth="2.2"
              />
              {/* Tiny craters — hand-drawn detail */}
              <circle cx="22" cy="22" r="0.9" fill="currentColor" stroke="none" />
              <circle cx="20" cy="27" r="0.6" fill="currentColor" stroke="none" />
              <path d="M 25 30 Q 27 31 28 30" />
            </g>

            {/* ---- Stars (dark mode only) ----
                 Two small sparkle marks beside the moon. */}
            <g
              className={`${styles.stars} ${isDark ? styles.shining : styles.muted}`}
            >
              <path d="M 42 12 L 42 16 M 40 14 L 44 14" />
              <path d="M 10 12 L 10 14.5 M 8.75 13.25 L 11.25 13.25" />
            </g>
          </svg>
        </div>

        {/* Status dot — colored like a pencil mark, not a flat dot. */}
        <div
          className={`${styles.statusDot} ${isDark ? styles.dark : styles.light}`}
          aria-hidden="true"
        />
      </div>
    </button>
  );
}

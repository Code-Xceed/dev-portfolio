"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAudio } from "../../../context/audio-context";
import { useTheme } from "../../../context/theme-context";
import styles from "./sound-toggle.module.css";

// Hand-drawn speaker / mute toggle that matches the sketchbook
// design language. When sound is ON, wobbly pencil arcs radiate
// outward and animate. When sound is OFF, a wobbly diagonal pencil
// "slash" crosses the speaker, plus a small masking-tape sticker
// appears in the corner as a skeuomorphic mute indicator.

export default function SoundToggle() {
  const { soundEnabled, toggleSound, unlockAudio } = useAudio();
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef(null);

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

  const handleToggle = () => toggleSound();
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <button
      ref={buttonRef}
      className={`${styles.widgetButton} ${theme === "charcoal" ? styles.charcoal : ""}`}
      onClick={handleToggle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
      title={soundEnabled ? "Sound On" : "Sound Off"}
      aria-pressed={!soundEnabled}
    >
      <div className={`${styles.widgetInner} ${isPressed ? styles.pressed : ""}`}>
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
            {/* Speaker box + cone. Drawn as a single wobbly path so
                nothing on the icon is ruler-straight. */}
            <path
              d="M 9 22
                 L 17 22
                 Q 19 22 21 20
                 L 24 16
                 Q 25 15 25 17
                 L 25 33
                 Q 25 35 24 34
                 L 21 30
                 Q 19 28 17 28
                 L 9 28
                 Q 8 28 8 27
                 L 8 23
                 Q 8 22 9 22 Z"
              className={`${styles.speaker} ${soundEnabled ? styles.on : styles.off}`}
            />

            {/* Sound waves — three concentric wobbly arcs that pulse
                outward when sound is on. Each path uses Q curves so
                the curves have a hand-scribbled quality. */}
            <g
              className={`${styles.waves} ${
                soundEnabled ? styles.active : styles.muted
              }`}
            >
              <path
                d="M 30 19
                   Q 33 22 33 25
                   Q 33 28 30 31"
                className={styles.wave1}
              />
              <path
                d="M 34 15
                   Q 39 20 39 25
                   Q 39 30 34 35"
                className={styles.wave2}
              />
              <path
                d="M 38 11
                   Q 45 18 45 25
                   Q 45 32 38 39"
                className={styles.wave3}
              />
            </g>

            {/* Mute slash — a hand-drawn diagonal pencil line drawn
                with three Q-curve wobbles so it doesn't look like
                a clean X. Hidden when sound is on. */}
            <g
              className={`${styles.muteMark} ${
                soundEnabled ? styles.muted : styles.active
              }`}
            >
              <path
                d="M 11 11
                   Q 18 18 25 25
                   Q 32 32 39 39"
                className={styles.slash}
              />
              {/* Two tiny end-marks like a real pencil has when it
                  overshoots at the end of a stroke. */}
              <path d="M 9 13 L 11 11" className={styles.slashTick} />
              <path d="M 41 37 L 39 39" className={styles.slashTick} />
            </g>

            {/* Skeuomorphic "tape" mute sticker. Drawn as a wobbly
                rectangle with a small piece of masking-tape texture
                on top. Hidden when sound is on. */}
            <g
              className={`${styles.tape} ${
                soundEnabled ? styles.muted : styles.active
              }`}
            >
              <path
                d="M 33 33
                   L 45 33
                   Q 46 33 46 34
                   L 46 42
                   Q 46 43 45 43
                   L 33 43
                   Q 32 43 32 42
                   L 32 34
                   Q 32 33 33 33 Z"
                className={styles.tapeRect}
              />
              <path d="M 35 38 L 43 38" className={styles.tapeX} />
            </g>
          </svg>
        </div>

        {/* Status indicator dot. */}
        <div
          className={`${styles.statusDot} ${soundEnabled ? styles.on : styles.off}`}
          aria-hidden="true"
        />
      </div>
    </button>
  );
}

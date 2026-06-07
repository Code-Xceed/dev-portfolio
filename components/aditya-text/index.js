"use client";

import React from "react";
import gsap from "gsap";
import { useAudio } from "../../context/audio-context";
import styles from "./aditya-text.module.css";

export default function AdityaText() {
  const { playSFX, playKeyboardKey } = useAudio();
  const firstName = "ADITYA";

  const handleLetterHover = (e, index) => {
    // Play mechanical keyboard sound for keys A-Z (ASCII values 65-90)
    const randomKey = 65 + Math.floor(Math.random() * 26);
    playKeyboardKey(randomKey);

    const el = e.currentTarget;
    gsap.killTweensOf(el);
    
    // Elastic spring springy lift, slight rotation, scale up, then fall back down
    gsap.timeline()
      .to(el, {
        y: -14,
        scale: 1.22,
        rotation: index % 2 === 0 ? 8 : -8,
        color: "var(--highlight-color)",
        duration: 0.12,
        ease: "power2.out"
      })
      .to(el, {
        y: 0,
        scale: 1,
        rotation: 0,
        color: "var(--text-color)",
        duration: 0.65,
        ease: "elastic.out(1, 0.4)",
        clearProps: "color"
      });
  };

  const handleLastNameHover = (e) => {
    const randomKey = 65 + Math.floor(Math.random() * 26);
    playKeyboardKey(randomKey);

    const el = e.currentTarget;
    gsap.killTweensOf(el);

    gsap.timeline()
      .to(el, {
        scale: 1.15,
        rotation: -9,
        color: "var(--text-color)",
        duration: 0.12,
        ease: "power2.out"
      })
      .to(el, {
        scale: 1,
        rotation: -5,
        color: "var(--highlight-color)",
        duration: 0.6,
        ease: "elastic.out(1, 0.45)",
        clearProps: "color"
      });
  };

  return (
    <div className={styles.container}>
      <span className={styles.tagline}>Creative Developer & Architect</span>
      <div className={styles.nameWrapper}>
        <h1 className={styles.firstName}>
          {firstName.split("").map((char, index) => (
            <span
              key={index}
              className={styles.letter}
              onMouseEnter={(e) => handleLetterHover(e, index)}
            >
              {char}
            </span>
          ))}
        </h1>
        <span 
          className={styles.lastName}
          onMouseEnter={handleLastNameHover}
        >
          Rathore
        </span>
      </div>
    </div>
  );
}

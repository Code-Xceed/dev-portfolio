"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./about-card.module.css";

export default function AboutCard() {
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      gsap.set(textRef.current, { opacity: 0, y: 15 });
      gsap.to(textRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        delay: 0.5,
        ease: "power2.out",
      });
    }
    return () => {
      if (textRef.current) {
        gsap.killTweensOf(textRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.aboutCard}>
        {/* Punch holes simulating torn binder sheet */}
        <div className={styles.binderHoles}>
          <div className={styles.hole}></div>
          <div className={styles.hole}></div>
          <div className={styles.hole}></div>
        </div>
        
        <div className={styles.tapeStrip}></div>

        <div className={`${styles.aboutContentWrapper} ${styles.aboutCardLines}`}>
          <p ref={textRef} className={styles.aboutRevealText} id="about-text">
            I am a <span className={styles.highlightDoodle}>Creative Developer</span> &{" "}
            <span className={styles.highlightDoodle}>Digital Architect</span> who designs wobbly,
            physics-driven web experiences. Blending technical engineering grids with organic sketches,
            I build interfaces that feel{" "}
            <span className={styles.highlightDoodle}>alive, interactive, and skeuomorphic</span>.
          </p>
        </div>

        {/* Sketchy Blueprint Stamped Seal */}
        <div className={styles.aboutStampSeal} title="Certified Vibe Architect Seal">
          <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <circle cx="40" cy="40" r="33" stroke="var(--highlight-color)" strokeWidth="1.2" strokeDasharray="35 6 12 5" fill="none" opacity="0.75" />
            <circle cx="40" cy="40" r="28" stroke="var(--highlight-color)" strokeWidth="0.8" fill="none" opacity="0.6" />
            <path id="seal-text-path-1" d="M 17 40 A 23 23 0 0 1 63 40" fill="none" />
            <text fontSize="5.5" fontFamily="var(--font-mono)" fill="var(--highlight-color)" letterSpacing="1" fontWeight="bold">
              <textPath href="#seal-text-path-1" startOffset="50%" textAnchor="middle">CREATIVE CODE</textPath>
            </text>
            <text x="40" y="44" fontSize="8" fontFamily="var(--font-mono)" fontWeight="bold" fill="var(--highlight-color)" textAnchor="middle">AD-26</text>
            <path d="M 22 46 L 24 48 L 22 50 L 20 48 Z M 58 46 L 60 48 L 58 50 L 56 48 Z" fill="var(--highlight-color)" opacity="0.8"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

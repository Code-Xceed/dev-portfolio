"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useAudio } from "../../context/audio-context";
import styles from "./welcome-screen.module.css";

export default function WelcomeScreen({ onRevealComplete }) {
  const welcomeScreenRef = useRef(null);
  const dusterRef = useRef(null);
  const { playSFX } = useAudio();
  const [isRendered, setIsRendered] = useState(true);

  // Store callbacks in refs to prevent effect re-runs on identity changes
  const playSFXRef = useRef(playSFX);
  const onRevealCompleteRef = useRef(onRevealComplete);
  useEffect(() => { playSFXRef.current = playSFX; }, [playSFX]);
  useEffect(() => { onRevealCompleteRef.current = onRevealComplete; }, [onRevealComplete]);

  useEffect(() => {
    const welcomeScreen = welcomeScreenRef.current;
    const duster = dusterRef.current;
    if (!welcomeScreen) return;

    // Scopes all selector queries within this component tree
    const q = gsap.utils.selector(welcomeScreenRef);

    // 1. Handwriting SVG paths draw timeline (Strict Sequential Letter-by-Letter)
    const drawTimeline = gsap.timeline();

    // Letter "H"
    drawTimeline.to(q(".path1"), { strokeDashoffset: 0, duration: 0.35, ease: "power1.out" });
    drawTimeline.to(q(".path2"), { strokeDashoffset: 0, duration: 0.22, ease: "power1.out" });
    drawTimeline.to(q(".path3"), { strokeDashoffset: 0, duration: 0.35, ease: "power1.out" });
    
    // Letter "e" (brief pause before starting)
    drawTimeline.to(q(".path4"), { strokeDashoffset: 0, duration: 0.65, ease: "power1.out" }, "+=0.15");
    
    // Letter "Y" (brief pause before starting)
    drawTimeline.to(q(".path5"), { strokeDashoffset: 0, duration: 0.25, ease: "power1.out" }, "+=0.15");
    drawTimeline.to(q(".path6"), { strokeDashoffset: 0, duration: 0.25, ease: "power1.out" });
    drawTimeline.to(q(".path7"), { strokeDashoffset: 0, duration: 0.22, ease: "power1.out" });
    
    // Underline markup (brief pause before starting after Y finishes)
    drawTimeline.to(q(".path9"), { strokeDashoffset: 0, duration: 0.85, ease: "power1.inOut" }, "+=0.25");

    // 2. Desk reveal diagonal wipe clipPath & duster motion
    const revealTimeline = gsap.timeline({
      paused: true,
      onComplete: () => {
        setIsRendered(false);
        if (onRevealCompleteRef.current) {
          onRevealCompleteRef.current();
        }
      },
    });

    revealTimeline.to(welcomeScreen, {
      clipPath: "polygon(140% 140%, 140% 140%, 140% 140%)",
      duration: 1.8,
      ease: "power2.inOut",
    }, 0);

    if (duster) {
      revealTimeline.to(duster, {
        x: "140%",
        y: "140%",
        duration: 1.8,
        ease: "power2.inOut",
        onStart: () => {
          playSFXRef.current("rubberEraser");
        },
      }, 0);
    }

    // Trigger reveal only when drawing completes and window is fully loaded
    let startRevealRef;
    drawTimeline.eventCallback("onComplete", () => {
      const startReveal = () => {
        revealTimeline.play();
      };
      startRevealRef = startReveal;

      if (document.readyState === "complete") {
        setTimeout(startReveal, 350);
      } else {
        window.addEventListener("load", startReveal, { once: true });
      }
    });

    return () => {
      if (startRevealRef) {
        window.removeEventListener("load", startRevealRef);
      }
      drawTimeline.kill();
      revealTimeline.kill();
    };
  }, []); // Stable effect — callbacks read from refs

  if (!isRendered) return null;

  return (
    <div ref={welcomeScreenRef} className={styles.welcomeScreen} id="welcome-screen">
      <div className={styles.gridBg}></div>
      <div className={styles.scratchLines}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.08 }}>
          <path d="M-10,20 L110,40 M-10,80 L110,60 M30,-10 L40,110 M70,-10 L60,110" stroke="currentColor" strokeWidth="0.8" strokeDasharray="10 5" />
          <path d="M-10,-10 L110,110 M110,-10 L-10,110" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        </svg>
      </div>
      <div className={styles.content}>
        <div className={styles.box}>
          <div className={`${styles.tape} ${styles.tapeTl}`}></div>
          <div className={`${styles.tape} ${styles.tapeTr}`}></div>
          <div className={`${styles.tape} ${styles.tapeBl}`}></div>
          <div className={`${styles.tape} ${styles.tapeBr}`}></div>
          
          <svg className={styles.heySvg} viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg">
            <path 
              className={`${styles.heyPath} path1`} 
              d="M 45,30 C 45,45 44,55 46,70" 
              fill="none"
              stroke="currentColor"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ strokeDasharray: 41, strokeDashoffset: 41 }}
            />
            <path 
              className={`${styles.heyPath} path2`} 
              d="M 46,50 C 54,49 64,51 74,49" 
              fill="none"
              stroke="currentColor"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ strokeDasharray: 29, strokeDashoffset: 29 }}
            />
            <path 
              className={`${styles.heyPath} path3`} 
              d="M 73,28 C 74,42 72,58 73,72" 
              fill="none"
              stroke="currentColor"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ strokeDasharray: 45, strokeDashoffset: 45 }}
            />
            <path 
              className={`${styles.heyPath} path4`} 
              d="M 84,54 C 94,54 103,52 103,46 C 103,40 94,38 87,42 C 80,46 80,58 86,64 C 92,68 102,64 106,56" 
              fill="none"
              stroke="currentColor"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ strokeDasharray: 92, strokeDashoffset: 92 }}
            />
            <path 
              className={`${styles.heyPath} path5`} 
              d="M 118,48 C 122,54 126,60 130,66" 
              fill="none"
              stroke="currentColor"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ strokeDasharray: 22, strokeDashoffset: 22 }}
            />
            <path 
              className={`${styles.heyPath} path6`} 
              d="M 130,66 C 126,76 120,86 114,94" 
              fill="none"
              stroke="currentColor"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ strokeDasharray: 33, strokeDashoffset: 33 }}
            />
            <path 
              className={`${styles.heyPath} path7`} 
              d="M 142,46 C 138,52 134,58 130,66" 
              fill="none"
              stroke="currentColor"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ strokeDasharray: 24, strokeDashoffset: 24 }}
            />
            <path 
              className={`${styles.heyPath} path9`} 
              d="M 35,88 C 75,92 125,89 165,85" 
              fill="none"
              stroke="var(--highlight-color)"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ strokeDasharray: 131, strokeDashoffset: 131 }}
            />
          </svg>
          
          <div className={`${styles.sub} font-mono`}>[ ADITYA.DEV WORKSPACE INITIALIZING ]</div>
        </div>
      </div>
      
      <div ref={dusterRef} className={styles.duster} id="welcome-duster">
        <div className={styles.dusterFelt}></div>
        <div className={styles.dusterWood}>
          <span className={`${styles.dusterLabel} font-mono`}>AD-ERASER</span>
        </div>
      </div>
    </div>
  );
}

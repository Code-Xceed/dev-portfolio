"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./skill-popup.module.css";

export default function SkillPopup({ skill, triggerRect, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSkill, setActiveSkill] = useState(null);
  const paperRef = useRef(null);
  const backdropRef = useRef(null);
  const savedOverflowRef = useRef("");

  // Sync skill prop to local state with open/close animations
  useEffect(() => {
    if (skill) {
      setActiveSkill(skill);
      setIsOpen(true);

      // Prevent background scrolling while open
      savedOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Snappy elastic reveal animation
      if (paperRef.current && backdropRef.current) {
        // Kill any in-flight tweens before starting new ones
        gsap.killTweensOf(paperRef.current);
        gsap.killTweensOf(backdropRef.current);

        // Calculate initial origin coordinates
        let px = window.innerWidth / 2;
        let py = window.innerHeight / 2;

        if (triggerRect) {
          px = triggerRect.left + triggerRect.width / 2;
          py = triggerRect.top + triggerRect.height / 2;
        }

        const tl = gsap.timeline();

        // 1. Fade backdrop in
        tl.fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: "power2.out" },
          0
        );

        // 2. Paper flies/swings in from trigger coordinates
        tl.fromTo(
          paperRef.current,
          {
            x: px - window.innerWidth / 2,
            y: py - window.innerHeight / 2,
            scale: 0.1,
            rotation: -25,
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(1.5)",
          },
          0
        );

        // 3. Pop the tape strips
        const tapes = paperRef.current.querySelectorAll(`.${styles.tape}`);
        if (tapes.length) {
          tl.fromTo(
            tapes,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.8)", stagger: 0.05 },
            0.2
          );
        }

        // 4. Stagger reveal content (header, lines, footer)
        const headerEl = paperRef.current.querySelector(`.${styles.header}`);
        const linesEl = paperRef.current.querySelector(`.${styles.lines}`);
        const footerEl = paperRef.current.querySelector(`.${styles.footer}`);
        const contentEls = [headerEl, linesEl, footerEl].filter(Boolean);
        if (contentEls.length) {
          tl.fromTo(
            contentEls,
            { y: 12, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.35, ease: "power2.out", stagger: 0.08 },
            0.15
          );
        }

        // 5. Stamp seal stamp-down animation
        const stamp = paperRef.current.querySelector(`.${styles.stampSeal}`);
        if (stamp) {
          tl.fromTo(
            stamp,
            { scale: 2, opacity: 0, rotation: 20 },
            { scale: 1, opacity: 1, rotation: -10, duration: 0.45, ease: "bounce.out" },
            0.3
          );
        }
      }
    } else if (isOpen) {
      // Smooth fade-out close transition

      if (paperRef.current && backdropRef.current) {
        // Kill any in-flight tweens before starting exit
        gsap.killTweensOf(paperRef.current);
        gsap.killTweensOf(backdropRef.current);
        let px = window.innerWidth / 2;
        let py = window.innerHeight / 2;

        if (triggerRect) {
          px = triggerRect.left + triggerRect.width / 2;
          py = triggerRect.top + triggerRect.height / 2;
        }

        const exitTl = gsap.timeline({
          onComplete: () => {
            setIsOpen(false);
            setActiveSkill(null);
            document.body.style.overflow = savedOverflowRef.current;
          },
        });

        // 1. Fade backdrop out
        exitTl.to(
          backdropRef.current,
          { opacity: 0, duration: 0.3, ease: "power2.inOut" },
          0
        );

        // 2. Fly paper sheet back to trigger coordinates
        exitTl.to(
          paperRef.current,
          {
            x: px - window.innerWidth / 2,
            y: py - window.innerHeight / 2,
            scale: 0.1,
            rotation: 20,
            opacity: 0,
            duration: 0.35,
            ease: "back.in(1.2)",
          },
          0
        );

        // 3. Fade out sub-elements
        const tapes = paperRef.current.querySelectorAll(`.${styles.tape}`);
        const stamp = paperRef.current.querySelector(`.${styles.stampSeal}`);
        if (tapes.length) {
          exitTl.to(tapes, { scale: 0.8, opacity: 0, duration: 0.18 }, 0);
        }
        if (stamp) {
          exitTl.to(stamp, { scale: 0.8, opacity: 0, duration: 0.18 }, 0);
        }
      } else {
        setIsOpen(false);
        setActiveSkill(null);
        document.body.style.overflow = savedOverflowRef.current;
      }
    }
  }, [skill, triggerRect]);

  // Handle escape key listener to close dialog — only attached when open
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !activeSkill) return null;

  return (
    <div
      className={`${styles.backdrop} ${styles.active}`}
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className={styles.paper} ref={paperRef}>
        {/* Masking tapes */}
        <div className={`${styles.tape} ${styles.tapeTl}`}></div>
        <div className={`${styles.tape} ${styles.tapeTr}`}></div>
        <div className={`${styles.tape} ${styles.tapeBl}`}></div>
        <div className={`${styles.tape} ${styles.tapeBr}`}></div>

        {/* Binder Holes */}
        <div className={styles.binderHoles}>
          <div className={styles.hole}></div>
          <div className={styles.hole}></div>
          <div className={styles.hole}></div>
        </div>

        {/* Close button */}
        <button className={styles.closeBtn} onClick={onClose} title="Close Sheet">
          X
        </button>

        {/* Header Block */}
        <div className={styles.header}>
          <div className={styles.brandVisual} dangerouslySetInnerHTML={{ __html: activeSkill.visualHtml }} />
          <div className={styles.titleBlock}>
            <h2 className={styles.skillName}>{activeSkill.title}</h2>
            <span className={styles.metadata}>[ Skill Details ]</span>
          </div>
        </div>

        {/* Guideline lines notebook body */}
        <div className={styles.lines}>
          <p>{activeSkill.description}</p>
        </div>

        {/* Technical Footer specifications */}
        <div className={styles.footer}>
          <span>Verified Skill // Info</span>
          <span>ADITYA DESIGN OFFICE © 2026</span>
        </div>

        {/* stamped seal */}
        <div className={styles.stampSeal}>
          <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="33" stroke="var(--highlight-color)" strokeWidth="1.2" strokeDasharray="35 6 12 5" fill="none" opacity="0.75" />
            <circle cx="40" cy="40" r="28" stroke="var(--highlight-color)" strokeWidth="0.8" fill="none" opacity="0.6" />
            <path id="popup-seal-path-comp" d="M 17 40 A 23 23 0 0 1 63 40" fill="none" />
            <text fontSize="5.5" fontFamily="var(--font-fira-code)" fill="var(--highlight-color)" letterSpacing="1" fontWeight="bold">
              <textPath href="#popup-seal-path-comp" startOffset="50%" textAnchor="middle">
                APPROVED SPEC
              </textPath>
            </text>
            <text x="40" y="44" fontSize="8" fontFamily="var(--font-fira-code)" fontWeight="bold" fill="var(--highlight-color)" textAnchor="middle">
              NO CAP
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}

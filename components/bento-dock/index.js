"use client";

import React, { useEffect, useRef } from "react";
import { TextScramble } from "../../utils/text-scramble";
import { useAudio } from "../../context/audio-context";
import { useTheme } from "../../context/theme-context";
import SoundToggle from "../widgets/sound-toggle";
import ThemeToggle from "../widgets/theme-toggle";
import styles from "./bento-dock.module.css";



const DockItem = React.memo(function DockItem({ label, active, onClick, children }) {
  const { playSFX } = useAudio();
  const labelRef = useRef(null);
  const scramblerRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (labelRef.current) {
      scramblerRef.current = new TextScramble(labelRef.current);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    playSFX("hover");
    if (scramblerRef.current) {
      // Small timeout to align with bento panel width CSS expand transitions
      timeoutRef.current = setTimeout(() => {
        scramblerRef.current.setText(label);
      }, 80);
    }
  };

  const handleLinkClick = (e) => {
    e.preventDefault();
    playSFX("hudClick");
    onClick();
  };

  return (
    <a
      href={`#section-${label.toLowerCase()}`}
      className={`${styles.dockItem} ${active ? styles.active : ""}`}
      onMouseEnter={handleMouseEnter}
      onClick={handleLinkClick}
    >
      <span className={styles.dockIcon}>{children}</span>
      <div className={styles.metaPill}>
        <span ref={labelRef} className={`${styles.label} font-mono`}>
          {label}
        </span>
      </div>
    </a>
  );
});

export default function BentoDock({ activePage, onPageChange }) {
  const { theme } = useTheme();
  return (
    <nav className={`${styles.dockNav} ${theme === 'charcoal' ? styles.charcoal : ''}`} id="bento-dock">
      <div className={styles.dockWrapper}>
        {/* Left Widget: Sound Toggle */}
        <SoundToggle />
        
        {/* Navigation Items */}
        <div className={styles.navItems}>
          {/* Dock Link 1: About */}
          <DockItem
            label="ABOUT"
            active={activePage === 0}
            onClick={() => onPageChange(0)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
          </DockItem>

          {/* Dock Link 2: Projects */}
          <DockItem
            label="PROJECTS"
            active={activePage === 1}
            onClick={() => onPageChange(1)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 19l-6-3-6 3-6-3v-13l6 3 6-3 6 3v13z" />
              <path d="M6 6v13M12 5v13M18 6v13" />
            </svg>
          </DockItem>

          {/* Dock Link 3: Sandbox */}
          <DockItem
            label="SANDBOX"
            active={activePage === 2}
            onClick={() => onPageChange(2)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </DockItem>
        </div>

        {/* Right Widget: Theme Toggle */}
        <ThemeToggle />
      </div>
    </nav>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./custom-cursor.module.css";

const CURSOR_STYLE = { left: 0, top: 0, position: 'fixed', pointerEvents: 'none', zIndex: 99999, willChange: 'transform' };

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const isPointerRef = useRef(false);
  const isClickingRef = useRef(false);
  const isVisibleRef = useRef(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const positionRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);
  const needsUpdateRef = useRef(false);

  // Check if element should show pointer cursor
  const checkIfInteractive = (element) => {
    if (!element) return false;
    
    const tagName = element.tagName?.toLowerCase();
    const interactiveTags = ['a', 'button', 'input', 'select', 'textarea', 'summary'];
    
    if (interactiveTags.includes(tagName)) return true;
    if (element.getAttribute('role') === 'button') return true;
    if (element.hasAttribute('tabindex') && element.getAttribute('tabindex') !== '-1') return true;
    
    // Check for portfolio-specific classes
    const className = element.className || '';
    const interactivePatterns = [
      /dockItem/i, /widget/i, /polaroidCard/i, /carouselCard/i,
      /skillCard/i, /aboutCard/i, /closeBtn/i, /letter/i, /lastName/i,
      /toggle/i, /popup/i, /ornament/i, /tapeStrip/i, /postIt/i
    ];
    
    return interactivePatterns.some(pattern => pattern.test(className));
  };

  useEffect(() => {
    // Detect touch device
    const checkTouch = () => {
      const hasTouch = window.matchMedia("(pointer: coarse)").matches || 
                       'ontouchstart' in window || 
                       navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch);
      return hasTouch;
    };

    if (checkTouch()) {
      return;
    }

    // Hide native cursor globally
    document.documentElement.style.cursor = 'none';
    document.body.style.cursor = 'none';

    // Smooth cursor follow with requestAnimationFrame
    // Moved inside useEffect to avoid stale closures and per-render recreation
    const updateCursorPosition = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0)`;
      }

      // Only continue the loop if there's a pending position update
      if (needsUpdateRef.current) {
        needsUpdateRef.current = false;
        animationFrameRef.current = requestAnimationFrame(updateCursorPosition);
      } else {
        animationFrameRef.current = null;
      }
    };

    // MutationObserver for body class changes (hovering-plane, hovering-emoji)
    // Replaces per-frame body class polling
    const observer = new MutationObserver(() => {
      const hovering = document.body.classList.contains('hovering-plane') || 
                       document.body.classList.contains('hovering-emoji') ||
                       document.body.style.cursor === 'pointer';
      if (hovering !== isPointerRef.current) {
        isPointerRef.current = hovering;
        cursorRef.current?.classList.toggle(styles.pointer, hovering);
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const handleMouseMove = (e) => {
      positionRef.current = { x: e.clientX, y: e.clientY };
      
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        if (cursorRef.current) {
          cursorRef.current.style.opacity = '1';
        }
      }

      // Signal that we need a position update and schedule rAF if not already running
      needsUpdateRef.current = true;
      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateCursorPosition);
      }
    };

    const handleMouseOver = (e) => {
      if (checkIfInteractive(e.target)) {
        isPointerRef.current = true;
        cursorRef.current?.classList.add(styles.pointer);
      }
    };

    const handleMouseOut = (e) => {
      if (checkIfInteractive(e.target)) {
        isPointerRef.current = false;
        cursorRef.current?.classList.remove(styles.pointer);
      }
    };

    const handleMouseDown = () => {
      isClickingRef.current = true;
      cursorRef.current?.classList.add(styles.clicking);
    };

    const handleMouseUp = () => {
      isClickingRef.current = false;
      cursorRef.current?.classList.remove(styles.clicking);
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '0';
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      needsUpdateRef.current = false;
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '1';
      }
      needsUpdateRef.current = true;
      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateCursorPosition);
      }
    };

    // Attach event listeners
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });
    document.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      observer.disconnect();
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Restore native cursor on unmount
      document.documentElement.style.cursor = '';
      document.body.style.cursor = '';
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <div
      ref={cursorRef}
      className={styles.customCursor}
      style={{ ...CURSOR_STYLE, opacity: 0 }}
    >
      {/* Default Arrow Cursor SVG */}
      <svg
        className={`${styles.cursorSvg} ${styles.defaultCursor}`}
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 2L16 7L9 10L6 16Z"
          fill="#FCFBE3"
          stroke="#3C2A21"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <line x1="2" y1="2" x2="9" y2="10" stroke="#3C2A21" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      {/* Pointer Hand Cursor SVG */}
      <svg
        className={`${styles.cursorSvg} ${styles.pointerCursor}`}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="rotate(-15 12 12)">
          <path
            d="M19.13 9.56v3.22l-1.33-.29V8.84a10.8 10.8 0 0 0-1.55-.56v3.88l-1.33-.29V8c-.73-.12-1.45-.2-2.05-.24v3.67l-1.33-.29V7.65h0V2.9a1.68 1.68 0 0 0-1.73-1.62 1.68 1.68 0 0 0-1.73 1.62v8.61h0v1.73l-1.33.67V10.4l-1.7-1.58a1.89 1.89 0 0 0-2.67 0 1.96 1.96 0 0 0 0 2.73l4 4.74a7.21 7.21 0 0 0 .93 2.81 5.61 5.61 0 0 0 1.48 1.82v1.71H18.53V20.41a8.36 8.36 0 0 0 2-5.67v-4A4.67 4.67 0 0 0 19.13 9.56Z"
            fill="#FCFBE3"
            stroke="#3C2A21"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}

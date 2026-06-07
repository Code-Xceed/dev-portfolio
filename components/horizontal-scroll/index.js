"use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import styles from "./horizontal-scroll.module.css";

export default function HorizontalScroll({ children, pagesCount = 3 }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);

  const currentPageRef = useRef(0);
  const lastSwitchAtRef = useRef(0);
  const wheelAccumulatorRef = useRef(0);
  const wheelTimeoutRef = useRef(null);

  const goToPage = (pageIndex) => {
    if (window.innerWidth <= 1024) return;
    const clampedIndex = Math.max(0, Math.min(pagesCount - 1, pageIndex));
    if (clampedIndex === currentPageRef.current) return;

    currentPageRef.current = clampedIndex;
    setCurrentPage(clampedIndex);
    lastSwitchAtRef.current = performance.now();
    wheelAccumulatorRef.current = 0;

    const track = trackRef.current;
    if (track) {
      gsap.to(track, {
        x: `-${clampedIndex * 100}vw`,
        duration: 0.8,
        ease: "power3.out",
      });
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const handleWheel = (e) => {
      if (window.innerWidth <= 1024) return;
      // 1. Check for scrollable elements inside to prevent hijacking their scrolling
      const target = e.target;
      let isInsideScrollable = false;
      let curr = target;
      while (curr && curr !== container) {
        if (curr.scrollHeight > curr.clientHeight || curr.scrollWidth > curr.clientWidth) {
          const style = window.getComputedStyle(curr);
          if (style.overflowY !== 'hidden' || style.overflowX !== 'hidden') {
            const atTop = curr.scrollTop === 0;
            const atBottom = Math.abs(curr.scrollHeight - curr.clientHeight - curr.scrollTop) <= 1;
            const atLeft = curr.scrollLeft === 0;
            const atRight = Math.abs(curr.scrollWidth - curr.clientWidth - curr.scrollLeft) <= 1;
            
            if (!(atTop && e.deltaY < 0) && !(atBottom && e.deltaY > 0) && !(atLeft && e.deltaX < 0) && !(atRight && e.deltaX > 0)) {
              isInsideScrollable = true;
              break;
            }
          }
        }
        curr = curr.parentNode;
      }

      if (isInsideScrollable) return;

      const scrollIntent = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(scrollIntent) < 2) return;

      // Prevent browser default scroll behaviors
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) || Math.abs(e.deltaX) > 0) {
        e.preventDefault();
      }

      // 2. Strict Switch Cooldown: ignore all scrolling during cooldown
      const now = performance.now();
      if (now - lastSwitchAtRef.current < 600) {
        return;
      }

      // 3. Accumulate delta and reset via debounce when user stops scrolling
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
      wheelTimeoutRef.current = setTimeout(() => {
        wheelAccumulatorRef.current = 0;
      }, 80);

      wheelAccumulatorRef.current += scrollIntent;

      const threshold = 45;
      if (wheelAccumulatorRef.current > threshold) {
        if (currentPageRef.current < pagesCount - 1) {
          goToPage(currentPageRef.current + 1);
        } else {
          wheelAccumulatorRef.current = 0;
        }
      } else if (wheelAccumulatorRef.current < -threshold) {
        if (currentPageRef.current > 0) {
          goToPage(currentPageRef.current - 1);
        } else {
          wheelAccumulatorRef.current = 0;
        }
      }
    };

    let touchStartX = 0;
    let touchStartY = 0;
    let touchTracking = false;

    const handleTouchStart = (e) => {
      if (window.innerWidth <= 1024) return;
      if (e.touches.length !== 1) return;

      // Ignore touch gestures on scrollable inner elements
      const target = e.target;
      let isInsideScrollable = false;
      let curr = target;
      while (curr && curr !== container) {
        if (curr.scrollWidth > curr.clientWidth) {
          const style = window.getComputedStyle(curr);
          if (style.overflowX !== 'hidden') {
            isInsideScrollable = true;
            break;
          }
        }
        curr = curr.parentNode;
      }
      if (isInsideScrollable) return;

      touchTracking = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (window.innerWidth <= 1024) return;
      if (!touchTracking || e.touches.length !== 1) return;

      const now = performance.now();
      if (now - lastSwitchAtRef.current < 600) {
        return;
      }

      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      const touchThreshold = 40;

      if (Math.abs(dx) < Math.abs(dy) || Math.abs(dx) < touchThreshold) return;

      e.preventDefault();

      if (dx < 0 && currentPageRef.current < pagesCount - 1) {
        goToPage(currentPageRef.current + 1);
      } else if (dx > 0 && currentPageRef.current > 0) {
        goToPage(currentPageRef.current - 1);
      }

      touchTracking = false; // Only one page switch per touch gesture
    };

    const handleTouchEnd = () => {
      touchTracking = false;
    };

    const handleKeyDown = (e) => {
      if (window.innerWidth <= 1024) return;
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      const now = performance.now();
      if (now - lastSwitchAtRef.current < 600) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        if (currentPageRef.current < pagesCount - 1) {
          goToPage(currentPageRef.current + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (currentPageRef.current > 0) {
          goToPage(currentPageRef.current - 1);
        }
      }
    };

    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        gsap.set(track, { clearProps: "transform" });
        return;
      }
      gsap.set(track, {
        x: `-${currentPageRef.current * 100}vw`
      });
    };

    // Initialize layout positions
    handleResize();

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
    };
  }, [pagesCount]);

  return (
    <div className={styles.scrollContainer} ref={containerRef}>
      <div 
        className={styles.scrollTrack} 
        ref={trackRef}
        style={{ width: `${pagesCount * 100}vw` }}
      >
        {children}
      </div>
    </div>
  );
}

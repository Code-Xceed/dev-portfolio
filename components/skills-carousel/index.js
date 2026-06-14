"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { useAudio } from "../../context/audio-context";
import { TextScramble } from "../../utils/text-scramble";
import { SKILLS_DATA } from "./skills-data";
import styles from "./skills-carousel.module.css";

export default function SkillsCarousel({ revealed, activePage = 0 }) {
  const { playSFX } = useAudio();
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const titleRef = useRef(null);

  // Constants
  const cardWidth = 170;
  const gap = 32;
  const cardSpacing = cardWidth + gap;
  const numOriginal = SKILLS_DATA.length;

  // Refs for tracking state to avoid closure issues in the loop
  const stateRef = useRef({
    scrollX: 0,
    targetScrollX: 0,
    autoScrollSpeed: -0.6,
    vx: -0.6,
    isDragging: false,
    dragged: false,
    startX: 0,
    dragStartScrollX: 0,
    lastPointerX: 0,
    lastPointerTime: 0,
    lastTickTime: 0,
    lastNearestIndex: -1,
    viewportWidth: 800,
    isMobile: false,
  });

  const [isMobile, setIsMobile] = useState(false);

  // Cache for previous card DOM state to skip redundant writes
  const prevCardState = useRef([]);

  // Ref to hold latest handler references for lazy global listeners
  const handlersRef = useRef({ onMove: null, onUp: null });

  // Title text scramble effect
  useEffect(() => {
    if (!titleRef.current) return;
    const scrambler = new TextScramble(titleRef.current);
    const originalText = "Technologies I can work with...";

    // Scramble initially on page load
    const timeoutId = setTimeout(() => {
      scrambler.setText(originalText);
    }, 800);

    // Continuous loop: scramble and reveal every 6 seconds
    const intervalId = setInterval(() => {
      scrambler.setText(originalText);
    }, 6000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      scrambler.cancel();
    };
  }, []);

  // Resize handler to determine mobile state and center positions
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      stateRef.current.isMobile = mobile;

      if (viewportRef.current) {
        const width = viewportRef.current.clientWidth;
        stateRef.current.viewportWidth = width;

        if (!mobile) {
          // Initialize scrollX to center on the first original card (index = numOriginal)
          const centerPos = width / 2 - numOriginal * cardSpacing - cardWidth / 2;
          stateRef.current.scrollX = centerPos;
          stateRef.current.targetScrollX = centerPos;
          stateRef.current.lastNearestIndex = Math.round((width / 2 - centerPos - cardWidth / 2) / cardSpacing);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [numOriginal, cardSpacing, revealed]);

  // Main animation loop (desktop only)
  useEffect(() => {
    if (isMobile || activePage !== 0 || !revealed) {
      // Clean up inline styles applied by 3D loop so mobile grid works perfectly
      if (trackRef.current) {
        trackRef.current.style.transform = "";
        const cards = trackRef.current.children;
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          if (!card) continue;
          card.style.transform = "";
          card.style.zIndex = "";
          card.style.opacity = "";
          card.style.visibility = "";
          card.style.pointerEvents = "";
        }
      }
      return;
    }

    const tick = () => {
      const state = stateRef.current;

      if (!trackRef.current) {
        return;
      }

      const now = performance.now();
      if (!state.lastTickTime) state.lastTickTime = now;

      let dt = now - state.lastTickTime;
      if (dt > 100) dt = 16.666; // clamp on tab sleep
      state.lastTickTime = now;

      const timeScale = dt / 16.666;

      // 1) Friction & Deceleration
      if (state.isDragging) {
        const dx = state.targetScrollX - state.scrollX;
        const lerpFactor = 1 - Math.pow(1 - 0.06, timeScale);
        const prevScrollX = state.scrollX;
        state.scrollX += dx * lerpFactor;
        state.vx = (state.scrollX - prevScrollX) / timeScale;
      } else {
        const decay = Math.pow(0.978, timeScale);
        state.vx =
          state.autoScrollSpeed + (state.vx - state.autoScrollSpeed) * decay;
        state.scrollX += state.vx * timeScale;
      }

      // 2) Loop wrap calculation
      const wrapCenter =
        state.viewportWidth / 2 - numOriginal * cardSpacing - cardWidth / 2;
      const setLength = numOriginal * cardSpacing;

      if (state.scrollX < wrapCenter - setLength / 2) {
        state.scrollX += setLength;
        state.targetScrollX += setLength;
        if (state.isDragging) state.dragStartScrollX += setLength;
        state.lastNearestIndex += numOriginal;
      } else if (state.scrollX > wrapCenter + setLength / 2) {
        state.scrollX -= setLength;
        state.targetScrollX -= setLength;
        if (state.isDragging) state.dragStartScrollX -= setLength;
        state.lastNearestIndex -= numOriginal;
      }

      // 3) Render Track Translation
      trackRef.current.style.transform = `translate3d(${state.scrollX}px, 0, 0)`;

      // 4) Render 3D Cylinder projection
      const radius = Math.max(550, state.viewportWidth * 0.55);
      const cards = trackRef.current.children;

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (!card) continue;

        const cardCenter = state.scrollX + i * cardSpacing + cardWidth / 2;
        const offsetFromCenter = cardCenter - state.viewportWidth / 2;
        const theta = offsetFromCenter / radius;

        const transX = radius * Math.sin(theta) - offsetFromCenter;
        const transZ = radius * (1 - Math.cos(theta)) * 1.25;
        const transY = Math.min(12, Math.max(-12, state.vx * 0.22));
        const rotY = -theta * (180 / Math.PI) * 1.15;

        const scale =
          1 +
          Math.max(
              0,
              Math.min(
                  (Math.abs(offsetFromCenter) / (state.viewportWidth / 2 || 400)) * 0.22,
                  0.32
              )
          );

        const rotY_final = rotY + state.vx * 0.45;
        const rotZ_final = state.vx * 0.24;
        const rotX_final = -Math.min(15, Math.max(-15, Math.abs(state.vx) * 0.35));

        card.style.transform = `translate3d(${transX}px, ${transY}px, ${transZ}px) rotateX(${rotX_final}deg) rotateY(${rotY_final}deg) rotateZ(${rotZ_final}deg) scale(${scale})`;

        const newZIndex = Math.round(1000 - Math.abs(offsetFromCenter));

        const normalizedOffsetAbs =
          Math.abs(offsetFromCenter) / (state.viewportWidth / 2 || 400);

        let opacity = 1;
        if (normalizedOffsetAbs > 0.6) {
          opacity = Math.max(
            0,
            Math.min(1, (0.96 - normalizedOffsetAbs) / (0.96 - 0.6))
          );
        }

        card.style.opacity = opacity;

        const newVisibility = opacity <= 0 ? "hidden" : "visible";
        const newPointerEvents = opacity < 0.18 ? "none" : "auto";

        // Only write zIndex, visibility, pointerEvents when changed (expensive discrete props)
        const prev = prevCardState.current[i];
        if (!prev || prev.zIndex !== newZIndex || prev.visibility !== newVisibility || prev.pointerEvents !== newPointerEvents) {
          if (!prev || prev.zIndex !== newZIndex) card.style.zIndex = newZIndex;
          if (!prev || prev.visibility !== newVisibility) card.style.visibility = newVisibility;
          if (!prev || prev.pointerEvents !== newPointerEvents) card.style.pointerEvents = newPointerEvents;
          prevCardState.current[i] = { zIndex: newZIndex, visibility: newVisibility, pointerEvents: newPointerEvents };
        }
      }

      // 5) Sound Tick checks (only when dragging)
      const currentNearestIndex = Math.round(
        (state.viewportWidth / 2 - state.scrollX - cardWidth / 2) / cardSpacing
      );

      if (currentNearestIndex !== state.lastNearestIndex) {
        if (state.isDragging) {
          // no clickTick emission in skills
        }
        state.lastNearestIndex = currentNearestIndex;
      }

      // Loop handled by gsap.ticker
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        gsap.ticker.remove(tick);
      } else {
        gsap.ticker.add(tick);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    gsap.ticker.add(tick);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      gsap.ticker.remove(tick);
    };
  }, [isMobile, numOriginal, cardSpacing, activePage, revealed]);

  // Attach/detach global drag listeners lazily (only while dragging)
  const attachGlobalListeners = useCallback(() => {
    const { onMove, onUp } = handlersRef.current;
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  }, []);

  const detachGlobalListeners = useCallback(() => {
    const { onMove, onUp } = handlersRef.current;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
    window.removeEventListener("touchmove", onMove);
    window.removeEventListener("touchend", onUp);
  }, []);

  // Pointer event handlers
  const handlePointerDown = (e) => {
    const state = stateRef.current;
    if (isMobile) return;
    if (e.type === "mousedown" && e.button !== 0) return;

    state.isDragging = true;
    state.dragged = false;

    const clientX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
    state.startX = clientX;
    state.lastPointerX = clientX;
    state.lastPointerTime = performance.now();
    state.dragStartScrollX = state.scrollX;
    state.targetScrollX = state.scrollX;

    attachGlobalListeners();
  };

  const handlePointerMove = (e) => {
    const state = stateRef.current;
    if (isMobile || !state.isDragging) return;

    const clientX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - state.startX;

    if (Math.abs(deltaX) > 5) {
      state.dragged = true;
      if (e.cancelable) {
        e.preventDefault();
      }
    }

    // Drag ticking audio haptics
    if (Math.abs(clientX - state.lastPointerX) > 1.5 && Math.random() < 0.16) {
      playSFX("drag");
    }

    state.lastPointerX = clientX;
    state.lastPointerTime = performance.now();
    state.targetScrollX = state.dragStartScrollX + deltaX;
  };

  const handlePointerUp = () => {
    const state = stateRef.current;
    if (!state.isDragging) return;
    state.isDragging = false;

    // Cap velocity
    const maxReleaseVelocity = 28;
    state.vx = Math.max(-maxReleaseVelocity, Math.min(state.vx, maxReleaseVelocity));

    detachGlobalListeners();
  };

  // Keep handler refs current so lazy listeners always call latest closures
  useEffect(() => {
    handlersRef.current.onMove = handlePointerMove;
    handlersRef.current.onUp = handlePointerUp;
  });

  // Cleanup global listeners on unmount in case unmount happens mid-drag
  useEffect(() => {
    return () => detachGlobalListeners();
  }, [detachGlobalListeners]);

  // Render cards sets (Left clones, Original center, Right clones)
  const renderCard = (skill, index, isCloned = false) => {
    return (
      <div
        key={`${skill.title}-${index}-${isCloned ? "cloned" : "orig"}`}
        className={`${styles.carouselCard} ${isCloned ? "cloned" : ""}`}
      >
        {/* Tape strips for sketchy aesthetic */}
        <div className="card-tape"></div>

        {/* Dynamic Visual SVGs */}
        <div className={styles.cardVisual} dangerouslySetInnerHTML={{ __html: skill.visualHtml }} />

        {/* Skill Card name header */}
        <div className={styles.cardInfo}>
          <h3>{skill.title}</h3>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.skillsSection} id="section-skills">
      <div className={styles.sectionHeader}>
        <h2 ref={titleRef}>Technologies I can work with...</h2>
        <div className={styles.headerLine}></div>
      </div>

      <div
        className={styles.carouselViewport}
        ref={viewportRef}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <div className={styles.carouselTrack} ref={trackRef}>
          {/* Duplicate set 1 (Left clones) */}
          {SKILLS_DATA.map((skill, index) => renderCard(skill, index, true))}

          {/* Core Set */}
          {SKILLS_DATA.map((skill, index) => renderCard(skill, index, false))}

          {/* Duplicate set 2 (Right clones) */}
          {SKILLS_DATA.map((skill, index) => renderCard(skill, index, true))}
        </div>
      </div>
    </div>
  );
}

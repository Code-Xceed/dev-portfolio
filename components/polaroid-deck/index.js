"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useAudio } from "../../context/audio-context";
import styles from "./polaroid-deck.module.css";

export default function PolaroidDeck() {
  const { playSFX } = useAudio();
  const [depths, setDepths] = useState([0, 1, 2]); // depths[0]: Card 1, depths[1]: Card 2, depths[2]: Card 3
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [draggingActive, setDraggingActive] = useState(false);
  
  const activeIndexRef = useRef(0);
  const cardRefs = useRef([]);

  // State refs for dragging coords
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragCurrentRef = useRef({ x: 0, y: 0 });
  const dragLastRef = useRef({ x: 0, y: 0 });
  const dragVelocityRef = useRef({ x: 0, y: 0 });

  const baseAngle = -3;

  useEffect(() => {
    activeIndexRef.current = depths.indexOf(0);
    // Clear all inline styles only after React commits the new DOM attributes (prevents flickering)
    cardRefs.current.forEach((el) => {
      if (el) {
        gsap.set(el, { clearProps: "all" });
      }
    });
  }, [depths]);

  const startDrag = useCallback((clientX, clientY) => {
    if (isAnimating) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    
    dragStartRef.current = { x: clientX, y: clientY };
    dragCurrentRef.current = { x: 0, y: 0 };
    dragLastRef.current = { x: clientX, y: clientY };
    dragVelocityRef.current = { x: 0, y: 0 };

    playSFX("hold");

    const activeCard = cardRefs.current[activeIndexRef.current];
    if (activeCard) {
      activeCard.style.cursor = "grabbing";
    }

    setDraggingActive(true);
  }, [isAnimating, playSFX]);

  const handleDrag = useCallback((clientX, clientY) => {
    if (!isDraggingRef.current) return;

    const currentX = clientX - dragStartRef.current.x;
    const currentY = clientY - dragStartRef.current.y;
    dragCurrentRef.current = { x: currentX, y: currentY };

    // Calculate drag velocity
    const vx = clientX - dragLastRef.current.x;
    const vy = clientY - dragLastRef.current.y;
    dragVelocityRef.current = { x: vx, y: vy };
    dragLastRef.current = { x: clientX, y: clientY };

    const activeCard = cardRefs.current[activeIndexRef.current];
    if (activeCard) {
      // Dynamic rotation with slight inertia
      const angle = baseAngle + currentX * 0.1;
      gsap.set(activeCard, {
        x: currentX,
        y: currentY,
        rotation: angle,
      });
    }
  }, [baseAngle]);

  const endDrag = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    setDraggingActive(false);

    const activeCard = cardRefs.current[activeIndexRef.current];
    if (!activeCard) return;

    activeCard.style.cursor = "grab";

    const { x: currentX, y: currentY } = dragCurrentRef.current;
    const distance = Math.sqrt(currentX * currentX + currentY * currentY);
    const isClick = distance < 4;
    const threshold = 16; // Low threshold

    if (distance > threshold || isClick) {
      // START REFINE SWIPE CYCLE
      setIsAnimating(true);

      let exitX, exitY, exitRot;
      if (isClick) {
        exitX = 240;
        exitY = -90;
        exitRot = 12;
      } else {
        const angleRad = Math.atan2(currentY, currentX);
        // Throw card slightly out of the stack (increased distance to fully clear deck)
        exitX = Math.cos(angleRad) * 240;
        exitY = Math.sin(angleRad) * 240;
        exitRot = baseAngle + currentX * 0.1;
      }

      // Animate next cards immediately to bridge depths gap (slower and calmer)
      const nextTopIndex = depths.indexOf(1);
      const nextTopCard = cardRefs.current[nextTopIndex];
      if (nextTopCard) {
        gsap.to(nextTopCard, {
          x: 0,
          y: 0,
          scale: 1.0,
          rotation: baseAngle,
          duration: 0.6,
          ease: "power3.out",
        });
      }

      const nextMiddleIndex = depths.indexOf(2);
      const nextMiddleCard = cardRefs.current[nextMiddleIndex];
      if (nextMiddleCard) {
        gsap.to(nextMiddleCard, {
          x: 12,
          y: 14,
          scale: 0.95,
          rotation: 4,
          duration: 0.6,
          ease: "power3.out",
        });
      }

      // Unified timeline for continuous and smooth going/returning card animation
      const cycleTimeline = gsap.timeline({
        onComplete: () => {
          // Update actual state depths at the very end
          setDepths((prev) => prev.map((d) => (d + 2) % 3));
          setIsAnimating(false);
        }
      });

      // Step 1: Smoothly slide card completely out of the deck
      cycleTimeline.to(activeCard, {
        x: exitX,
        y: exitY,
        rotation: exitRot,
        opacity: 0.95,
        scale: 1.02,
        zIndex: 12, // Keep fully on top
        duration: 0.4,
        ease: "power2.out",
      });

      // Step 2: Instant z-index drop at the peak of slide out
      cycleTimeline.set(activeCard, {
        zIndex: 4,
      });

      // Step 3: Glide card smoothly back into the back of stack (depth 2 position)
      cycleTimeline.to(activeCard, {
        x: -12,
        y: 24,
        scale: 0.9,
        opacity: 0.86,
        rotation: -6,
        duration: 0.65,
        ease: "power3.out",
      });

    } else {
      // Snap card back to active position - smooth snap
      gsap.to(activeCard, {
        x: 0,
        y: 0,
        rotation: baseAngle,
        duration: 0.45,
        ease: "power3.out",
        onComplete: () => {
          gsap.set(activeCard, { clearProps: "all" });
        },
      });
    }
  }, [depths, isAnimating, baseAngle, playSFX]);

  // Attach global event listeners
  useEffect(() => {
    if (!draggingActive) return;

    const handleMouseMove = (e) => {
      handleDrag(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      endDrag();
    };

    const handleTouchMove = (e) => {
      if (e.touches.length !== 1) return;
      handleDrag(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
      endDrag();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [draggingActive, depths, isAnimating]);

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  };

  const onTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
  };

  const transitionClass = isDragging || isAnimating ? styles.noTransition : "";

  return (
    <div className={styles.deckContainer}>
      {/* Yellow Sticky Note instruction */}
      <div className={styles.postIt}>
        <div className={styles.tapeStrip}></div>
        <span>Swipe / Drag cards to flip deck! ✏️</span>
      </div>

      <div className={styles.polaroidDeck}>
        {/* Card 1: Origami Crane */}
        <div
          ref={(el) => { cardRefs.current[0] = el; }}
          className={`${styles.polaroidCard} ${transitionClass}`}
          data-depth={depths[0]}
          onMouseDown={depths[0] === 0 ? onMouseDown : undefined}
          onTouchStart={depths[0] === 0 ? onTouchStart : undefined}
        >
          <div className={styles.polaroidTape}></div>
          <div className={styles.photoFrame}>
            <div className={styles.fallbackVector}>
              <svg viewBox="0 0 200 200" fill="none" className={styles.blueprintVectorSvg}>
                <path d="M 10 100 H 190 M 100 10 V 190" stroke="var(--highlight-color)" strokeWidth="0.6" strokeDasharray="2 3" opacity="0.4" />
                <circle cx="100" cy="100" r="70" stroke="var(--border-color)" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.25" />
                <path d="M 100 30 L 70 110 L 100 160 L 130 110 Z" stroke="var(--border-color)" strokeWidth="1.2" opacity="0.8" />
                <path d="M 70 110 L 100 110 L 130 110 M 100 30 L 100 160" stroke="var(--border-color)" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.6" />
                <path d="M 70 110 L 40 140 L 48 100 Z" stroke="var(--highlight-color)" strokeWidth="1.2" fill="rgba(var(--border-rgb), 0.02)" />
                <path d="M 130 110 L 165 130 L 160 118" stroke="var(--highlight-color)" strokeWidth="1.2" />
                <path d="M 100 30 L 60 70 L 100 110 L 140 70 L 100 30" stroke="var(--border-color)" strokeWidth="1" opacity="0.75" />
                <circle cx="100" cy="30" r="2.5" fill="var(--highlight-color)" />
                <circle cx="100" cy="160" r="2.5" fill="var(--highlight-color)" />
              </svg>
            </div>
          </div>
          <div className={styles.caption}>
            <span>Origami Crane</span>
            <span className={styles.captionStatus}>[ 01/03 ]</span>
          </div>
        </div>

        {/* Card 2: Cyber Mesh */}
        <div
          ref={(el) => { cardRefs.current[1] = el; }}
          className={`${styles.polaroidCard} ${transitionClass}`}
          data-depth={depths[1]}
          onMouseDown={depths[1] === 0 ? onMouseDown : undefined}
          onTouchStart={depths[1] === 0 ? onTouchStart : undefined}
        >
          <div className={styles.polaroidTape}></div>
          <div className={styles.photoFrame}>
            <div className={styles.fallbackVector}>
              <svg viewBox="0 0 200 200" fill="none" className={styles.blueprintVectorSvg}>
                <path d="M 10 160 L 100 70 L 190 160 M 35 160 L 100 70 L 165 160 M 60 160 L 100 70 L 140 160 M 80 160 L 100 70 L 120 160 M 100 160 V 70" stroke="var(--border-color)" strokeWidth="0.8" opacity="0.4" />
                <path d="M 10 160 Q 100 175, 190 160 M 22 140 Q 100 152, 178 140 M 35 120 Q 100 130, 165 120 M 50 100 Q 100 108, 150 100 M 68 85 Q 100 90, 132 85" stroke="var(--border-color)" strokeWidth="0.8" opacity="0.5" />
                <circle cx="100" cy="70" r="28" stroke="var(--highlight-color)" strokeWidth="1.5" strokeDasharray="6 2" />
                <circle cx="100" cy="70" r="20" fill="rgba(var(--border-rgb), 0.01)" stroke="var(--highlight-color)" strokeWidth="1" />
                <path d="M 100 35 V 20 M 135 70 H 150 M 65 70 H 50 M 125 45 L 135 35 M 75 45 L 65 35" stroke="var(--highlight-color)" strokeWidth="1" opacity="0.7" />
              </svg>
            </div>
          </div>
          <div className={styles.caption}>
            <span>Cyber Mesh</span>
            <span className={styles.captionStatus}>[ 02/03 ]</span>
          </div>
        </div>

        {/* Card 3: Celestial Rings */}
        <div
          ref={(el) => { cardRefs.current[2] = el; }}
          className={`${styles.polaroidCard} ${transitionClass}`}
          data-depth={depths[2]}
          onMouseDown={depths[2] === 0 ? onMouseDown : undefined}
          onTouchStart={depths[2] === 0 ? onTouchStart : undefined}
        >
          <div className={styles.polaroidTape}></div>
          <div className={styles.photoFrame}>
            <div className={styles.fallbackVector}>
              <svg viewBox="0 0 200 200" fill="none" className={styles.blueprintVectorSvg}>
                <circle cx="100" cy="100" r="75" stroke="var(--border-color)" strokeWidth="1.5" strokeDasharray="10 4 2 4" className={styles.spinningRingCw} />
                <circle cx="100" cy="100" r="50" stroke="var(--highlight-color)" strokeWidth="1.2" strokeDasharray="6 3" className={styles.spinningRingCcw} />
                <circle cx="100" cy="100" r="62" stroke="var(--border-color)" strokeWidth="0.6" opacity="0.4" />
                <circle cx="100" cy="100" r="38" stroke="var(--border-color)" strokeWidth="0.6" opacity="0.4" />
                <path d="M 25 100 H 175 M 100 25 V 175" stroke="var(--border-color)" strokeWidth="0.8" opacity="0.3" />
                <circle cx="100" cy="50" r="2.5" fill="var(--highlight-color)" />
                <circle cx="100" cy="150" r="2.5" fill="var(--highlight-color)" />
                <circle cx="50" cy="100" r="2.5" fill="var(--highlight-color)" />
                <circle cx="150" cy="100" r="2.5" fill="var(--highlight-color)" />
                <g className={styles.orbitGroup}>
                  <circle cx="100" cy="38" r="5" fill="var(--highlight-color)" stroke="var(--border-color)" strokeWidth="1" />
                </g>
              </svg>
            </div>
          </div>
          <div className={styles.caption}>
            <span>Celestial Rings</span>
            <span className={styles.captionStatus}>[ 03/03 ]</span>
          </div>
        </div>
      </div>
    </div>
  );
}

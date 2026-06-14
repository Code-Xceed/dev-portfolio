"use client";

import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useAudio } from "../../context/audio-context";
import styles from "./paper-emoji-keychain.module.css";

const MOOD_MESSAGES = {
  0: ["yay!", "happy coder!", "love it!", "drawing!", "sketching!", "hello!"],
  1: ["whoop!", "excited!", "Ameen mode!", "let's build!", "super cool!"],
  2: ["wink! 😉", "cool!", "playful!", "sketchy tech!", "awesome!"],
  3: ["whoa!", "oh!", "wow!", "physics!", "vector?!"],
  4: ["click me?", "what's there?", "studying...", "designing..."],
};

export default function PaperEmojiKeychain() {
  const { playSFX } = useAudio();
  const [stateIndex, setStateIndex] = useState(0);
  const [draggingActive, setDraggingActive] = useState(false);

  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const shadowRef = useRef(null);
  const bubbleRef = useRef(null);
  const bubbleTextRef = useRef(null);
  const faceGroupRef = useRef(null);
  const emojiSvgRef = useRef(null);
  const chainContainerRef = useRef(null);
  const sheetRef = useRef(null);
  const isVisibleRef = useRef(true);

  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const startMouseRef = useRef({ x: 0, y: 0 });
  const prevSwingAngleRef = useRef(0);
  const swingAngleRef = useRef(0);
  const swingVelocityRef = useRef(0);

  const stretchRef = useRef(1);
  const stretchVelocityRef = useRef(0);
  const translateYRef = useRef(0);
  const mousePosRef = useRef({ x: 0, y: 0 });

  const gravity = 0.0055;
  const friction = 0.98;

  // Cache drawing-sheet element on mount
  useEffect(() => {
    sheetRef.current = document.getElementById('drawing-sheet');
  }, []);

  // IntersectionObserver to pause rAF when off-screen
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 1. Drag & Swing Pendulum Physics Loop
  useEffect(() => {
    let animId;
    const updatePendulum = () => {
      // Skip physics when off-screen but keep scheduling frames
      if (!isVisibleRef.current) {
        animId = requestAnimationFrame(updatePendulum);
        return;
      }

      if (!isDraggingRef.current) {
        const accel = -gravity * Math.sin(swingAngleRef.current);
        swingVelocityRef.current += accel;
        swingVelocityRef.current *= friction;
        swingAngleRef.current += swingVelocityRef.current;
      }

      // Physics for tension/stretch
      let targetStretch = 1;
      let targetTranslateY = 0;

      if (isDraggingRef.current) {
        let anchorX = window.innerWidth - 68;
        let anchorY = 38;
        const sheet = sheetRef.current;
        if (sheet) {
          const sheetRect = sheet.getBoundingClientRect();
          const isMobile = window.innerWidth <= 768;
          anchorX = sheetRect.right - (isMobile ? 55 : 80);
          anchorY = sheetRect.top + 14;
        }
        const dx = mousePosRef.current.x - anchorX;
        const dy = mousePosRef.current.y - anchorY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const restingLength = 70;
        if (dist > restingLength) {
          const excess = dist - restingLength;
          targetStretch = 1 + Math.min(0.22, excess * 0.0018);
          targetTranslateY = Math.min(12, excess * 0.1);
        }
      }

      // Spring formula for stretch
      const springK = 0.15;
      const springDamping = 0.82;
      const stretchForce = (targetStretch - stretchRef.current) * springK;
      stretchVelocityRef.current += stretchForce;
      stretchVelocityRef.current *= springDamping;
      stretchRef.current += stretchVelocityRef.current;

      // Lerp translation
      translateYRef.current += (targetTranslateY - translateYRef.current) * 0.15;

      const degrees = swingAngleRef.current * (180 / Math.PI);
      if (containerRef.current) {
        containerRef.current.style.transform = `rotate(${degrees}deg)`;
        containerRef.current.style.transformOrigin = 'center -50px';
      }

      if (chainContainerRef.current) {
        chainContainerRef.current.style.transform = `scaleY(${stretchRef.current})`;
        chainContainerRef.current.style.transformOrigin = 'center top';
      }

      if (wrapperRef.current) {
        const emojiScaleY = 1 + (stretchRef.current - 1) * 0.45;
        const emojiScaleX = 1 - (stretchRef.current - 1) * 0.35;
        wrapperRef.current.style.transform = `translateY(${translateYRef.current}px) scaleX(${emojiScaleX}) scaleY(${emojiScaleY})`;
      }

      animId = requestAnimationFrame(updatePendulum);
    };

    updatePendulum();
    return () => cancelAnimationFrame(animId);
  }, []);

  // 2. Dynamic event binding only during active drag state
  useEffect(() => {
    if (!draggingActive) return;

    const handleMouseMove = (e) => {
      const clientX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.startsWith("touch") ? e.touches[0].clientY : e.clientY;

      mousePosRef.current = { x: clientX, y: clientY };

      const distMoved = Math.sqrt(
        (clientX - startMouseRef.current.x) ** 2 +
          (clientY - startMouseRef.current.y) ** 2
      );

      if (distMoved > 6) {
        hasDraggedRef.current = true;
      }

      // Calculate anchor coordinate (top chain link hanging point)
      let anchorX = window.innerWidth - 68;
      let anchorY = 38;

      const sheet = sheetRef.current;
      if (sheet) {
        const sheetRect = sheet.getBoundingClientRect();
        const isMobile = window.innerWidth <= 768;
        anchorX = sheetRect.right - (isMobile ? 55 : 80);
        anchorY = sheetRect.top + 14;
      }

      const mouseDx = clientX - anchorX;
      const mouseDy = clientY - anchorY;

      const targetAngle = -Math.atan2(mouseDx, mouseDy);

      prevSwingAngleRef.current = swingAngleRef.current;
      // Interpolate angle to make the dragging feel heavy/laggy
      const lerpFactor = 0.055;
      const targetLimited = Math.max(-0.7, Math.min(0.7, targetAngle));
      swingAngleRef.current += (targetLimited - swingAngleRef.current) * lerpFactor;
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      if (containerRef.current) {
        containerRef.current.classList.remove(styles.dragging);
      }

      if (hasDraggedRef.current) {
        swingVelocityRef.current = swingAngleRef.current - prevSwingAngleRef.current;
        swingVelocityRef.current = Math.max(-0.05, Math.min(0.05, swingVelocityRef.current));
      } else {
        swingVelocityRef.current = 0;
      }

      // Trigger cleanup of drag handlers
      setDraggingActive(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });
    window.addEventListener("touchmove", handleMouseMove, { passive: true });
    window.addEventListener("touchend", handleMouseUp, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [draggingActive]);

  const startDrag = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    hasDraggedRef.current = false;

    const clientX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.startsWith("touch") ? e.touches[0].clientY : e.clientY;

    startMouseRef.current = { x: clientX, y: clientY };
    mousePosRef.current = { x: clientX, y: clientY };
    swingVelocityRef.current = 0;

    if (containerRef.current) {
      containerRef.current.classList.add(styles.dragging);
    }

    setDraggingActive(true);
  };

  // 3. Pointer Look-At Effects (Mouse Move Parallax)
  useEffect(() => {
    const handlePointerLook = (e) => {
      if (window.innerWidth <= 768 || isDraggingRef.current) return;
      if (!emojiSvgRef.current || !faceGroupRef.current) return;

      const rect = emojiSvgRef.current.getBoundingClientRect();
      const emojiX = rect.left + rect.width / 2;
      const emojiY = rect.top + rect.height / 2;

      const dx = e.clientX - emojiX;
      const dy = e.clientY - emojiY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 500) return; // Skip expensive calculations when mouse is far away


      const maxTrackDist = Math.min(window.innerWidth, window.innerHeight) * 0.8;
      const intensity = Math.min(dist / maxTrackDist, 1.0);
      const angle = Math.atan2(dy, dx);

      const maxRotX = 20;
      const maxRotY = 22;

      const targetRotY = Math.cos(angle) * maxRotY * intensity;
      const targetRotX = -12 + Math.sin(angle) * maxRotX * intensity;

      gsap.to(emojiSvgRef.current, {
        transform: `perspective(150px) rotateX(${targetRotX}deg) rotateY(${targetRotY}deg)`,
        duration: 0.25,
        ease: "power2.out",
      });

      const maxTranslation = 5.5;
      const targetFaceX = Math.cos(angle) * maxTranslation * intensity;
      const targetFaceY = Math.sin(angle) * maxTranslation * intensity;

      gsap.to(faceGroupRef.current, {
        x: targetFaceX,
        y: targetFaceY,
        duration: 0.25,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      if (!emojiSvgRef.current || !faceGroupRef.current) return;
      gsap.to(emojiSvgRef.current, {
        transform: "perspective(150px) rotateX(-12deg) rotateY(0deg)",
        duration: 0.5,
        ease: "power2.out",
      });
      gsap.to(faceGroupRef.current, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handlePointerLook, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handlePointerLook);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // 4. Click Mood Toggles
  const handleEmojiClick = (e) => {
    e.stopPropagation();
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

    playSFX("emoji");
    const nextMood = (stateIndex + 1) % 5;
    setStateIndex(nextMood);

    // Cute jump shock animation for mood index 3 (Surprised)
    if (nextMood === 3 && wrapperRef.current && shadowRef.current) {
      gsap.killTweensOf(wrapperRef.current);
      gsap
        .timeline()
        .to(wrapperRef.current, {
          y: -10,
          scaleX: 0.9,
          scaleY: 1.1,
          duration: 0.12,
          ease: "power2.out",
        })
        .to(wrapperRef.current, {
          y: 0,
          scaleX: 1.05,
          scaleY: 0.95,
          duration: 0.15,
          ease: "power2.in",
        })
        .to(wrapperRef.current, {
          scaleX: 1,
          scaleY: 1,
          duration: 0.25,
          ease: "elastic.out(1, 0.5)",
        });

      gsap
        .timeline()
        .to(shadowRef.current, {
          scaleX: 0.6,
          opacity: 0.25,
          duration: 0.12,
          ease: "power2.out",
        })
        .to(shadowRef.current, {
          scaleX: 1,
          opacity: 1,
          duration: 0.15,
          ease: "power2.in",
        });
    }

    // Trigger Speech bubble popup
    if (bubbleRef.current && bubbleTextRef.current) {
      const activePhrases = MOOD_MESSAGES[nextMood];
      const phrase = activePhrases[Math.floor(Math.random() * activePhrases.length)];
      bubbleTextRef.current.innerText = phrase;

      gsap.killTweensOf(bubbleRef.current);
      gsap
        .timeline()
        .to(bubbleRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.22,
          ease: "back.out(1.6)",
        })
        .to(
          bubbleRef.current,
          {
            opacity: 0,
            scale: 0.6,
            duration: 0.2,
            ease: "power2.in",
          },
          "+=1.3"
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className={styles.paper3dEmojiContainer}
      onMouseDown={startDrag}
      onTouchStart={startDrag}
    >
      {/* Sketched chain links */}
      <div ref={chainContainerRef} className={styles.keychainLinks}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.chainLink} />
        ))}
      </div>

      <div className={styles.emojiInteractiveGroup}>
        {/* Floor shadow */}
        <div ref={shadowRef} className={styles.emojiShadow} id="emoji-shadow" />

        <div ref={wrapperRef} className={styles.emojiWrapper} id="emoji-wrapper">
          <div
            className={styles.paper3dEmoji}
            id="paper-3d-emoji"
            onClick={handleEmojiClick}
          >
            {/* Background wobbly sketch guides */}
            <svg
              viewBox="0 0 50 50"
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 1,
                overflow: "visible",
              }}
            >
              <defs>
                <pattern
                  id="pencil-hatch"
                  width="4"
                  height="4"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="4"
                    strokeWidth="0.65"
                    opacity="0.22"
                    style={{ stroke: "var(--text-color)" }}
                  />
                </pattern>
              </defs>
              <circle cx="25" cy="25" r="23" fill="url(#pencil-hatch)" />
              <circle
                cx="25"
                cy="25"
                r="23"
                strokeWidth="1.2"
                fill="none"
                opacity="0.85"
                strokeDasharray="140 10 90 20"
                style={{ stroke: "var(--text-color)" }}
              />
              <circle
                cx="25"
                cy="25"
                r="22.5"
                strokeWidth="0.8"
                fill="none"
                opacity="0.6"
                strokeDasharray="60 30 110 10"
                transform="rotate(45 25 25)"
                style={{ stroke: "var(--text-color)" }}
              />
              <circle
                cx="25"
                cy="25"
                r="23.5"
                strokeWidth="0.6"
                fill="none"
                opacity="0.4"
                strokeDasharray="80 40"
                transform="rotate(-30 25 25)"
                style={{ stroke: "var(--text-color)" }}
              />
            </svg>

            {/* Sketched Face elements (clipped inside circle) */}
            <div className={styles.emojiFaceClip}>
              <svg ref={emojiSvgRef} viewBox="0 0 50 50" className={styles.emojiSvg}>
                <g ref={faceGroupRef} className={styles.emojiFaceGroup}>
                  {/* EYES */}
                  <g className="eyes-group">
                    <circle
                      cx="18"
                      cy="20"
                      r="4.2"
                      style={{ fill: "var(--text-color)", opacity: stateIndex === 4 ? 1 : 0 }}
                    />
                    <circle
                      cx="32"
                      cy="20"
                      r="4.2"
                      style={{ fill: "var(--text-color)", opacity: stateIndex === 4 || stateIndex === 2 ? 1 : 0 }}
                    />
                    <circle
                      cx="17"
                      cy="16"
                      r="3.2"
                      style={{ fill: "var(--text-color)", opacity: stateIndex === 3 ? 1 : 0 }}
                    />
                    <circle
                      cx="33"
                      cy="16"
                      r="3.2"
                      style={{ fill: "var(--text-color)", opacity: stateIndex === 3 ? 1 : 0 }}
                    />
                    {/* Happy / excited eyes (curves) */}
                    <path
                      d="M 14 21 C 14 17, 20 17, 20 21"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      style={{ stroke: "var(--text-color)", fill: "none", opacity: stateIndex === 0 || stateIndex === 1 ? 1 : 0 }}
                    />
                    <path
                      d="M 30 21 C 30 17, 36 17, 36 21"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      style={{ stroke: "var(--text-color)", fill: "none", opacity: stateIndex === 0 || stateIndex === 1 ? 1 : 0 }}
                    />
                    {/* Wink Left Eye */}
                    <path
                      d="M 14 20 L 20 20"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      style={{ stroke: "var(--text-color)", fill: "none", opacity: stateIndex === 2 ? 1 : 0 }}
                    />
                  </g>

                  {/* MOUTHS */}
                  <g className="mouths-group">
                    {/* Default line mouth */}
                    <path
                      d="M 18 33 C 18 29, 32 29, 32 33"
                      strokeWidth="3"
                      strokeLinecap="round"
                      style={{ stroke: "var(--text-color)", fill: "none", opacity: stateIndex === 4 ? 1 : 0 }}
                    />
                    {/* Surprised circle mouth */}
                    <circle
                      cx="25"
                      cy="32"
                      r="4.2"
                      style={{ fill: "var(--text-color)", opacity: stateIndex === 3 ? 1 : 0 }}
                    />
                    {/* Happy smile mouth */}
                    <path
                      d="M 18 29 C 18 36, 32 36, 32 29"
                      strokeWidth="3"
                      strokeLinecap="round"
                      style={{ stroke: "var(--text-color)", fill: "none", opacity: stateIndex === 0 || stateIndex === 2 ? 1 : 0 }}
                    />
                    {/* Excited open mouth */}
                    <path
                      d="M 17 28 C 17 38, 33 38, 33 28 Z"
                      strokeWidth="1.8"
                      style={{ fill: "var(--text-color)", stroke: "var(--text-color)", opacity: stateIndex === 1 ? 1 : 0 }}
                    />
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Speech bubble */}
      <div ref={bubbleRef} className={styles.emojiBubble} id="emoji-bubble">
        <span ref={bubbleTextRef} className="bubble-text">
          click!!
        </span>
        <span className={styles.bubbleSpark}>✦</span>
      </div>
    </div>
  );
}

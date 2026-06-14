"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { useAudio } from "../../context/audio-context";
import { TextScramble } from "../../utils/text-scramble";
import styles from "./projects-section.module.css";

const PROJECTS_DATA = [
  {
    title: "VIBEENGINE 3D",
    text: "A custom WebGL wireframe rendering engine designed to project complex 3D geometry onto a wobbly hand-drawn graph canvas, supporting real-time camera rotations, dynamic depth-sorting, and sketch line displacement shaders.",
    skills: ["WebGL", "GLSL", "Three.js", "Canvas 2D", "Linear Algebra"],
    dwg: "Interactive 3D",
    scale: "Build V1.0",
    svg: (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.blueprintVectorSvg}>
        <path d="M 10 100 H 190 M 100 10 V 190" stroke="var(--highlight-color)" strokeWidth="0.6" strokeDasharray="2 3" opacity="0.4" />
        <path d="M 60 70 L 100 45 L 140 70 L 100 95 Z" stroke="var(--border-color)" strokeWidth="1.2" />
        <path d="M 60 130 L 100 105 L 140 130 L 100 155 Z" stroke="var(--border-color)" strokeWidth="1.2" />
        <path d="M 60 70 V 130 M 100 45 V 105 M 140 70 V 130 M 100 95 V 155" stroke="var(--border-color)" strokeWidth="1.2" />
        <path d="M 100 95 L 160 55" stroke="var(--highlight-color)" strokeWidth="1.2" strokeDasharray="3 2" />
        <circle cx="160" cy="55" r="3" fill="var(--highlight-color)" />
      </svg>
    )
  },
  {
    title: "GRAPHITE PAINT",
    text: "A custom 2D canvas drawing system simulating graphite lead texture and friction. Features realistic charcoal smudge physics, soft pressure-sensitive brush trails, and an interactive coffee-ring stain eraser.",
    skills: ["Canvas 2D", "Pointer Events", "CSS Filters", "JavaScript"],
    dwg: "Canvas Physics",
    scale: "Build V1.1",
    svg: (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.blueprintVectorSvg}>
        <path d="M 20 150 Q 60 40, 100 150 T 180 150" stroke="var(--border-color)" strokeWidth="1.5" />
        <path d="M 20 150 Q 60 80, 100 110 T 180 150" stroke="var(--highlight-color)" strokeWidth="1.0" strokeDasharray="4 2" />
        <circle cx="60" cy="95" r="4" fill="var(--highlight-color)" />
        <circle cx="140" cy="130" r="4" fill="var(--border-color)" />
        <path d="M 140 130 L 170 80 L 175 85 Z" fill="var(--paper-bg)" stroke="var(--border-color)" strokeWidth="1" />
        <path d="M 170 80 L 178 72" stroke="var(--border-color)" strokeWidth="2" />
      </svg>
    )
  },
  {
    title: "MACOS DOCK OS",
    text: "A high-fidelity recreative environment of the macOS desktop dock, utilizing real-time mathematical proximity zooming on hover, spring-damper physical scaling, and interactive sketch-drawn polaroid picture decks.",
    skills: ["HTML/CSS", "JavaScript", "Spring Physics", "DOM Animation"],
    dwg: "Interactive UI",
    scale: "Build V1.2",
    svg: (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.blueprintVectorSvg}>
        <circle cx="100" cy="140" r="50" stroke="var(--highlight-color)" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.4" />
        <circle cx="100" cy="140" r="30" stroke="var(--highlight-color)" strokeWidth="1.2" opacity="0.6" />
        <rect x="50" y="125" width="20" height="20" rx="3" stroke="var(--border-color)" strokeWidth="1.2" fill="var(--paper-bg)" />
        <rect x="75" y="110" width="30" height="30" rx="4" stroke="var(--border-color)" strokeWidth="1.5" fill="var(--paper-bg)" />
        <rect x="110" y="120" width="24" height="24" rx="3.5" stroke="var(--border-color)" strokeWidth="1.3" fill="var(--paper-bg)" />
        <rect x="140" y="128" width="16" height="16" rx="2" stroke="var(--border-color)" strokeWidth="1" fill="var(--paper-bg)" />
        <path d="M 90 120 L 90 90 L 96 90 L 96 115" stroke="var(--highlight-color)" strokeWidth="1.5" fill="none" />
      </svg>
    )
  },
  {
    title: "PHYSICS WAVE",
    text: "An interactive sine wave synthesizer visualizing acoustic wave interference, frequency harmonics, and damping in a pencil sketch style. Generates procedurally modulated audio frequencies using Web Audio API nodes.",
    skills: ["Web Audio API", "Canvas 2D", "DSP", "Math.js", "SVG"],
    dwg: "Web Audio DSP",
    scale: "Build V1.3",
    svg: (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.blueprintVectorSvg}>
        <path d="M 10 70 Q 50 120, 100 70 T 190 70" stroke="var(--border-color)" strokeWidth="1.2" />
        <path d="M 10 110 Q 50 60, 100 110 T 190 110" stroke="var(--highlight-color)" strokeWidth="1.2" />
        <path d="M 10 150 Q 50 190, 100 150 T 190 150" stroke="var(--border-color)" strokeWidth="0.8" opacity="0.5" />
      </svg>
    )
  },
  {
    title: "CYBER SKETCH",
    text: "A digital blueprint drafting environment utilizing custom coordinate mapping, snapping nodes, wobbly grid lines, and interactive technical specs cards. Built to blend mechanical CAD layouts with hand-drawn aesthetics.",
    skills: ["SVG", "CSS Grid", "JavaScript", "Vite", "HTML5"],
    dwg: "Vector Editor",
    scale: "Build V1.4",
    svg: (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.blueprintVectorSvg}>
        <rect x="25" y="25" width="150" height="150" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="25" y1="25" x2="175" y2="175" stroke="var(--highlight-color)" strokeWidth="1" />
        <line x1="175" y1="25" x2="25" y2="175" stroke="var(--highlight-color)" strokeWidth="1" />
        <circle cx="100" cy="100" r="50" stroke="var(--border-color)" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    title: "SOUNDSCAPE JS",
    text: "A Web Audio ambient synthesizer that generates immersive, procedurally modulated sonic environments. Features real-time frequency visualizers, interactive wobbly control knobs, and low-frequency oscillator filters.",
    skills: ["Web Audio API", "Canvas 2D", "OscillatorNode", "JavaScript"],
    dwg: "Synth System",
    scale: "Build V1.5",
    svg: (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.blueprintVectorSvg}>
        <rect x="20" y="40" width="160" height="120" rx="6" stroke="var(--border-color)" strokeWidth="1.2" />
        <path d="M 40 100 Q 60 40, 80 100 T 120 100 T 160 100" stroke="var(--highlight-color)" strokeWidth="1.5" />
        <line x1="40" y1="130" x2="160" y2="130" stroke="var(--border-color)" strokeWidth="0.8" strokeDasharray="2 3" />
        <circle cx="60" cy="130" r="4" fill="var(--border-color)" />
        <circle cx="100" cy="130" r="4" fill="var(--border-color)" />
        <circle cx="140" cy="130" r="4" fill="var(--highlight-color)" />
      </svg>
    )
  },
  {
    title: "PARTICLE ORBIT",
    text: "A wobbly gravitational particle orbit simulation with hand-sketched celestial trails, planetary gravity wells, and real-time n-body orbit paths. Users can drag and place masses to dynamically warp local space-time orbits.",
    skills: ["Canvas 2D", "N-Body Physics", "requestAnimationFrame", "Math"],
    dwg: "Space Simulator",
    scale: "Build V1.6",
    svg: (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.blueprintVectorSvg}>
        <circle cx="100" cy="100" r="8" fill="var(--highlight-color)" />
        <ellipse cx="100" cy="100" rx="60" ry="25" stroke="var(--border-color)" strokeWidth="0.8" strokeDasharray="3 3" transform="rotate(-15 100 100)" />
        <ellipse cx="100" cy="100" rx="85" ry="35" stroke="var(--border-color)" strokeWidth="0.6" strokeDasharray="4 2" transform="rotate(20 100 100)" />
        <circle cx="145" cy="85" r="4" fill="var(--border-color)" />
        <circle cx="50" cy="118" r="3" fill="var(--border-color)" />
      </svg>
    )
  },
  {
    title: "BLUEPRINT CAD",
    text: "An interactive vector mechanical design sandbox rendering structural isometric schematics, blueprint dimension markings, and grid constraints. Simulates wobbly ruler drafts, angle annotations, and blueprint seal stamps.",
    skills: ["SVG", "Isometric Math", "CSS Custom Props", "JavaScript"],
    dwg: "CAD Designer",
    scale: "Build V1.7",
    svg: (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.blueprintVectorSvg}>
        <rect x="35" y="45" width="130" height="90" stroke="var(--border-color)" strokeWidth="1.2" />
        <line x1="35" y1="150" x2="165" y2="150" stroke="var(--highlight-color)" strokeWidth="1" />
        <line x1="35" y1="145" x2="35" y2="155" stroke="var(--highlight-color)" strokeWidth="1" />
        <line x1="165" y1="145" x2="165" y2="155" stroke="var(--highlight-color)" strokeWidth="1" />
        <line x1="35" y1="45" x2="165" y2="135" stroke="var(--border-color)" strokeWidth="0.8" strokeDasharray="2 2" />
      </svg>
    )
  },
  {
    title: "KINETIC DRAFT",
    text: "A dynamic spring-mass physics simulator featuring wobbly nodes, elastic canvas meshes, and drag-and-drop structural anchors. Allows users to pull, stretch, and deform wobbly mechanical frameworks in real-time.",
    skills: ["Canvas 2D", "Verlet Physics", "Drag & Drop", "JavaScript"],
    dwg: "Mass Physics",
    scale: "Build V1.8",
    svg: (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.blueprintVectorSvg}>
        <circle cx="60" cy="60" r="6" fill="var(--border-color)" strokeWidth="1.2" />
        <circle cx="140" cy="60" r="6" fill="var(--border-color)" strokeWidth="1.2" />
        <circle cx="100" cy="130" r="8" fill="var(--highlight-color)" />
        <line x1="60" y1="60" x2="100" y2="130" stroke="var(--border-color)" strokeWidth="1.2" />
        <line x1="140" y1="60" x2="100" y2="130" stroke="var(--border-color)" strokeWidth="1.2" />
        <path d="M 100 130 L 100 170" stroke="var(--highlight-color)" strokeWidth="1.2" strokeDasharray="3 2" />
        <polygon points="100,174 96,166 104,166" fill="var(--highlight-color)" />
      </svg>
    )
  }
];

const PRE_DETERMINED_ROTATIONS = [2.5, -3.1, 1.8, -2.4, 3.2, -1.5, 0.9, -2.8, 1.4, -3.3, 2.1, -1.9, 0.5, -0.8, 1.2, -1.7];

export default function ProjectsSection({ revealed, activePage }) {
  const { playSFX } = useAudio();

  const [activeIndex, setActiveIndex] = useState(0);
  const [mobilePopupOpen, setMobilePopupOpen] = useState(false);
  const [mobilePopupIndex, setMobilePopupIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // DOM Refs
  const trackRef = useRef(null);
  const canvasRef = useRef(null);
  const cardRefs = useRef([]);
  const titleRef = useRef(null);
  const skillsRef = useRef(null);

  // Animation scramble title ref
  const scramblerRef = useRef(null);

  // Track page state inside ref to sync with dynamic loops immediately
  const activePageRef = useRef(activePage);
  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  // Set initial performance.now() inside useEffect to keep render pure
  useEffect(() => {
    lastAdvanceTimeRef.current = performance.now();
  }, []);

  // Kinetic throw physics refs
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startAngleRef = useRef(0);
  const targetAngleRef = useRef(0);
  const currentAngleRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(0);
  const autoSpinRef = useRef(true);
  const resumeTimeoutRef = useRef(null);
  const lastAdvanceTimeRef = useRef(0);
  const isCanvasHoveredRef = useRef(false);

  // Drag check threshold
  const startXRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const lastPointerYRef = useRef(0);
  const hasPlayedDragSFXRef = useRef(false);
  const lastWheelTimeRef = useRef(0);

  // Index references
  const activeIndexRef = useRef(0);
  const numCards = PROJECTS_DATA.length;

  // Initialize Text Scrambler
  useEffect(() => {
    if (titleRef.current) {
      scramblerRef.current = new TextScramble(titleRef.current, 6);
    }
    return () => {
      if (scramblerRef.current) scramblerRef.current.cancel();
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => setIsVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const updateSpecsIndex = useCallback((index) => {
    if (activeIndexRef.current === index) return;
    activeIndexRef.current = index;
    setActiveIndex(index);

    // Scramble the specs title
    if (scramblerRef.current) {
      scramblerRef.current.setText(PROJECTS_DATA[index].title);
    }
  }, [playSFX]);

  // Project Centering
  const centerCardIndex = useCallback((index) => {
    autoSpinRef.current = false;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);

    const baseAngle = index * ((2 * Math.PI) / numCards);
    const target = -baseAngle;

    // Shortest path logic
    let diff = (target - targetAngleRef.current) % (2 * Math.PI);
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;

    targetAngleRef.current += diff;
    updateSpecsIndex(index);

    resumeTimeoutRef.current = setTimeout(() => {
      autoSpinRef.current = true;
      lastAdvanceTimeRef.current = performance.now();
    }, 2000);
  }, [numCards, updateSpecsIndex]);

  // Open mobile details modal
  const openMobilePopup = useCallback((index) => {
    playSFX("clickTick");
    setMobilePopupIndex(index);
    setMobilePopupOpen(true);
  }, [playSFX]);

  // Close mobile details modal
  const closeMobilePopup = useCallback(() => {
    setMobilePopupOpen(false);
  }, []);

  // Handlers for click / drag / touch inputs
  const handleStart = (clientX, clientY) => {
    isDraggingRef.current = true;
    hasPlayedDragSFXRef.current = false;
    if (typeof document !== "undefined") {
      document.body.classList.add("is-dragging-spiral");
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }
    }
    startYRef.current = clientY;
    lastPointerYRef.current = clientY;
    startAngleRef.current = targetAngleRef.current;
    autoSpinRef.current = false;
    velocityRef.current = 0;
    lastTimeRef.current = performance.now();
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);

    startXRef.current = clientX;
    dragDistanceRef.current = 0;
  };

  const handleMove = (clientX, clientY) => {
    if (!isDraggingRef.current) return;

    // Calculate drag distance
    const dx = clientX - startXRef.current;
    const dy = clientY - startYRef.current;
    dragDistanceRef.current = Math.sqrt(dx * dx + dy * dy);

    // Play drag sound haptics once per drag gesture
    if (!hasPlayedDragSFXRef.current && dragDistanceRef.current > 4) {
      playSFX("drag");
      hasPlayedDragSFXRef.current = true;
    }
    lastPointerYRef.current = clientY;

    const now = performance.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    const deltaY = clientY - startYRef.current;
    const prevAngle = targetAngleRef.current;

    targetAngleRef.current = startAngleRef.current + deltaY * 0.008; // smoother, more responsive drag sensitivity
    velocityRef.current = ((targetAngleRef.current - prevAngle) / dt) * 16;
    lastTimeRef.current = now;
  };

  const handleEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (typeof document !== "undefined") {
      document.body.classList.remove("is-dragging-spiral");
    }

    // Resume auto spin after timeout
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      autoSpinRef.current = true;
      lastAdvanceTimeRef.current = performance.now();
    }, 2000);
  };

  // Drag Event Listeners
  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault(); // prevent native browser text selection/dragging ghost outlines
    handleStart(e.clientX, e.clientY);
  };

  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      if (e.cancelable) e.preventDefault();
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDraggingRef.current) {
        handleMove(e.clientX, e.clientY);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        handleEnd();
      }
    };

    const handleGlobalTouchMove = (e) => {
      if (isDraggingRef.current) {
        if (e.cancelable) e.preventDefault(); // prevent elastic window bounce
        if (e.touches.length === 1) {
          handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }
    };

    const handleGlobalTouchEnd = () => {
      if (isDraggingRef.current) {
        handleEnd();
      }
    };

    const handleSelectStart = (e) => {
      if (isDraggingRef.current) {
        e.preventDefault();
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchmove", handleGlobalTouchMove, { passive: false });
    window.addEventListener("touchend", handleGlobalTouchEnd);
    window.addEventListener("selectstart", handleSelectStart);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchmove", handleGlobalTouchMove);
      window.removeEventListener("touchend", handleGlobalTouchEnd);
      window.removeEventListener("selectstart", handleSelectStart);
    };
  }, []);

  // Wheel event listener (Physics velocity impulse)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e) => {
      if (activePageRef.current !== 1) return;
      e.preventDefault();
      autoSpinRef.current = false;

      const scrollIntent = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      velocityRef.current -= scrollIntent * 0.00015; // Lower sensitivity
      velocityRef.current = Math.max(-0.12, Math.min(0.12, velocityRef.current));

      // Calm debounced wheel scrolling SFX
      const now = performance.now();
      if (now - lastWheelTimeRef.current > 600 && Math.abs(scrollIntent) > 1) {
        playSFX("drag");
        lastWheelTimeRef.current = now;
      }

      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = setTimeout(() => {
        autoSpinRef.current = true;
        lastAdvanceTimeRef.current = performance.now();
      }, 2000);
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [playSFX]);

  // Main 3D Ticker Loop
  useEffect(() => {
    const tick = () => {
      // Deactivate calculations immediately if off-screen to preserve CPU
      if (activePageRef.current !== 1 || !revealed || !isVisible) {
        return;
      }

      // 1. Kinetic Coasting, Snapping, Auto-Play
      if (!isDraggingRef.current) {
        if (Math.abs(velocityRef.current) > 0.0001) {
          targetAngleRef.current += velocityRef.current;
          velocityRef.current *= 0.91; // smooth gliding friction
          lastAdvanceTimeRef.current = performance.now(); // reset auto spin timers
        } else {
          velocityRef.current = 0;

          // Magnetic Snapping
          const step = (2 * Math.PI) / numCards;
          const closestStep = Math.round(targetAngleRef.current / step);
          const snapAngle = closestStep * step;
          targetAngleRef.current += (snapAngle - targetAngleRef.current) * 0.06;

          // Auto play advance
          if (autoSpinRef.current && !isCanvasHoveredRef.current) {
            const now = performance.now();
            if (now - lastAdvanceTimeRef.current > 2000) {
              const nextIndex = (activeIndexRef.current + 1) % numCards;
              const baseAngle = nextIndex * ((2 * Math.PI) / numCards);
              const target = -baseAngle;

              let diff = (target - targetAngleRef.current) % (2 * Math.PI);
              if (diff > Math.PI) diff -= 2 * Math.PI;
              if (diff < -Math.PI) diff += 2 * Math.PI;

              targetAngleRef.current += diff;
              updateSpecsIndex(nextIndex);
              lastAdvanceTimeRef.current = now;
            }
          } else {
            lastAdvanceTimeRef.current = performance.now();
          }
        }
      }

      // 2. Interpolate current rotation angle smoothly
      currentAngleRef.current += (targetAngleRef.current - currentAngleRef.current) * 0.085;

      const time = performance.now() * 0.001;
      const W = window.innerWidth;
      const isMobile = W <= 1024;

      // Premium responsive cylinder radii
      const mobileScaleFactor = isMobile ? Math.max(0.52, Math.min(0.78, (W / 375) * 0.65)) : 1.0;
      const radiusX = isMobile ? Math.max(120, Math.min(240, W * 0.44)) : 380;
      const radiusZ = isMobile ? Math.max(100, Math.min(195, W * 0.37)) : 290;
      const pitchY = isMobile ? 220 * (mobileScaleFactor / 0.65) : 145;

      // Find closest card index to center & compute angles in a single optimized pass
      let closestIdx = 0;
      let minDiff = Infinity;
      const diffs = new Float32Array(numCards);

      for (let i = 0; i < numCards; i++) {
        const phi_i = i * ((2 * Math.PI) / numCards);
        let diff = (phi_i + currentAngleRef.current) % (2 * Math.PI);
        if (diff > Math.PI) diff -= 2 * Math.PI;
        if (diff < -Math.PI) diff += 2 * Math.PI;
        diffs[i] = diff;

        const absDiff = Math.abs(diff);
        if (absDiff < minDiff) {
          minDiff = absDiff;
          closestIdx = i;
        }
      }

      // Render cylinder projections directly on DOM properties (no React lag)
      cardRefs.current.forEach((card, idx) => {
        if (!card) return;

        const diff = diffs[idx];
        const cosVal = Math.cos(diff);
        const normCos = (cosVal + 1) / 2;
        const isFrontSide = cosVal >= -0.55;

        let scale = (0.58 + Math.pow(normCos, 1.45) * 0.52) * mobileScaleFactor;
        if (isMobile) {
          const centerAngle = -0.2;
          const angleOffset = Math.abs(diff - centerAngle);
          const verticalScaleFactor = Math.max(0.42, 1.0 - (angleOffset / Math.PI) * 0.58);
          scale *= verticalScaleFactor;
        }

        // Procedural hand-drawn micro wobbles
        const wobbleX = Math.sin(diff * 3 + time * 1.5) * 4;
        const wobbleY = Math.cos(diff * 2 + time * 1.2) * 3;

        // 3D projections
        const perspective = 850;
        const transZ = radiusZ * (cosVal - 1);
        const projectionScale = perspective / (perspective - transZ);

        // 3D positioning
        const transX = radiusX * Math.sin(diff) + wobbleX;
        const transY = (diff * pitchY * scale) / projectionScale + wobbleY;

        // Rotations
        const wobbleRotY = Math.sin(diff * 4 + time * 2.0) * 1.5;
        const baseRotY = -diff * (180 / Math.PI) * 0.72 + wobbleRotY;
        const rotY = baseRotY;
        const rotX = 0;
        const rotZ = 0;

        // Layer sorting
        let zIndex = Math.round(1000 + cosVal * 500);
        if (isMobile) {
          zIndex += Math.round(-diff * 200);
        }

        // Opacity
        let opacity = Math.pow(normCos, 0.55);
        if (isMobile) {
          const fadeFactor = (diff + Math.PI) / (2 * Math.PI);
          opacity *= 0.15 + 0.85 * Math.pow(fadeFactor, 1.35);

          if (idx === closestIdx) {
            opacity = 1.0;
          } else if (isFrontSide) {
            opacity = Math.max(0.75, opacity);
          }
        }

        // Apply transformations directly to cards
        card.style.transform = `translate3d(${transX}px, ${transY}px, ${transZ}px) rotateY(${rotY}deg) rotateX(${rotX}deg) rotateZ(${rotZ}deg) scale(${scale})`;
        card.style.zIndex = zIndex;
        card.style.opacity = opacity;

        // Interactive pointer-events throttling
        if (isMobile && isFrontSide) {
          card.style.pointerEvents = "auto";
        } else if (opacity < 0.2) {
          card.style.pointerEvents = "none";
        } else {
          card.style.pointerEvents = "auto";
        }

        // Active border styles
        const shadowOffset = Math.round(2 + normCos * 4);
        if (idx === activeIndexRef.current) {
          card.classList.add(styles.active);
          card.style.boxShadow = `0 0 12px rgba(var(--highlight-rgb, 218, 92, 53), 0.25), ${shadowOffset}px ${shadowOffset}px 0 var(--highlight-color)`;
        } else {
          card.classList.remove(styles.active);
          card.style.boxShadow = `${shadowOffset}px ${shadowOffset}px 0 var(--border-color)`;
        }
      });

      // Auto-update specs note when card spins into center view
      if (!isDraggingRef.current && closestIdx !== activeIndexRef.current) {
        updateSpecsIndex(closestIdx);
      }
    };

    // Ticker subscriptions
    if (revealed && activePage === 1 && isVisible) {
      gsap.ticker.add(tick);
    } else {
      gsap.ticker.remove(tick);
    }

    return () => {
      gsap.ticker.remove(tick);
    };
  }, [revealed, activePage, isVisible, numCards, updateSpecsIndex]);

  const handleCardMouseEnter = (index) => {
    playSFX("hover");
  };

  const handleCardClick = (e, index) => {
    // Return if user dragged
    if (dragDistanceRef.current > 8) return;

    e.stopPropagation();
    if (window.innerWidth <= 1024) {
      openMobilePopup(index);
    } else {
      centerCardIndex(index);
    }
  };

  const activeProject = PROJECTS_DATA[activeIndex];

  return (
    <div className={styles.projectsLayout} id="section-projects">
      {/* Dynamic Ticker strip spanning both columns */}
      <div className={styles.projectsTickerStrip}>
        <div className={styles.projectsTickerWrap}>
          <div className={styles.projectsTickerContent}>
            <span className={styles.tickerTerm}>NO CAP</span>
            <span className={styles.tickerTerm}>PATIENT</span>
            <span className={styles.tickerTerm}>DEDICATION</span>
            <span className={styles.tickerTerm}>BUILD</span>
            <span className={styles.tickerTerm}>ITERATE</span>
            <span className={styles.tickerTerm}>SHIP IT</span>
            <span className={styles.tickerTerm}>REFACTOR</span>
            <span className={styles.tickerTerm}>COFFEE TO CODE</span>
            <span className={styles.tickerTerm}>PIXEL PERFECT</span>
            <span className={styles.tickerTerm}>OPTIMIZED</span>
            <span className={styles.tickerTerm}>DEBUGGING</span>
            <span className={styles.tickerTerm}>PROTOTYPE</span>
            <span className={styles.tickerTerm}>99% PERSISTENCE</span>
            <span className={styles.tickerTerm}>SOLVE</span>
          </div>
          <div className={styles.projectsTickerContent}>
            <span className={styles.tickerTerm}>NO CAP</span>
            <span className={styles.tickerTerm}>PATIENT</span>
            <span className={styles.tickerTerm}>DEDICATION</span>
            <span className={styles.tickerTerm}>BUILD</span>
            <span className={styles.tickerTerm}>ITERATE</span>
            <span className={styles.tickerTerm}>SHIP IT</span>
            <span className={styles.tickerTerm}>REFACTOR</span>
            <span className={styles.tickerTerm}>COFFEE TO CODE</span>
            <span className={styles.tickerTerm}>PIXEL PERFECT</span>
            <span className={styles.tickerTerm}>OPTIMIZED</span>
            <span className={styles.tickerTerm}>DEBUGGING</span>
            <span className={styles.tickerTerm}>PROTOTYPE</span>
            <span className={styles.tickerTerm}>99% PERSISTENCE</span>
            <span className={styles.tickerTerm}>SOLVE</span>
          </div>
        </div>
      </div>

      {/* Mobile Projects Header (visible only on mobile) */}
      <div className={styles.projectsMobileHeader}>
        <h2 className="font-hand">Projects I have built...</h2>
        <div className="header-line"></div>
      </div>

      {/* Left Pane: The 3D Spiral Canvas */}
      <div className={styles.projectSpiralPane}>
        <div
          className={styles.projectSpiralCanvas}
          ref={canvasRef}
          onMouseEnter={() => {
            isCanvasHoveredRef.current = true;
          }}
          onMouseLeave={() => {
            isCanvasHoveredRef.current = false;
          }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          {/* Cylinder guides */}
          <div className={styles.blueprintCylinderGuides}>
            <svg className={`${styles.cylinderGuideSvg} ${styles.topGuide}`} viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="85" stroke="var(--highlight-color)" strokeWidth="0.6" fill="none" opacity="0.12" />
              <circle cx="100" cy="100" r="85" stroke="var(--highlight-color)" strokeWidth="0.6" strokeDasharray="8 4" fill="none" opacity="0.1" />
            </svg>
            <svg className={`${styles.cylinderGuideSvg} ${styles.bottomGuide}`} viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="85" stroke="var(--highlight-color)" strokeWidth="0.6" fill="none" opacity="0.12" />
              <circle cx="100" cy="100" r="85" stroke="var(--highlight-color)" strokeWidth="0.6" strokeDasharray="6 3" fill="none" opacity="0.1" />
            </svg>
          </div>

          {/* Spiral cards track */}
          <div
            className={styles.projectsSpiralTrack}
            ref={trackRef}
          >
            {PROJECTS_DATA.map((project, i) => (
              <div
                key={i}
                className={styles.projectsSpiralCard}
                ref={(el) => {
                  if (el) cardRefs.current[i] = el;
                }}
                onMouseEnter={() => handleCardMouseEnter(i)}
                onClick={(e) => handleCardClick(e, i)}
                style={{ zIndex: 1000 }}
              >
                <div className={styles.tapeStrip} />
                <div className={styles.cardVisual}>{project.svg}</div>
                <div className={`${styles.polaroidCaption} font-mono`}>
                  <span className={styles.captionText}>{project.title}</span>
                  <span className={styles.captionStatus}>#0{i + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Pane: Notepad Specs Card */}
      <div className={styles.projectSpecsPane}>
        <div className={styles.projectSpecsCard}>
          <div className={styles.binderHoles}>
            <div className={styles.hole} />
            <div className={styles.hole} />
            <div className={styles.hole} />
          </div>

          <div key={`meta-${activeIndex}`} className={`${styles.aboutMetadata} font-mono`}>
            <span className={styles.metaDwg} style={{ fontWeight: "bold" }}>
              {activeProject.dwg}
            </span>
            <span className={styles.metaScale} style={{ fontWeight: "bold" }}>
              {activeProject.scale}
            </span>
          </div>

          <div key={`content-${activeIndex}`} className={styles.aboutContentWrapper}>
            <h3 ref={titleRef} className={`${styles.specsTitle} font-mono`} style={{ fontSize: "14px", letterSpacing: "0.8px" }}>
              {activeProject.title}
            </h3>
            <p className={`${styles.specsText} font-hand`} style={{ color: "var(--text-color)" }}>
              {activeProject.text}
            </p>
          </div>

          {/* Stack pills */}
          <div key={`skills-${activeIndex}`} ref={skillsRef} className={styles.projSkillsPills}>
            <span className={`${styles.projSkillsLabel} font-mono`}>STACK:</span>
            {activeProject.skills.map((skill, sIdx) => {
              const rot = PRE_DETERMINED_ROTATIONS[sIdx % PRE_DETERMINED_ROTATIONS.length];
              return (
                <span
                  key={sIdx}
                  className={`${styles.projSkillPill} font-mono`}
                  style={{
                    animationDelay: `${sIdx * 60}ms`,
                    "--pill-rot": `${rot}deg`
                  }}
                >
                  {skill}
                </span>
              );
            })}
          </div>

          {/* Blueprint stamp seal */}
          <div key={`seal-${activeIndex}`} className={styles.aboutStampSeal}>
            <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="33" stroke="var(--highlight-color)" strokeWidth="1.2" strokeDasharray="35 6 12 5" fill="none" opacity="0.75" />
              <circle cx="40" cy="40" r="28" stroke="var(--highlight-color)" strokeWidth="0.8" fill="none" opacity="0.6" />
              <path id="proj-seal-path-comp" d="M 17 40 A 23 23 0 0 1 63 40" fill="none" />
              <text fontSize="5.5" fontFamily="var(--font-mono)" fill="var(--highlight-color)" letterSpacing="1" fontWeight="bold">
                <textPath href="#proj-seal-path-comp" startOffset="50%" textAnchor="middle">
                  SYSTEM DESIGN
                </textPath>
              </text>
              <text x="40" y="44" fontSize="8" fontFamily="var(--font-mono)" fontWeight="bold" fill="var(--highlight-color)" textAnchor="middle">
                LOGGED
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Mobile Details Popup Backdrop Modal */}
      <div
        className={`${styles.projectPopupBackdrop} ${mobilePopupOpen ? styles.active : ""}`}
        onClick={closeMobilePopup}
      >
        <div
          className={`${styles.projectSpecsCard} ${styles.projectPopupCard}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.binderHoles}>
            <div className={styles.hole} />
            <div className={styles.hole} />
            <div className={styles.hole} />
          </div>

          <button
            className="popup-close-btn font-mono"
            onClick={closeMobilePopup}
            style={{ position: "absolute", top: "12px", right: "12px", zIndex: 10 }}
            title="Close Sheet"
          >
            ×
          </button>

          <div className={`${styles.aboutMetadata} font-mono`}>
            <span className={styles.metaDwg} style={{ fontWeight: "bold" }}>
              {PROJECTS_DATA[mobilePopupIndex].dwg}
            </span>
            <span className={styles.metaScale} style={{ fontWeight: "bold" }}>
              {PROJECTS_DATA[mobilePopupIndex].scale}
            </span>
          </div>

          <div className={styles.aboutContentWrapper}>
            <h3 className={`${styles.specsTitle} font-mono`} style={{ fontSize: "14px", letterSpacing: "0.8px" }}>
              {PROJECTS_DATA[mobilePopupIndex].title}
            </h3>
            <p className={`${styles.specsText} font-hand`} style={{ color: "var(--text-color)" }}>
              {PROJECTS_DATA[mobilePopupIndex].text}
            </p>
          </div>

          {/* Stack pills */}
          <div className={styles.projSkillsPills}>
            <span className={`${styles.projSkillsLabel} font-mono`}>STACK:</span>
            {PROJECTS_DATA[mobilePopupIndex].skills.map((skill, sIdx) => {
              const rot = PRE_DETERMINED_ROTATIONS[sIdx % PRE_DETERMINED_ROTATIONS.length];
              return (
                <span
                  key={sIdx}
                  className={`${styles.projSkillPill} font-mono`}
                  style={{
                    animationDelay: `${sIdx * 60}ms`,
                    "--pill-rot": `${rot}deg`
                  }}
                >
                  {skill}
                </span>
              );
            })}
          </div>

          {/* Blueprint stamp seal */}
          <div className={styles.aboutStampSeal}>
            <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="33" stroke="var(--highlight-color)" strokeWidth="1.2" strokeDasharray="35 6 12 5" fill="none" opacity="0.75" />
              <circle cx="40" cy="40" r="28" stroke="var(--highlight-color)" strokeWidth="0.8" fill="none" opacity="0.6" />
              <path id="proj-seal-path-popup" d="M 17 40 A 23 23 0 0 1 63 40" fill="none" />
              <text fontSize="5.5" fontFamily="var(--font-mono)" fill="var(--highlight-color)" letterSpacing="1" fontWeight="bold">
                <textPath href="#proj-seal-path-popup" startOffset="50%" textAnchor="middle">
                  SYSTEM DESIGN
                </textPath>
              </text>
              <text x="40" y="44" fontSize="8" fontFamily="var(--font-mono)" fontWeight="bold" fill="var(--highlight-color)" textAnchor="middle">
                LOGGED
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "../../context/theme-context";
import styles from "./terrain-background.module.css";

// Pre-calculated random pool for high-performance stable sketching wobbly lines (used in CPU fallback)
const RANDOM_POOL = Array.from({ length: 512 }, () => (Math.random() - 0.5) * 0.95);
let poolIdx = 0;

export default function TerrainBackground() {
  const canvasRef = useRef(null);
  const { theme, isRulerAnimating } = useTheme();
  
  const themeRef = useRef(theme);
  const timeRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const animationFrameIdRef = useRef(null);
  const isTabVisibleRef = useRef(true);
  const workerRef = useRef(null);
  const fallbackTickRef = useRef(null);

  // Sync theme changes instantly into anim loop/worker context
  useEffect(() => {
    themeRef.current = theme;
    if (workerRef.current) {
      workerRef.current.postMessage({ action: "theme", data: theme });
    }
  }, [theme]);

  // Pause rendering loops during theme transitions to ensure lag-free animations
  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ action: "pause", data: isRulerAnimating });
    } else {
      if (isRulerAnimating) {
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = null;
        }
      } else {
        if (!animationFrameIdRef.current && fallbackTickRef.current && isTabVisibleRef.current) {
          animationFrameIdRef.current = requestAnimationFrame(fallbackTickRef.current);
        }
      }
    }
  }, [isRulerAnimating]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = false;
    let worker = null;

    // Detect OffscreenCanvas support for Worker offloading
    const supportsOffscreen = !!canvas.transferControlToOffscreen;

    // Initialize dimensions
    const getDPR = () => Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let width = window.innerWidth;
    let height = window.innerHeight;
    let cachedDPR = getDPR();
    let lastMousePostTime = 0;

    // Track mouse move to forward coordinates to worker or fallback
    const handleMouseMove = (e) => {
      if (window.innerWidth <= 768) return;
      if (worker) {
        const now = performance.now();
        if (now - lastMousePostTime < 33.33) return;
        lastMousePostTime = now;
        worker.postMessage({ action: "mousemove", data: { x: e.clientX, y: e.clientY } });
      } else {
        mouseRef.current.targetX = e.clientX;
        mouseRef.current.targetY = e.clientY;
      }
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Handle Resize
    let resizeTimeout = null;
    const handleResize = () => {
      if (resizeTimeout) cancelAnimationFrame(resizeTimeout);
      resizeTimeout = requestAnimationFrame(() => {
        width = window.innerWidth;
        height = window.innerHeight;
        cachedDPR = getDPR();
        const dpr = cachedDPR;

        if (worker) {
          worker.postMessage({
            action: "resize",
            data: { width, height, dpr }
          });
        } else {
          canvas.width = Math.floor(width * dpr);
          canvas.height = Math.floor(height * dpr);
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
      });
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Track visibility to pause fallback/worker
    const handleVisibility = () => {
      const isVisible = !document.hidden;
      isTabVisibleRef.current = isVisible;
      if (worker) {
        worker.postMessage({ action: "visibility", data: isVisible });
      } else if (isVisible && !animationFrameIdRef.current) {
        // Restart the fallback loop when tab becomes visible again
        lastTickTime = performance.now();
        animationFrameIdRef.current = requestAnimationFrame(tick);
      }
    };
    let tick = null;
    let lastTickTime = performance.now();
    document.addEventListener("visibilitychange", handleVisibility);

    if (supportsOffscreen) {
      // 1. WEB WORKER PATH
      try {
        const offscreen = canvas.transferControlToOffscreen();
        worker = new Worker("/workers/terrain-worker.js");
        workerRef.current = worker;

        worker.postMessage({
          action: "init",
          data: {
            canvas: offscreen,
            width,
            height,
            dpr: getDPR(),
            theme: themeRef.current
          }
        }, [offscreen]);
      } catch (e) {
        console.warn("Failed to initialize OffscreenCanvas worker, falling back to main thread:", e);
        worker = null;
        initFallback();
      }
    } else {
      // 2. MAIN THREAD CPU FALLBACK PATH
      initFallback();
    }

    function initFallback() {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = cachedDPR;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Gradient cache – rebuilt on resize or theme change
      let gradientCacheDirty = true;
      let cachedThemeForGradients = themeRef.current;
      let cachedW = width;
      let cachedH = height;
      let cachedAura = null;
      let cachedFillGrads = [];
      let cachedStrokeGrads = [];

      const birds = [
        { x: -50, yRatio: 0.22, scale: 0.8, speed: 0.45, flapSpeed: 0.12, phase: 0 },
        { x: -200, yRatio: 0.18, scale: 0.65, speed: 0.35, flapSpeed: 0.1, phase: Math.PI / 3 },
        { x: -350, yRatio: 0.26, scale: 0.5, speed: 0.3, flapSpeed: 0.08, phase: Math.PI / 1.5 },
      ];

      const stars = Array.from({ length: 12 }, () => ({
        x: Math.random(),
        y: Math.random() * 0.45,
        size: 2 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03,
      }));

      const drawWobblyLine = (pts, color, widthVal) => {
        if (pts.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);

        for (let i = 1; i < pts.length; i++) {
          const p1 = pts[i - 1];
          const p2 = pts[i];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distSq = dx * dx + dy * dy;

          if (distSq > 64) {
            const jitterX = RANDOM_POOL[poolIdx];
            poolIdx = (poolIdx + 1) & 511;
            const jitterY = RANDOM_POOL[poolIdx];
            poolIdx = (poolIdx + 1) & 511;
            ctx.lineTo(p1.x + dx * 0.5 + jitterX, p1.y + dy * 0.5 + jitterY);
          }
          ctx.lineTo(p2.x, p2.y);
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = widthVal;
        ctx.lineCap = "round";
        ctx.stroke();
      };

      const getThemeColorAt = (t, isDark) => {
        let r, g, b;
        if (isDark) {
          if (t < 0.35) {
            const localT = t / 0.35;
            r = 14 + 10 * localT;
            g = 21 + 13 * localT;
            b = 37 + 17 * localT;
          } else if (t < 0.65) {
            const localT = (t - 0.35) / 0.3;
            r = 24 - 14 * localT;
            g = 34 - 21 * localT;
            b = 54 - 34 * localT;
          } else {
            const localT = (t - 0.65) / 0.35;
            r = 10 - 4 * localT;
            g = 13 - 5 * localT;
            b = 20 - 5 * localT;
          }
        } else {
          if (t < 0.35) {
            const localT = t / 0.35;
            r = 221 - 9 * localT;
            g = 216 - 53 * localT;
            b = 196 - 81 * localT;
          } else if (t < 0.65) {
            const localT = (t - 0.35) / 0.3;
            r = 212 - 152 * localT;
            g = 163 - 121 * localT;
            b = 115 - 82 * localT;
          } else {
            const localT = (t - 0.65) / 0.35;
            r = 60 + 161 * localT;
            g = 42 + 174 * localT;
            b = 33 + 163 * localT;
          }
        }
        return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
      };

      tick = (now) => {
        if (!isTabVisibleRef.current) {
          // Don't schedule rAF when tab is hidden; will restart from visibility handler
          animationFrameIdRef.current = null;
          return;
        }

        lastTickTime = now;

        const W = canvas.width / cachedDPR;
        const H = canvas.height / cachedDPR;

        // Check if gradients need rebuilding
        if (cachedThemeForGradients !== themeRef.current || cachedW !== W || cachedH !== H) {
          gradientCacheDirty = true;
          cachedThemeForGradients = themeRef.current;
          cachedW = W;
          cachedH = H;
        }

        ctx.clearRect(0, 0, W, H);
        poolIdx = 0;
        timeRef.current += 0.0095;
        const time = timeRef.current;

        const mouse = mouseRef.current;
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        const isDark = themeRef.current === "charcoal";
        const isMobile = W <= 768;

        const layersCount = isMobile ? 8 : 18;
        const layerSpacing = isMobile ? 40 : 20;
        const layersOffsetY = isMobile ? -100 : -140;
        const steps = isMobile ? 24 : 48;

        const centerY = H * 0.55;
        const sunX = W * 0.5 + 130;
        const sunY = centerY - 160;
        const sunPulse = 1.0 + 0.04 * Math.sin(time * 1.5);
        const baseRadius = 38 * sunPulse;

        // Birds
        birds.forEach((bird) => {
          bird.x += bird.speed;
          bird.phase += bird.flapSpeed;
          if (bird.x > W + 80) {
            bird.x = -80;
            bird.yRatio = 0.16 + Math.random() * 0.15;
          }
          if (bird.x > -50 && bird.x < W + 50) {
            const flap = Math.sin(bird.phase) * 6 * bird.scale;
            const bx = bird.x;
            const by = centerY - H * bird.yRatio;
            const s = 14 * bird.scale;
            const birdPts = [
              { x: bx - s, y: by - flap },
              { x: bx, y: by + flap * 0.2 },
              { x: bx + s, y: by - flap },
            ];
            const birdColor = isDark ? "rgba(245, 245, 237, 0.35)" : "rgba(60, 42, 33, 0.3)";
            drawWobblyLine(birdPts, birdColor, 0.85);
          }
        });

        // Stars
        if (isDark) {
          stars.forEach((star) => {
            star.phase += star.speed;
            const opacity = 0.15 + 0.65 * Math.abs(Math.sin(star.phase));
            const sx = star.x * W;
            const sy = star.y * H;
            ctx.strokeStyle = `rgba(226, 232, 240, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(sx - star.size, sy);
            ctx.lineTo(sx + star.size, sy);
            ctx.moveTo(sx, sy - star.size);
            ctx.lineTo(sx, sy + star.size);
            ctx.stroke();
          });

          const ringColor = "rgba(56, 189, 248, 0.08)";
          const ringRadii = [baseRadius + 40, baseRadius + 85, baseRadius + 140];
          ringRadii.forEach((r) => {
            const ringPts = [];
            const orbitSteps = isMobile ? 18 : 36;
            for (let s = 0; s < orbitSteps; s++) {
              const angle = (s / orbitSteps) * Math.PI * 2;
              const wobble = Math.sin(angle * 6 + time) * 1.5;
              const rx = sunX + Math.cos(angle) * (r + wobble);
              const ry = sunY + Math.sin(angle) * (r + wobble);
              ringPts.push({ x: rx, y: ry });
            }
            ringPts.push(ringPts[0]);
            ctx.save();
            ctx.setLineDash([4, 8]);
            drawWobblyLine(ringPts, ringColor, 0.6);
            ctx.restore();
          });
        }

        // Sun Aura
        const auraRadius = 180 * sunPulse;
        if (gradientCacheDirty || !cachedAura) {
          cachedAura = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, auraRadius);
          if (isDark) {
            cachedAura.addColorStop(0, "rgba(200, 224, 255, 0.15)");
            cachedAura.addColorStop(0.5, "rgba(200, 224, 255, 0.04)");
            cachedAura.addColorStop(1, "rgba(0, 0, 0, 0)");
          } else {
            cachedAura.addColorStop(0, "rgba(212, 163, 115, 0.20)");
            cachedAura.addColorStop(0.5, "rgba(212, 163, 115, 0.07)");
            cachedAura.addColorStop(1, "rgba(0, 0, 0, 0)");
          }
        }
        ctx.fillStyle = cachedAura;
        ctx.beginPath();
        ctx.arc(sunX, sunY, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        // Rebuild gradient cache if dirty
        if (gradientCacheDirty) {
          cachedFillGrads = [];
          cachedStrokeGrads = [];
          for (let layer = 0; layer < layersCount; layer++) {
            const tLayer = layer / (layersCount - 1);
            const layerY = centerY + layersOffsetY + layer * layerSpacing;
            const c = getThemeColorAt(tLayer, isDark);

            const fillBg = ctx.createLinearGradient(0, layerY - 180, 0, H);
            const fillOpacity0 = isDark
              ? 0.08 + 0.35 * Math.sin(tLayer * Math.PI)
              : 0.1 + 0.38 * Math.sin(tLayer * Math.PI);
            const fillOpacity1 = fillOpacity0 * 0.45;
            fillBg.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${fillOpacity0})`);
            fillBg.addColorStop(0.5, `rgba(${c.r}, ${c.g}, ${c.b}, ${fillOpacity1})`);
            fillBg.addColorStop(1, "rgba(0, 0, 0, 0.0)");
            cachedFillGrads.push(fillBg);

            const strokeGrad = ctx.createLinearGradient(0, 0, W, 0);
            const sunRatio = Math.max(0.05, Math.min(0.95, sunX / W));
            const leftRatio = Math.max(0, sunRatio - 0.15);
            const rightRatio = Math.min(1.0, sunRatio + 0.15);
            const strokeOpacity = 0.12 + 0.78 * Math.sin(tLayer * Math.PI);
            const baseColorStr = `rgba(${c.r}, ${c.g}, ${c.b}, ${strokeOpacity})`;
            const highlightColorStr = isDark
              ? `rgba(56, 189, 248, ${Math.min(1.0, strokeOpacity * 1.6)})`
              : `rgba(212, 163, 115, ${Math.min(1.0, strokeOpacity * 1.5)})`;
            strokeGrad.addColorStop(0, baseColorStr);
            strokeGrad.addColorStop(leftRatio, baseColorStr);
            strokeGrad.addColorStop(sunRatio, highlightColorStr);
            strokeGrad.addColorStop(rightRatio, baseColorStr);
            strokeGrad.addColorStop(1, baseColorStr);
            cachedStrokeGrads.push(strokeGrad);
          }
          gradientCacheDirty = false;
        }

        // Layers
        for (let layer = 0; layer < layersCount; layer++) {
          const tLayer = layer / (layersCount - 1);
          const layerY = centerY + layersOffsetY + layer * layerSpacing;

          const pts = [];
          for (let s = 0; s <= steps; s++) {
            const tx = s / steps;
            const x = tx * W;
            let wave = Math.sin(tx * Math.PI * 4 + time * 2 + layer * 0.5) * 18 * (1 - tLayer * 0.4);
            wave += Math.cos(tx * Math.PI * 10 - time + layer) * 5;

            const dxFromCenter = tx - 0.5;
            const mountainBaseWidth = 0.22 + tLayer * 0.06;
            const peakIntensity = Math.exp(
              -(dxFromCenter * dxFromCenter) / (2 * mountainBaseWidth * mountainBaseWidth)
            );

            const mountainHeight = 150 * (0.3 + 0.7 * (1 - tLayer * 0.5)) * peakIntensity;
            let y = layerY - mountainHeight + wave;

            const mouseDx = x - mouse.x;
            const mouseDy = y - mouse.y;
            const distSq = mouseDx * mouseDx + mouseDy * mouseDy;

            if (distSq < 62500) {
              const mouseDist = Math.sqrt(distSq);
              const force = (1 - mouseDist / 250) * 15 * peakIntensity;
              y += ((mouse.y - y) * 0.15 * force) / 15;
            }
            pts.push({ x, y });
          }

          ctx.beginPath();
          ctx.moveTo(0, H);
          ctx.lineTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.lineTo(W, H);
          ctx.closePath();
          ctx.fillStyle = cachedFillGrads[layer];
          ctx.fill();

          const strokeWidth = 0.7 + 1.2 * Math.sin(tLayer * Math.PI);
          const isContour = layer % 3 === 0;
          ctx.save();
          if (isDark && isContour) ctx.setLineDash([6, 9]);
          drawWobblyLine(pts, cachedStrokeGrads[layer], strokeWidth);
          ctx.restore();
        }

        // God Rays
        const beamColor = isDark ? "rgba(180, 205, 240, 0.08)" : "rgba(212, 163, 115, 0.12)";
        for (let i = 0; i < 4; i++) {
          const angle = Math.PI * 0.2 + (i / 4) * Math.PI * 0.8 + Math.sin(time * 0.4 + i) * 0.04;
          const startDist = baseRadius + 12;
          const endDist = Math.max(W, H) * 1.2;
          const x1 = sunX + Math.cos(angle) * startDist;
          const y1 = sunY + Math.sin(angle) * startDist;
          const x2 = sunX + Math.cos(angle) * endDist;
          const y2 = sunY + Math.sin(angle) * endDist;

          ctx.save();
          ctx.setLineDash([8, 12]);
          drawWobblyLine([{ x: x1, y: y1 }, { x: x2, y: y2 }], beamColor, 0.75);
          ctx.restore();
        }

        animationFrameIdRef.current = requestAnimationFrame(tick);
      };

      fallbackTickRef.current = tick;

      animationFrameIdRef.current = requestAnimationFrame(tick);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (resizeTimeout) cancelAnimationFrame(resizeTimeout);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (worker) worker.terminate();
    };
  }, []);

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} id="terrain-bg-canvas" />
    </div>
  );
}

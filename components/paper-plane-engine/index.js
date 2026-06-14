"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useAudio } from "../../context/audio-context";
import { useTheme } from "../../context/theme-context";
import styles from "./paper-plane-engine.module.css";

function getDistanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    const mx = px - x1;
    const my = py - y1;
    return Math.sqrt(mx * mx + my * my);
  }
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  const distDx = px - cx;
  const distDy = py - cy;
  return Math.sqrt(distDx * distDx + distDy * distDy);
}

function isPointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const v0x = cx - ax;
  const v0y = cy - ay;
  const v1x = bx - ax;
  const v1y = by - ay;
  const v2x = px - ax;
  const v2y = py - ay;

  const dot00 = v0x * v0x + v0y * v0y;
  const dot01 = v0x * v1x + v0y * v1y;
  const dot02 = v0x * v2x + v0y * v2y;
  const dot11 = v1x * v1x + v1y * v1y;
  const dot12 = v1x * v2x + v1y * v2y;

  const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

  return (u >= 0) && (v >= 0) && (u + v <= 1);
}


export default function PaperPlaneEngine() {
  const canvasRef = useRef(null);
  const { playSFX } = useAudio();
  const { theme } = useTheme();

  // Store theme and playSFX in refs so the main useEffect doesn't teardown on change
  const themeRef = useRef(theme);
  const playSFXRef = useRef(playSFX);

  const isLandedRef = useRef(true);
  const isStuntFlyingRef = useRef(false);
  const stuntProgressRef = useRef(0);
  const stuntStartPosRef = useRef({ x: 0, y: 0, z: 20 });
  const lastStuntPosRef = useRef({ x: 0, y: 0 });
  
  const headingRef = useRef(0.1);
  const flightYawRef = useRef(-Math.PI / 2);
  const flightRollRef = useRef(0);

  // Ring buffer for flight trail (avoids O(n) .shift())
  const TRAIL_MAX = 70;
  const trailBufRef = useRef(new Array(TRAIL_MAX));
  const trailHeadRef = useRef(0);
  const trailCountRef = useRef(0);

  const currentYawRef = useRef(0);
  const currentPitchRef = useRef(0);
  const isHoveringPlaneRef = useRef(false);

  const planePosRef = useRef({ x: 0, y: 0, z: 20 });
  const planeScaleRef = useRef(1.3);

  const mouseRef = useRef({ x: 0, y: 0 });
  const mouseMovedRef = useRef(false);
  const prevHoveringRef = useRef(false);
  const cachedWidthRef = useRef(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const timeRef = useRef(0);
  const sheetRef = useRef(null);
  const frameCountRef = useRef(0);

  // 3D Origami Paper Plane Geometry
  const planeRef = useRef({
    vertices: [
      { x: 0, y: 18, z: 60 },     // 0: Nose
      { x: -4, y: 8, z: -50 },    // 1: Tail Fold Left
      { x: 4, y: 8, z: -50 },     // 2: Tail Fold Right
      { x: 0, y: 18, z: -50 },    // 3: Tail Bottom / Keel
      { x: -65, y: 0, z: -40 },   // 4: Left Wing Tip
      { x: 65, y: 0, z: -40 },    // 5: Right Wing Tip
      { x: -12, y: 0, z: -50 },   // 6: Left Inner Fold
      { x: 12, y: 0, z: -50 },    // 7: Right Inner Fold
      { x: -60, y: -10, z: -42 }, // 8: Left Winglet Tip
      { x: 60, y: -10, z: -42 }   // 9: Right Winglet Tip
    ],
    edges: [
      [0, 1], [0, 2], [0, 3], // Nose folds
      [0, 6], [0, 7],         // Wing crease folds
      [1, 3], [2, 3],         // Keel / Rudder
      [1, 6], [2, 7],         // Inner back folds
      [6, 7],                 // Cross tail line
      [0, 4], [0, 5],         // Nose to wing tips
      [4, 8], [5, 9],         // Winglet fold lines
      [8, 6], [9, 7],         // Winglet back trailing edges
      [4, 6], [5, 7],         // Wing crease lines
      [0, 8], [0, 9]          // Outer wing edge to winglet crease
    ],
    faces: [
      [0, 3, 1],              // Keel bottom left
      [0, 2, 3],              // Keel bottom right
      [0, 1, 6],              // Left fuselage panel
      [0, 7, 2],              // Right fuselage panel
      [0, 6, 4],              // Left wing main panel
      [0, 5, 7],              // Right wing main panel
      [4, 8, 6],              // Left winglet panel
      [5, 9, 7]               // Right winglet panel
    ]
  });

  const rotateX = (point, angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: point.x,
      y: point.y * cos - point.z * sin,
      z: point.y * sin + point.z * cos
    };
  };

  const rotateY = (point, angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: point.x * cos + point.z * sin,
      y: point.y,
      z: -point.x * sin + point.z * cos
    };
  };

  const rotateZ = (point, angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: point.x * cos - point.y * sin,
      y: point.x * sin + point.y * cos,
      z: point.z
    };
  };

  const project = (point, yaw, pitch, roll, centerOffsetX, centerOffsetY, scale = 1, zPos = 0) => {
    let p = rotateZ(point, roll);
    p = rotateX(p, pitch);
    p = rotateY(p, yaw);
    
    p.x *= scale;
    p.y *= scale;
    p.z *= scale;
    
    const d = 350;
    const zOffset = 300;
    const projectedZ = p.z + zOffset + zPos;
    
    return {
      x: p.x * d / projectedZ + centerOffsetX,
      y: p.y * d / projectedZ + centerOffsetY,
      z: projectedZ
    };
  };

  // Sync theme and playSFX into refs without tearing down the canvas
  useEffect(() => { themeRef.current = theme; }, [theme]);
  useEffect(() => { playSFXRef.current = playSFX; }, [playSFX]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = false;

    // Hoisted function declarations
    function drawWobblyLine(x1, y1, x2, y2, color, width) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.stroke();
    }



    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const W = canvas.width;
      const H = canvas.height;
      const centerX = W / 2;
      const centerY = H / 2;

      // Mouse Parallax is disabled as per request
      currentYawRef.current = 0;
      currentPitchRef.current = 0;

      timeRef.current += 0.015;

      frameCountRef.current++;
      if (frameCountRef.current % 60 === 1 || !sheetRef.current) {
        sheetRef.current = document.querySelector(".horizontal-page-panel.active-sheet") || document.getElementById("drawing-sheet");
      }
      const sheet = sheetRef.current;
      let parkedX = W * 0.30;
      let parkedY = H * 0.28;

      if (sheet) {
        const rect = sheet.getBoundingClientRect();
        const isMobile = cachedWidthRef.current <= 768;
        parkedY = (rect.bottom - centerY) - 23.5;
        parkedX = (rect.right - centerX) - (isMobile ? 70 : 250);
      }

      let fYaw = 0;
      let fPitch = 0;
      let fRoll = 0;

      if (isLandedRef.current) {
        planePosRef.current.x = parkedX;
        planePosRef.current.y = parkedY;
        planePosRef.current.z = 20;
        
        flightYawRef.current = -Math.PI / 2;
        flightRollRef.current = 0;
        
        fYaw = flightYawRef.current;
        fPitch = 0;
        fRoll = flightRollRef.current;
      } else if (isStuntFlyingRef.current) {
        const t = stuntProgressRef.current;
        const start_x = stuntStartPosRef.current.x;
        const start_y = stuntStartPosRef.current.y;
        
        const target_x = parkedX;
        const target_y = parkedY;
        
        const loop_start_x = target_x - W * 0.44;
        const loop_elevation = 380;
        const loop_start_y = target_y - loop_elevation;
        
        let cur_x, cur_y, cur_z;
        let dx = 0, dy = 0;
        
        if (t <= 0.3) {
          // Phase 1: Takeoff
          const tau = t / 0.3;
          const d_tau = 1 / 0.3;
          cur_x = start_x + (loop_start_x - start_x) * tau;
          cur_y = start_y + (loop_start_y - start_y) * (2 * tau - tau * tau);
          cur_z = 20 - 20 * tau;
          
          dx = (loop_start_x - start_x) * d_tau;
          dy = (loop_start_y - start_y) * (2 - 2 * tau) * d_tau;
        } else if (t <= 0.6) {
          // Phase 2: Loop
          const tau = (t - 0.3) / 0.3;
          const theta = tau * Math.PI * 2;
          const d_theta = Math.PI * 2 / 0.3;
          const R_x = 85;
          const R_y = 80;
          const R_z = 60;
          
          cur_x = loop_start_x - R_x * Math.sin(theta);
          cur_y = loop_start_y - R_y * (1 - Math.cos(theta));
          cur_z = -R_z * Math.sin(theta);
          
          dx = -R_x * Math.cos(theta) * d_theta;
          dy = R_y * Math.sin(theta) * d_theta;
        } else if (t <= 0.75) {
          // Phase 3A: Exit Left
          const tau = (t - 0.6) / 0.15;
          const d_tau = 1 / 0.15;
          cur_x = loop_start_x + (-W * 0.68 - loop_start_x) * tau;
          cur_y = loop_start_y - 40 * (tau * tau);
          cur_z = -20 * tau;
          
          dx = (-W * 0.68 - loop_start_x) * d_tau;
          dy = -40 * (2 * tau) * d_tau;
        } else {
          // Phase 3B: Enter Right & Land
          const tau = (t - 0.75) / 0.25;
          const d_tau = 1 / 0.25;
          cur_x = W * 0.68 + (target_x - W * 0.68) * tau;
          cur_y = (target_y - loop_elevation) + loop_elevation * (2 * tau - tau * tau);
          cur_z = -25 + 45 * tau;
          
          dx = (target_x - W * 0.68) * d_tau;
          dy = loop_elevation * (2 - 2 * tau) * d_tau;
        }
        
        planePosRef.current.x = cur_x;
        planePosRef.current.y = cur_y;
        planePosRef.current.z = cur_z;
        
        lastStuntPosRef.current = { x: cur_x, y: cur_y };
        
        if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
          headingRef.current = Math.atan2(dy, dx);
        }
        
        let targetYaw = -Math.PI / 2;
        let targetPitch = 0;
        
        if (dx < 0) {
          targetYaw = -Math.PI / 2;
          targetPitch = headingRef.current - Math.PI;
        } else {
          targetYaw = Math.PI / 2;
          targetPitch = -headingRef.current;
        }
        
        flightYawRef.current += (targetYaw - flightYawRef.current) * 0.12;
        fYaw = flightYawRef.current;
        fPitch = targetPitch;
        
        let targetRoll = 0;
        const yawDelta = targetYaw - flightYawRef.current;
        if (Math.abs(yawDelta) > 0.01) {
          const progress = (flightYawRef.current - (-Math.PI / 2)) / Math.PI;
          targetRoll = Math.sin(progress * Math.PI) * 0.85;
          if (targetYaw < 0) {
            targetRoll = -targetRoll;
          }
        }
        
        flightRollRef.current += (targetRoll - flightRollRef.current) * 0.15;
        fRoll = flightRollRef.current;

        // Add organic wind turbulence wiggle to the flight rotation to make it feel light and dynamic
        const windWiggleRoll = Math.sin(timeRef.current * 18) * 0.06;
        const windWigglePitch = Math.cos(timeRef.current * 14) * 0.03;
        fRoll += windWiggleRoll;
        fPitch += windWigglePitch;
      }

      // Parallax rotation added to flight rotation when landed
      if (isLandedRef.current) {
        fYaw += currentYawRef.current;
        fPitch += currentPitchRef.current;
      }

      // Smooth scale interpolation (no hover scale-up as per request; scaled down for mobile)
      const isMobile = cachedWidthRef.current <= 768;
      const baseScale = isMobile ? 0.95 : 1.3;
      let targetScale = baseScale;
      if (isStuntFlyingRef.current) {
        targetScale = baseScale * (1 - (planePosRef.current.z / 220));
      }
      planeScaleRef.current += (targetScale - planeScaleRef.current) * 0.15;

      // 3. Project central 3D plane
      const projectedVertices = planeRef.current.vertices.map(vertex => {
        return project(
          vertex,
          fYaw,
          fPitch,
          fRoll,
          centerX + planePosRef.current.x,
          centerY + planePosRef.current.y,
          planeScaleRef.current,
          planePosRef.current.z
        );
      });

      // Hitbox / hover logic — only run when mouse has moved
      if (mouseMovedRef.current) {
        mouseMovedRef.current = false;

        let minDistance = Infinity;
        planeRef.current.edges.forEach(edge => {
          const v1 = projectedVertices[edge[0]];
          const v2 = projectedVertices[edge[1]];
          const dist = getDistanceToSegment(mouseRef.current.x, mouseRef.current.y, v1.x, v1.y, v2.x, v2.y);
          if (dist < minDistance) {
            minDistance = dist;
          }
        });

        let isInsideAnyFace = false;
        for (const face of planeRef.current.faces) {
          const v0 = projectedVertices[face[0]];
          const v1 = projectedVertices[face[1]];
          const v2 = projectedVertices[face[2]];
          if (isPointInTriangle(mouseRef.current.x, mouseRef.current.y, v0.x, v0.y, v1.x, v1.y, v2.x, v2.y)) {
            isInsideAnyFace = true;
            break;
          }
        }

        const isHovering = !isStuntFlyingRef.current && (isInsideAnyFace || minDistance < 22);
        isHoveringPlaneRef.current = isHovering;
      }

      // Guard DOM writes behind dirty flag — only write when hover state changes
      const isHovering = isHoveringPlaneRef.current;
      if (isHovering !== prevHoveringRef.current) {
        prevHoveringRef.current = isHovering;
        if (isHovering) {
          document.body.classList.add("hovering-plane");
          if (canvas) canvas.style.pointerEvents = "auto";
        } else {
          document.body.classList.remove("hovering-plane");
          if (canvas) canvas.style.pointerEvents = "none";
        }
      }

      // Trajectory dash trail (ring buffer)
      const trailBuf = trailBufRef.current;
      let trailHead = trailHeadRef.current;
      let trailCount = trailCountRef.current;

      if (isStuntFlyingRef.current) {
        const writeIdx = (trailHead + trailCount) % TRAIL_MAX;
        trailBuf[writeIdx] = { x: projectedVertices[0].x, y: projectedVertices[0].y };
        if (trailCount < TRAIL_MAX) {
          trailCount++;
        } else {
          trailHead = (trailHead + 1) % TRAIL_MAX;
        }
      } else if (trailCount > 0) {
        trailHead = (trailHead + 1) % TRAIL_MAX;
        trailCount--;
      }
      trailHeadRef.current = trailHead;
      trailCountRef.current = trailCount;

      if (trailCount > 1) {
        ctx.beginPath();
        let first = true;
        for (let i = 0; i < trailCount; i++) {
          const pt = trailBuf[(trailHead + i) % TRAIL_MAX];
          if (i > 0) {
            const prev = trailBuf[(trailHead + i - 1) % TRAIL_MAX];
            if (Math.abs(pt.x - prev.x) > W * 0.4) {
              first = true;
              continue;
            }
          }
          if (first) {
            ctx.moveTo(pt.x, pt.y);
            first = false;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.strokeStyle = themeRef.current === "charcoal" ? "rgba(142, 202, 230, 0.88)" : "rgba(212, 163, 115, 0.88)";
        ctx.lineWidth = 1.6;
        ctx.setLineDash([5, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw and fill 3D Origami faces with shaded colors
      const isDark = themeRef.current === "charcoal";
      planeRef.current.faces.forEach((face, idx) => {
        ctx.beginPath();
        face.forEach((vIdx, i) => {
          const v = projectedVertices[vIdx];
          if (i === 0) ctx.moveTo(v.x, v.y);
          else ctx.lineTo(v.x, v.y);
        });
        ctx.closePath();
        
        if (isDark) {
          if (idx < 2) ctx.fillStyle = "rgba(15, 15, 13, 0.98)";
          else if (idx < 4) ctx.fillStyle = "rgba(28, 28, 26, 0.96)";
          else if (idx < 6) ctx.fillStyle = "rgba(46, 46, 44, 0.96)";
          else ctx.fillStyle = "rgba(36, 36, 34, 0.96)";
        } else {
          if (idx < 2) ctx.fillStyle = "rgba(195, 188, 158, 0.98)";
          else if (idx < 4) ctx.fillStyle = "rgba(228, 224, 192, 0.96)";
          else if (idx < 6) ctx.fillStyle = "rgba(252, 251, 227, 0.96)";
          else ctx.fillStyle = "rgba(242, 239, 210, 0.96)";
        }
        ctx.fill();
      });

      // Draw edges
      const edgeColor = isDark ? "rgba(245, 245, 237, 0.78)" : "rgba(60, 42, 33, 0.8)";
      const highlightColor = isDark ? "rgba(142, 202, 230, 0.88)" : "rgba(212, 163, 115, 0.88)";
      
      planeRef.current.edges.forEach(edge => {
        const v1 = projectedVertices[edge[0]];
        const v2 = projectedVertices[edge[1]];
        
        const isWingEdge = [4, 5, 8, 9].includes(edge[0]) || [4, 5, 8, 9].includes(edge[1]);
        const strokeColor = isWingEdge ? highlightColor : edgeColor;
        const strokeWidth = isWingEdge ? 2.5 : 1.5;
        
        drawWobblyLine(v1.x, v1.y, v2.x, v2.y, strokeColor, strokeWidth);
      });

      drawWobblyLine(projectedVertices[0].x, projectedVertices[0].y, projectedVertices[6].x, projectedVertices[6].y, edgeColor, 1.2);

      // Loop recursive call removed, handled by gsap.ticker
    }

    const resize = () => {
      cachedWidthRef.current = window.innerWidth;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      mouseMovedRef.current = true;
    };

    // Stunt takeoff trigger on global click
    const handleGlobalClick = (e) => {
      if (isStuntFlyingRef.current) return;

      const W = canvas.width;
      const H = canvas.height;
      const centerX = W / 2;
      const centerY = H / 2;

      let fYaw = flightYawRef.current;
      let fPitch = 0;
      let fRoll = flightRollRef.current;

      if (isLandedRef.current) {
        fYaw += currentYawRef.current;
        fPitch += currentPitchRef.current;
      }

      const projectedVertices = planeRef.current.vertices.map(vertex => {
        return project(
          vertex,
          fYaw,
          fPitch,
          fRoll,
          centerX + planePosRef.current.x,
          centerY + planePosRef.current.y,
          planeScaleRef.current,
          planePosRef.current.z
        );
      });

      let minDistance = Infinity;
      planeRef.current.edges.forEach(edge => {
        const v1 = projectedVertices[edge[0]];
        const v2 = projectedVertices[edge[1]];
        const dist = getDistanceToSegment(e.clientX, e.clientY, v1.x, v1.y, v2.x, v2.y);
        if (dist < minDistance) {
          minDistance = dist;
        }
      });

      let isInsideAnyFace = false;
      for (const face of planeRef.current.faces) {
        const v0 = projectedVertices[face[0]];
        const v1 = projectedVertices[face[1]];
        const v2 = projectedVertices[face[2]];
        if (isPointInTriangle(e.clientX, e.clientY, v0.x, v0.y, v1.x, v1.y, v2.x, v2.y)) {
          isInsideAnyFace = true;
          break;
        }
      }

      if (isInsideAnyFace || minDistance < 35) {
        playSFXRef.current("plane");
        
        isStuntFlyingRef.current = true;
        isLandedRef.current = false;
        
        stuntStartPosRef.current = { 
          x: planePosRef.current.x, 
          y: planePosRef.current.y, 
          z: planePosRef.current.z 
        };
        stuntProgressRef.current = 0;
        lastStuntPosRef.current = { x: planePosRef.current.x, y: planePosRef.current.y };
        
        const stuntObj = { progress: 0 };
        gsap.to(stuntObj, {
          progress: 1,
          duration: 3.2,
          ease: "power1.inOut",
          onUpdate: () => {
            stuntProgressRef.current = stuntObj.progress;
          },
          onComplete: () => {
            planePosRef.current.x = stuntStartPosRef.current.x;
            planePosRef.current.y = stuntStartPosRef.current.y;
            planePosRef.current.z = 20;
            isLandedRef.current = true;
            isStuntFlyingRef.current = false;
            stuntProgressRef.current = 0;
          }
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        gsap.ticker.remove(tick);
      } else {
        gsap.ticker.add(tick);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("click", handleGlobalClick);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleGlobalClick);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      gsap.ticker.remove(tick);
      document.body.classList.remove("hovering-plane");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="blueprint-3d-canvas"
      className={styles.blueprint3dCanvas}
    />
  );
}

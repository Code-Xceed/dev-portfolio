"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { DESIGN_SYSTEM } from "../config/design-system";

const AudioContext = createContext({
  soundEnabled: true,
  toggleSound: () => {},
  playSFX: (name, rate) => {},
  playKeyboardKey: (keyCode) => {},
  unlockAudio: () => {},
});

class HTML5AudioPool {
  constructor(src, volume = 1, poolSize = 6) {
    this.src = src;
    this.volume = volume;
    this.poolSize = poolSize;
    this.pool = [];
    this.currentIndex = 0;
    
    // Lazy initialize on first play/unlock to prevent early browser blocking
  }

  init() {
    if (this.pool.length > 0) return;
    for (let i = 0; i < this.poolSize; i++) {
      const audio = new Audio(this.src);
      audio.volume = this.volume;
      audio.preload = "auto";
      this.pool.push(audio);
    }
  }

  play(playbackRate = 1.0) {
    this.init();
    if (this.pool.length === 0) return;
    const audio = this.pool[this.currentIndex];
    audio.currentTime = 0;
    try {
      audio.playbackRate = playbackRate;
    } catch (e) {}
    audio.play().catch((e) => {
      // Swallowed browser autoplay policy block
    });
    this.currentIndex = (this.currentIndex + 1) % this.poolSize;
  }
}

export function AudioProvider({ children }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(true);
  const audioCtxRef = useRef(null);
  const keyboardInitialized = useRef(false);
  const keyboardConfig = useRef(null);
  const keyboardBuffer = useRef(null);
  const pools = useRef({});
  const lastHoverTime = useRef(0);
  const hoverStreak = useRef(0);
  const unlocked = useRef(false);

  // Sync mute state with localStorage on mount
  useEffect(() => {
    const savedSound = localStorage.getItem("portfolio-sound");
    if (savedSound === "false") {
      setSoundEnabled(false);
      soundEnabledRef.current = false;
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      soundEnabledRef.current = next;
      localStorage.setItem("portfolio-sound", next ? "true" : "false");
      
      if (!next) {
        // Stop all currently playing HTML5 audio
        Object.values(pools.current).forEach(pool => {
          if (pool && pool.pool) {
            pool.pool.forEach(audio => {
              if (audio && !audio.paused) {
                audio.pause();
                audio.currentTime = 0;
              }
            });
          }
        });
        
        // Mute Web Audio API
        if (audioCtxRef.current && audioCtxRef.current.state === "running") {
          audioCtxRef.current.suspend();
        }
      } else {
        // Resume Web Audio API
        if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }
      }
      
      return next;
    });
  }, []);

  const initPools = () => {
    if (Object.keys(pools.current).length > 0) return;

    pools.current = {
      hover: new HTML5AudioPool("/audios/sfx/chime2.ogg", 0.12, 12),
      drag: new HTML5AudioPool("/audios/sfx/drag.ogg", 0.3, 4),
      plane: new HTML5AudioPool("/audios/sfx/chime.ogg", 0.45, 4),
      emoji1: new HTML5AudioPool("/audios/sfx/315579920_nw_prev.m4a", 0.5, 4),
      emoji2: new HTML5AudioPool("/audios/sfx/318079656_nw_prev.m4a", 0.5, 4),
      emoji3: new HTML5AudioPool("/audios/sfx/318527441_nw_prev.m4a", 0.5, 4),
      hold: new HTML5AudioPool("/audios/sfx/hold.ogg", 0.45, 4),
      bounce1: new HTML5AudioPool("/audios/sfx/cartoon-boing-7-sound-effect-151311470_nw_prev.m4a", 0.5, 4),
      bounce2: new HTML5AudioPool("/audios/sfx/video-game-jump-sound-14-sound-effect-033920106_nw_prev.m4a", 0.4, 4),
      bounce3: new HTML5AudioPool("/audios/sfx/315579920_nw_prev.m4a", 0.5, 4),
      hudClick: new HTML5AudioPool("/audios/sfx/smooth-interface-ui-hud-user-sound-effect-159490742_nw_prev.m4a", 0.5, 8),
      clickTick: new HTML5AudioPool("/audios/sfx/click.ogg", 0.25, 12),
      paperTear: new HTML5AudioPool("/audios/sfx/hold.ogg", 0.45, 4),
      rubberEraser: new HTML5AudioPool("/audios/sfx/drag.ogg", 0.35, 4),
    };
  };

  const initKeyboard = async () => {
    if (keyboardInitialized.current) return;
    keyboardInitialized.current = true;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    audioCtxRef.current = new AudioContextClass();

    try {
      const configRes = await fetch(DESIGN_SYSTEM.keyboardAudio.configPath);
      keyboardConfig.current = await configRes.json();

      const soundRes = await fetch(DESIGN_SYSTEM.keyboardAudio.soundPath);
      const arrayBuffer = await soundRes.arrayBuffer();

      keyboardBuffer.current = await audioCtxRef.current.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.error("Failed to load mechanical keyboard sound pack:", e);
      keyboardInitialized.current = false;
    }
  };

  const unlockAudio = useCallback(() => {
    if (unlocked.current) return;
    initPools();

    // Unlock context
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }

    if (audioCtxRef.current && audioCtxRef.current.state === "suspended" && soundEnabledRef.current) {
      audioCtxRef.current.resume();
    }

    if (audioCtxRef.current && !keyboardInitialized.current) {
      initKeyboard();
    }

    // Pre-warm HTML5 pools
    let allUnlocked = true;
    Object.values(pools.current).forEach((pool) => {
      pool.init();
      pool.pool.forEach((audio) => {
        if (audio.dataset.unlocked === "true") return;
        const originalVolume = audio.volume;
        audio.volume = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              audio.pause();
              audio.currentTime = 0;
              audio.volume = originalVolume;
              audio.dataset.unlocked = "true";
            })
            .catch(() => {
              audio.volume = originalVolume;
              allUnlocked = false;
            });
        } else {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = originalVolume;
          audio.dataset.unlocked = "true";
        }
      });
    });

    if (allUnlocked && Object.keys(pools.current).length > 0 && (!audioCtxRef.current || audioCtxRef.current.state === "running")) {
      unlocked.current = true;
    }
  }, []);

  // Play normal sfx
  const playSFX = useCallback((name, customRate = null) => {
    if (!soundEnabledRef.current) return;
    initPools();

    if (name === "bounce") {
      const bouncePools = ["bounce1", "bounce2", "bounce3"];
      const selected = bouncePools[Math.floor(Math.random() * bouncePools.length)];
      pools.current[selected]?.play();
      return;
    }

    if (name === "emoji") {
      const emojiPools = ["emoji1", "emoji2", "emoji3"];
      const selected = emojiPools[Math.floor(Math.random() * emojiPools.length)];
      pools.current[selected]?.play();
      return;
    }

    const pool = pools.current[name];
    if (!pool) return;

    if (name === "hover") {
      const now = Date.now();
      if (now - lastHoverTime.current < 1000) {
        hoverStreak.current = (hoverStreak.current + 1) % 6;
      } else {
        hoverStreak.current = 0;
      }
      lastHoverTime.current = now;

      // Pentatonic scale arpeggio climb
      const pentatonicMultipliers = [1.0, 1.125, 1.25, 1.5, 1.667, 2.0];
      const rate = pentatonicMultipliers[hoverStreak.current];
      pool.play(rate);
    } else {
      pool.play(customRate || 1.0);
    }
  }, []);

  // Play mechanical keyboard keystroke
  const playKeyboardKey = useCallback((keyCode) => {
    if (!soundEnabledRef.current || !keyCode) return;
    if (!keyboardInitialized.current) {
      initKeyboard();
      return;
    }
    if (!audioCtxRef.current || !keyboardBuffer.current || !keyboardConfig.current) return;

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    const defines = keyboardConfig.current.defines;
    const keyStr = keyCode.toString();
    let slice = defines[keyStr];

    if (!slice) {
      if (keyCode === 32) slice = defines["32"]; // Space
      else if (keyCode === 13) slice = defines["13"]; // Enter
      else if (keyCode === 8) slice = defines["8"]; // Backspace
      if (!slice) slice = defines["65"] || Object.values(defines)[0];
    }

    if (!slice) return;

    const [startMs, durationMs] = slice;
    const offset = startMs / 1000;
    const duration = durationMs / 1000;

    try {
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = keyboardBuffer.current;
      
      const now = audioCtxRef.current.currentTime;
      source.playbackRate.setValueAtTime(0.96 + Math.random() * 0.08, now);
      
      const gainNode = audioCtxRef.current.createGain();
      gainNode.gain.setValueAtTime(0.55, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      source.connect(gainNode);
      gainNode.connect(audioCtxRef.current.destination);
      
      source.start(0, offset, duration);
    } catch (e) {
      // Swallowed node error
    }
  }, []);

  // Set up click/gesture triggers to unlock audio context dynamically
  useEffect(() => {
    const handleGesture = () => {
      unlockAudio();
      if (unlocked.current) {
        window.removeEventListener("click", handleGesture);
        window.removeEventListener("touchend", handleGesture);
        window.removeEventListener("pointerdown", handleGesture);
      }
    };

    window.addEventListener("click", handleGesture);
    window.addEventListener("touchend", handleGesture);
    window.addEventListener("pointerdown", handleGesture);

    return () => {
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("touchend", handleGesture);
      window.removeEventListener("pointerdown", handleGesture);
    };
  }, []);

  return (
    <AudioContext.Provider value={{ soundEnabled, toggleSound, playSFX, playKeyboardKey, unlockAudio }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}

/**
 * Global Design System Config & Theme Tokens
 * Houses all skeuomorphic theme configurations, typography stacks, spacing scales,
 * mechanical keyboard sound config paths, and canvas/animation constants.
 */

export const DESIGN_SYSTEM = {
  // Theme Color Configurations
  themes: {
    default: {
      id: "default",
      name: "Vintage Sepia",
      bgColor: "#DDD8C4",
      paperBg: "#FCFBE3",
      paperBgRgb: "252, 251, 227",
      textColor: "#3C2A21",
      textLight: "#5C4A3F",
      borderColor: "#3C2A21",
      highlightColor: "#D4A373",
      highlighter: "#FFEB3B",
      gridColor: "rgba(60, 42, 33, 0.04)",
      tapeBg: "rgba(250, 240, 215, 0.75)",
      tapeBorder: "rgba(60, 42, 33, 0.15)",
      dusterShadow: "rgba(60, 42, 33, 0.24)",
    },
    charcoal: {
      id: "charcoal",
      name: "Crumpled Charcoal",
      bgColor: "#06080F",
      paperBg: "#111520",
      paperBgRgb: "17, 21, 32",
      textColor: "#FFFFFF",
      textLight: "#94A3B8",
      borderColor: "#2A3245",
      highlightColor: "#38BDF8",
      highlighter: "rgba(56, 189, 248, 0.15)",
      gridColor: "rgba(255, 255, 255, 0.012)",
      tapeBg: "rgba(42, 50, 69, 0.6)",
      tapeBorder: "rgba(255, 255, 255, 0.1)",
      dusterShadow: "rgba(0, 0, 0, 0.5)",
    },
  },

  // Typography Config
  typography: {
    fonts: {
      mono: "var(--font-fira-code), monospace",
      outfit: "var(--font-outfit), sans-serif",
      hand: "var(--font-caveat), cursive",
      script: "var(--font-dancing-script), cursive",
    },
    sizes: {
      heroTitle: "clamp(1.5rem, 1rem + 3vw, 3.25rem)",
      sectionTitle: "clamp(1rem, 0.7rem + 1.5vw, 1.375rem)",
      body: "clamp(0.875rem, 0.8rem + 0.4vw, 1.0625rem)",
      monoLabel: "clamp(0.5625rem, 0.5rem + 0.3vw, 0.6875rem)",
      hand: "clamp(1rem, 0.85rem + 0.75vw, 1.25rem)",
    },
  },

  // Spacing Scales
  spacing: {
    pagePad: "clamp(12px, 3vw, 40px)",
    sectionGap: "clamp(12px, 2vw, 25px)",
    cardPad: "clamp(12px, 2vw, 24px)",
  },

  // Motion Settings
  motion: {
    transitionJelly: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.28), box-shadow 0.4s ease",
    sketchFilter: "url(#sketch-vibration)",
    pencilFilter: "url(#pencil-scratch-filter)",
  },

  // Mechanical Keyboard Asset Setup
  keyboardAudio: {
    configPath: "/cherrymx-blue-abs/config.json",
    soundPath: "/cherrymx-blue-abs/sound.ogg",
  },
};

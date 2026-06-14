import { Fira_Code, Outfit, Caveat, Dancing_Script } from "next/font/google";
import { ThemeProvider } from "../context/theme-context";
import { AudioProvider } from "../context/audio-context";
import TerrainBackground from "../components/terrain-background";
import ThemeRulerOverlay from "../components/theme-ruler-overlay";
import CustomCursor from "../components/custom-cursor";
import "./globals.css";

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
});

export const metadata = {
  title: "Aditya | Creative Developer Portfolio",
  description: "Welcome to the sketchbook desk portfolio of Aditya, a creative developer specializing in interactive, physics-driven web experiences.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${firaCode.variable} ${outfit.variable} ${caveat.variable} ${dancingScript.variable}`}>
      <body className="theme-grid" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('portfolio-theme') === 'charcoal') {
                  document.body.classList.add('theme-charcoal');
                }
              } catch (e) {}
            `,
          }}
        />
        <ThemeProvider>
          <AudioProvider>
            <TerrainBackground />
            {children}
            {/* Renders nothing until a theme transition is requested,
                then mounts the diagonal drafting ruler overlay that
                sweeps top-left → bottom-right while the View
                Transitions API reveals the new theme along the same
                diagonal. */}
            <ThemeRulerOverlay />
          </AudioProvider>
        </ThemeProvider>
        
        {/* Hand-drawn vector sketch turbulence filters definitions */}
        <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }} xmlns="http://www.w3.org/2000/svg" version="1.1">
          <defs>
            {/* Sketch vibration filter */}
            <filter id="sketch-vibration" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={3} result="noise" seed={3} />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            
            {/* Realistic rough pencil scratch filter */}
            <filter id="pencil-scratch-filter" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves={4} result="noise" seed={5} />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.6" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            
            {/* Crumpled paper texture pattern */}
            <pattern id="paper-crumple-pattern" width="300" height="300" patternUnits="userSpaceOnUse">
              <path d="M 0 50 Q 75 75 150 50 T 300 50" fill="none" stroke="rgba(0,0,0,0.02)" strokeWidth="1" />
              <path d="M 50 0 Q 75 100 50 200 T 50 300" fill="none" stroke="rgba(0,0,0,0.025)" strokeWidth="1.2" />
            </pattern>
          </defs>
        </svg>
      </body>
    </html>
  );
}


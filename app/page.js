"use client";

import React, { useState } from "react";
import WelcomeScreen from "../components/welcome-screen";
import HorizontalScroll from "../components/horizontal-scroll";
import DrawingSheet from "../components/drawing-sheet";
import AdityaText from "../components/aditya-text";
import PolaroidDeck from "../components/polaroid-deck";
import AboutCard from "../components/about-card";

export default function Home() {
  const [revealed, setRevealed] = useState(false);

  return (
    <>
      <WelcomeScreen onRevealComplete={() => setRevealed(true)} />
      
      <div
        style={{
          transition: "opacity 0.8s ease",
          pointerEvents: revealed ? "auto" : "none",
        }}
      >
        <HorizontalScroll pagesCount={3}>
          {/* Screen 1: Home / Hero */}
          <div className="horizontal-page-panel">
            <DrawingSheet id="drawing-sheet-1">
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AdityaText />
                <PolaroidDeck />
                <AboutCard />
                {/* Empty canvas ready for Home content */}
              </div>
            </DrawingSheet>
          </div>

          {/* Screen 2: Skills / Experience */}
          <div className="horizontal-page-panel">
            <DrawingSheet id="drawing-sheet-2">
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Empty canvas ready for Skills content */}
              </div>
            </DrawingSheet>
          </div>

          {/* Screen 3: Projects / Contact */}
          <div className="horizontal-page-panel">
            <DrawingSheet id="drawing-sheet-3">
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Empty canvas ready for Projects content */}
              </div>
            </DrawingSheet>
          </div>
        </HorizontalScroll>
      </div>
    </>
  );
}

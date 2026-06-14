"use client";

import React, { useState, useCallback } from "react";
import WelcomeScreen from "../components/welcome-screen";
import HorizontalScroll from "../components/horizontal-scroll";
import DrawingSheet from "../components/drawing-sheet";
import AdityaText from "../components/aditya-text";
import PolaroidDeck from "../components/polaroid-deck";
import AboutCard from "../components/about-card";
import SkillsCarousel from "../components/skills-carousel";
import BentoDock from "../components/bento-dock";
import PaperEmojiKeychain from "../components/paper-emoji-keychain";
import PaperPlaneEngine from "../components/paper-plane-engine";

import ProjectsSection from "../components/projects-section";
import ContactSection from "../components/contact-section";

export default function Home() {
  const [revealed, setRevealed] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const handleRevealComplete = useCallback(() => setRevealed(true), []);

  return (
    <>
      <WelcomeScreen onRevealComplete={handleRevealComplete} />

      <div
        style={{
          transition: "opacity 0.8s ease",
          pointerEvents: revealed ? "auto" : "none",
        }}
      >
        <DrawingSheet id="drawing-sheet" ornaments={<PaperEmojiKeychain />}>
          <HorizontalScroll pagesCount={3} activePage={activePage} onPageChange={setActivePage}>
            {/* Screen 1: Home / Hero */}
            <div className="horizontal-page-panel">
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  position: "relative",
                  paddingTop: "20px"
                }}
              >
                <AdityaText />
                <PolaroidDeck />
                <AboutCard />
              </div>
            </div>

            {/* Screen 2: Projects */}
            <div className="horizontal-page-panel">
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                <SkillsCarousel revealed={revealed} activePage={activePage} />
                <ProjectsSection revealed={revealed} activePage={activePage} />
              </div>
            </div>

            {/* Screen 3: Contact */}
            <div className="horizontal-page-panel">
              <ContactSection />
            </div>
          </HorizontalScroll>
        </DrawingSheet>
      </div>

      <BentoDock activePage={activePage} onPageChange={setActivePage} />
      <PaperPlaneEngine />
    </>
  );
}

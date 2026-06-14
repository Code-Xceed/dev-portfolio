"use client";

import React, { useState, useCallback } from "react";
import { useAudio } from "../../context/audio-context";
import styles from "./contact-section.module.css";

const TESTIMONIALS_DATA_1 = [
  { text: "Delivered a pixel-perfect interactive prototype in under a week. Exceptional craft.", author: "— SARAH K. / FINTECH" },
  { text: "The attention to micro-interactions was beyond anything we expected.", author: "— MARCUS T. / AGENCY" },
  { text: "Turned our rough wireframes into a living, breathing experience.", author: "— ELENA R. / PRODUCT" },
  { text: "Brilliant architectural thinking. Every component felt intentional.", author: "— JAMES W. / CTO" },
  { text: "Fast, communicative, and the final result exceeded every benchmark.", author: "— PRIYA D. / VENTURE" }
];

const TESTIMONIALS_DATA_2 = [
  { text: "One of those rare engineers who truly understands design intent.", author: "— ALEX M. / CREATIVE" },
  { text: "Our conversion rate jumped 40% after the redesign. Worth every penny.", author: "— DAVID L. / ECOM" },
  { text: "The WebGL work was museum-quality. Absolutely stunning portfolio piece.", author: "— NINA S. / ART DIR." },
  { text: "Clean code, beautiful UI, and delivered ahead of schedule. Rare combo.", author: "— OMAR F. / TECH LEAD" },
  { text: "Brought a level of polish that made our investors take notice immediately.", author: "— RACHEL H. / FOUNDER" }
];

// Duplicate lists once for seamless vertical loop scroll
const TESTIMONIALS_UP = [...TESTIMONIALS_DATA_1, ...TESTIMONIALS_DATA_1];
const TESTIMONIALS_DOWN = [...TESTIMONIALS_DATA_2, ...TESTIMONIALS_DATA_2];

const SOCIAL_LINKS = [
  {
    label: "GITHUB",
    url: "https://github.com",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
      </svg>
    )
  },
  {
    label: "LINKEDIN",
    url: "https://linkedin.com",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
      </svg>
    )
  },
  {
    label: "TWITTER",
    url: "https://twitter.com",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
      </svg>
    )
  },
  {
    label: "EMAIL",
    url: "mailto:aditya@studio.com",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
    )
  }
];

const BUDGET_VALS = ["Minor Blueprint", "Standard Layout", "Custom Detail", "Monumental Build"];

export default function ContactSection() {
  const { playSFX, playKeyboardKey } = useAudio();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [receiptDetails, setReceiptDetails] = useState({
    txId: "",
    name: "",
    email: "",
    subject: "",
    budget: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    playSFX("clickTick");

    // Procedural receipt fields generator
    const randomTxId = `DWG-TX-${Math.floor(100000 + Math.random() * 900000)}`;
    const randomBudget = BUDGET_VALS[Math.floor(Math.random() * BUDGET_VALS.length)];

    setReceiptDetails({
      txId: randomTxId,
      name: formData.name,
      email: formData.email,
      subject: formData.subject || "Message Inquiry",
      budget: randomBudget
    });

    setSubmitted(true);
  };

  const handleReset = () => {
    playSFX("clickTick");
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
    setSubmitted(false);
  };

  return (
    <div className={styles.contactLayout} id="section-contact">
      
      {/* Left Page: Interactive Commission Ledger Form */}
      <div className={styles.projectSpecsPane}>
        <div className={styles.contactFormCard}>
          
          {/* Metallic rivets binder look */}
          <div className={styles.rivetBinding}>
            <div className={styles.rivet} />
            <div className={styles.rivet} />
            <div className={styles.rivet} />
          </div>

          <div className={`${styles.aboutMetadata} font-mono`}>
            <span style={{ fontWeight: "bold" }}>
              {submitted ? "Success Receipt" : "Message Draft"}
            </span>
            <span style={{ fontWeight: "bold" }}>
              {submitted ? "Sent" : "Ready to Send"}
            </span>
          </div>

          {!submitted ? (
            <form className={styles.contactFormFields} onSubmit={handleSubmit}>
              <h3 className={`${styles.contactTitle} font-mono`}>SEND A MESSAGE</h3>

              {/* Client Name Field */}
              <div className={styles.inputGroup}>
                <label className={`${styles.contactLabel} font-mono`} htmlFor="contact-name">NAME / AGENCY</label>
                <div className={styles.ledgerFieldCell}>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onKeyDown={(e) => playKeyboardKey(e.keyCode)}
                    className={styles.contactInput}
                    placeholder="Name / Agency"
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Coordinate Email Field */}
              <div className={styles.inputGroup}>
                <label className={`${styles.contactLabel} font-mono`} htmlFor="contact-email">EMAIL</label>
                <div className={styles.ledgerFieldCell}>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onKeyDown={(e) => playKeyboardKey(e.keyCode)}
                    className={styles.contactInput}
                    placeholder="Email Address"
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Subject Selection Field */}
              <div className={styles.inputGroup}>
                <label className={`${styles.contactLabel} font-mono`} htmlFor="contact-subject">SUBJECT</label>
                <div className={styles.ledgerFieldCell}>
                  <select
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onKeyDown={(e) => playKeyboardKey(e.keyCode)}
                    className={styles.contactSelect}
                    required
                  >
                    <option value="" disabled>Select Subject</option>
                    <option value="Chatting">Chatting</option>
                    <option value="Project">Project</option>
                    <option value="Hire Me">Hire Me</option>
                    <option value="Games">Games</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Message Area */}
              <div className={styles.inputGroup}>
                <label className={`${styles.contactLabel} font-mono`} htmlFor="contact-message">MESSAGE</label>
                <div className={styles.ledgerFieldCell}>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onKeyDown={(e) => playKeyboardKey(e.keyCode)}
                    className={styles.contactTextarea}
                    rows="3"
                    placeholder="Write your message here..."
                    required
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitBtn}>
                SEND MESSAGE
              </button>
            </form>
          ) : (
            <div className={styles.contactSuccessReceipt}>
              <h3 className={`${styles.receiptTitle} font-mono`}>MESSAGE DISPATCHED</h3>
              <div className={styles.receiptDivider} />
              
              <div className={`${styles.receiptDetails} font-mono`}>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>ID:</span>
                  <span className={styles.receiptValueAccent}>{receiptDetails.txId}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>NAME:</span>
                  <span className={`${styles.receiptValue} font-hand`} style={{ fontSize: "14px" }}>{receiptDetails.name}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>EMAIL:</span>
                  <span className={`${styles.receiptValue} font-hand`} style={{ fontSize: "14px" }}>{receiptDetails.email}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>SUBJECT:</span>
                  <span className={styles.receiptValue}>{receiptDetails.subject}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>BUDGET:</span>
                  <span className={styles.receiptValueAccent}>{receiptDetails.budget}</span>
                </div>
              </div>

              <p className={`${styles.receiptMessage} font-hand`}>
                Your message transmission is logged successfully. I will get back to you within 24-48 business hours.
              </p>

              <button type="button" onClick={handleReset} className={styles.resetBtn}>
                SEND NEW MESSAGE
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Right Page: Handles Grid & Testimonials Marquee */}
      <div className={styles.projectSpiralPane}>
        <div className={styles.contactAboutCanvas}>
          
          {/* Blueprint vector guide backgrounds */}
          <div className={styles.blueprintBackground}>
            <svg viewBox="0 0 400 400" className={styles.blueprintVectorSvg} stroke="var(--border-color)" strokeWidth="0.8">
              <circle cx="200" cy="200" r="140" stroke="var(--highlight-color)" strokeWidth="0.6" strokeDasharray="4 4" fill="none" opacity="0.4" />
              <circle cx="200" cy="200" r="90" stroke="var(--border-color)" strokeWidth="0.8" fill="none" />
              <circle cx="200" cy="200" r="40" stroke="var(--highlight-color)" strokeDasharray="2 2" fill="none" />
              <path d="M 40 200 H 360 M 200 40 V 360" />
              <line x1="87" y1="87" x2="313" y2="313" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* CTA Title */}
          <div className={styles.letsBuildCTA}>
            <h2 className={`${styles.letsBuildTitle} font-hand`}>
              Let&apos;s build<br />something <span className={styles.monumentalHighlight}>monumental.</span>
            </h2>
          </div>

          {/* Social Links handles */}
          <div className={styles.socialLinksGrid}>
            {SOCIAL_LINKS.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.tactileHandleCard} font-mono`}
                onMouseEnter={() => playSFX("hover")}
              >
                <div className={styles.handleContent}>
                  <span className={styles.handleLabel}>
                    {link.icon}
                    {link.label}
                  </span>
                  <span className={styles.handleArrow}>↗</span>
                </div>
              </a>
            ))}
          </div>

          {/* Small pill handles for extra platforms */}
          <div className={styles.extraPillsGrid}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.extraPill} onMouseEnter={() => playSFX("hover")} title="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={styles.extraPill} onMouseEnter={() => playSFX("hover")} title="YouTube">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.122C19.53 3.545 12 3.545 12 3.545s-7.53 0-9.388.496a3.003 3.003 0 0 0-2.11 2.122C0 8.005 0 12 0 12s0 3.995.502 5.837a3.003 3.003 0 0 0 2.11 2.122c1.858.496 9.386.496 9.386.496s7.53 0 9.386-.496a3.003 3.003 0 0 0 2.11-2.122C24 15.995 24 12 24 12s0-3.995-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className={styles.extraPill} onMouseEnter={() => playSFX("hover")} title="X">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25H21.55L14.325 10.51L22.825 21.75H16.17L10.956 14.93L4.99 21.75H1.68L9.412 12.915L1.254 2.25H8.08L12.793 8.481L18.244 2.25ZM17.083 19.77H18.92L7.084 4.126H5.117L17.083 19.77Z" />
              </svg>
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className={styles.extraPill} onMouseEnter={() => playSFX("hover")} title="Discord">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c1-.73,2-1.5,3-2.29a74.58,74.58,0,0,0,72.06,0c1,.79,2,1.56,3,2.29a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.06-18.83C129,54.65,122.94,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
              </svg>
            </a>
          </div>

          {/* Scrolling Testimonials Marquee */}
          <div className={styles.testimonialsMarqueeSection}>
            <div className={styles.testimonialsHeader}>
              <h4 className={`${styles.testimonialsTitle} font-mono`}>TESTIMONIALS</h4>
              <span className={styles.dividerLine} />
            </div>

            <div className={styles.testimonialsScrollTrack}>
              {/* Column 1 - scrolls up */}
              <div className={`${styles.testimonialCol} ${styles.testimonialColUp}`}>
                {TESTIMONIALS_UP.map((t, idx) => (
                  <div key={`t-up-${idx}`} className={`${styles.testimonialCard} font-hand`}>
                    <p>&quot;{t.text}&quot;</p>
                    <div className={styles.testimonialMeta}>
                      <span className={`${styles.testimonialAuthor} font-mono`}>{t.author}</span>
                      <span className={styles.testimonialStars}>★★★★★</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Column 2 - scrolls down */}
              <div className={`${styles.testimonialCol} ${styles.testimonialColDown}`}>
                {TESTIMONIALS_DOWN.map((t, idx) => (
                  <div key={`t-down-${idx}`} className={`${styles.testimonialCard} font-hand`}>
                    <p>&quot;{t.text}&quot;</p>
                    <div className={styles.testimonialMeta}>
                      <span className={`${styles.testimonialAuthor} font-mono`}>{t.author}</span>
                      <span className={styles.testimonialStars}>★★★★★</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

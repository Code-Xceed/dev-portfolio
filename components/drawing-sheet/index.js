"use client";

import React from "react";
import styles from "./drawing-sheet.module.css";

// DrawingSheet is the rectangular paper card on each horizontal
// page. Its <main> wrapper is the positioning context for any
// absolutely-positioned ornaments (e.g. the paper emoji keychain),
// while the inner scroll container is where the page content goes.
//
// Children are split via the `ornaments` and `body` props. Anything
// in `body` goes inside the scroll container; anything in
// `ornaments` (or as the rest of children) becomes a child of
// <main> and is positioned absolutely. This lets decorations hang
// over the sheet's content edge without being clipped by the scroll
// container's overflow:hidden.
//
// For backward compat, plain children still go into the body.
export default function DrawingSheet({
  children,
  ornaments,
  className = "",
  id = "",
}) {
  return (
    <main className={`${styles.drawingSheet} ${className}`} id={id}>
      <div className={styles.scrollContainer}>{children}</div>
      {ornaments}
    </main>
  );
}

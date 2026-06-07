"use client";

import React from "react";
import styles from "./drawing-sheet.module.css";

export default function DrawingSheet({ children, className = "", id = "" }) {
  return (
    <main className={`${styles.drawingSheet} ${className}`} id={id}>
      <div className={styles.scrollContainer}>
        {children}
      </div>
    </main>
  );
}

"use client";

import { useEffect } from "react";

export default function HideNextIndicator() {
  useEffect(() => {
    const interval = setInterval(() => {
      const indicator = document.querySelector(
        'div[style*="pointer-events: none"][style*="z-index: 999999"]'
      );
      if (indicator) {
        (indicator as HTMLElement).style.display = "none";
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return null;
}

"use client";

import { useState } from "react";

/**
 * Manual theme override. Light is the default on first load
 * regardless of system preference; the toggle flips [data-theme]
 * on <html> and the CSS decides which icon is visible. No
 * persistence — deliberately, per the prototype: the override
 * resets on reload back to light, not back to system preference.
 */
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  function handleClick() {
    const nextIsDark = !isDark;
    document.documentElement.setAttribute(
      "data-theme",
      nextIsDark ? "dark" : "light",
    );
    setIsDark(nextIsDark);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={handleClick}
    >
      <svg className="theme-icon theme-icon--moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" />
      </svg>
      <svg className="theme-icon theme-icon--sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </svg>
    </button>
  );
}

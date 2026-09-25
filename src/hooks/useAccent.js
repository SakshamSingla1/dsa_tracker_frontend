import { useEffect, useState } from "react";
import { ACCENTS, DEFAULT_ACCENT } from "../theme/accents.js";

const ACCENT_KEY = "dsa-accent";

function loadAccent() {
  try {
    const stored = localStorage.getItem(ACCENT_KEY);
    return stored && ACCENTS[stored] ? stored : DEFAULT_ACCENT;
  } catch {
    return DEFAULT_ACCENT;
  }
}

/** The chosen accent color, applied as CSS custom properties on <html>. Independent of light/dark. */
export function useAccent(isDark) {
  const [accent, setAccentState] = useState(loadAccent);

  useEffect(() => {
    const palette = (ACCENTS[accent] ?? ACCENTS[DEFAULT_ACCENT])[isDark ? "dark" : "light"];
    const root = document.documentElement.style;
    root.setProperty("--accent", palette.accent);
    root.setProperty("--accent-rgb", palette.accentRgb);
    root.setProperty("--accent-ink", palette.accentInk);
    root.setProperty("--accent-soft", palette.accentSoft);
    root.setProperty("--accent-line", palette.accentLine);
    root.setProperty("--ring-gradient-end", palette.ringEnd);
    root.setProperty("--focus", palette.accent);
  }, [accent, isDark]);

  const setAccent = (next) => {
    if (!ACCENTS[next]) return;
    setAccentState(next);
    try {
      localStorage.setItem(ACCENT_KEY, next);
    } catch {
      /* private browsing or storage disabled: preference just won't persist */
    }
  };

  return { accent, setAccent };
}

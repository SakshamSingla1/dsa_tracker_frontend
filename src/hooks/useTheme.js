import { useEffect, useState } from "react";

const THEME_KEY = "dsa-theme";

function loadTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

/** Explicit light/dark override, or null to follow the OS setting. Persists across visits. */
export function useTheme() {
  const [theme, setTheme] = useState(loadTheme);

  useEffect(() => {
    if (theme) {
      document.documentElement.dataset.theme = theme;
    } else {
      delete document.documentElement.dataset.theme;
    }
    try {
      if (theme) localStorage.setItem(THEME_KEY, theme);
      else localStorage.removeItem(THEME_KEY);
    } catch {
      /* private browsing or storage disabled: preference just won't persist */
    }
  }, [theme]);

  const toggle = () => {
    setTheme((current) => {
      const effectivelyDark = current ? current === "dark" : systemPrefersDark();
      return effectivelyDark ? "light" : "dark";
    });
  };

  const isDark = theme ? theme === "dark" : systemPrefersDark();

  return { theme, isDark, toggle };
}

import { useEffect, useRef, useState } from "react";

const PREFS_KEY = "dsa-reminder-prefs";
const LAST_SHOWN_KEY = "dsa-reminder-last-shown";

const DEFAULT_PREFS = { enabled: false, dailyTime: "19:00", streakAtRisk: true, reviewDue: true };

function loadPrefs() {
  try {
    const stored = localStorage.getItem(PREFS_KEY);
    return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function hasNotificationSupport() {
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * Local, in-tab reminders (due reviews / streak-at-risk) via the browser Notification API.
 * This is a single-machine personal tool with no push server, so reminders only fire while
 * a tab is open or regains focus -- there's deliberately no background/closed-tab push here.
 */
export function useReminders({ reviewDueCount = 0, solvedToday = false, currentStreak = 0 } = {}) {
  const [prefs, setPrefsState] = useState(loadPrefs);
  const [permission, setPermission] = useState(() => (hasNotificationSupport() ? Notification.permission : "unsupported"));

  const setPrefs = (patch) => {
    setPrefsState((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {
        /* private browsing or storage disabled: preference just won't persist */
      }
      return next;
    });
  };

  const requestPermission = () => {
    if (!hasNotificationSupport()) return Promise.resolve("unsupported");
    return Notification.requestPermission().then((result) => {
      setPermission(result);
      return result;
    });
  };

  // Refs so the focus/mount effect below can read the latest values without re-subscribing
  // its listeners on every render. Updated from an effect (not during render) to stay a
  // side-effect rather than a render-time mutation.
  const liveRef = useRef({ reviewDueCount, solvedToday, currentStreak });
  const prefsRef = useRef(prefs);
  useEffect(() => {
    liveRef.current = { reviewDueCount, solvedToday, currentStreak };
    prefsRef.current = prefs;
  });

  useEffect(() => {
    const maybeNotify = () => {
      if (!hasNotificationSupport() || Notification.permission !== "granted") return;
      const p = prefsRef.current;
      if (!p.enabled) return;

      const now = new Date();
      const [h, m] = (p.dailyTime || "19:00").split(":").map(Number);
      const pastDailyTime = now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
      if (!pastDailyTime) return;

      let lastShown = null;
      try {
        lastShown = localStorage.getItem(LAST_SHOWN_KEY);
      } catch {
        /* ignore */
      }
      if (lastShown === todayKey()) return;

      const { reviewDueCount: due, solvedToday: solved, currentStreak: streak } = liveRef.current;
      const dueMsg = p.reviewDue && due > 0 ? `${due} review${due === 1 ? "" : "s"} due` : null;
      const riskMsg =
        p.streakAtRisk && !solved
          ? streak > 0
            ? `keep your ${streak}-day streak alive -- solve one today!`
            : "haven't solved anything today yet"
          : null;
      const body = [dueMsg, riskMsg].filter(Boolean).join(" · ");
      if (!body) return;

      try {
        new Notification("DSA Tracker", { body, icon: "/favicon.svg" });
        localStorage.setItem(LAST_SHOWN_KEY, todayKey());
      } catch {
        /* e.g. permission revoked mid-session */
      }
    };

    maybeNotify();
    const onVisible = () => {
      if (document.visibilityState === "visible") maybeNotify();
    };
    window.addEventListener("focus", maybeNotify);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", maybeNotify);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [reviewDueCount, solvedToday, currentStreak, prefs.enabled, prefs.dailyTime, prefs.reviewDue, prefs.streakAtRisk]);

  return { prefs, setPrefs, permission, requestPermission, supported: hasNotificationSupport() };
}

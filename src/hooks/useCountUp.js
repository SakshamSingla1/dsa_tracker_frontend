import { useEffect, useRef, useState } from "react";

/** Animates a number from its last displayed value to `target` on change. */
export function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(target);
  const displayedRef = useRef(target);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      displayedRef.current = target;
      setValue(target);
      return;
    }

    const from = displayedRef.current;
    if (from === target) return;

    let raf;
    let start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + (target - from) * eased);
      setValue(next);
      displayedRef.current = next;
      if (progress < 1) raf = requestAnimationFrame(step);
      else displayedRef.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}

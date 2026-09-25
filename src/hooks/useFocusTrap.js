import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Traps Tab/Shift+Tab focus within the returned container ref while `active` is true --
 *  focuses the first focusable element on activation, cycles focus at the edges, and restores
 *  focus to whatever was focused before on deactivation/unmount. For modals/dialogs/popovers
 *  that would otherwise let Tab escape to the page behind them. */
export function useFocusTrap(active) {
  const containerRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!active) return;

    previouslyFocused.current = document.activeElement;

    const container = containerRef.current;
    const focusFirst = () => {
      const focusable = container?.querySelectorAll(FOCUSABLE_SELECTOR);
      focusable?.[0]?.focus();
    };
    // Deferred a tick so the dialog's own contents (which may mount alongside this effect)
    // are in the DOM before we try to find something focusable inside them.
    const raf = requestAnimationFrame(focusFirst);

    const onKeyDown = (e) => {
      if (e.key !== "Tab" || !container) return;
      const focusable = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [active]);

  return containerRef;
}

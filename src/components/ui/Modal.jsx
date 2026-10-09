import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "../../hooks/useFocusTrap.js";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
};

/** Centered dialog with a backdrop, focus trap, and Escape-to-close -- the base for every
 *  modal/confirm dialog in the app. Renders nothing while `open` is false. */
export default function Modal({ open, onClose, title, size = "md", footer = null, children }) {
  const containerRef = useFocusTrap(open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${SIZES[size] ?? SIZES.md}
          bg-paper-raised border border-line rounded-xl shadow-lg
          flex flex-col max-h-[85vh]`}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
            <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
            <button
              onClick={onClose}
              aria-label="Close"
              className="h-7 w-7 flex items-center justify-center rounded-md text-ink-soft hover:bg-ink/5 hover:text-ink"
            >
              ×
            </button>
          </div>
        )}
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-3.5 border-t border-line flex justify-end gap-2 shrink-0">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

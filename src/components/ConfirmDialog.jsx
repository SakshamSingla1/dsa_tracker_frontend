import { useFocusTrap } from "../hooks/useFocusTrap.js";
import { Button } from "./ui/index.js";

export default function ConfirmDialog({ open, title, body, confirmLabel = "Confirm", onConfirm, onCancel }) {
  const trapRef = useFocusTrap(open);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-[2px]" onMouseDown={onCancel}>
      <div
        ref={trapRef}
        onMouseDown={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm bg-paper-raised border border-line rounded-xl shadow-lg p-5"
      >
        <h3 className="text-[15px] font-semibold text-ink mb-1.5">{title}</h3>
        {body && <p className="text-[13.5px] text-ink-soft leading-relaxed">{body}</p>}
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

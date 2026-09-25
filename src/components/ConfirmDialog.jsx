import { useFocusTrap } from "../hooks/useFocusTrap.js";

export default function ConfirmDialog({ open, title, body, confirmLabel = "Confirm", onConfirm, onCancel }) {
  const trapRef = useFocusTrap(open);
  if (!open) return null;

  return (
    <div className="confirm-overlay" onMouseDown={onCancel}>
      <div
        ref={trapRef}
        className="confirm-panel"
        onMouseDown={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
      >
        <h3>{title}</h3>
        {body && <p>{body}</p>}
        <div className="confirm-actions">
          <button className="ghost-btn-light" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-danger-btn" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

/** A small inline spinner + label, for a fetch that's in flight inside a card/panel. */
export function LoadingState({ label = "Loading…" }) {
  return (
    <div className="inline-state inline-state-loading">
      <span className="inline-state-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

/** A small inline error message with an optional retry button, for a failed fetch. */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="inline-state inline-state-error">
      <FiAlertCircle aria-hidden="true" />
      <span>{message}</span>
      {onRetry && (
        <button className="ghost-btn-light inline-state-retry" onClick={onRetry}>
          <FiRefreshCw aria-hidden="true" /> Retry
        </button>
      )}
    </div>
  );
}

import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { Spinner } from "./ui/index.js";

/** A small inline spinner + label, for a fetch that's in flight inside a card/panel. */
export function LoadingState({ label = "Loading…" }) {
  return (
    <div className="flex items-center gap-2 text-[13px] text-ink-soft py-3">
      <Spinner size="sm" />
      <span>{label}</span>
    </div>
  );
}

/** A small inline error message with an optional retry button, for a failed fetch. */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex items-center gap-2 text-[13px] text-hard bg-hard-soft rounded-lg px-3 py-2.5">
      <FiAlertCircle aria-hidden="true" className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 text-[12.5px] font-medium hover:underline shrink-0"
        >
          <FiRefreshCw aria-hidden="true" className="h-3 w-3" /> Retry
        </button>
      )}
    </div>
  );
}

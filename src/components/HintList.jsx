import { useState } from "react";

/** Reveals hints one at a time on request, instead of spoiling the approach up front. */
export default function HintList({ hints }) {
  const [revealed, setRevealed] = useState(0);

  if (!hints || hints.length === 0) return null;

  return (
    <div className="hint-list" role="list" aria-label="Hints" aria-live="polite">
      {hints.slice(0, revealed).map((hint, i) => (
        <div className="hint-item" role="listitem" key={i} aria-setsize={hints.length} aria-posinset={i + 1}>
          <span className="hint-index mono" aria-hidden="true">
            {i + 1}
          </span>
          <span>{hint}</span>
        </div>
      ))}
      {revealed < hints.length && (
        <button className="ghost-btn-light" onClick={() => setRevealed((n) => n + 1)}>
          {revealed === 0 ? "Show a hint" : `Show hint ${revealed + 1} of ${hints.length}`}
        </button>
      )}
    </div>
  );
}

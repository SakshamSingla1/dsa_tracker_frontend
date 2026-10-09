import { useState } from "react";
import { Button } from "./ui/index.js";

/** Reveals hints one at a time on request, instead of spoiling the approach up front. */
export default function HintList({ hints }) {
  const [revealed, setRevealed] = useState(0);

  if (!hints || hints.length === 0) return null;

  return (
    <div className="space-y-2" role="list" aria-label="Hints" aria-live="polite">
      {hints.slice(0, revealed).map((hint, i) => (
        <div key={i} role="listitem" aria-setsize={hints.length} aria-posinset={i + 1} className="flex gap-2.5 rounded-lg bg-ink/[0.03] px-3 py-2">
          <span className="mono text-[11px] text-ink-soft shrink-0" aria-hidden="true">
            {i + 1}
          </span>
          <span className="text-[13px] text-ink">{hint}</span>
        </div>
      ))}
      {revealed < hints.length && (
        <Button variant="ghost" size="sm" onClick={() => setRevealed((n) => n + 1)}>
          {revealed === 0 ? "Show a hint" : `Show hint ${revealed + 1} of ${hints.length}`}
        </Button>
      )}
    </div>
  );
}

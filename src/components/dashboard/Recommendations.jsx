import { useEffect, useState } from "react";
import { FiArrowRight, FiCpu } from "react-icons/fi";
import { fetchRecommendations } from "../../api/client.js";
import { LoadingState, ErrorState } from "../InlineState.jsx";
import { Badge, difficultyTone } from "../ui/index.js";

/** Rule-based "what to solve next" -- weak topics first, unexplored topics as a fallback.
 *  See AnalyticsService#getRecommendations on the backend for the actual logic. */
export default function Recommendations({ onSolve }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    fetchRecommendations()
      .then(setItems)
      .catch(() => setError("Couldn't load recommendations."));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (items === null) return <LoadingState label="Figuring out what to solve next…" />;
  if (items.length === 0) {
    return <p className="text-[13px] text-ink-soft">Solve a few more problems and recommendations will show up here.</p>;
  }

  return (
    <div className="space-y-1.5" role="list">
      {items.map((r) => (
        <button
          key={r.problemId}
          role="listitem"
          onClick={() => onSolve?.(r.problemId)}
          className="flex items-center gap-3 w-full rounded-lg border border-line px-3 py-2.5 text-left hover:border-line-strong hover:bg-ink/[0.02] transition-colors"
        >
          <span className="h-8 w-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center shrink-0">
            <FiCpu aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-medium text-ink truncate">{r.title}</span>
              <Badge tone={difficultyTone(r.difficulty)} size="sm">
                {r.difficulty}
              </Badge>
            </div>
            <span className="text-[12px] text-ink-soft">{r.reason}</span>
          </div>
          <FiArrowRight className="text-ink-soft shrink-0" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

import { useEffect, useState } from "react";
import { FiArrowRight, FiCpu } from "react-icons/fi";
import { fetchRecommendations } from "../../api/client.js";
import { LoadingState, ErrorState } from "../InlineState.jsx";

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
    return <p className="profile-empty-note">Solve a few more problems and recommendations will show up here.</p>;
  }

  return (
    <div className="recommendations-list" role="list">
      {items.map((r) => (
        <button
          key={r.problemId}
          className="recommendation-row"
          role="listitem"
          onClick={() => onSolve?.(r.problemId)}
        >
          <FiCpu className="recommendation-icon" aria-hidden="true" />
          <div className="recommendation-body">
            <div className="recommendation-title-row">
              <span className="recommendation-title">{r.title}</span>
              <span className={`chip pill diff-${r.difficulty.toLowerCase()}`}>{r.difficulty}</span>
            </div>
            <span className="recommendation-reason">{r.reason}</span>
          </div>
          <FiArrowRight className="recommendation-arrow" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

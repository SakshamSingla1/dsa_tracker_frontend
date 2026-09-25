import { useCallback, useEffect, useState } from "react";
import { FaMedal } from "react-icons/fa";
import { fetchLeaderboard } from "../api/client.js";
import { LoadingState, ErrorState } from "./InlineState.jsx";

const MEDAL_COLORS = ["#d4af37", "#a8a8a8", "#b08d57"]; // gold, silver, bronze

const SCOPES = [
  { value: "ALL", label: "All time" },
  { value: "WEEK", label: "This week" },
  { value: "MONTH", label: "This month" },
];

export default function Leaderboard({ sheets = [] }) {
  const [scope, setScope] = useState("ALL");
  const [sheet, setSheet] = useState("");
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    setEntries(null);
    fetchLeaderboard({ scope, sheet: sheet || undefined })
      .then(setEntries)
      .catch(() => setError("Couldn't load the leaderboard."));
  }, [scope, sheet]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="leaderboard">
      <div className="leaderboard-controls">
        <div className="filter-group" role="group" aria-label="Leaderboard time scope">
          {SCOPES.map((s) => (
            <button
              key={s.value}
              className={`filter-chip ${scope === s.value ? "active" : ""}`}
              onClick={() => setScope(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
        {sheets.length > 0 && (
          <select className="leaderboard-sheet-select" value={sheet} onChange={(e) => setSheet(e.target.value)}>
            <option value="">All sheets</option>
            {sheets.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && !entries && <LoadingState label="Loading leaderboard…" />}
      {!error && entries && entries.length === 0 && (
        <p className="empty-state">No one's solved a problem in this window yet — be the first on the board.</p>
      )}
      {!error && entries && entries.length > 0 && (
        <div className="leaderboard-list">
          {entries.map((entry, i) => (
            <div
              key={`${entry.displayName}-${i}`}
              className={`leaderboard-row ${entry.isYou ? "is-you" : ""}`}
              style={MEDAL_COLORS[i] ? { borderLeft: `3px solid ${MEDAL_COLORS[i]}` } : undefined}
            >
              <span className="leaderboard-rank mono">
                {MEDAL_COLORS[i] ? <FaMedal style={{ color: MEDAL_COLORS[i] }} /> : `#${i + 1}`}
              </span>
              <span className="leaderboard-name">
                {entry.displayName}
                {entry.isYou && <span className="leaderboard-you-tag">you</span>}
              </span>
              <span className="leaderboard-count mono">{entry.solvedCount} solved</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

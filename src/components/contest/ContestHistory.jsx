import { FiClock } from "react-icons/fi";
import { LoadingState } from "../InlineState.jsx";

export default function ContestHistory({ sessions, onSelect }) {
  if (sessions == null) return <LoadingState label="Loading contest history…" />;

  if (sessions.length === 0) {
    return (
      <div className="contest-history glass-card">
        <h2>Past contests</h2>
        <div className="insights-empty">
          <FiClock className="insights-empty-icon" aria-hidden="true" />
          <p>No contests yet — start one above to see your history here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contest-history glass-card">
      <h2>Past contests</h2>
      <ul className="contest-history-list">
        {sessions.map((s) => (
          <li key={s.id} className="contest-history-row lift-on-hover" onClick={() => onSelect(s.id)}>
            <span className="mono">{new Date(s.startedAt).toLocaleDateString()}</span>
            <span>
              {s.solvedCount}/{s.totalCount} solved
            </span>
            <span className={`chip contest-status-badge contest-status-${s.status.toLowerCase()}`}>
              {s.status.replace("_", " ")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

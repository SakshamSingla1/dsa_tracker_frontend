import { FiCheckCircle, FiCircle } from "react-icons/fi";

function formatDuration(startedAt, finishedAt) {
  if (!finishedAt) return "—";
  const ms = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  return `${Math.max(0, Math.round(ms / 60000))} min`;
}

export default function ContestResults({ session, onNewContest }) {
  return (
    <div className="contest-results glass-card">
      <h2>Contest results</h2>
      <div className="contest-results-summary">
        <div className="hero-stat-tile">
          <span className="hero-stat-value mono">
            {session.solvedCount}
            <span className="hero-stat-of">/{session.totalCount}</span>
          </span>
          <span className="hero-stat-label">solved</span>
        </div>
        <div className="hero-stat-tile">
          <span className="hero-stat-value mono">{formatDuration(session.startedAt, session.finishedAt)}</span>
          <span className="hero-stat-label">time taken</span>
        </div>
      </div>

      <ul className="contest-problem-list">
        {session.problems.map((p) => (
          <li key={p.problemId} className={`contest-problem-row ${p.solved ? "solved" : ""}`}>
            <span className="contest-problem-status" aria-hidden="true">
              {p.solved ? <FiCheckCircle /> : <FiCircle />}
            </span>
            <span className="contest-problem-title">{p.title}</span>
            <span className={`chip pill diff-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
          </li>
        ))}
      </ul>

      <button className="submit-btn" onClick={onNewContest}>
        Start another contest
      </button>
    </div>
  );
}

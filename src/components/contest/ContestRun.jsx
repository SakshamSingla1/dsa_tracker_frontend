import { useEffect, useState } from "react";
import { FiCheckCircle, FiCircle, FiFlag, FiRefreshCw } from "react-icons/fi";

function formatRemaining(ms) {
  if (ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Countdown is re-derived every tick from the server's fixed `endsAt`, not decremented
 *  locally -- so a refresh or a tab left open overnight can't drift or reset the timer. */
export default function ContestRun({ session, onSolve, onFinish, onRefresh }) {
  const endsAt = new Date(session.endsAt).getTime();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = endsAt - now;
  const expired = remainingMs <= 0;
  const urgent = remainingMs > 0 && remainingMs < 60_000;

  useEffect(() => {
    if (expired) onFinish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired]);

  return (
    <div className="contest-run">
      <div className={`contest-timer glass-panel ${urgent ? "contest-timer-urgent" : ""}`}>
        <div className="contest-timer-main">
          <span className="contest-timer-label">Time remaining</span>
          <span className="contest-timer-value mono">{formatRemaining(remainingMs)}</span>
        </div>
        <span className="contest-score mono">
          {session.solvedCount}/{session.totalCount} solved
        </span>
        <div className="contest-timer-actions">
          <button className="ghost-btn" onClick={onRefresh} title="Refresh solved status">
            <FiRefreshCw aria-hidden="true" />
          </button>
          <button className="ghost-btn" onClick={onFinish}>
            <FiFlag aria-hidden="true" /> Finish
          </button>
        </div>
      </div>

      <ul className="contest-problem-list">
        {session.problems.map((p) => (
          <li
            key={p.problemId}
            className={`contest-problem-row lift-on-hover ${p.solved ? "solved" : ""}`}
            onClick={() => onSolve(p.problemId)}
          >
            <span className="contest-problem-status" aria-hidden="true">
              {p.solved ? <FiCheckCircle /> : <FiCircle />}
            </span>
            <span className="contest-problem-order mono">#{p.orderIndex + 1}</span>
            <span className="contest-problem-title">{p.title}</span>
            <span className={`chip pill diff-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

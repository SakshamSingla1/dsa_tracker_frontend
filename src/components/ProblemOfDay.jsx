import { useEffect, useState } from "react";
import { FiCheck, FiSun } from "react-icons/fi";
import { fetchProblemOfTheDay } from "../api/client.js";
import { ErrorState } from "./InlineState.jsx";

export default function ProblemOfDay({ sheetSlug, onSolve }) {
  const [potd, setPotd] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setPotd(null);
    setError(null);
    fetchProblemOfTheDay(sheetSlug)
      .then(setPotd)
      .catch(() => setError("Couldn't load the problem of the day."));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetSlug]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!potd) return null;

  const { problem, topicName } = potd;

  return (
    <div className="potd-card">
      <div className="potd-label">
        <span className="potd-icon" aria-hidden="true">
          <FiSun />
        </span>
        Problem of the Day
      </div>
      <div className="potd-body">
        <div className="potd-title-row">
          <span className="potd-title">{problem.title}</span>
          <span className={`pill diff-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
          {problem.status === "DONE" && (
            <span className="potd-solved mono">
              <FiCheck /> solved
            </span>
          )}
        </div>
        <span className="potd-topic mono">{topicName}</span>
      </div>
      <button className="potd-btn" onClick={() => onSolve(problem.id)}>
        {problem.status === "DONE" ? "Review" : "Solve"} ▸
      </button>
    </div>
  );
}

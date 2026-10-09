import { useEffect, useState } from "react";
import { FiCheck, FiSun } from "react-icons/fi";
import { fetchProblemOfTheDay } from "../api/client.js";
import { ErrorState } from "./InlineState.jsx";
import { Badge, Button, difficultyTone } from "./ui/index.js";

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
    <div className="flex items-center gap-4 rounded-lg border border-accent-line bg-accent-soft px-4 py-3 mb-4">
      <div className="h-9 w-9 rounded-lg bg-accent text-accent-ink flex items-center justify-center shrink-0">
        <FiSun aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold text-accent uppercase tracking-wide mb-0.5">Problem of the Day</div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14px] font-medium text-ink truncate">{problem.title}</span>
          <Badge tone={difficultyTone(problem.difficulty)} size="sm">
            {problem.difficulty}
          </Badge>
          {problem.status === "DONE" && (
            <span className="flex items-center gap-1 text-[12px] text-done">
              <FiCheck className="h-3 w-3" /> solved
            </span>
          )}
        </div>
        <span className="mono text-[12px] text-ink-soft">{topicName}</span>
      </div>
      <Button variant="primary" onClick={() => onSolve(problem.id)} className="shrink-0">
        {problem.status === "DONE" ? "Review" : "Solve"} ▸
      </Button>
    </div>
  );
}

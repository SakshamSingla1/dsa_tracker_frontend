import { useEffect, useState } from "react";
import { FiCheckCircle, FiCircle, FiFlag, FiRefreshCw } from "react-icons/fi";
import { Badge, Button, difficultyTone } from "../ui/index.js";

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
    <div className="max-w-2xl space-y-4">
      <div
        className={`flex flex-wrap items-center gap-4 rounded-lg border px-4 py-3
          ${urgent ? "border-hard/40 bg-hard-soft" : "border-line bg-paper-raised"}`}
      >
        <div className="flex flex-col">
          <span className="text-[11px] text-ink-soft">Time remaining</span>
          <span className={`mono text-xl font-bold ${urgent ? "text-hard" : "text-ink"}`}>{formatRemaining(remainingMs)}</span>
        </div>
        <span className="mono text-[13px] text-ink-soft">
          {session.solvedCount}/{session.totalCount} solved
        </span>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onRefresh}
            title="Refresh solved status"
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-line text-ink-soft hover:text-ink hover:border-line-strong"
          >
            <FiRefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
          <Button variant="secondary" size="sm" icon={<FiFlag className="h-3.5 w-3.5" />} onClick={onFinish}>
            Finish
          </Button>
        </div>
      </div>

      <ul className="rounded-lg border border-line bg-paper-raised divide-y divide-line overflow-hidden">
        {session.problems.map((p) => (
          <li
            key={p.problemId}
            onClick={() => onSolve(p.problemId)}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-ink/[0.02]"
          >
            <span className={p.solved ? "text-done" : "text-ink-soft/40"} aria-hidden="true">
              {p.solved ? <FiCheckCircle /> : <FiCircle />}
            </span>
            <span className="mono text-[12px] text-ink-soft shrink-0">#{p.orderIndex + 1}</span>
            <span className="text-[13.5px] text-ink flex-1 truncate">{p.title}</span>
            <Badge tone={difficultyTone(p.difficulty)}>{p.difficulty}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}

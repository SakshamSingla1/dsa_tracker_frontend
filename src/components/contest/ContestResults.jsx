import { FiCheckCircle, FiCircle } from "react-icons/fi";
import { Badge, Button, Card, difficultyTone } from "../ui/index.js";

function formatDuration(startedAt, finishedAt) {
  if (!finishedAt) return "—";
  const ms = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  return `${Math.max(0, Math.round(ms / 60000))} min`;
}

export default function ContestResults({ session, onNewContest }) {
  return (
    <Card padding="lg" className="max-w-2xl">
      <h2 className="text-[16px] font-semibold text-ink mb-4">Contest results</h2>
      <div className="flex gap-8 mb-5">
        <div className="flex flex-col">
          <span className="mono text-2xl font-bold text-ink">
            {session.solvedCount}
            <span className="text-ink-soft text-base">/{session.totalCount}</span>
          </span>
          <span className="text-[12px] text-ink-soft">solved</span>
        </div>
        <div className="flex flex-col">
          <span className="mono text-2xl font-bold text-ink">{formatDuration(session.startedAt, session.finishedAt)}</span>
          <span className="text-[12px] text-ink-soft">time taken</span>
        </div>
      </div>

      <ul className="rounded-lg border border-line divide-y divide-line overflow-hidden mb-5">
        {session.problems.map((p) => (
          <li key={p.problemId} className="flex items-center gap-3 px-4 py-2.5">
            <span className={p.solved ? "text-done" : "text-ink-soft/40"} aria-hidden="true">
              {p.solved ? <FiCheckCircle /> : <FiCircle />}
            </span>
            <span className="text-[13.5px] text-ink flex-1 truncate">{p.title}</span>
            <Badge tone={difficultyTone(p.difficulty)}>{p.difficulty}</Badge>
          </li>
        ))}
      </ul>

      <Button variant="primary" onClick={onNewContest}>
        Start another contest
      </Button>
    </Card>
  );
}

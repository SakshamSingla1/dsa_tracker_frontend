import { FiClock } from "react-icons/fi";
import { LoadingState } from "../InlineState.jsx";
import { Badge, Card } from "../ui/index.js";

const STATUS_TONE = {
  IN_PROGRESS: "accent",
  FINISHED: "done",
  ABANDONED: "neutral",
};

export default function ContestHistory({ sessions, onSelect }) {
  if (sessions == null) return <LoadingState label="Loading contest history…" />;

  if (sessions.length === 0) {
    return (
      <Card padding="lg" className="max-w-md">
        <h2 className="text-[16px] font-semibold text-ink mb-4">Past contests</h2>
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <FiClock className="h-6 w-6 text-ink-soft/50" aria-hidden="true" />
          <p className="text-[13px] text-ink-soft">No contests yet — start one above to see your history here.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="max-w-md">
      <h2 className="text-[16px] font-semibold text-ink mb-3">Past contests</h2>
      <ul className="space-y-1">
        {sessions.map((s) => (
          <li
            key={s.id}
            onClick={() => onSelect(s.id)}
            className="flex items-center gap-3 rounded-lg px-2 py-2 cursor-pointer hover:bg-ink/[0.03]"
          >
            <span className="mono text-[12px] text-ink-soft">{new Date(s.startedAt).toLocaleDateString()}</span>
            <span className="text-[12.5px] text-ink flex-1">
              {s.solvedCount}/{s.totalCount} solved
            </span>
            <Badge tone={STATUS_TONE[s.status] ?? "neutral"}>{s.status.replace("_", " ")}</Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}

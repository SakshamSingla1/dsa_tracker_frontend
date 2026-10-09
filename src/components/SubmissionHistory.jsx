import { LoadingState, ErrorState } from "./InlineState.jsx";
import { Badge } from "./ui/index.js";

const VERDICT_LABEL = {
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
  RUNTIME_ERROR: "Runtime Error",
  COMPILE_ERROR: "Compile Error",
  TIME_LIMIT_EXCEEDED: "Time Limit Exceeded",
};

const VERDICT_TONE = {
  ACCEPTED: "done",
  WRONG_ANSWER: "hard",
  RUNTIME_ERROR: "neutral",
  COMPILE_ERROR: "medium",
  TIME_LIMIT_EXCEEDED: "neutral",
};

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function SubmissionHistory({ submissions, loading, error, onRetry }) {
  if (loading) {
    return <LoadingState label="Loading submissions…" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div role="status" className="text-[13px] text-ink-soft">
        No submissions yet for this problem.
      </div>
    );
  }

  return (
    <div className="space-y-1.5" role="list" aria-label="Submission history" aria-live="polite">
      {submissions.map((s) => (
        <div key={s.id} role="listitem" className="flex items-center gap-3 rounded-lg bg-ink/[0.03] px-3 py-2">
          <Badge tone={VERDICT_TONE[s.verdict] ?? "neutral"}>{VERDICT_LABEL[s.verdict] ?? s.verdict}</Badge>
          <span className="mono text-[12px] text-ink-soft">{s.language}</span>
          <span className="mono text-[12px] text-ink-soft">
            {s.passedCount}/{s.totalCount} cases
          </span>
          <span className="mono text-[12px] text-ink-soft/70 ml-auto">{timeAgo(s.submittedAt)}</span>
        </div>
      ))}
    </div>
  );
}

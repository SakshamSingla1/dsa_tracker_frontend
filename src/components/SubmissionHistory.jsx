import { LoadingState, ErrorState } from "./InlineState.jsx";

const VERDICT_LABEL = {
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
  RUNTIME_ERROR: "Runtime Error",
  COMPILE_ERROR: "Compile Error",
  TIME_LIMIT_EXCEEDED: "Time Limit Exceeded",
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
      <div className="submission-history-empty" role="status">
        No submissions yet for this problem.
      </div>
    );
  }

  return (
    <div className="submission-history" role="list" aria-label="Submission history" aria-live="polite">
      {submissions.map((s) => (
        <div className="submission-row" role="listitem" key={s.id}>
          <span className={`chip verdict-pill verdict-${s.verdict.toLowerCase()}`}>{VERDICT_LABEL[s.verdict] ?? s.verdict}</span>
          <span className="submission-lang mono">{s.language}</span>
          <span className="submission-cases mono">
            {s.passedCount}/{s.totalCount} cases
          </span>
          <span className="submission-time mono">{timeAgo(s.submittedAt)}</span>
        </div>
      ))}
    </div>
  );
}

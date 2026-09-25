import { useEffect, useState } from "react";
import { FiCheck, FiCheckCircle, FiRotateCcw } from "react-icons/fi";
import { fetchReviewQueue, reviewProblem } from "../api/client.js";
import { useToast } from "./ToastProvider.jsx";
import { LoadingState, ErrorState } from "./InlineState.jsx";

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

function dueBadge(dateStr) {
  const days = daysUntil(dateStr);
  if (days < 0) return { label: `${-days}d overdue`, tone: "overdue" };
  if (days === 0) return { label: "Due today", tone: "today" };
  return { label: `Due in ${days}d`, tone: "soon" };
}

export default function ReviewQueue({ onSolve, onQueueChange }) {
  const [queue, setQueue] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const toast = useToast();

  const load = () => {
    setError(null);
    fetchReviewQueue()
      .then((items) => {
        setQueue(items);
        onQueueChange?.(items.length);
      })
      .catch(() => setError("Couldn't load your review queue."));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOutcome = (problemId, outcome) => {
    setBusyId(problemId);
    reviewProblem(problemId, outcome)
      .then(() => {
        setQueue((prev) => {
          const next = prev.filter((p) => p.id !== problemId);
          onQueueChange?.(next.length);
          return next;
        });
        toast.show(outcome === "REMEMBERED" ? "Nice — pushed further out." : "No worries, back in a day.", {
          duration: 1800,
        });
      })
      .catch(() => toast.error("Couldn't save that. Try again."))
      .finally(() => setBusyId(null));
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!queue) return <LoadingState label="Loading your review queue…" />;

  if (queue.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon" aria-hidden="true">
          <FiCheckCircle />
        </span>
        <p>Nothing due for review right now. Mark a problem "Revise" and it'll surface here when it's due.</p>
      </div>
    );
  }

  return (
    <div className="review-queue">
      {queue.map((p) => {
        const badge = dueBadge(p.reviewDueAt);
        const busy = busyId === p.id;
        return (
          <div className={`review-row review-row-${badge.tone}`} key={p.id}>
            <span className={`chip pill diff-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
            <button className="review-row-title" onClick={() => onSolve(p.id)}>
              {p.title}
            </button>
            <span className={`chip review-due-badge review-due-${badge.tone}`}>{badge.label}</span>
            <div className="review-row-actions">
              <button
                className="ghost-btn-light"
                disabled={busy}
                onClick={() => handleOutcome(p.id, "FORGOT")}
                title="Still shaky — review again tomorrow"
              >
                <FiRotateCcw aria-hidden="true" /> Still shaky
              </button>
              <button
                className="ghost-btn-light review-got-it"
                disabled={busy}
                onClick={() => handleOutcome(p.id, "REMEMBERED")}
                title="Got it — push the next review further out"
              >
                <FiCheck aria-hidden="true" /> Got it
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

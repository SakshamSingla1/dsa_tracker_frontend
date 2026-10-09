import { useEffect, useState } from "react";
import { FiCheck, FiCheckCircle, FiRotateCcw } from "react-icons/fi";
import { fetchReviewQueue, reviewProblem } from "../api/client.js";
import { useToast } from "./ToastProvider.jsx";
import { LoadingState, ErrorState } from "./InlineState.jsx";
import { Badge, Button, difficultyTone } from "./ui/index.js";

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

function dueBadge(dateStr) {
  const days = daysUntil(dateStr);
  if (days < 0) return { label: `${-days}d overdue`, tone: "hard" };
  if (days === 0) return { label: "Due today", tone: "medium" };
  return { label: `Due in ${days}d`, tone: "accent" };
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
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="h-10 w-10 rounded-full bg-done-soft text-done flex items-center justify-center" aria-hidden="true">
          <FiCheckCircle />
        </span>
        <p className="text-[14px] text-ink-soft max-w-sm">
          Nothing due for review right now. Mark a problem "Revise" and it'll surface here when it's due.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-w-3xl">
      {queue.map((p) => {
        const badge = dueBadge(p.reviewDueAt);
        const busy = busyId === p.id;
        return (
          <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-paper-raised px-4 py-3">
            <Badge tone={difficultyTone(p.difficulty)} className="shrink-0">
              {p.difficulty}
            </Badge>
            <button onClick={() => onSolve(p.id)} className="text-[13.5px] font-medium text-ink hover:text-accent truncate">
              {p.title}
            </button>
            <Badge tone={badge.tone} className="shrink-0">
              {badge.label}
            </Badge>
            <div className="flex items-center gap-2 ml-auto shrink-0">
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => handleOutcome(p.id, "FORGOT")}
                title="Still shaky — review again tomorrow"
                icon={<FiRotateCcw className="h-3.5 w-3.5" />}
              >
                Still shaky
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={() => handleOutcome(p.id, "REMEMBERED")}
                title="Got it — push the next review further out"
                icon={<FiCheck className="h-3.5 w-3.5" />}
              >
                Got it
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import InsightsEmptyState from "./InsightsEmptyState.jsx";

const VERDICT_META = {
  ACCEPTED: { label: "Accepted", color: "var(--done)" },
  WRONG_ANSWER: { label: "Wrong answer", color: "var(--hard)" },
  COMPILE_ERROR: { label: "Compile error", color: "var(--medium)" },
  RUNTIME_ERROR: { label: "Runtime error", color: "var(--todo)" },
  TIME_LIMIT_EXCEEDED: { label: "Time limit", color: "var(--ink-soft)" },
};

const ORDER = ["ACCEPTED", "WRONG_ANSWER", "RUNTIME_ERROR", "COMPILE_ERROR", "TIME_LIMIT_EXCEEDED"];

// Full literal class strings (not interpolated) so Tailwind's static scanner can find them.
const ACCEPTANCE_CLASS = {
  done: "bg-done-soft text-done",
  medium: "bg-medium-soft text-medium",
  hard: "bg-hard-soft text-hard",
};

function acceptanceTone(rate) {
  if (rate >= 0.7) return "done";
  if (rate >= 0.4) return "medium";
  return "hard";
}

export default function VerdictBreakdown({ byVerdict, acceptanceRate }) {
  const total = Object.values(byVerdict).reduce((sum, n) => sum + n, 0);
  const max = Math.max(1, ...Object.values(byVerdict));

  if (total === 0) {
    return <InsightsEmptyState message="No submissions yet -- submit a solution to see your verdict mix." />;
  }

  const tone = acceptanceTone(acceptanceRate);

  return (
    <div className="space-y-3">
      <div className={`inline-flex mono text-[13px] font-semibold rounded-pill px-3 py-1 ${ACCEPTANCE_CLASS[tone]}`}>
        {Math.round(acceptanceRate * 100)}% acceptance rate
      </div>
      {ORDER.filter((key) => byVerdict[key]).map((key) => {
        const count = byVerdict[key];
        const meta = VERDICT_META[key];
        const pct = (count / max) * 100;
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 w-32 shrink-0 text-[12.5px] text-ink">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: meta.color }} aria-hidden="true" />
              {meta.label}
            </span>
            <div className="w-full h-2 rounded-pill bg-ink/8 overflow-hidden">
              <div className="h-full rounded-pill" style={{ width: `${pct}%`, background: meta.color }} />
            </div>
            <span className="mono text-[12.5px] text-ink-soft w-8 text-right shrink-0">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

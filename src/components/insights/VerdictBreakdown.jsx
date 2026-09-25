import InsightsEmptyState from "./InsightsEmptyState.jsx";

const VERDICT_META = {
  ACCEPTED: { label: "Accepted", color: "var(--done)" },
  WRONG_ANSWER: { label: "Wrong answer", color: "var(--hard)" },
  COMPILE_ERROR: { label: "Compile error", color: "var(--medium)" },
  RUNTIME_ERROR: { label: "Runtime error", color: "var(--todo)" },
  TIME_LIMIT_EXCEEDED: { label: "Time limit", color: "var(--ink-soft)" },
};

const ORDER = ["ACCEPTED", "WRONG_ANSWER", "RUNTIME_ERROR", "COMPILE_ERROR", "TIME_LIMIT_EXCEEDED"];

function acceptanceTier(rate) {
  if (rate >= 0.7) return "good";
  if (rate >= 0.4) return "mid";
  return "low";
}

export default function VerdictBreakdown({ byVerdict, acceptanceRate }) {
  const total = Object.values(byVerdict).reduce((sum, n) => sum + n, 0);
  const max = Math.max(1, ...Object.values(byVerdict));

  if (total === 0) {
    return <InsightsEmptyState message="No submissions yet -- submit a solution to see your verdict mix." />;
  }

  return (
    <div className="insights-bars">
      <div className={`chip insights-acceptance-chip tier-${acceptanceTier(acceptanceRate)} mono`}>
        {Math.round(acceptanceRate * 100)}% acceptance rate
      </div>
      {ORDER.filter((key) => byVerdict[key]).map((key) => {
        const count = byVerdict[key];
        const meta = VERDICT_META[key];
        const pct = (count / max) * 100;
        return (
          <div className="topic-bar-row" key={key}>
            <span className="topic-bar-name insights-verdict-label">
              <span className="insights-verdict-dot" style={{ background: meta.color }} aria-hidden="true" />
              {meta.label}
            </span>
            <div className="topic-bar-track">
              <div className="topic-bar-fill" style={{ width: `${pct}%`, background: meta.color }} />
            </div>
            <span className="topic-bar-count mono">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

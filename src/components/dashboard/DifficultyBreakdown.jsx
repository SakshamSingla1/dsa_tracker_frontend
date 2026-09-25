const ROWS = [
  { key: "EASY", label: "Easy" },
  { key: "MEDIUM", label: "Medium" },
  { key: "HARD", label: "Hard" },
];

export default function DifficultyBreakdown({ byDifficulty }) {
  return (
    <div className="difficulty-breakdown">
      {ROWS.map((r) => {
        const stat = byDifficulty[r.key] ?? { done: 0, total: 0 };
        const pct = stat.total === 0 ? 0 : (stat.done / stat.total) * 100;
        return (
          <div className="difficulty-row" key={r.key}>
            <span className={`chip pill diff-${r.key.toLowerCase()}`}>{r.label}</span>
            <div className="topic-bar-track">
              <div className={`difficulty-fill diff-fill-${r.key.toLowerCase()}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="topic-bar-count mono">
              {stat.done}/{stat.total}
            </span>
          </div>
        );
      })}
    </div>
  );
}

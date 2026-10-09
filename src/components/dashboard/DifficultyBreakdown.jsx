import { Badge, ProgressBar } from "../ui/index.js";

const ROWS = [
  { key: "EASY", label: "Easy", tone: "easy" },
  { key: "MEDIUM", label: "Medium", tone: "medium" },
  { key: "HARD", label: "Hard", tone: "hard" },
];

export default function DifficultyBreakdown({ byDifficulty }) {
  return (
    <div className="space-y-3">
      {ROWS.map((r) => {
        const stat = byDifficulty[r.key] ?? { done: 0, total: 0 };
        const pct = stat.total === 0 ? 0 : (stat.done / stat.total) * 100;
        return (
          <div key={r.key} className="flex items-center gap-3">
            <Badge tone={r.tone} className="w-[72px] justify-center shrink-0">
              {r.label}
            </Badge>
            <ProgressBar value={pct} tone={r.tone === "hard" ? "hard" : r.tone === "medium" ? "medium" : "done"} />
            <span className="mono text-[12.5px] text-ink-soft w-14 text-right shrink-0">
              {stat.done}/{stat.total}
            </span>
          </div>
        );
      })}
    </div>
  );
}

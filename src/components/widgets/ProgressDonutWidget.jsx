import { FiArrowRight } from "react-icons/fi";
import { Card } from "../ui/index.js";

const ROWS = [
  { key: "EASY", label: "Easy", color: "var(--easy)" },
  { key: "MEDIUM", label: "Medium", color: "var(--medium)" },
  { key: "HARD", label: "Hard", color: "var(--hard)" },
];

export default function ProgressDonutWidget({ stats, onViewDetails }) {
  const done = stats?.done ?? 0;
  const total = stats?.total ?? 0;
  const pct = total === 0 ? 0 : done / total;
  const r = 38;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);

  return (
    <Card padding="lg" hoverable className="animate-fade-up" style={{ animationDelay: "60ms" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13.5px] font-semibold text-ink">My Progress</h3>
        {onViewDetails && (
          <button onClick={onViewDetails} className="flex items-center gap-1 text-[11.5px] text-accent hover:underline">
            View Details <FiArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0 flex items-center justify-center">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r={r} fill="none" stroke="var(--line)" strokeWidth="8" />
            <circle
              cx="48"
              cy="48"
              r={r}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 48 48)"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="mono text-lg font-bold text-ink leading-none">{done}</span>
            <span className="mono text-[10px] text-ink-soft">/ {total}</span>
          </div>
        </div>

        <div className="flex-1 space-y-1.5">
          {ROWS.map((r2) => {
            const d = stats?.byDifficulty?.[r2.key] ?? { done: 0, total: 0 };
            return (
              <div key={r2.key} className="flex items-center gap-2 text-[12px]">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: r2.color }} />
                <span className="text-ink-soft flex-1">{r2.label}</span>
                <span className="mono text-ink">{d.done}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

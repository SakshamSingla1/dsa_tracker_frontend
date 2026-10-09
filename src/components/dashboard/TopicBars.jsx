import { ProgressBar } from "../ui/index.js";

export default function TopicBars({ topics }) {
  return (
    <div className="space-y-3">
      {topics.map((t) => {
        const total = t.problems.length;
        const done = t.problems.filter((p) => p.status === "DONE").length;
        const pct = total === 0 ? 0 : (done / total) * 100;
        return (
          <div key={t.id} className="flex items-center gap-3">
            <span className="text-[13px] text-ink w-40 shrink-0 truncate">{t.name}</span>
            <ProgressBar value={pct} tone={pct === 100 ? "done" : "accent"} />
            <span className="mono text-[12.5px] text-ink-soft w-14 text-right shrink-0">
              {done}/{total}
            </span>
          </div>
        );
      })}
    </div>
  );
}

import { useCountUp } from "../../hooks/useCountUp.js";

export default function ProgressRing({ done, total }) {
  const pct = total === 0 ? 0 : done / total;
  const r = 54;
  const circumference = 2 * Math.PI * r;

  const animatedPct = useCountUp(Math.round(pct * 100));
  const animatedDone = useCountUp(done);
  const offset = circumference * (1 - animatedPct / 100);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 120 120" role="img" aria-label={`${done} of ${total} problems done`}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--line)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="mono text-2xl font-bold text-ink">{animatedPct}%</span>
        <span className="mono text-[12px] text-ink-soft">
          {animatedDone} / {total}
        </span>
      </div>
    </div>
  );
}

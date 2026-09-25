import { useCountUp } from "../../hooks/useCountUp.js";

export default function ProgressRing({ done, total }) {
  const pct = total === 0 ? 0 : done / total;
  const r = 54;
  const circumference = 2 * Math.PI * r;

  const animatedPct = useCountUp(Math.round(pct * 100));
  const animatedDone = useCountUp(done);
  const offset = circumference * (1 - animatedPct / 100);

  return (
    <div className="progress-ring">
      <svg width="140" height="140" viewBox="0 0 120 120" role="img" aria-label={`${done} of ${total} problems done`}>
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--ring-gradient-end)" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--line)" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dashoffset 0.2s ease" }}
        />
      </svg>
      <div className="progress-ring-label">
        <span className="progress-ring-pct mono">{animatedPct}%</span>
        <span className="progress-ring-count mono">
          {animatedDone} / {total}
        </span>
      </div>
    </div>
  );
}

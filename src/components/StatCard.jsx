const TONE = {
  done: { ring: "var(--done)", bg: "bg-done-soft", text: "text-done" },
  medium: { ring: "var(--medium)", bg: "bg-medium-soft", text: "text-medium" },
  accent: { ring: "var(--accent)", bg: "bg-accent-soft", text: "text-accent" },
  cyan: { ring: "var(--cyan)", bg: "bg-cyan-soft", text: "text-cyan" },
};

/** One of the four hero metric cards at the top of the sheet view -- a small ring-filled
 *  icon badge, a big number, a label, and a one-line subtitle. */
export default function StatCard({ tone = "accent", icon, value, label, subtitle, pct = 0 }) {
  const t = TONE[tone] ?? TONE.accent;
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-line bg-paper-raised p-4">
      <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
        <svg width="56" height="56" viewBox="0 0 56 56" className="absolute inset-0">
          <circle cx="28" cy="28" r={r} fill="none" stroke="var(--line)" strokeWidth="4" />
          <circle
            cx="28"
            cy="28"
            r={r}
            fill="none"
            stroke={t.ring}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 28 28)"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <span className={`h-8 w-8 rounded-full ${t.bg} ${t.text} flex items-center justify-center text-base`}>{icon}</span>
      </div>
      <div className="min-w-0">
        <div className="mono text-xl font-bold text-ink leading-tight">{value}</div>
        <div className="text-[13px] font-medium text-ink leading-tight">{label}</div>
        <div className={`text-[11.5px] leading-tight mt-0.5 ${t.text}`}>{subtitle}</div>
      </div>
    </div>
  );
}

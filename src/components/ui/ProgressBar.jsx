const TONES = {
  accent: "bg-accent",
  done: "bg-done",
  medium: "bg-medium",
  hard: "bg-hard",
};

/** Flat linear progress bar. `value` is 0-100. */
export default function ProgressBar({ value = 0, tone = "accent", size = "md", className = "" }) {
  const clamped = Math.max(0, Math.min(100, value));
  const height = size === "sm" ? "h-1.5" : "h-2";
  return (
    <div className={`w-full ${height} rounded-pill bg-ink/8 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-pill transition-[width] duration-500 ease-out ${TONES[tone] ?? TONES.accent}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

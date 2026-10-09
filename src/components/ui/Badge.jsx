const TONES = {
  neutral: "bg-ink/5 text-ink-soft",
  accent: "bg-accent-soft text-accent",
  todo: "bg-todo-soft text-todo",
  done: "bg-done-soft text-done",
  revise: "bg-revise-soft text-revise",
  easy: "bg-easy-soft text-easy",
  medium: "bg-medium-soft text-medium",
  hard: "bg-hard-soft text-hard",
};

const SIZES = {
  sm: "h-5 px-1.5 text-[11px] gap-1",
  md: "h-6 px-2 text-[12px] gap-1.5",
};

/** Small pill label for difficulty, status, and tag chips. */
export default function Badge({ tone = "neutral", size = "md", icon = null, className = "", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-pill font-medium whitespace-nowrap
        ${TONES[tone] ?? TONES.neutral}
        ${SIZES[size] ?? SIZES.md}
        ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}

/** Maps a problem difficulty string to the matching Badge tone. */
export function difficultyTone(difficulty) {
  const d = (difficulty || "").toLowerCase();
  if (d === "easy") return "easy";
  if (d === "medium") return "medium";
  if (d === "hard") return "hard";
  return "neutral";
}

/** Maps a problem status string to the matching Badge tone. */
export function statusTone(status) {
  const s = (status || "").toLowerCase();
  if (s === "done") return "done";
  if (s === "revise") return "revise";
  return "todo";
}

import InsightsEmptyState from "./InsightsEmptyState.jsx";
import { ProgressBar } from "../ui/index.js";

const LANGUAGE_LABELS = {
  JAVA: "Java",
  PYTHON: "Python",
  JAVASCRIPT: "JavaScript",
  CPP: "C++",
};

export default function LanguageUsage({ byLanguage }) {
  const entries = Object.entries(byLanguage).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, count]) => count));

  if (entries.length === 0) {
    return <InsightsEmptyState message="No submissions yet -- your language mix will show up here." />;
  }

  return (
    <div className="space-y-3">
      {entries.map(([lang, count]) => (
        <div key={lang} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-[12.5px] text-ink">{LANGUAGE_LABELS[lang] ?? lang}</span>
          <ProgressBar value={(count / max) * 100} />
          <span className="mono text-[12.5px] text-ink-soft w-8 text-right shrink-0">{count}</span>
        </div>
      ))}
    </div>
  );
}

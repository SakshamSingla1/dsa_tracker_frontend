import InsightsEmptyState from "./InsightsEmptyState.jsx";

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
    <div className="insights-bars">
      {entries.map(([lang, count]) => (
        <div className="topic-bar-row" key={lang}>
          <span className="topic-bar-name">{LANGUAGE_LABELS[lang] ?? lang}</span>
          <div className="topic-bar-track">
            <div className="topic-bar-fill" style={{ width: `${(count / max) * 100}%` }} />
          </div>
          <span className="topic-bar-count mono">{count}</span>
        </div>
      ))}
    </div>
  );
}

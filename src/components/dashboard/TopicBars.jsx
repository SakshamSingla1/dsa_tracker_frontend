export default function TopicBars({ topics }) {
  return (
    <div className="topic-bars">
      {topics.map((t) => {
        const total = t.problems.length;
        const done = t.problems.filter((p) => p.status === "DONE").length;
        const pct = total === 0 ? 0 : (done / total) * 100;
        return (
          <div className="topic-bar-row" key={t.id}>
            <span className="topic-bar-name">{t.name}</span>
            <div className="topic-bar-track">
              <div className="topic-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="topic-bar-count mono">
              {done}/{total}
            </span>
          </div>
        );
      })}
    </div>
  );
}

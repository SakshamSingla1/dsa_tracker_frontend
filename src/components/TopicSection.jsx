import ProblemRow from "./ProblemRow.jsx";

export default function TopicSection({ topic, visibleProblems, onUpdate, onSolve, onTagClick, collapsed, onToggleCollapse }) {
  if (visibleProblems.length === 0) return null;

  const done = topic.problems.filter((p) => p.status === "DONE").length;

  return (
    <section className="topic-section" id={`topic-${topic.id}`}>
      <div
        className="topic-heading"
        onClick={onToggleCollapse}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleCollapse();
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
      >
        <span className={`topic-chevron ${collapsed ? "collapsed" : ""}`} aria-hidden="true">
          &#9662;
        </span>
        <h2>{topic.name}</h2>
        <span className="count mono">
          {done} / {topic.problems.length} done
        </span>
      </div>
      {!collapsed && (
        <div className="problem-list">
          {visibleProblems.map((p) => (
            <ProblemRow key={p.id} problem={p} onUpdate={onUpdate} onSolve={onSolve} onTagClick={onTagClick} />
          ))}
        </div>
      )}
    </section>
  );
}

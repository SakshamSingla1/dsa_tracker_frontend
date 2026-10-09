import ProblemRow from "./ProblemRow.jsx";

export default function TopicSection({ topic, visibleProblems, onUpdate, onSolve, onTagClick, collapsed, onToggleCollapse }) {
  if (visibleProblems.length === 0) return null;

  const done = topic.problems.filter((p) => p.status === "DONE").length;

  return (
    <section className="mb-4" id={`topic-${topic.id}`}>
      <div
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
        className="flex items-center gap-2.5 px-1 py-2 cursor-pointer select-none"
      >
        <span
          className={`text-ink-soft text-[10px] transition-transform ${collapsed ? "-rotate-90" : ""}`}
          aria-hidden="true"
        >
          &#9662;
        </span>
        <h2 className="text-[14px] font-semibold text-ink">{topic.name}</h2>
        <span className="mono text-[12px] text-ink-soft">
          {done} / {topic.problems.length} done
        </span>
      </div>
      {!collapsed && (
        <div className="rounded-lg border border-line bg-paper-raised divide-y divide-line overflow-hidden">
          {visibleProblems.map((p) => (
            <ProblemRow key={p.id} problem={p} onUpdate={onUpdate} onSolve={onSolve} onTagClick={onTagClick} />
          ))}
        </div>
      )}
    </section>
  );
}

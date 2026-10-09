import ProblemRow from "./ProblemRow.jsx";
import topicIcon from "./topicIcons.js";
import { ProgressBar } from "./ui/index.js";

export default function TopicSection({ topic, visibleProblems, onUpdate, onSolve, onTagClick, collapsed, onToggleCollapse, index }) {
  if (visibleProblems.length === 0) return null;

  const done = topic.problems.filter((p) => p.status === "DONE").length;
  const total = topic.problems.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const Icon = topicIcon(topic.name);

  return (
    <section className="mb-3 rounded-xl border border-line bg-paper-raised overflow-hidden" id={`topic-${topic.id}`}>
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
        className="flex items-center gap-3.5 px-4 py-3.5 cursor-pointer select-none"
      >
        <span className="mono text-[12px] text-ink-soft/60 w-6 shrink-0">{String(index + 1).padStart(2, "0")}</span>
        <span className="h-9 w-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <h2 className="text-[14px] font-semibold text-ink shrink-0 w-48 truncate">{topic.name}</h2>
        <span className="text-[12.5px] text-ink-soft shrink-0 hidden sm:inline">
          {done} / {total} problems
        </span>
        <div className="hidden md:block flex-1 min-w-[80px] max-w-xs">
          <ProgressBar value={pct} tone={pct === 100 ? "done" : "accent"} />
        </div>
        <span className="mono text-[11px] text-ink-soft shrink-0 hidden lg:inline">{pct}%</span>
        <span className="ml-auto h-8 px-3 rounded-pill border border-line text-[12px] font-medium text-ink-soft shrink-0 flex items-center">
          {total} Problems
        </span>
        <span className={`text-ink-soft/50 text-[11px] transition-transform shrink-0 ${collapsed ? "-rotate-90" : ""}`} aria-hidden="true">
          &#9662;
        </span>
      </div>
      {!collapsed && (
        <div className="border-t border-line divide-y divide-line">
          {visibleProblems.map((p) => (
            <ProblemRow key={p.id} problem={p} onUpdate={onUpdate} onSolve={onSolve} onTagClick={onTagClick} />
          ))}
        </div>
      )}
    </section>
  );
}

import { useState } from "react";
import { FiExternalLink } from "react-icons/fi";
import StatusPicker from "./StatusPicker.jsx";
import ComplexityCalculator from "./ComplexityCalculator.jsx";
import ProblemExample from "./ProblemExample.jsx";
import BookmarkButton from "./BookmarkButton.jsx";
import { Badge, Button, difficultyTone, Input, Label, Textarea } from "./ui/index.js";

export default function ProblemRow({ problem, onUpdate, onSolve, onTagClick }) {
  const [expanded, setExpanded] = useState(false);
  const [linkDraft, setLinkDraft] = useState(problem.externalUrl ?? "");
  const [notesDraft, setNotesDraft] = useState(problem.notes ?? "");
  const [celebrate, setCelebrate] = useState(false);

  const handleStatusChange = (status) => {
    onUpdate(problem.id, { status });
    if (status === "DONE" && problem.status !== "DONE") {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 650);
    }
  };

  const saveLink = () => {
    const trimmed = linkDraft.trim();
    if (trimmed !== (problem.externalUrl ?? "")) {
      onUpdate(problem.id, { externalUrl: trimmed });
    }
  };

  const saveNotes = () => {
    if (notesDraft !== (problem.notes ?? "")) {
      onUpdate(problem.id, { notes: notesDraft });
    }
  };

  const handleHeaderKeyDown = (e) => {
    // Only handle keys landing on the row itself -- nested buttons/inputs (status picker,
    // bookmark, notes field, ...) manage their own keyboard behavior.
    if (e.target !== e.currentTarget) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setExpanded((v) => !v);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      // ".content"/".problem-header" are kept as literal class names purely so this
      // selector-based keyboard nav keeps working.
      const rows = Array.from(e.currentTarget.closest(".content")?.querySelectorAll(".problem-header") ?? []);
      const index = rows.indexOf(e.currentTarget);
      const next = rows[index + (e.key === "ArrowDown" ? 1 : -1)];
      next?.focus();
    }
  };

  return (
    <div className={`transition-shadow ${celebrate ? "ring-2 ring-inset ring-done" : ""}`}>
      <div
        className="problem-header flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-ink/[0.02]"
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={handleHeaderKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
      >
        <StatusPicker status={problem.status} onChange={handleStatusChange} />

        <span className="text-[13.5px] text-ink font-medium truncate min-w-0 flex-1">{problem.title}</span>

        <span className="hidden md:flex items-center gap-1 shrink-0">
          {problem.tags.slice(0, 3).map((t) => (
            <button
              type="button"
              key={t}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick?.(t);
              }}
              title={`Filter by "${t}"`}
              className="h-5 px-1.5 rounded-pill bg-ink/5 text-ink-soft text-[11px] hover:bg-ink/10"
            >
              {t}
            </button>
          ))}
        </span>

        <Badge tone={difficultyTone(problem.difficulty)} size="sm" className="shrink-0">
          {problem.difficulty}
        </Badge>

        <BookmarkButton bookmarked={problem.bookmarked} onToggle={() => onUpdate(problem.id, { bookmarked: !problem.bookmarked })} />

        {problem.externalUrl ? (
          <a
            href={problem.externalUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="hidden sm:flex items-center gap-1 text-[12.5px] text-accent hover:underline shrink-0"
          >
            View <FiExternalLink aria-hidden="true" className="h-3 w-3" />
          </a>
        ) : (
          <span className="hidden sm:inline text-[12px] text-ink-soft/50 shrink-0">No link yet</span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSolve(problem.id);
          }}
          className="h-7 px-3 rounded-md bg-ink text-paper text-[12.5px] font-medium hover:brightness-110 shrink-0"
        >
          Solve
        </button>

        <span className={`text-ink-soft/40 text-[10px] transition-transform shrink-0 ${expanded ? "rotate-90" : ""}`} aria-hidden="true">
          &#9656;
        </span>
      </div>

      {expanded && (
        <div className="px-3 pb-4 pt-1 space-y-3 border-t border-line bg-paper">
          {problem.statement && <p className="text-[13.5px] text-ink leading-relaxed pt-2">{problem.statement}</p>}

          <ProblemExample examples={problem.examples} input={problem.exampleInput} output={problem.exampleOutput} />

          {problem.timeComplexity && problem.spaceComplexity && (
            <ComplexityCalculator timeComplexity={problem.timeComplexity} spaceComplexity={problem.spaceComplexity} />
          )}

          <div>
            <Label>Resource link</Label>
            <Input
              type="url"
              placeholder="Paste a link to the problem (LeetCode, GfG, ...)"
              value={linkDraft}
              onChange={(e) => setLinkDraft(e.target.value)}
              onBlur={saveLink}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              placeholder="Approach, gotchas, complexity, whatever you want to remember next time"
              rows={3}
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={saveNotes}
            />
          </div>
        </div>
      )}
    </div>
  );
}

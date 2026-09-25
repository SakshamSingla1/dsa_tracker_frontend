import { useState } from "react";
import { FiExternalLink } from "react-icons/fi";
import StatusPicker from "./StatusPicker.jsx";
import ComplexityCalculator from "./ComplexityCalculator.jsx";
import ProblemExample from "./ProblemExample.jsx";
import BookmarkButton from "./BookmarkButton.jsx";

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
      const rows = Array.from(
        e.currentTarget.closest(".content")?.querySelectorAll(".problem-header") ?? []
      );
      const index = rows.indexOf(e.currentTarget);
      const next = rows[index + (e.key === "ArrowDown" ? 1 : -1)];
      next?.focus();
    }
  };

  return (
    <div
      className={`problem-row ${expanded ? "expanded" : ""} ${celebrate ? "celebrate" : ""} status-tint-${problem.status.toLowerCase()}`}
    >
      <div
        className="problem-header"
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={handleHeaderKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
      >
        <StatusPicker status={problem.status} onChange={handleStatusChange} />

        <span className="problem-title">{problem.title}</span>

        <span className="problem-tags">
          {problem.tags.map((t) => (
            <button
              type="button"
              className="chip tag"
              key={t}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick?.(t);
              }}
              title={`Filter by "${t}"`}
            >
              {t}
            </button>
          ))}
        </span>

        <span className={`chip pill diff-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>

        <BookmarkButton bookmarked={problem.bookmarked} onToggle={() => onUpdate(problem.id, { bookmarked: !problem.bookmarked })} />

        {problem.externalUrl ? (
          <a
            className="solve-link"
            href={problem.externalUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            View <FiExternalLink aria-hidden="true" />
          </a>
        ) : (
          <span className="solve-link no-link">No link yet</span>
        )}

        <button
          className="solve-btn"
          onClick={(e) => {
            e.stopPropagation();
            onSolve(problem.id);
          }}
        >
          Solve
        </button>

        <span className="chevron" aria-hidden="true">
          &#9656;
        </span>
      </div>

      <div className="problem-details-collapse">
        <div className="problem-details">
          {problem.statement && <p className="problem-statement">{problem.statement}</p>}

          <ProblemExample examples={problem.examples} input={problem.exampleInput} output={problem.exampleOutput} />

          {problem.timeComplexity && problem.spaceComplexity && (
            <ComplexityCalculator timeComplexity={problem.timeComplexity} spaceComplexity={problem.spaceComplexity} />
          )}

          <label className="field">
            <span className="field-label">Resource link</span>
            <input
              type="url"
              placeholder="Paste a link to the problem (LeetCode, GfG, ...)"
              value={linkDraft}
              onChange={(e) => setLinkDraft(e.target.value)}
              onBlur={saveLink}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
            />
          </label>

          <label className="field">
            <span className="field-label">Notes</span>
            <textarea
              placeholder="Approach, gotchas, complexity, whatever you want to remember next time"
              rows={3}
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={saveNotes}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

import { lazy, Suspense, useEffect, useState } from "react";
import { FiArrowLeft, FiExternalLink } from "react-icons/fi";
import StatusPicker from "./StatusPicker.jsx";
import ComplexityCalculator from "./ComplexityCalculator.jsx";
import ProblemExample from "./ProblemExample.jsx";
import UserMenu from "./UserMenu.jsx";
import BookmarkButton from "./BookmarkButton.jsx";
import HintList from "./HintList.jsx";
import SubmissionHistory from "./SubmissionHistory.jsx";
import ContestTimerBanner from "./contest/ContestTimerBanner.jsx";
import { fetchSubmissions } from "../api/client.js";

const CodeEditor = lazy(() => import("./CodeEditor.jsx"));

export default function SolveView({
  problem,
  topicName,
  onBack,
  onUpdate,
  onNavigate,
  hasPrev,
  hasNext,
  user,
  onLogout,
  onRefreshTopics,
  onCelebrate,
  contestSessionId,
}) {
  const [linkDraft, setLinkDraft] = useState(problem.externalUrl ?? "");
  const [notesDraft, setNotesDraft] = useState(problem.notes ?? "");
  const [notesOpen, setNotesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [submissions, setSubmissions] = useState(null);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    setLinkDraft(problem.externalUrl ?? "");
    setNotesDraft(problem.notes ?? "");
    setSubmissions(null);
    setSubmissionsError(null);
    setHistoryOpen(false);
  }, [problem.id, problem.externalUrl, problem.notes]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  const loadSubmissions = () => {
    setSubmissionsLoading(true);
    setSubmissionsError(null);
    fetchSubmissions(problem.id)
      .then(setSubmissions)
      .catch(() => setSubmissionsError("Couldn't load your submission history."))
      .finally(() => setSubmissionsLoading(false));
  };

  const loadHistory = () => {
    setHistoryOpen((v) => !v);
    if (submissions === null && !submissionsLoading) {
      loadSubmissions();
    }
  };

  const handleSubmitted = (res) => {
    if (historyOpen || submissions !== null) {
      fetchSubmissions(problem.id).then(setSubmissions).catch(() => {});
    }
    if (res.verdict === "ACCEPTED") {
      onRefreshTopics?.();
      onCelebrate?.();
      setAccepted(true);
      setTimeout(() => setAccepted(false), 900);
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

  return (
    <div className="solve-view">
      {contestSessionId != null && <ContestTimerBanner contestSessionId={contestSessionId} />}
      <div className="solve-topbar">
        <button className="solve-back" onClick={onBack}>
          <FiArrowLeft aria-hidden="true" /> Sheet
        </button>
        <span className="solve-crumb mono">{topicName}</span>
        <div className="solve-topbar-nav">
          <button className="ghost-btn" disabled={!hasPrev} onClick={() => onNavigate(-1)}>
            ‹ Prev
          </button>
          <button className="ghost-btn" disabled={!hasNext} onClick={() => onNavigate(1)}>
            Next ›
          </button>
        </div>
        {user && <UserMenu user={user} onLogout={onLogout} />}
      </div>

      <div className="solve-body">
        <div className="solve-left">
          <div className="solve-left-header">
            <h1>{problem.title}</h1>
            <span className={`chip pill diff-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
            <BookmarkButton bookmarked={problem.bookmarked} onToggle={() => onUpdate(problem.id, { bookmarked: !problem.bookmarked })} />
          </div>

          <div className="solve-tags">
            {problem.tags.map((t) => (
              <span className="chip tag tag-static" key={t}>
                {t}
              </span>
            ))}
          </div>

          <StatusPicker status={problem.status} onChange={(status) => onUpdate(problem.id, { status })} />

          {problem.statement && <p className="solve-statement">{problem.statement}</p>}

          <ProblemExample examples={problem.examples} input={problem.exampleInput} output={problem.exampleOutput} />

          {problem.constraints?.length > 0 && (
            <div className="constraints-block">
              <div className="field-label">Constraints</div>
              <ul className="constraints-list">
                {problem.constraints.map((c, i) => (
                  <li key={i}>
                    <code>{c}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <HintList hints={problem.hints} />

          {problem.timeComplexity && problem.spaceComplexity && (
            <ComplexityCalculator
              key={problem.id}
              timeComplexity={problem.timeComplexity}
              spaceComplexity={problem.spaceComplexity}
            />
          )}

          <div className="solve-resource-links">
            {problem.externalUrl && (
              <a className="solve-view-link" href={problem.externalUrl} target="_blank" rel="noreferrer">
                Full problem, examples &amp; constraints <FiExternalLink aria-hidden="true" />
              </a>
            )}
            {problem.editorialUrl && (
              <a className="solve-view-link" href={problem.editorialUrl} target="_blank" rel="noreferrer">
                Editorial <FiExternalLink aria-hidden="true" />
              </a>
            )}
            {problem.videoUrl && (
              <a className="solve-view-link" href={problem.videoUrl} target="_blank" rel="noreferrer">
                Video walkthrough <FiExternalLink aria-hidden="true" />
              </a>
            )}
          </div>

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

          {notesOpen ? (
            <label className="field">
              <span className="field-label">Notes</span>
              <textarea
                autoFocus
                placeholder="Approach, gotchas, complexity, whatever you want to remember next time"
                rows={5}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                onBlur={saveNotes}
              />
            </label>
          ) : (
            <button className="ghost-btn-light" onClick={() => setNotesOpen(true)}>
              {problem.notes ? "Edit notes" : "+ Add notes"}
            </button>
          )}

          <button className="ghost-btn-light" onClick={loadHistory}>
            {historyOpen ? "Hide submissions" : "Show submissions"}
          </button>
          {historyOpen && (
            <SubmissionHistory
              submissions={submissions}
              loading={submissionsLoading}
              error={submissionsError}
              onRetry={loadSubmissions}
            />
          )}
        </div>

        <div className={`solve-right ${accepted ? "accepted-pulse" : ""}`}>
          <Suspense fallback={<div className="editor-loading">Loading editor…</div>}>
            <CodeEditor problem={problem} height="52vh" onSubmitted={handleSubmitted} contestSessionId={contestSessionId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

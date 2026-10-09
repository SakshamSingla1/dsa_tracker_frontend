import { lazy, Suspense, useEffect, useState } from "react";
import { FiArrowLeft, FiExternalLink } from "react-icons/fi";
import StatusPicker from "./StatusPicker.jsx";
import ComplexityCalculator from "./ComplexityCalculator.jsx";
import ProblemExample from "./ProblemExample.jsx";
import UserMenu from "./UserMenu.jsx";
import BookmarkButton from "./BookmarkButton.jsx";
import HintList from "./HintList.jsx";
import AiHintPanel from "./AiHintPanel.jsx";
import AiTutorChat from "./AiTutorChat.jsx";
import Discussion from "./Discussion.jsx";
import SubmissionHistory from "./SubmissionHistory.jsx";
import ContestTimerBanner from "./contest/ContestTimerBanner.jsx";
import { fetchSubmissions } from "../api/client.js";
import { Badge, Button, difficultyTone, Input, Label, Spinner, Textarea } from "./ui/index.js";

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
  const [discussionOpen, setDiscussionOpen] = useState(false);
  const [tutorChatOpen, setTutorChatOpen] = useState(false);
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
    setDiscussionOpen(false);
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
    <div className="min-h-screen bg-paper">
      {contestSessionId != null && (
        <div className="px-5 lg:px-8 pt-3">
          <ContestTimerBanner contestSessionId={contestSessionId} />
        </div>
      )}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-5 lg:px-8 h-14 border-b border-line bg-paper/90 backdrop-blur-sm">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink">
          <FiArrowLeft aria-hidden="true" /> Sheet
        </button>
        <span className="mono text-[12px] text-ink-soft truncate">{topicName}</span>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" disabled={!hasPrev} onClick={() => onNavigate(-1)}>
            ‹ Prev
          </Button>
          <Button variant="ghost" size="sm" disabled={!hasNext} onClick={() => onNavigate(1)}>
            Next ›
          </Button>
        </div>
        {user && (
          <div className="ml-auto">
            <UserMenu user={user} onLogout={onLogout} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-5 lg:px-8 py-6 max-w-[1600px] mx-auto">
        <div className="space-y-4 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[20px] font-semibold text-ink">{problem.title}</h1>
            <Badge tone={difficultyTone(problem.difficulty)}>{problem.difficulty}</Badge>
            <BookmarkButton bookmarked={problem.bookmarked} onToggle={() => onUpdate(problem.id, { bookmarked: !problem.bookmarked })} />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {problem.tags.map((t) => (
              <span key={t} className="h-5 px-1.5 rounded-pill bg-ink/5 text-ink-soft text-[11px] flex items-center">
                {t}
              </span>
            ))}
          </div>

          <StatusPicker status={problem.status} onChange={(status) => onUpdate(problem.id, { status })} />

          {problem.statement && <p className="text-[14px] text-ink leading-relaxed">{problem.statement}</p>}

          <ProblemExample examples={problem.examples} input={problem.exampleInput} output={problem.exampleOutput} />

          {problem.constraints?.length > 0 && (
            <div>
              <div className="text-[11px] text-ink-soft mb-1.5">Constraints</div>
              <ul className="space-y-1">
                {problem.constraints.map((c, i) => (
                  <li key={i}>
                    <code className="mono text-[12.5px] text-ink bg-ink/5 rounded px-1.5 py-0.5">{c}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <HintList hints={problem.hints} />
          <AiHintPanel problemId={problem.id} />

          {problem.timeComplexity && problem.spaceComplexity && (
            <ComplexityCalculator key={problem.id} timeComplexity={problem.timeComplexity} spaceComplexity={problem.spaceComplexity} />
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {problem.externalUrl && (
              <a href={problem.externalUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[12.5px] text-accent hover:underline">
                Full problem, examples &amp; constraints <FiExternalLink aria-hidden="true" className="h-3 w-3" />
              </a>
            )}
            {problem.editorialUrl && (
              <a href={problem.editorialUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[12.5px] text-accent hover:underline">
                Editorial <FiExternalLink aria-hidden="true" className="h-3 w-3" />
              </a>
            )}
            {problem.videoUrl && (
              <a href={problem.videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[12.5px] text-accent hover:underline">
                Video walkthrough <FiExternalLink aria-hidden="true" className="h-3 w-3" />
              </a>
            )}
          </div>

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

          {notesOpen ? (
            <div>
              <Label>Notes</Label>
              <Textarea
                autoFocus
                placeholder="Approach, gotchas, complexity, whatever you want to remember next time"
                rows={5}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                onBlur={saveNotes}
              />
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setNotesOpen(true)}>
              {problem.notes ? "Edit notes" : "+ Add notes"}
            </Button>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={loadHistory}>
              {historyOpen ? "Hide submissions" : "Show submissions"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDiscussionOpen((v) => !v)}>
              {discussionOpen ? "Hide discussion" : "Show discussion"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setTutorChatOpen((v) => !v)}>
              {tutorChatOpen ? "Hide AI tutor" : "Ask the AI tutor"}
            </Button>
          </div>

          {historyOpen && (
            <SubmissionHistory submissions={submissions} loading={submissionsLoading} error={submissionsError} onRetry={loadSubmissions} />
          )}
          {discussionOpen && <Discussion problemId={problem.id} />}
          {tutorChatOpen && <AiTutorChat key={problem.id} problemId={problem.id} />}
        </div>

        <div className={`min-w-0 transition-shadow rounded-xl ${accepted ? "ring-2 ring-done" : ""}`}>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64 rounded-xl border border-line bg-paper-raised">
                <Spinner size="lg" />
              </div>
            }
          >
            <CodeEditor problem={problem} height="52vh" onSubmitted={handleSubmitted} contestSessionId={contestSessionId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

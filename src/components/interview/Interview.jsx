import { useEffect, useState } from "react";
import {
  endInterview,
  fetchInterviewHistory,
  fetchInterviewSession,
  sendInterviewMessage,
  startInterview,
} from "../../api/client.js";
import { LoadingState, ErrorState } from "../InlineState.jsx";
import { useToast } from "../ToastProvider.jsx";
import InterviewSetup from "./InterviewSetup.jsx";
import InterviewRun from "./InterviewRun.jsx";
import InterviewResults from "./InterviewResults.jsx";
import InterviewHistory from "./InterviewHistory.jsx";

const ACTIVE_INTERVIEW_KEY = "dsa-active-interview";

function loadActiveInterviewId() {
  try {
    const raw = localStorage.getItem(ACTIVE_INTERVIEW_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

function saveActiveInterviewId(id) {
  try {
    if (id == null) localStorage.removeItem(ACTIVE_INTERVIEW_KEY);
    else localStorage.setItem(ACTIVE_INTERVIEW_KEY, String(id));
  } catch {
    /* private browsing or storage disabled: an in-progress interview just won't survive a refresh */
  }
}

/** Top-level Interview view: shows setup+history when nothing's running, otherwise the
 *  active (or just-completed) session -- same shape as Contest.jsx. */
export default function Interview() {
  const toast = useToast();
  const [interviewId, setInterviewId] = useState(loadActiveInterviewId);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [startError, setStartError] = useState(null);
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [history, setHistory] = useState(null);

  const loadSession = (id) => {
    setError(null);
    fetchInterviewSession(id)
      .then((res) => {
        setSession(res);
        if (res.status !== "IN_PROGRESS") saveActiveInterviewId(null);
      })
      .catch(() => setError("Couldn't load this interview."));
  };

  useEffect(() => {
    if (interviewId == null) {
      setSession(null);
      return;
    }
    loadSession(interviewId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  useEffect(() => {
    if (interviewId == null) {
      fetchInterviewHistory().then(setHistory).catch(() => setHistory([]));
    }
  }, [interviewId]);

  const handleStart = (form) => {
    setStarting(true);
    setStartError(null);
    startInterview(form)
      .then((created) => {
        setInterviewId(created.id);
        saveActiveInterviewId(created.id);
        setSession(created);
      })
      .catch(() => setStartError("Couldn't start an interview with that difficulty. Try widening it."))
      .finally(() => setStarting(false));
  };

  const handleSendMessage = (content) => {
    setSending(true);
    sendInterviewMessage(interviewId, content)
      .then(setSession)
      .catch(() => toast.error("Couldn't reach the AI interviewer."))
      .finally(() => setSending(false));
  };

  const handleEnd = () => {
    setEnding(true);
    endInterview(interviewId)
      .then((updated) => {
        setSession(updated);
        saveActiveInterviewId(null);
      })
      .catch(() => toast.error("Couldn't end this interview."))
      .finally(() => setEnding(false));
  };

  const handleNewInterview = () => {
    setInterviewId(null);
    setSession(null);
    saveActiveInterviewId(null);
  };

  if (interviewId != null) {
    if (error) return <ErrorState message={error} onRetry={() => loadSession(interviewId)} />;
    if (!session) return <LoadingState label="Loading interview…" />;

    if (session.status === "IN_PROGRESS") {
      return (
        <InterviewRun session={session} onSendMessage={handleSendMessage} onEnd={handleEnd} sending={sending} ending={ending} />
      );
    }

    return <InterviewResults session={session} onNewInterview={handleNewInterview} />;
  }

  return (
    <div className="flex flex-wrap items-start gap-5">
      <InterviewSetup onStart={handleStart} starting={starting} error={startError} />
      <InterviewHistory sessions={history} onSelect={(id) => setInterviewId(id)} />
    </div>
  );
}

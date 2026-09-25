import { useEffect, useState } from "react";
import { createContest, fetchContest, fetchContestHistory, finishContest } from "../../api/client.js";
import { LoadingState, ErrorState } from "../InlineState.jsx";
import ContestSetup from "./ContestSetup.jsx";
import ContestRun from "./ContestRun.jsx";
import ContestResults from "./ContestResults.jsx";
import ContestHistory from "./ContestHistory.jsx";

const ACTIVE_CONTEST_KEY = "dsa-active-contest";

function loadActiveContestId() {
  try {
    const raw = localStorage.getItem(ACTIVE_CONTEST_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

function saveActiveContestId(id) {
  try {
    if (id == null) localStorage.removeItem(ACTIVE_CONTEST_KEY);
    else localStorage.setItem(ACTIVE_CONTEST_KEY, String(id));
  } catch {
    /* private browsing or storage disabled: an in-progress contest just won't survive a refresh */
  }
}

/** Top-level Contest view: shows setup+history when nothing's running, otherwise the
 *  active session (server-anchored, so a refresh resumes the same countdown). */
export default function Contest({ onSolveProblem }) {
  const [contestId, setContestId] = useState(loadActiveContestId);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [startError, setStartError] = useState(null);
  const [starting, setStarting] = useState(false);
  const [history, setHistory] = useState(null);

  const loadSession = (id) => {
    setError(null);
    fetchContest(id)
      .then((res) => {
        setSession(res);
        if (res.status !== "IN_PROGRESS") saveActiveContestId(null);
      })
      .catch(() => setError("Couldn't load this contest."));
  };

  useEffect(() => {
    if (contestId == null) {
      setSession(null);
      return;
    }
    loadSession(contestId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contestId]);

  // Poll while running so a problem solved from inside SolveView shows up here on return.
  useEffect(() => {
    if (!session || session.status !== "IN_PROGRESS") return;
    const id = setInterval(() => loadSession(contestId), 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.status, contestId]);

  useEffect(() => {
    if (contestId == null) {
      fetchContestHistory().then(setHistory).catch(() => setHistory([]));
    }
  }, [contestId]);

  const handleStart = (form) => {
    setStarting(true);
    setStartError(null);
    createContest(form)
      .then((created) => {
        setContestId(created.id);
        saveActiveContestId(created.id);
        setSession(created);
      })
      .catch(() => setStartError("Couldn't start a contest with those filters. Try widening them."))
      .finally(() => setStarting(false));
  };

  const handleFinish = () => {
    finishContest(contestId)
      .then((updated) => {
        setSession(updated);
        saveActiveContestId(null);
      })
      .catch(() => setError("Couldn't finish this contest."));
  };

  const handleNewContest = () => {
    setContestId(null);
    setSession(null);
    saveActiveContestId(null);
  };

  if (contestId != null) {
    if (error) return <ErrorState message={error} onRetry={() => loadSession(contestId)} />;
    if (!session) return <LoadingState label="Loading contest…" />;

    if (session.status === "IN_PROGRESS") {
      return (
        <ContestRun
          session={session}
          onSolve={(problemId) => onSolveProblem(problemId, contestId)}
          onFinish={handleFinish}
          onRefresh={() => loadSession(contestId)}
        />
      );
    }

    return <ContestResults session={session} onNewContest={handleNewContest} />;
  }

  return (
    <div className="contest-home">
      <ContestSetup onStart={handleStart} starting={starting} error={startError} />
      <ContestHistory sessions={history} onSelect={(id) => setContestId(id)} />
    </div>
  );
}

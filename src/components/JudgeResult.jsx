import { useState } from "react";
import { FiCheck, FiCpu, FiX } from "react-icons/fi";
import { fetchAiReview } from "../api/client.js";

/** On-demand (not auto-fetched, to avoid burning AI quota on every submit): a short Gemini
 *  review of the submitted code, layered on top of the always-on heuristic complexity above it. */
function AiReviewPanel({ code, language, verdict }) {
  const [state, setState] = useState("idle"); // idle | loading | done | unavailable | error

  const [feedback, setFeedback] = useState(null);

  const request = () => {
    setState("loading");
    fetchAiReview({ code, language, verdict })
      .then((res) => {
        if (!res.available) {
          setState("unavailable");
          return;
        }
        setFeedback(res.feedback);
        setState("done");
      })
      .catch(() => setState("error"));
  };

  if (state === "unavailable") {
    return (
      <div className="ai-panel ai-panel-unavailable">
        <FiCpu aria-hidden="true" />
        <span>AI review isn&rsquo;t configured for this app yet.</span>
      </div>
    );
  }

  return (
    <div className="ai-panel">
      {state === "done" && (
        <div className="ai-panel-message">
          <FiCpu className="ai-panel-icon" aria-hidden="true" />
          <span>{feedback}</span>
        </div>
      )}
      {state === "error" && <div className="ai-panel-error">Couldn&rsquo;t reach the AI review service.</div>}
      {state !== "done" && (
        <button className="ghost-btn-light" onClick={request} disabled={state === "loading"}>
          <FiCpu aria-hidden="true" /> {state === "loading" ? "Reviewing…" : "Get AI review"}
        </button>
      )}
    </div>
  );
}

const VERDICT_LABEL = {
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
  RUNTIME_ERROR: "Runtime Error",
  COMPILE_ERROR: "Compile Error",
  TIME_LIMIT_EXCEEDED: "Time Limit Exceeded",
};

function TestCaseRow({ result }) {
  return (
    <div className={`testcase-row ${result.passed ? "passed" : "failed"}`}>
      <div className="testcase-row-header">
        <span className="testcase-status" aria-hidden="true">
          {result.passed ? <FiCheck /> : <FiX />}
        </span>
        <span>{result.sample ? `Case ${result.index}` : `Hidden case ${result.index}`}</span>
        {result.timedOut && <span className="chip testcase-flag">timed out</span>}
      </div>
      {result.sample && (
        <div className="testcase-details">
          <div>
            <span className="testcase-label">Input</span>
            <pre className="testcase-block">{result.input}</pre>
          </div>
          <div>
            <span className="testcase-label">Expected</span>
            <pre className="testcase-block">{result.expectedOutput}</pre>
          </div>
          <div>
            <span className="testcase-label">Got</span>
            <pre className="testcase-block">{result.actualOutput || "(no output)"}</pre>
          </div>
        </div>
      )}
      {result.stderr && (
        <div>
          <span className="testcase-label">stderr</span>
          <pre className="testcase-block run-output-stderr">{result.stderr}</pre>
        </div>
      )}
    </div>
  );
}

export default function JudgeResult({ result, code, language }) {
  if (!result) return null;

  return (
    <div className="judge-result">
      <div className="judge-summary">
        <span className={`chip verdict-pill verdict-${result.verdict.toLowerCase()}`}>
          {VERDICT_LABEL[result.verdict] ?? result.verdict}
        </span>
        <span className="mono">
          {result.passedCount}/{result.totalCount} passed
        </span>
        <span className="run-duration mono">{result.durationMs}ms</span>
      </div>

      {result.compileError && <pre className="run-output-block run-output-stderr">{result.compileError}</pre>}

      {result.results?.length > 0 && (
        <div className="testcase-list">
          {result.results.map((r) => (
            <TestCaseRow key={r.index} result={r} />
          ))}
        </div>
      )}

      {result.complexity && (
        <div className="complexity-estimate">
          <span className="field-label">Estimated complexity</span>
          <p>{result.complexity.estimate}</p>
        </div>
      )}

      {result.complexity && <AiReviewPanel code={code} language={language} verdict={result.verdict} />}
    </div>
  );
}

import { useState } from "react";
import { FiCheck, FiCpu, FiX } from "react-icons/fi";
import { fetchAiReview } from "../api/client.js";
import { Badge, Button } from "./ui/index.js";

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
      <div className="flex items-center gap-2 text-[13px] text-ink-soft mt-3">
        <FiCpu aria-hidden="true" />
        <span>AI review isn&rsquo;t configured for this app yet.</span>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {state === "done" && (
        <div className="flex gap-2.5 rounded-lg bg-accent-soft px-3 py-2">
          <FiCpu className="text-accent shrink-0 mt-0.5" aria-hidden="true" />
          <span className="text-[13px] text-ink">{feedback}</span>
        </div>
      )}
      {state === "error" && <div className="text-[12.5px] text-hard">Couldn&rsquo;t reach the AI review service.</div>}
      {state !== "done" && (
        <Button variant="ghost" size="sm" icon={<FiCpu className="h-3.5 w-3.5" />} onClick={request} disabled={state === "loading"}>
          {state === "loading" ? "Reviewing…" : "Get AI review"}
        </Button>
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

const VERDICT_TONE = {
  ACCEPTED: "done",
  WRONG_ANSWER: "hard",
  RUNTIME_ERROR: "neutral",
  COMPILE_ERROR: "medium",
  TIME_LIMIT_EXCEEDED: "neutral",
};

function TestCaseRow({ result }) {
  return (
    <div className={`rounded-lg border px-3 py-2.5 ${result.passed ? "border-done/30 bg-done-soft/40" : "border-hard/30 bg-hard-soft/40"}`}>
      <div className="flex items-center gap-2">
        <span className={result.passed ? "text-done" : "text-hard"} aria-hidden="true">
          {result.passed ? <FiCheck /> : <FiX />}
        </span>
        <span className="text-[13px] text-ink">{result.sample ? `Case ${result.index}` : `Hidden case ${result.index}`}</span>
        {result.timedOut && <Badge tone="medium">timed out</Badge>}
      </div>
      {result.sample && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
          <div>
            <span className="text-[11px] text-ink-soft">Input</span>
            <pre className="mono text-[12px] text-ink bg-paper rounded-md p-2 mt-0.5 overflow-x-auto whitespace-pre-wrap break-all">{result.input}</pre>
          </div>
          <div>
            <span className="text-[11px] text-ink-soft">Expected</span>
            <pre className="mono text-[12px] text-ink bg-paper rounded-md p-2 mt-0.5 overflow-x-auto whitespace-pre-wrap break-all">{result.expectedOutput}</pre>
          </div>
          <div>
            <span className="text-[11px] text-ink-soft">Got</span>
            <pre className="mono text-[12px] text-ink bg-paper rounded-md p-2 mt-0.5 overflow-x-auto whitespace-pre-wrap break-all">{result.actualOutput || "(no output)"}</pre>
          </div>
        </div>
      )}
      {result.stderr && (
        <div className="mt-2">
          <span className="text-[11px] text-ink-soft">stderr</span>
          <pre className="mono text-[12px] text-hard bg-paper rounded-md p-2 mt-0.5 overflow-x-auto whitespace-pre-wrap">{result.stderr}</pre>
        </div>
      )}
    </div>
  );
}

export default function JudgeResult({ result, code, language }) {
  if (!result) return null;

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-3">
        <Badge tone={VERDICT_TONE[result.verdict] ?? "neutral"}>{VERDICT_LABEL[result.verdict] ?? result.verdict}</Badge>
        <span className="mono text-[12.5px] text-ink-soft">
          {result.passedCount}/{result.totalCount} passed
        </span>
        <span className="mono text-[12px] text-ink-soft/70">{result.durationMs}ms</span>
      </div>

      {result.compileError && (
        <pre className="mono text-[12px] text-hard bg-hard-soft rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">{result.compileError}</pre>
      )}

      {result.results?.length > 0 && (
        <div className="space-y-2">
          {result.results.map((r) => (
            <TestCaseRow key={r.index} result={r} />
          ))}
        </div>
      )}

      {result.complexity && (
        <div className="rounded-lg bg-ink/[0.03] px-3 py-2.5">
          <span className="text-[11px] text-ink-soft">Estimated complexity</span>
          <p className="text-[13px] text-ink mt-0.5">{result.complexity.estimate}</p>
        </div>
      )}

      {result.complexity && <AiReviewPanel code={code} language={language} verdict={result.verdict} />}
    </div>
  );
}

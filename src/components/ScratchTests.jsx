import { useEffect, useState } from "react";
import { FiPlay, FiPlus, FiTrash2 } from "react-icons/fi";
import { runCode } from "../api/client.js";
import { Button, Textarea } from "./ui/index.js";

function storageKey(problemId) {
  return `dsa-scratch-${problemId}`;
}

function loadCases(problemId) {
  try {
    const raw = localStorage.getItem(storageKey(problemId));
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ id: 1, stdin: "" }];
  } catch {
    return [{ id: 1, stdin: "" }];
  }
}

/**
 * A scratch pad of extra, ad-hoc stdin cases beyond a problem's fixed samples --
 * client-side only (never sent to the backend except as a plain /run call), so it's
 * fine to persist per-problem in localStorage the same way the code editor does.
 */
export default function ScratchTests({ problemId, language, code }) {
  const [cases, setCases] = useState(() => loadCases(problemId));
  const [results, setResults] = useState({});
  const [runningId, setRunningId] = useState(null);

  useEffect(() => {
    setCases(loadCases(problemId));
    setResults({});
  }, [problemId]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(problemId), JSON.stringify(cases));
    } catch {
      /* private browsing or storage disabled: scratch cases just won't persist */
    }
  }, [cases, problemId]);

  const addCase = () => {
    setCases((prev) => [...prev, { id: (prev.at(-1)?.id ?? 0) + 1, stdin: "" }]);
  };

  const removeCase = (id) => {
    setCases((prev) => (prev.length > 1 ? prev.filter((c) => c.id !== id) : prev));
    setResults((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateStdin = (id, stdin) => {
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, stdin } : c)));
  };

  const runOne = async (id, stdin) => {
    setRunningId(id);
    setResults((prev) => ({ ...prev, [id]: { ...prev[id], error: null } }));
    try {
      const res = await runCode(language, code, stdin);
      setResults((prev) => ({ ...prev, [id]: { res, error: null } }));
    } catch {
      setResults((prev) => ({ ...prev, [id]: { res: null, error: "Couldn't reach the backend to run this." } }));
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="space-y-3">
      {cases.map((c) => {
        const entry = results[c.id];
        return (
          <div key={c.id} className="rounded-lg border border-line p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12.5px] font-medium text-ink">Case {cases.indexOf(c) + 1}</span>
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm" icon={<FiPlay className="h-3 w-3" />} onClick={() => runOne(c.id, c.stdin)} disabled={runningId === c.id} aria-label="Run this case">
                  {runningId === c.id ? "Running…" : "Run"}
                </Button>
                <button
                  onClick={() => removeCase(c.id)}
                  disabled={cases.length <= 1}
                  aria-label="Remove this case"
                  className="h-7 w-7 flex items-center justify-center rounded-md text-ink-soft hover:text-hard disabled:opacity-30"
                >
                  <FiTrash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <Textarea placeholder="stdin for this case" rows={2} value={c.stdin} onChange={(e) => updateStdin(c.id, e.target.value)} />
            {entry?.error && <div className="mt-2 rounded-lg bg-hard-soft text-hard text-[12.5px] px-3 py-2">{entry.error}</div>}
            {entry?.res && (
              <div className="mt-2 rounded-lg bg-ink/[0.03] p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[12px] font-medium ${
                      !entry.res.compiled ? "text-hard" : entry.res.timedOut ? "text-medium" : entry.res.exitCode === 0 ? "text-done" : "text-hard"
                    }`}
                  >
                    {!entry.res.compiled
                      ? "Compile error"
                      : entry.res.timedOut
                        ? "Timed out"
                        : entry.res.exitCode === 0
                          ? "Ran successfully"
                          : `Exited with code ${entry.res.exitCode}`}
                  </span>
                  <span className="mono text-[11px] text-ink-soft">{entry.res.durationMs}ms</span>
                </div>
                {entry.res.stdout && (
                  <div>
                    <div className="text-[11px] text-ink-soft">stdout</div>
                    <pre className="mono text-[12px] text-ink bg-paper rounded-md p-2 mt-0.5 overflow-x-auto whitespace-pre-wrap">{entry.res.stdout}</pre>
                  </div>
                )}
                {entry.res.stderr && (
                  <div className="mt-1.5">
                    <div className="text-[11px] text-ink-soft">stderr</div>
                    <pre className="mono text-[12px] text-hard bg-paper rounded-md p-2 mt-0.5 overflow-x-auto whitespace-pre-wrap">{entry.res.stderr}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      <Button variant="ghost" size="sm" icon={<FiPlus className="h-3.5 w-3.5" />} onClick={addCase}>
        Add case
      </Button>
    </div>
  );
}

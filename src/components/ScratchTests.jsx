import { useEffect, useState } from "react";
import { FiPlay, FiPlus, FiTrash2 } from "react-icons/fi";
import { runCode } from "../api/client.js";

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
    <div className="scratch-tests">
      {cases.map((c) => {
        const entry = results[c.id];
        return (
          <div key={c.id} className="scratch-case">
            <div className="scratch-case-header">
              <span className="scratch-case-label">Case {cases.indexOf(c) + 1}</span>
              <div className="scratch-case-actions">
                <button
                  className="ghost-btn"
                  onClick={() => runOne(c.id, c.stdin)}
                  disabled={runningId === c.id}
                  aria-label="Run this case"
                >
                  <FiPlay /> {runningId === c.id ? "Running…" : "Run"}
                </button>
                <button
                  className="ghost-btn scratch-case-remove"
                  onClick={() => removeCase(c.id)}
                  disabled={cases.length <= 1}
                  aria-label="Remove this case"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
            <textarea
              className="stdin-box"
              placeholder="stdin for this case"
              rows={2}
              value={c.stdin}
              onChange={(e) => updateStdin(c.id, e.target.value)}
            />
            {entry?.error && <div className="run-output run-error">{entry.error}</div>}
            {entry?.res && (
              <div className="run-output">
                <div className="run-output-header">
                  <span
                    className={`run-status ${
                      entry.res.compiled ? (entry.res.timedOut ? "run-status-timeout" : "run-status-ok") : "run-status-fail"
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
                  <span className="run-duration mono">{entry.res.durationMs}ms</span>
                </div>
                {entry.res.stdout && (
                  <div>
                    <div className="run-output-label">stdout</div>
                    <pre className="run-output-block">{entry.res.stdout}</pre>
                  </div>
                )}
                {entry.res.stderr && (
                  <div>
                    <div className="run-output-label">stderr</div>
                    <pre className="run-output-block run-output-stderr">{entry.res.stderr}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      <button className="ghost-btn scratch-add-btn" onClick={addCase}>
        <FiPlus /> Add case
      </button>
    </div>
  );
}

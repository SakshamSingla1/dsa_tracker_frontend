import { useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, keymap } from "@codemirror/view";
import { lintGutter } from "@codemirror/lint";
import { vim } from "@replit/codemirror-vim";
import { FiCheckCircle } from "react-icons/fi";
import { runCode, runTests, submitSolution } from "../api/client.js";
import { LANGUAGES, LANGUAGE_ORDER } from "../languages.js";
import { useTheme } from "../hooks/useTheme.js";
import JudgeResult from "./JudgeResult.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import EditorSettings from "./EditorSettings.jsx";
import ScratchTests from "./ScratchTests.jsx";
import { useToast } from "./ToastProvider.jsx";
import { Button, Card, SegmentedControl, Textarea } from "./ui/index.js";

const EDITOR_PREFS_KEY = "dsa-editor-prefs";
const DEFAULT_EDITOR_PREFS = { vimMode: false, fontSize: 14 };

function loadEditorPrefs() {
  try {
    const raw = localStorage.getItem(EDITOR_PREFS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return { ...DEFAULT_EDITOR_PREFS, ...parsed };
  } catch {
    return DEFAULT_EDITOR_PREFS;
  }
}

const VERDICT_TOAST = {
  ACCEPTED: {
    tone: "success",
    message: (
      <>
        <FiCheckCircle className="toast-icon" /> Accepted! Great work.
      </>
    ),
  },
  WRONG_ANSWER: { tone: "error", message: "Wrong answer — check the failing case below." },
  RUNTIME_ERROR: { tone: "error", message: "Runtime error — check stderr below." },
  COMPILE_ERROR: { tone: "error", message: "Compile error — check the details below." },
  TIME_LIMIT_EXCEEDED: { tone: "error", message: "Time limit exceeded on at least one case." },
};

function codeKey(problemId, language) {
  return `dsa-code-${problemId}-${language}`;
}

function langKey(problemId) {
  return `dsa-lang-${problemId}`;
}

function loadLanguage(problemId) {
  try {
    const stored = localStorage.getItem(langKey(problemId));
    return stored && LANGUAGES[stored] ? stored : "JAVA";
  } catch {
    return "JAVA";
  }
}

function loadCode(problemId, language, title) {
  try {
    return localStorage.getItem(codeKey(problemId, language)) ?? LANGUAGES[language].template(title);
  } catch {
    return LANGUAGES[language].template(title);
  }
}

function RunOutput({ result }) {
  if (!result) return null;
  return (
    <div className="mt-3 rounded-lg bg-ink/[0.03] p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={`text-[12.5px] font-medium ${
            !result.compiled ? "text-hard" : result.timedOut ? "text-medium" : result.exitCode === 0 ? "text-done" : "text-hard"
          }`}
        >
          {!result.compiled
            ? "Compile error"
            : result.timedOut
              ? "Timed out"
              : result.exitCode === 0
                ? "Ran successfully"
                : `Exited with code ${result.exitCode}`}
        </span>
        <span className="mono text-[11px] text-ink-soft">{result.durationMs}ms</span>
      </div>
      {result.stdout && (
        <div>
          <div className="text-[11px] text-ink-soft">stdout</div>
          <pre className="mono text-[12px] text-ink bg-paper rounded-md p-2 mt-0.5 overflow-x-auto whitespace-pre-wrap">{result.stdout}</pre>
        </div>
      )}
      {result.stderr && (
        <div className="mt-1.5">
          <div className="text-[11px] text-ink-soft">stderr</div>
          <pre className="mono text-[12px] text-hard bg-paper rounded-md p-2 mt-0.5 overflow-x-auto whitespace-pre-wrap">{result.stderr}</pre>
        </div>
      )}
      {!result.stdout && !result.stderr && <div className="text-[12.5px] text-ink-soft/70">No output.</div>}
    </div>
  );
}

export default function CodeEditor({ problem, height = "280px", onSubmitted, contestSessionId }) {
  const toast = useToast();
  const { isDark } = useTheme();
  const [language, setLanguage] = useState(() => loadLanguage(problem.id));
  const [code, setCode] = useState(() => loadCode(problem.id, loadLanguage(problem.id), problem.title));
  const [showStdin, setShowStdin] = useState(false);
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState(null);

  const [judgeResult, setJudgeResult] = useState(null);
  const [judging, setJudging] = useState(null); // null | "run" | "submit"
  const [judgeError, setJudgeError] = useState(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [editorPrefs, setEditorPrefs] = useState(loadEditorPrefs);
  const [scratchOpen, setScratchOpen] = useState(false);

  const hasTests = problem.totalTestCases > 0;
  const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform || navigator.userAgent);
  const modKey = isMac ? "⌘" : "Ctrl";

  useEffect(() => {
    try {
      localStorage.setItem(EDITOR_PREFS_KEY, JSON.stringify(editorPrefs));
    } catch {
      /* private browsing or storage disabled: editor prefs just won't persist */
    }
  }, [editorPrefs]);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(codeKey(problem.id, language), code);
      } catch {
        /* private browsing or storage disabled: code just won't persist */
      }
    }, 400);
    return () => clearTimeout(id);
  }, [code, problem.id, language]);

  const switchLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    setResult(null);
    setJudgeResult(null);
    setCode(loadCode(problem.id, nextLanguage, problem.title));
    try {
      localStorage.setItem(langKey(problem.id), nextLanguage);
    } catch {
      /* ignore */
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setRunError(null);
    setJudgeResult(null);
    try {
      const res = await runCode(language, code, stdin);
      setResult(res);
    } catch {
      setRunError("Couldn't reach the backend to run this. Is it running on http://localhost:8081?");
    } finally {
      setRunning(false);
    }
  };

  const handleRunTests = async () => {
    setJudging("run");
    setJudgeError(null);
    setResult(null);
    try {
      const res = await runTests(problem.id, language, code);
      setJudgeResult(res);
    } catch {
      setJudgeError("Couldn't reach the backend to run the sample tests.");
    } finally {
      setJudging(null);
    }
  };

  const handleSubmit = async () => {
    setJudging("submit");
    setJudgeError(null);
    setResult(null);
    try {
      const res = await submitSolution(problem.id, language, code, contestSessionId);
      setJudgeResult(res);
      onSubmitted?.(res);
      const t = VERDICT_TOAST[res.verdict];
      if (t) toast[t.tone === "success" ? "success" : "error"](t.message, { duration: t.tone === "success" ? 4200 : 3200 });
      if (res.xpAwarded) {
        setTimeout(() => toast.show(`+${res.xpAwarded} XP`, { duration: 2400 }), t ? 350 : 0);
      }
    } catch {
      setJudgeError("Couldn't reach the backend to submit this.");
    } finally {
      setJudging(null);
    }
  };

  const handleReset = () => setResetConfirmOpen(true);

  const confirmReset = () => {
    setCode(LANGUAGES[language].template(problem.title));
    setResult(null);
    setJudgeResult(null);
    setResetConfirmOpen(false);
    toast.show("Code reset to the starter template", { duration: 1800 });
  };

  const current = LANGUAGES[language];

  // The keymap closure below is created once and never changes, so it reads the latest
  // handlers/state through this ref rather than capturing a stale snapshot from whichever
  // render first built the (memoized) extensions array.
  const latestActionsRef = useRef(null);
  useEffect(() => {
    latestActionsRef.current = { handleRun, handleRunTests, handleSubmit, running, judging, hasTests };
  });

  const shortcutKeymap = useMemo(
    () =>
      keymap.of([
        {
          // Mirrors "Run tests" when this problem has judge test cases (the common case) --
          // falls back to the generic stdin Run for the few that don't.
          key: "Mod-Enter",
          run: () => {
            const { handleRun, handleRunTests, running, judging, hasTests } = latestActionsRef.current;
            if (hasTests) {
              if (judging === null) handleRunTests();
            } else if (!running) {
              handleRun();
            }
            return true;
          },
        },
        {
          key: "Mod-Shift-Enter",
          run: () => {
            const { handleSubmit, judging, hasTests } = latestActionsRef.current;
            if (judging === null && hasTests) handleSubmit();
            return true;
          },
        },
      ]),
    []
  );

  // vim must come first in the extensions array so it can intercept keystrokes
  // before the language/lint/keymap extensions handle them.
  const editorExtensions = useMemo(
    () => [
      ...(editorPrefs.vimMode ? [vim()] : []),
      current.extension,
      lintGutter(),
      EditorView.theme({ "&": { fontSize: `${editorPrefs.fontSize}px` } }),
      shortcutKeymap,
    ],
    [current, editorPrefs.vimMode, editorPrefs.fontSize, shortcutKeymap]
  );

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 border-b border-line">
        <SegmentedControl
          options={LANGUAGE_ORDER.map((key) => ({ value: key, label: LANGUAGES[key].label }))}
          value={language}
          onChange={switchLanguage}
        />
        <div className="flex items-center gap-1.5 ml-auto">
          <EditorSettings prefs={editorPrefs} onChange={setEditorPrefs} vimAvailable />
          <Button variant="ghost" size="sm" onClick={() => setShowStdin((v) => !v)}>
            {showStdin ? "Hide stdin" : "Add stdin"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setScratchOpen((v) => !v)}>
            {scratchOpen ? "Hide scratch tests" : "Scratch tests"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </Button>
          <span className="w-px h-5 bg-line" aria-hidden="true" />
          <Button variant="secondary" size="sm" onClick={handleRun} disabled={running} title={hasTests ? undefined : `${modKey}+Enter`}>
            {running ? "Running…" : "Run ▸"}
          </Button>
        </div>
      </div>

      <div className="px-3 pt-2.5">
        {current.hint && <div className="text-[12px] text-ink-soft mb-2">{current.hint}</div>}

        {showStdin && (
          <Textarea
            placeholder="Input fed to stdin, if your program reads any"
            rows={2}
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            className="mb-2.5"
          />
        )}
      </div>

      <CodeMirror
        // Remounts on a language switch: `value` and `extensions` (the language mode) both
        // change in the same render when switching languages, and @uiw/react-codemirror can
        // race on that combination -- rebuilding the EditorState from a stale value snapshot
        // instead of the new one, so the editor kept showing the previous language's code. A
        // fresh mount always starts from the current `value` prop, sidestepping that race.
        key={language}
        value={code}
        height={height}
        theme={isDark ? oneDark : "light"}
        extensions={editorExtensions}
        onChange={(value) => setCode(value)}
        basicSetup={{ tabSize: 4 }}
      />

      <div className="p-3 space-y-3">
        {scratchOpen && (
          <div className="rounded-lg border border-line p-3">
            <div className="text-[12.5px] font-semibold text-ink mb-3">Scratch test cases</div>
            <ScratchTests problemId={problem.id} language={language} code={code} />
          </div>
        )}

        <div className="flex items-center gap-2">
          {hasTests ? (
            <>
              <Button variant="secondary" onClick={handleRunTests} disabled={judging !== null}>
                {judging === "run" ? "Running tests…" : "Run tests ▸"}
              </Button>
              <Button variant="primary" onClick={handleSubmit} disabled={judging !== null}>
                {judging === "submit" ? "Submitting…" : "Submit"}
              </Button>
            </>
          ) : (
            <span className="text-[12.5px] text-ink-soft">No automated tests for this problem yet — use Run above with your own input.</span>
          )}
        </div>

        {runError && <div className="rounded-lg bg-hard-soft text-hard text-[13px] px-3 py-2">{runError}</div>}
        {judgeError && <div className="rounded-lg bg-hard-soft text-hard text-[13px] px-3 py-2">{judgeError}</div>}

        <RunOutput result={result} />

        <JudgeResult result={judgeResult} code={code} language={language} />
      </div>

      <ConfirmDialog
        open={resetConfirmOpen}
        title="Reset this problem's code?"
        body="This replaces the editor with the starter template. Your current code for this language will be lost."
        confirmLabel="Reset"
        onConfirm={confirmReset}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </Card>
  );
}

import { useEffect, useState } from "react";
import { fetchSheets } from "../../api/client.js";

const PROBLEM_COUNT_PRESETS = [3, 5, 10];
const DURATION_PRESETS = [15, 30, 60];
const DIFFICULTIES = [
  { value: "", label: "Any" },
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

export default function ContestSetup({ onStart, starting, error }) {
  const [sheets, setSheets] = useState([]);
  const [problemCount, setProblemCount] = useState(5);
  const [difficulty, setDifficulty] = useState("");
  const [sheetSlug, setSheetSlug] = useState("ALL");
  const [durationMinutes, setDurationMinutes] = useState(30);

  useEffect(() => {
    fetchSheets().then(setSheets).catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onStart({
      problemCount,
      difficulty: difficulty || null,
      sheetSlug: sheetSlug === "ALL" ? null : sheetSlug,
      durationMinutes,
    });
  };

  return (
    <form className="contest-setup glass-card" onSubmit={handleSubmit}>
      <h2>Start a timed contest</h2>
      <p className="contest-setup-lede">Draw a fresh problem set and race the clock, contest-style.</p>

      <div className="contest-field">
        <span className="field-label">Problems</span>
        <div className="filter-group" role="group" aria-label="Problem count">
          {PROBLEM_COUNT_PRESETS.map((n) => (
            <button
              type="button"
              key={n}
              className={`filter-chip ${problemCount === n ? "active" : ""}`}
              onClick={() => setProblemCount(n)}
            >
              {n}
            </button>
          ))}
          <input
            type="number"
            min={1}
            max={20}
            className="contest-number-input"
            value={problemCount}
            onChange={(e) => setProblemCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            aria-label="Custom problem count"
          />
        </div>
      </div>

      <div className="contest-field">
        <span className="field-label">Difficulty</span>
        <div className="filter-group" role="group" aria-label="Difficulty">
          {DIFFICULTIES.map((d) => (
            <button
              type="button"
              key={d.value}
              className={`filter-chip ${difficulty === d.value ? "active" : ""}`}
              onClick={() => setDifficulty(d.value)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {sheets.length > 0 && (
        <div className="contest-field">
          <span className="field-label">Sheet</span>
          <select className="contest-select" value={sheetSlug} onChange={(e) => setSheetSlug(e.target.value)}>
            <option value="ALL">Any sheet</option>
            {sheets.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="contest-field">
        <span className="field-label">Duration</span>
        <div className="filter-group" role="group" aria-label="Duration in minutes">
          {DURATION_PRESETS.map((m) => (
            <button
              type="button"
              key={m}
              className={`filter-chip ${durationMinutes === m ? "active" : ""}`}
              onClick={() => setDurationMinutes(m)}
            >
              {m}m
            </button>
          ))}
          <input
            type="number"
            min={5}
            max={180}
            className="contest-number-input"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Math.max(5, Math.min(180, Number(e.target.value) || 5)))}
            aria-label="Custom duration in minutes"
          />
        </div>
      </div>

      {error && <div className="inline-state inline-state-error">{error}</div>}

      <button className="submit-btn" type="submit" disabled={starting}>
        {starting ? "Starting…" : "Start contest ▸"}
      </button>
    </form>
  );
}

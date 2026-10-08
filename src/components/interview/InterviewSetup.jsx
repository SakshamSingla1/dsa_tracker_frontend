import { useState } from "react";

const DIFFICULTIES = [
  { value: "", label: "Any" },
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

/** The AI plays interviewer for a drawn problem -- picks it up by difficulty, or any. */
export default function InterviewSetup({ onStart, starting, error }) {
  const [difficulty, setDifficulty] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onStart({ difficulty: difficulty || null });
  };

  return (
    <form className="interview-setup glass-card" onSubmit={handleSubmit}>
      <h2>Start a mock interview</h2>
      <p className="contest-setup-lede">
        The AI draws a problem and plays interviewer -- it reacts to your approach before you code, and gives
        you a final verdict when you end the session.
      </p>

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

      {error && <div className="inline-state inline-state-error">{error}</div>}

      <button className="submit-btn" type="submit" disabled={starting}>
        {starting ? "Finding a problem…" : "Start interview ▸"}
      </button>
    </form>
  );
}

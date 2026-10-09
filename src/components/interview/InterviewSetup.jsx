import { useState } from "react";
import { Button, Card, Label, SegmentedControl } from "../ui/index.js";

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
    <Card as="form" padding="lg" onSubmit={handleSubmit} className="max-w-md">
      <h2 className="text-[16px] font-semibold text-ink mb-1">Start a mock interview</h2>
      <p className="text-[13px] text-ink-soft mb-5">
        The AI draws a problem and plays interviewer — it reacts to your approach before you code, and gives you a
        final verdict when you end the session.
      </p>

      <div>
        <Label>Difficulty</Label>
        <SegmentedControl options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />
      </div>

      {error && <div className="mt-4 rounded-lg bg-hard-soft text-hard text-[13px] px-3 py-2">{error}</div>}

      <Button type="submit" variant="primary" size="lg" loading={starting} className="w-full mt-5">
        {starting ? "Finding a problem…" : "Start interview ▸"}
      </Button>
    </Card>
  );
}

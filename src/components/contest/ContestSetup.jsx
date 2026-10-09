import { useEffect, useState } from "react";
import { fetchSheets } from "../../api/client.js";
import { Button, Card, Input, Label, Select, SegmentedControl } from "../ui/index.js";

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
    <Card as="form" padding="lg" onSubmit={handleSubmit} className="max-w-md">
      <h2 className="text-[16px] font-semibold text-ink mb-1">Start a timed contest</h2>
      <p className="text-[13px] text-ink-soft mb-5">Draw a fresh problem set and race the clock, contest-style.</p>

      <div className="space-y-4">
        <div>
          <Label>Problems</Label>
          <div className="flex items-center gap-2">
            <SegmentedControl
              options={PROBLEM_COUNT_PRESETS.map((n) => ({ value: n, label: String(n) }))}
              value={problemCount}
              onChange={setProblemCount}
            />
            <Input
              type="number"
              min={1}
              max={20}
              value={problemCount}
              onChange={(e) => setProblemCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
              aria-label="Custom problem count"
              className="w-20"
            />
          </div>
        </div>

        <div>
          <Label>Difficulty</Label>
          <SegmentedControl options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />
        </div>

        {sheets.length > 0 && (
          <div>
            <Label>Sheet</Label>
            <Select value={sheetSlug} onChange={(e) => setSheetSlug(e.target.value)}>
              <option value="ALL">Any sheet</option>
              {sheets.map((s) => (
                <option key={s.id} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <Label>Duration</Label>
          <div className="flex items-center gap-2">
            <SegmentedControl
              options={DURATION_PRESETS.map((m) => ({ value: m, label: `${m}m` }))}
              value={durationMinutes}
              onChange={setDurationMinutes}
            />
            <Input
              type="number"
              min={5}
              max={180}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Math.max(5, Math.min(180, Number(e.target.value) || 5)))}
              aria-label="Custom duration in minutes"
              className="w-20"
            />
          </div>
        </div>
      </div>

      {error && <div className="mt-4 rounded-lg bg-hard-soft text-hard text-[13px] px-3 py-2">{error}</div>}

      <Button type="submit" variant="primary" size="lg" loading={starting} className="w-full mt-5">
        {starting ? "Starting…" : "Start contest ▸"}
      </Button>
    </Card>
  );
}

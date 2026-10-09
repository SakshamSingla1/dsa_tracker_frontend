import { useState } from "react";
import { Button, Select, Badge } from "./ui/index.js";

const CLASSES = ["O(1)", "O(log n)", "O(√n)", "O(n)", "O(n log n)", "O(n²)", "O(n³)", "O(2ⁿ)", "O(n!)"];

function normalize(s) {
  return s.replace(/\s+/g, "").toLowerCase();
}

// The stored answer can carry qualifiers ("O(n log n) avg", "O(1) per op") or
// problem-specific notation (V+E, n·m, ...) that will never exactly match a
// dropdown pick. Pull out the first O(...) token to compare against, and
// only ever affirm a match -- never tell someone their differently-phrased
// but equivalent answer is wrong.
function leadingToken(actual) {
  const m = actual.match(/O\([^)]*\)/i);
  return m ? m[0] : actual;
}

function isMatch(guess, actual) {
  return !!guess && normalize(leadingToken(actual)) === normalize(guess);
}

export default function ComplexityCalculator({ timeComplexity, spaceComplexity }) {
  const [guessTime, setGuessTime] = useState("");
  const [guessSpace, setGuessSpace] = useState("");
  const [revealed, setRevealed] = useState(false);

  const timeMatch = isMatch(guessTime, timeComplexity);
  const spaceMatch = isMatch(guessSpace, spaceComplexity);

  return (
    <div className="rounded-lg border border-line bg-paper p-3">
      <div className="text-[12.5px] font-semibold text-ink mb-2.5">Complexity calculator</div>

      {!revealed ? (
        <>
          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <label className="block">
              <span className="block text-[11.5px] text-ink-soft mb-1">Time</span>
              <Select value={guessTime} onChange={(e) => setGuessTime(e.target.value)}>
                <option value="">Your guess…</option>
                {CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block">
              <span className="block text-[11.5px] text-ink-soft mb-1">Space</span>
              <Select value={guessSpace} onChange={(e) => setGuessSpace(e.target.value)}>
                <option value="">Your guess…</option>
                {CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </label>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setRevealed(true)}>
            Check answer
          </Button>
        </>
      ) : (
        <div className="space-y-2" role="status" aria-live="polite">
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-ink-soft w-12">Time</span>
            <span className="mono text-ink">{timeComplexity}</span>
            {timeMatch && <Badge tone="done">matched your guess</Badge>}
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-ink-soft w-12">Space</span>
            <span className="mono text-ink">{spaceComplexity}</span>
            {spaceMatch && <Badge tone="done">matched your guess</Badge>}
          </div>
          <Button variant="secondary" size="sm" onClick={() => setRevealed(false)}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

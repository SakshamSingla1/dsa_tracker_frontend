import { useState } from "react";

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
    <div className="complexity-calc">
      <div className="complexity-calc-title">Complexity calculator</div>

      {!revealed ? (
        <>
          <div className="complexity-calc-row">
            <label className="complexity-calc-field">
              <span>Time</span>
              <select value={guessTime} onChange={(e) => setGuessTime(e.target.value)}>
                <option value="">Your guess…</option>
                {CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="complexity-calc-field">
              <span>Space</span>
              <select value={guessSpace} onChange={(e) => setGuessSpace(e.target.value)}>
                <option value="">Your guess…</option>
                {CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="ghost-btn-light complexity-calc-check" onClick={() => setRevealed(true)}>
            Check answer
          </button>
        </>
      ) : (
        <div className="complexity-calc-result" role="status" aria-live="polite">
          <div className={`complexity-calc-answer ${timeMatch ? "match" : ""}`}>
            <span className="complexity-calc-label">Time</span>
            <span className="mono">{timeComplexity}</span>
            {timeMatch && <span className="chip complexity-calc-badge">matched your guess</span>}
          </div>
          <div className={`complexity-calc-answer ${spaceMatch ? "match" : ""}`}>
            <span className="complexity-calc-label">Space</span>
            <span className="mono">{spaceComplexity}</span>
            {spaceMatch && <span className="chip complexity-calc-badge">matched your guess</span>}
          </div>
          <button className="ghost-btn-light complexity-calc-check" onClick={() => setRevealed(false)}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

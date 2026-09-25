function OneExample({ input, output, explanation, index, total }) {
  return (
    <div className="problem-example">
      <div className="problem-example-title" role="heading" aria-level="4">
        {total > 1 ? `Example ${index + 1}` : "Example"}
      </div>
      <div className="problem-example-row">
        <span className="problem-example-label" id={`example-${index}-input-label`}>
          Input
        </span>
        <code aria-labelledby={`example-${index}-input-label`}>{input}</code>
      </div>
      <div className="problem-example-row">
        <span className="problem-example-label" id={`example-${index}-output-label`}>
          Output
        </span>
        <code aria-labelledby={`example-${index}-output-label`}>{output}</code>
      </div>
      {explanation && (
        <div className="problem-example-row">
          <span className="problem-example-label">Why</span>
          <span className="problem-example-explanation">{explanation}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Renders a problem's worked examples. Accepts either the richer `examples`
 * array (preferred) or the legacy single `input`/`output` pair, so callers
 * don't need to know which shape a given problem has.
 */
export default function ProblemExample({ examples, input, output }) {
  const list = examples && examples.length > 0 ? examples : input && output ? [{ input, output }] : [];
  if (list.length === 0) return null;

  return (
    <div className="problem-examples" role="group" aria-label="Worked examples">
      {list.map((ex, i) => (
        <OneExample key={i} input={ex.input} output={ex.output} explanation={ex.explanation} index={i} total={list.length} />
      ))}
    </div>
  );
}

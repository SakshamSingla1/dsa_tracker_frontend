function OneExample({ input, output, explanation, index, total }) {
  return (
    <div className="rounded-lg border border-line bg-paper p-3">
      <div className="text-[12px] font-semibold text-ink-soft mb-2" role="heading" aria-level="4">
        {total > 1 ? `Example ${index + 1}` : "Example"}
      </div>
      <div className="flex gap-2 text-[13px] mb-1.5">
        <span className="text-ink-soft w-16 shrink-0" id={`example-${index}-input-label`}>
          Input
        </span>
        <code aria-labelledby={`example-${index}-input-label`} className="mono text-ink break-all">
          {input}
        </code>
      </div>
      <div className="flex gap-2 text-[13px]">
        <span className="text-ink-soft w-16 shrink-0" id={`example-${index}-output-label`}>
          Output
        </span>
        <code aria-labelledby={`example-${index}-output-label`} className="mono text-ink break-all">
          {output}
        </code>
      </div>
      {explanation && (
        <div className="flex gap-2 text-[13px] mt-1.5">
          <span className="text-ink-soft w-16 shrink-0">Why</span>
          <span className="text-ink-soft">{explanation}</span>
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
    <div className="space-y-2" role="group" aria-label="Worked examples">
      {list.map((ex, i) => (
        <OneExample key={i} input={ex.input} output={ex.output} explanation={ex.explanation} index={i} total={list.length} />
      ))}
    </div>
  );
}

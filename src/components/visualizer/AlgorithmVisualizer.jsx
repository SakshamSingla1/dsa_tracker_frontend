import { useEffect, useMemo, useRef, useState } from "react";
import { FiPause, FiPlay, FiRewind, FiShuffle, FiSkipBack, FiSkipForward } from "react-icons/fi";
import { ALGORITHMS, ALGORITHM_ORDER } from "./sortAlgorithms.js";
import { Badge, Button, Card, SegmentedControl } from "../ui/index.js";

const DEFAULT_SIZE = 40;
const MIN_DELAY_MS = 8;
const MAX_DELAY_MS = 400;

function randomArray(size) {
  return Array.from({ length: size }, () => 8 + Math.floor(Math.random() * 92));
}

const BAR_CLASS = {
  default: "bg-accent/40",
  compare: "bg-medium",
  swap: "bg-hard",
  done: "bg-done",
};

export default function AlgorithmVisualizer() {
  const [algorithmKey, setAlgorithmKey] = useState("BUBBLE");
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [initialArray, setInitialArray] = useState(() => randomArray(DEFAULT_SIZE));
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [delayMs, setDelayMs] = useState(60);
  const timerRef = useRef(null);

  const algorithm = ALGORITHMS[algorithmKey];
  const steps = useMemo(() => algorithm.run(initialArray), [algorithm, initialArray]);

  const reshuffle = (newSize = size) => {
    setPlaying(false);
    setInitialArray(randomArray(newSize));
    setStepIndex(0);
  };

  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
  }, [algorithmKey, initialArray]);

  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    timerRef.current = setTimeout(() => setStepIndex((i) => Math.min(i + 1, steps.length - 1)), MAX_DELAY_MS - delayMs + MIN_DELAY_MS);
    return () => clearTimeout(timerRef.current);
  }, [playing, stepIndex, steps.length, delayMs]);

  const current = steps[stepIndex];
  const isDone = stepIndex === steps.length - 1;

  const counts = useMemo(() => {
    let comparisons = 0;
    let writes = 0;
    for (let i = 0; i <= stepIndex; i++) {
      if (steps[i].type === "compare") comparisons++;
      if (steps[i].type === "swap") writes++;
    }
    return { comparisons, writes };
  }, [steps, stepIndex]);

  const maxValue = useMemo(() => Math.max(...initialArray, 1), [initialArray]);

  const barClass = (idx) => {
    if (isDone) return BAR_CLASS.done;
    if (!current || !current.indices.includes(idx)) return BAR_CLASS.default;
    return current.type === "swap" ? BAR_CLASS.swap : BAR_CLASS.compare;
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <Card padding="lg" className="space-y-4">
        <SegmentedControl
          options={ALGORITHM_ORDER.map((key) => ({ value: key, label: ALGORITHMS[key].label }))}
          value={algorithmKey}
          onChange={setAlgorithmKey}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" icon={<FiShuffle className="h-3.5 w-3.5" />} onClick={() => reshuffle()}>
            Shuffle
          </Button>
          <Button variant="ghost" size="sm" icon={<FiRewind className="h-3.5 w-3.5" />} onClick={() => setStepIndex(0)} disabled={stepIndex === 0}>
            Restart
          </Button>
          <Button variant="ghost" size="sm" icon={<FiSkipBack className="h-3.5 w-3.5" />} onClick={() => setStepIndex((i) => Math.max(i - 1, 0))} disabled={stepIndex === 0} />
          <Button variant="primary" size="sm" icon={playing ? <FiPause className="h-3.5 w-3.5" /> : <FiPlay className="h-3.5 w-3.5" />} onClick={() => setPlaying((p) => !p)} disabled={isDone}>
            {playing ? "Pause" : "Play"}
          </Button>
          <Button variant="ghost" size="sm" icon={<FiSkipForward className="h-3.5 w-3.5" />} onClick={() => setStepIndex((i) => Math.min(i + 1, steps.length - 1))} disabled={isDone} />

          <label className="flex items-center gap-2 text-[12.5px] text-ink-soft ml-2">
            <span>Speed</span>
            <input type="range" min={MIN_DELAY_MS} max={MAX_DELAY_MS} value={delayMs} onChange={(e) => setDelayMs(Number(e.target.value))} className="accent-[var(--accent)]" />
          </label>

          <label className="flex items-center gap-2 text-[12.5px] text-ink-soft">
            <span>Bars</span>
            <input
              type="range"
              min={10}
              max={100}
              value={size}
              onChange={(e) => {
                const next = Number(e.target.value);
                setSize(next);
                reshuffle(next);
              }}
              className="accent-[var(--accent)]"
            />
          </label>
        </div>
      </Card>

      <div className="flex items-center gap-4 mono text-[12.5px] text-ink-soft">
        <span>
          Step {stepIndex} / {steps.length - 1}
        </span>
        <span>{counts.comparisons} comparisons</span>
        <span>{counts.writes} writes/swaps</span>
        {isDone && <Badge tone="done">Sorted!</Badge>}
      </div>

      <div className="flex items-end gap-[2px] h-64 rounded-lg border border-line bg-paper-raised p-3" role="img" aria-label={`${algorithm.label} visualization`}>
        {(current?.array ?? initialArray).map((value, idx) => (
          <div key={idx} className={`flex-1 rounded-t-sm transition-colors ${barClass(idx)}`} style={{ height: `${(value / maxValue) * 100}%` }} />
        ))}
      </div>

      <Card padding="lg">
        <h2 className="text-[15px] font-semibold text-ink mb-1.5">{algorithm.label}</h2>
        <p className="text-[13.5px] text-ink-soft leading-relaxed mb-3">{algorithm.blurb}</p>
        <div className="flex items-center gap-2">
          <Badge tone="neutral">Time: {algorithm.time}</Badge>
          <Badge tone="neutral">Space: {algorithm.space}</Badge>
        </div>
      </Card>
    </div>
  );
}

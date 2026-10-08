import { useEffect, useMemo, useRef, useState } from "react";
import { FiPause, FiPlay, FiRewind, FiShuffle, FiSkipBack, FiSkipForward } from "react-icons/fi";
import { ALGORITHMS, ALGORITHM_ORDER } from "./sortAlgorithms.js";

const DEFAULT_SIZE = 40;
const MIN_DELAY_MS = 8;
const MAX_DELAY_MS = 400;

function randomArray(size) {
  return Array.from({ length: size }, () => 8 + Math.floor(Math.random() * 92));
}

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

  const highlightClass = (idx) => {
    if (isDone) return "visualizer-bar-done";
    if (!current || !current.indices.includes(idx)) return "";
    return current.type === "swap" ? "visualizer-bar-swap" : "visualizer-bar-compare";
  };

  return (
    <div className="visualizer">
      <div className="visualizer-controls">
        <div className="visualizer-control-group" role="group" aria-label="Algorithm">
          {ALGORITHM_ORDER.map((key) => (
            <button
              key={key}
              className={`filter-chip ${algorithmKey === key ? "active" : ""}`}
              onClick={() => setAlgorithmKey(key)}
            >
              {ALGORITHMS[key].label}
            </button>
          ))}
        </div>

        <div className="visualizer-control-row">
          <button className="ghost-btn" onClick={() => reshuffle()}>
            <FiShuffle aria-hidden="true" /> Shuffle
          </button>
          <button className="ghost-btn" onClick={() => setStepIndex(0)} disabled={stepIndex === 0}>
            <FiRewind aria-hidden="true" /> Restart
          </button>
          <button className="ghost-btn" onClick={() => setStepIndex((i) => Math.max(i - 1, 0))} disabled={stepIndex === 0}>
            <FiSkipBack aria-hidden="true" />
          </button>
          <button
            className="run-btn"
            onClick={() => setPlaying((p) => !p)}
            disabled={isDone}
          >
            {playing ? <FiPause aria-hidden="true" /> : <FiPlay aria-hidden="true" />} {playing ? "Pause" : "Play"}
          </button>
          <button
            className="ghost-btn"
            onClick={() => setStepIndex((i) => Math.min(i + 1, steps.length - 1))}
            disabled={isDone}
          >
            <FiSkipForward aria-hidden="true" />
          </button>

          <label className="visualizer-slider-field">
            <span>Speed</span>
            <input
              type="range"
              min={MIN_DELAY_MS}
              max={MAX_DELAY_MS}
              value={delayMs}
              onChange={(e) => setDelayMs(Number(e.target.value))}
            />
          </label>

          <label className="visualizer-slider-field">
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
            />
          </label>
        </div>
      </div>

      <div className="visualizer-stats mono">
        <span>Step {stepIndex} / {steps.length - 1}</span>
        <span>{counts.comparisons} comparisons</span>
        <span>{counts.writes} writes/swaps</span>
        {isDone && <span className="chip verdict-pill verdict-accepted">Sorted!</span>}
      </div>

      <div className="visualizer-bars" role="img" aria-label={`${algorithm.label} visualization`}>
        {(current?.array ?? initialArray).map((value, idx) => (
          <div
            key={idx}
            className={`visualizer-bar ${highlightClass(idx)}`}
            style={{ height: `${(value / maxValue) * 100}%` }}
          />
        ))}
      </div>

      <div className="visualizer-info dashboard-card">
        <h2>{algorithm.label}</h2>
        <p>{algorithm.blurb}</p>
        <div className="visualizer-complexity-row">
          <span className="chip">Time: {algorithm.time}</span>
          <span className="chip">Space: {algorithm.space}</span>
        </div>
      </div>
    </div>
  );
}

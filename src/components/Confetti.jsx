import { useEffect, useState } from "react";

const COLORS = ["#4a4fcf", "#c15fd6", "#1e8a6e", "#a9761f", "#b0473c", "#2f8fd6", "#e3b45c"];
const PARTICLE_COUNT = 70;

function makeParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.35,
    duration: 1.8 + Math.random() * 1.1,
    rotation: 360 + Math.random() * 720,
    color: COLORS[i % COLORS.length],
    drift: (Math.random() - 0.5) * 260,
    width: 7 + Math.random() * 6,
    height: 10 + Math.random() * 8,
    round: i % 3 === 0,
  }));
}

/** Fires a short confetti burst every time `burstKey` changes to a new truthy value. */
export default function Confetti({ burstKey }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!burstKey) return;
    const batch = makeParticles();
    setParticles(batch);
    const id = setTimeout(() => setParticles([]), 3200);
    return () => clearTimeout(id);
  }, [burstKey]);

  if (particles.length === 0) return null;

  return (
    <div className="confetti-layer" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={`confetti-piece ${p.round ? "round" : ""}`}
          style={{
            left: `${p.left}%`,
            "--drift": `${p.drift}px`,
            "--rotation": `${p.rotation}deg`,
            "--duration": `${p.duration}s`,
            "--delay": `${p.delay}s`,
            width: p.width,
            height: p.height,
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}

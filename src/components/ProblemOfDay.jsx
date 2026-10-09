import { useEffect, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { GiTrophy } from "react-icons/gi";
import { fetchProblemOfTheDay } from "../api/client.js";
import { ErrorState } from "./InlineState.jsx";
import { Badge, Button, difficultyTone } from "./ui/index.js";

export default function ProblemOfDay({ sheetSlug, onSolve }) {
  const [potd, setPotd] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setPotd(null);
    setError(null);
    fetchProblemOfTheDay(sheetSlug)
      .then(setPotd)
      .catch(() => setError("Couldn't load the problem of the day."));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetSlug]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!potd) return null;

  const { problem, topicName } = potd;

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-accent-line p-5 flex items-center gap-5 animate-fade-up hover-lift"
      style={{ background: "linear-gradient(120deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 55%, var(--ring-gradient-end)) 55%, var(--ring-gradient-end) 100%)" }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 120">
        <path d="M0,120 L60,55 L110,90 L170,30 L230,80 L290,45 L340,90 L400,60 L400,120 Z" fill="rgba(0,0,0,0.25)" />
        {[...Array(14)].map((_, i) => (
          <circle
            key={i}
            cx={(i * 37 + 13) % 400}
            cy={(i * 53) % 60}
            r={i % 3 === 0 ? 1.6 : 1}
            fill="white"
            opacity={0.5}
            className="animate-float"
            style={{ animationDelay: `${(i % 5) * 0.4}s`, animationDuration: `${3.5 + (i % 4) * 0.6}s` }}
          />
        ))}
      </svg>

      <div className="relative h-16 w-16 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 text-2xl text-white animate-float">
        <GiTrophy aria-hidden="true" />
      </div>

      <div className="relative min-w-0 flex-1">
        <div className="text-[11px] font-semibold text-white/80 uppercase tracking-wide mb-1 flex items-center gap-1.5">
          <GiTrophy className="h-3 w-3" aria-hidden="true" /> Problem of the Day
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[17px] font-semibold text-white truncate">{problem.title}</span>
          <Badge tone={difficultyTone(problem.difficulty)}>{problem.difficulty}</Badge>
          {problem.status === "DONE" && (
            <span className="flex items-center gap-1 text-[12px] text-white/90">
              <FiCheck className="h-3 w-3" /> solved
            </span>
          )}
        </div>
        <p className="text-[13px] text-white/75 mt-1 truncate max-w-xl">{topicName}</p>
      </div>

      <div className="relative flex items-center gap-2 shrink-0">
        <Button
          variant="secondary"
          className="!bg-white/10 !border-white/25 !text-white hover:!brightness-125 transition-transform hover:scale-105"
          onClick={() => onSolve(problem.id)}
        >
          View Details
        </Button>
        <Button
          variant="primary"
          className="!bg-white !text-ink hover:!brightness-95 transition-transform hover:scale-105"
          onClick={() => onSolve(problem.id)}
        >
          {problem.status === "DONE" ? "Review" : "Solve Now"} →
        </Button>
      </div>
    </div>
  );
}

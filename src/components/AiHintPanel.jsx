import { useState } from "react";
import { FiCpu } from "react-icons/fi";
import { fetchAiHint } from "../api/client.js";
import { Button } from "./ui/index.js";

/** On-demand AI hints (Gemini), separate from the problem's static hint list -- each click asks
 *  for one fresh nudge rather than pre-generating anything, so a problem with AI disabled costs
 *  nothing and one with it enabled doesn't burn quota until the user actually wants help. */
export default function AiHintPanel({ problemId }) {
  const [hints, setHints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState(null);

  const requestHint = () => {
    setLoading(true);
    setError(null);
    fetchAiHint(problemId)
      .then((res) => {
        if (!res.available) {
          setUnavailable(true);
          return;
        }
        setHints((prev) => [...prev, res.hint]);
      })
      .catch(() => setError("Couldn't reach the AI hint service."))
      .finally(() => setLoading(false));
  };

  if (unavailable && hints.length === 0) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-ink-soft">
        <FiCpu aria-hidden="true" />
        <span>AI hints aren&rsquo;t configured for this app yet.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {hints.map((hint, i) => (
        <div key={i} className="flex gap-2.5 rounded-lg bg-accent-soft px-3 py-2">
          <FiCpu className="text-accent shrink-0 mt-0.5" aria-hidden="true" />
          <span className="text-[13px] text-ink">{hint}</span>
        </div>
      ))}
      {error && <div className="text-[12.5px] text-hard">{error}</div>}
      <Button variant="ghost" size="sm" icon={<FiCpu className="h-3.5 w-3.5" />} onClick={requestHint} disabled={loading}>
        {loading ? "Thinking…" : hints.length === 0 ? "Ask AI for a hint" : "Ask for another AI hint"}
      </Button>
    </div>
  );
}

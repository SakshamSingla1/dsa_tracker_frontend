import { useState } from "react";
import { FiCpu } from "react-icons/fi";
import { fetchAiHint } from "../api/client.js";

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
      <div className="ai-panel ai-panel-unavailable">
        <FiCpu aria-hidden="true" />
        <span>AI hints aren&rsquo;t configured for this app yet.</span>
      </div>
    );
  }

  return (
    <div className="ai-panel">
      {hints.map((hint, i) => (
        <div className="ai-panel-message" key={i}>
          <FiCpu className="ai-panel-icon" aria-hidden="true" />
          <span>{hint}</span>
        </div>
      ))}
      {error && <div className="ai-panel-error">{error}</div>}
      <button className="ghost-btn-light" onClick={requestHint} disabled={loading}>
        <FiCpu aria-hidden="true" /> {loading ? "Thinking…" : hints.length === 0 ? "Ask AI for a hint" : "Ask for another AI hint"}
      </button>
    </div>
  );
}

import { useEffect, useState } from "react";
import { FiCpu } from "react-icons/fi";
import { fetchAiCoachNote } from "../../api/client.js";
import { LoadingState, ErrorState } from "../InlineState.jsx";

/** AI-personalized "what to focus on" note, layered above the rule-based Recommendations list
 *  below it -- built from the same practice stats that back the Insights view. */
export default function CoachNote() {
  const [note, setNote] = useState(null);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    setUnavailable(false);
    fetchAiCoachNote()
      .then((res) => {
        if (!res.available) {
          setUnavailable(true);
          return;
        }
        setNote(res.note);
      })
      .catch(() => setError("Couldn't load your AI coach note."));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (unavailable) return null; // AI not configured -- the rule-based list below still works fine on its own
  if (note === null) return <LoadingState label="Your AI coach is reviewing your stats…" />;

  return (
    <div className="flex gap-3 rounded-lg border border-accent-line bg-accent-soft px-4 py-3 mb-3">
      <FiCpu className="text-accent shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-[13.5px] text-ink leading-relaxed">{note}</p>
    </div>
  );
}

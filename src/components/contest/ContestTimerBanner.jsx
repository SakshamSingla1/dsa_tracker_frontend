import { useEffect, useState } from "react";
import { GiFlame } from "react-icons/gi";
import { fetchContest } from "../../api/client.js";

function formatRemaining(ms) {
  if (ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** A compact, always-visible reminder while solving a problem from inside an active contest --
 *  fetches the session once for its fixed `endsAt`, then just ticks a local clock against it. */
export default function ContestTimerBanner({ contestSessionId }) {
  const [endsAt, setEndsAt] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setEndsAt(null);
    fetchContest(contestSessionId)
      .then((res) => setEndsAt(new Date(res.endsAt).getTime()))
      .catch(() => {});
  }, [contestSessionId]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (endsAt == null) return null;

  const remainingMs = endsAt - now;
  const urgent = remainingMs > 0 && remainingMs < 60_000;

  return (
    <div className={`contest-solve-banner ${urgent ? "contest-timer-urgent" : ""}`}>
      <GiFlame aria-hidden="true" />
      <span>Contest in progress</span>
      <span className="mono contest-solve-banner-time">{formatRemaining(remainingMs)}</span>
    </div>
  );
}

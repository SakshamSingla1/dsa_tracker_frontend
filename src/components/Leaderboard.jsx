import { useCallback, useEffect, useState } from "react";
import { FaMedal } from "react-icons/fa";
import { fetchLeaderboard } from "../api/client.js";
import { LoadingState, ErrorState } from "./InlineState.jsx";
import { Select } from "./ui/index.js";

const MEDAL_COLORS = ["#d4af37", "#a8a8a8", "#b08d57"]; // gold, silver, bronze

const SCOPES = [
  { value: "ALL", label: "All time" },
  { value: "WEEK", label: "This week" },
  { value: "MONTH", label: "This month" },
];

export default function Leaderboard({ sheets = [] }) {
  const [scope, setScope] = useState("ALL");
  const [sheet, setSheet] = useState("");
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    setEntries(null);
    fetchLeaderboard({ scope, sheet: sheet || undefined })
      .then(setEntries)
      .catch(() => setError("Couldn't load the leaderboard."));
  }, [scope, sheet]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-line bg-paper-raised" role="group" aria-label="Leaderboard time scope">
          {SCOPES.map((s) => (
            <button
              key={s.value}
              onClick={() => setScope(s.value)}
              className={`h-8 px-3 rounded-md text-[13px] font-medium transition-colors
                ${scope === s.value ? "bg-accent text-accent-ink" : "text-ink-soft hover:text-ink"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        {sheets.length > 0 && (
          <Select value={sheet} onChange={(e) => setSheet(e.target.value)} className="w-auto">
            <option value="">All sheets</option>
            {sheets.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </Select>
        )}
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && !entries && <LoadingState label="Loading leaderboard…" />}
      {!error && entries && entries.length === 0 && (
        <p className="text-[13.5px] text-ink-soft">No one's solved a problem in this window yet — be the first on the board.</p>
      )}
      {!error && entries && entries.length > 0 && (
        <div className="space-y-1.5">
          {entries.map((entry, i) => (
            <div
              key={`${entry.displayName}-${i}`}
              className={`flex items-center gap-4 rounded-lg border px-4 py-2.5
                ${entry.isYou ? "border-accent-line bg-accent-soft" : "border-line bg-paper-raised"}`}
              style={MEDAL_COLORS[i] ? { borderLeftColor: MEDAL_COLORS[i], borderLeftWidth: 3 } : undefined}
            >
              <span className="mono text-[13px] text-ink-soft w-6 shrink-0 flex items-center">
                {MEDAL_COLORS[i] ? <FaMedal style={{ color: MEDAL_COLORS[i] }} /> : `#${i + 1}`}
              </span>
              <span className="flex-1 min-w-0 text-[13.5px] text-ink truncate flex items-center gap-2">
                {entry.displayName}
                {entry.isYou && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide bg-accent text-accent-ink rounded-pill px-1.5 py-0.5">
                    you
                  </span>
                )}
              </span>
              <span className="mono text-[12.5px] text-ink-soft shrink-0">{entry.solvedCount} solved</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

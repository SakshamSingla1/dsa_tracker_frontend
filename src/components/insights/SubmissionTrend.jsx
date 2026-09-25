import { useMemo } from "react";
import { dateKey, addDays } from "../dashboard/date-utils.js";
import InsightsEmptyState from "./InsightsEmptyState.jsx";

const HEIGHT = 120;
const WIDTH = 640;

/** Fills in zero-count days so the line reads as a continuous timeline, not just submission days. */
function buildSeries(dailyActivity, days) {
  const byDate = new Map(dailyActivity.map((d) => [d.date, d.count]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = addDays(today, -i);
    const key = dateKey(day);
    series.push({ key, count: byDate.get(key) ?? 0 });
  }
  return series;
}

export default function SubmissionTrend({ dailyActivity, days }) {
  const series = useMemo(() => buildSeries(dailyActivity, days), [dailyActivity, days]);
  const max = Math.max(1, ...series.map((d) => d.count));

  const points = series.map((d, i) => {
    const x = (i / Math.max(1, series.length - 1)) * WIDTH;
    const y = HEIGHT - (d.count / max) * (HEIGHT - 8) - 4;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;

  const total = series.reduce((sum, d) => sum + d.count, 0);
  const activeDays = series.filter((d) => d.count > 0).length;

  if (total === 0) {
    return <InsightsEmptyState message={`No submissions in the last ${days} days -- solve something to see your trend.`} />;
  }

  return (
    <div className="insights-trend">
      <div className="insights-trend-stats">
        <span>
          <strong className="mono">{total}</strong> submissions in the last {days} days
        </span>
        <span>
          <strong className="mono">{activeDays}</strong> active days
        </span>
      </div>
      <svg
        className="insights-trend-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${total} submissions over the last ${days} days`}
      >
        <defs>
          <linearGradient id="trend-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {total > 0 && <path d={areaPath} fill="url(#trend-fill)" stroke="none" />}
        {total > 0 && <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </div>
  );
}

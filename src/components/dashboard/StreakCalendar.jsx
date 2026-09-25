import { useEffect, useMemo, useRef, useState } from "react";
import { GiFlame } from "react-icons/gi";
import { dateKey, addDays, parseKey } from "./date-utils.js";
import AnimatedNumber from "./AnimatedNumber.jsx";

const CELL = 16;
const GAP = 4;
const COL_WIDTH = CELL + GAP;
const MIN_WEEKS = 8;
const MAX_WEEKS = 53; // a full year, GitHub-style
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = [null, "Mon", null, "Wed", null, "Fri", null];
const DATE_FMT = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });

function levelFor(count) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

const GUTTER = 40; // day-label column + the gap next to it

/** How many week-columns fit the given pixel width, clamped to a sane range. */
function weeksForWidth(width) {
  if (!width) return MIN_WEEKS;
  // The grid always renders weekCount + 1 columns (the trailing partial week up to today),
  // so the fit needs to reserve room for that extra column too.
  const fit = Math.floor((width - GUTTER) / COL_WIDTH) - 1;
  return Math.max(MIN_WEEKS, Math.min(MAX_WEEKS, fit));
}

/** The set of date keys making up the trailing active streak, so the grid can trace it visually. */
function streakDateKeys(dayCounts, currentStreak, realToday) {
  const keys = new Set();
  if (currentStreak <= 0) return keys;
  const hasToday = (dayCounts[dateKey(realToday)] ?? 0) > 0;
  let cursor = hasToday ? realToday : addDays(realToday, -1);
  for (let i = 0; i < currentStreak; i++) {
    keys.add(dateKey(cursor));
    cursor = addDays(cursor, -1);
  }
  return keys;
}

export default function StreakCalendar({ dayCounts, currentStreak, longestStreak }) {
  const wrapRef = useRef(null);
  const calRef = useRef(null);
  const [weekCount, setWeekCount] = useState(MIN_WEEKS);
  const [yearsBack, setYearsBack] = useState(0);
  const [hover, setHover] = useState(null); // { x, y, text } relative to calRef

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width;
      if (width) setWeekCount(weeksForWidth(width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const realToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const anchorEnd = addDays(realToday, -yearsBack * 365);
  const streakKeys = useMemo(() => streakDateKeys(dayCounts, currentStreak, realToday), [dayCounts, currentStreak, realToday]);

  // Start on the Sunday of the week `weekCount` weeks before the anchor, so the grid is aligned.
  const start = addDays(anchorEnd, -(weekCount * 7 - 1));
  start.setDate(start.getDate() - start.getDay());

  const weeks = [];
  const monthLabels = [];
  let lastMonth = null;
  let cursor = start;
  for (let w = 0; w < weekCount + 1; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const key = dateKey(cursor);
      const inRange = cursor <= realToday && cursor <= anchorEnd;
      days.push({ key, count: inRange ? dayCounts[key] ?? 0 : null, isToday: key === dateKey(realToday) });
      // Only label a month change if it's the first column, or if enough columns have
      // passed since the last label -- otherwise a start date that lands right on a
      // month boundary can stack two labels on top of each other.
      if (d === 0) {
        const month = cursor.getMonth();
        const lastLabelWeek = monthLabels.at(-1)?.week;
        if (month !== lastMonth && (lastLabelWeek === undefined || w - lastLabelWeek >= 3)) {
          monthLabels.push({ week: w, label: MONTH_NAMES[month] });
          lastMonth = month;
        }
      }
      cursor = addDays(cursor, 1);
    }
    weeks.push(days);
  }

  const activeDays = Object.values(dayCounts).filter((c) => c > 0).length;
  const monthStart = new Date(realToday.getFullYear(), realToday.getMonth(), 1);
  const solvedThisMonth = Object.entries(dayCounts).reduce((sum, [key, count]) => {
    return count > 0 && parseKey(key) >= monthStart ? sum + count : sum;
  }, 0);

  const rangeLabel = `${DATE_FMT.format(start)} – ${DATE_FMT.format(anchorEnd)}`;

  const showTooltip = (e, text) => {
    if (!text || !calRef.current) return;
    const cellRect = e.currentTarget.getBoundingClientRect();
    const calRect = calRef.current.getBoundingClientRect();
    setHover({ x: cellRect.left - calRect.left + cellRect.width / 2, y: cellRect.top - calRect.top, text });
  };

  return (
    <div className="streak-calendar" ref={calRef}>
      <div className="streak-stats">
        <div className="streak-stat">
          <AnimatedNumber value={currentStreak} className="streak-stat-value mono" />
          <span className="streak-stat-label">day streak</span>
        </div>
        <div className="streak-stat">
          <AnimatedNumber value={longestStreak} className="streak-stat-value mono" />
          <span className="streak-stat-label">longest streak</span>
        </div>
        <div className="streak-stat">
          <AnimatedNumber value={activeDays} className="streak-stat-value mono" />
          <span className="streak-stat-label">active days</span>
        </div>
        <div className="streak-stat">
          <AnimatedNumber value={solvedThisMonth} className="streak-stat-value mono" />
          <span className="streak-stat-label">solved this month</span>
        </div>
      </div>

      <div className="streak-nav">
        <button className="streak-nav-btn" onClick={() => setYearsBack((y) => y + 1)} title="Previous year">
          ‹
        </button>
        <span className="streak-range mono">{rangeLabel}</span>
        <button className="streak-nav-btn" onClick={() => setYearsBack((y) => Math.max(0, y - 1))} disabled={yearsBack === 0} title="Next year">
          ›
        </button>
        {yearsBack > 0 && (
          <button className="streak-today-btn" onClick={() => setYearsBack(0)}>
            Jump to today
          </button>
        )}
      </div>

      <div className="streak-scroll" ref={wrapRef}>
        <div className="streak-grid-area">
          <div className="streak-day-labels">
            {DAY_LABELS.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>

          <div className="streak-grid-col">
            <div className="streak-months" style={{ width: (weekCount + 1) * COL_WIDTH }}>
              {monthLabels.map(({ week, label }) => (
                <span key={week} style={{ left: week * COL_WIDTH }}>
                  {label}
                </span>
              ))}
            </div>

            <div className="streak-grid" role="img" aria-label={`Daily problems solved, ${rangeLabel}`} onMouseLeave={() => setHover(null)}>
              {weeks.map((week, i) => (
                <div className="streak-week" key={i}>
                  {week.map((day) => {
                    const tooltip =
                      day.count === null ? null : `${day.count} solved — ${DATE_FMT.format(parseKey(day.key))}`;
                    return (
                      <div
                        key={day.key}
                        className={[
                          "streak-cell",
                          day.count === null ? "streak-cell-empty" : `streak-level-${levelFor(day.count)}`,
                          day.isToday ? "streak-cell-today" : "",
                          streakKeys.has(day.key) ? "streak-cell-active" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onMouseEnter={(e) => showTooltip(e, tooltip)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {hover && (
        <div className="streak-tooltip" style={{ left: hover.x, top: hover.y }}>
          {hover.text}
        </div>
      )}

      <div className="streak-legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((lvl) => (
          <div key={lvl} className={`streak-cell streak-level-${lvl}`} />
        ))}
        <span>More</span>
        {currentStreak > 0 && (
          <span className="streak-legend-flame">
            <GiFlame className="icon-flame" /> current streak highlighted
          </span>
        )}
      </div>
    </div>
  );
}

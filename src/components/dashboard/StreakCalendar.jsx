import { useEffect, useMemo, useRef, useState } from "react";
import { GiFlame } from "react-icons/gi";
import { dateKey, addDays, parseKey } from "./date-utils.js";
import AnimatedNumber from "./AnimatedNumber.jsx";
import { Button } from "../ui/index.js";

const CELL = 16;
const GAP = 4;
const COL_WIDTH = CELL + GAP;
const MIN_WEEKS = 8;
const MAX_WEEKS = 53; // a full year, GitHub-style
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = [null, "Mon", null, "Wed", null, "Fri", null];
const DATE_FMT = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });

const LEVEL_CLASS = ["bg-ink/[0.06]", "bg-done/30", "bg-done/55", "bg-done/80", "bg-done"];

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
    <div className="relative" ref={calRef}>
      <div className="flex flex-wrap gap-6 mb-4">
        <div className="flex flex-col">
          <AnimatedNumber value={currentStreak} className="mono text-xl font-bold text-ink" />
          <span className="text-[12px] text-ink-soft">day streak</span>
        </div>
        <div className="flex flex-col">
          <AnimatedNumber value={longestStreak} className="mono text-xl font-bold text-ink" />
          <span className="text-[12px] text-ink-soft">longest streak</span>
        </div>
        <div className="flex flex-col">
          <AnimatedNumber value={activeDays} className="mono text-xl font-bold text-ink" />
          <span className="text-[12px] text-ink-soft">active days</span>
        </div>
        <div className="flex flex-col">
          <AnimatedNumber value={solvedThisMonth} className="mono text-xl font-bold text-ink" />
          <span className="text-[12px] text-ink-soft">solved this month</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setYearsBack((y) => y + 1)}
          title="Previous year"
          className="h-7 w-7 flex items-center justify-center rounded-md border border-line text-ink-soft hover:text-ink hover:border-line-strong"
        >
          ‹
        </button>
        <span className="mono text-[12px] text-ink-soft">{rangeLabel}</span>
        <button
          onClick={() => setYearsBack((y) => Math.max(0, y - 1))}
          disabled={yearsBack === 0}
          title="Next year"
          className="h-7 w-7 flex items-center justify-center rounded-md border border-line text-ink-soft hover:text-ink hover:border-line-strong disabled:opacity-40 disabled:pointer-events-none"
        >
          ›
        </button>
        {yearsBack > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setYearsBack(0)}>
            Jump to today
          </Button>
        )}
      </div>

      <div className="overflow-x-auto" ref={wrapRef}>
        <div className="flex gap-2">
          <div className="flex flex-col gap-1 pt-[18px] shrink-0">
            {DAY_LABELS.map((label, i) => (
              <span key={i} className="h-4 text-[10px] leading-4 text-ink-soft">
                {label}
              </span>
            ))}
          </div>

          <div className="flex flex-col">
            <div className="relative h-[16px]" style={{ width: (weekCount + 1) * COL_WIDTH }}>
              {monthLabels.map(({ week, label }) => (
                <span key={week} className="absolute top-0 text-[10px] text-ink-soft" style={{ left: week * COL_WIDTH }}>
                  {label}
                </span>
              ))}
            </div>

            <div
              className="flex gap-1"
              role="img"
              aria-label={`Daily problems solved, ${rangeLabel}`}
              onMouseLeave={() => setHover(null)}
            >
              {weeks.map((week, i) => (
                <div key={i} className="flex flex-col gap-1">
                  {week.map((day) => {
                    const tooltip =
                      day.count === null ? null : `${day.count} solved — ${DATE_FMT.format(parseKey(day.key))}`;
                    const empty = day.count === null;
                    return (
                      <div
                        key={day.key}
                        onMouseEnter={(e) => showTooltip(e, tooltip)}
                        className={`h-4 w-4 rounded-[3px]
                          ${empty ? "bg-transparent" : LEVEL_CLASS[levelFor(day.count)]}
                          ${day.isToday ? "ring-1 ring-accent ring-offset-1 ring-offset-paper-raised" : ""}
                          ${streakKeys.has(day.key) ? "outline outline-1 outline-medium" : ""}`}
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
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-full -mt-2 px-2 py-1 rounded-md bg-ink text-paper text-[11px] whitespace-nowrap pointer-events-none"
          style={{ left: hover.x, top: hover.y }}
        >
          {hover.text}
        </div>
      )}

      <div className="flex items-center gap-1.5 mt-3 text-[11px] text-ink-soft">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((lvl) => (
          <div key={lvl} className={`h-3 w-3 rounded-[3px] ${LEVEL_CLASS[lvl]}`} />
        ))}
        <span>More</span>
        {currentStreak > 0 && (
          <span className="flex items-center gap-1 ml-2">
            <GiFlame className="text-medium" /> current streak outlined
          </span>
        )}
      </div>
    </div>
  );
}

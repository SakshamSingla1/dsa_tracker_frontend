import { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { dateKey } from "../dashboard/date-utils.js";
import { Card } from "../ui/index.js";

const MONTH_FMT = new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric" });
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** A month-grid view of solve activity -- a compact complement to the full-year heatmap on
 *  the Dashboard, scoped to "what does this month look like". Only solved-day data is reliably
 *  tracked per day today, so the legend reflects that rather than inventing revise/bookmark
 *  day-level history the backend doesn't record. */
export default function StudyCalendarWidget({ dayCounts }) {
  const [monthOffset, setMonthOffset] = useState(0);

  const { label, weeks, todayKey } = useMemo(() => {
    const anchor = new Date();
    anchor.setDate(1);
    anchor.setMonth(anchor.getMonth() + monthOffset);
    const year = anchor.getFullYear();
    const month = anchor.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday-first
    const gridStart = new Date(year, month, 1 - startOffset);

    const weeks = [];
    let cursor = new Date(gridStart);
    for (let w = 0; w < 6; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        days.push({
          date: new Date(cursor),
          inMonth: cursor.getMonth() === month,
          key: dateKey(cursor),
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(days);
    }

    return { label: MONTH_FMT.format(anchor), weeks, todayKey: dateKey(new Date()) };
  }, [monthOffset]);

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13.5px] font-semibold text-ink">Study Calendar</h3>
        <div className="flex items-center gap-1">
          <button onClick={() => setMonthOffset((m) => m - 1)} className="h-6 w-6 flex items-center justify-center rounded-md text-ink-soft hover:text-ink hover:bg-ink/5">
            <FiChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-[11.5px] text-ink-soft w-16 text-center">{label}</span>
          <button onClick={() => setMonthOffset((m) => m + 1)} className="h-6 w-6 flex items-center justify-center rounded-md text-ink-soft hover:text-ink hover:bg-ink/5">
            <FiChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((d) => (
          <span key={d} className="text-[9.5px] text-ink-soft/60 text-center">
            {d[0]}
          </span>
        ))}
      </div>

      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day) => {
              const count = dayCounts?.[day.key] ?? 0;
              const isToday = day.key === todayKey;
              return (
                <div
                  key={day.key}
                  title={count > 0 ? `${count} solved` : undefined}
                  className={`aspect-square rounded-[5px] flex items-center justify-center text-[9.5px]
                    ${day.inMonth ? "text-ink-soft" : "text-ink-soft/30"}
                    ${count > 0 ? "bg-accent text-accent-ink font-medium" : "bg-ink/[0.04]"}
                    ${isToday && count === 0 ? "ring-1 ring-accent" : ""}`}
                >
                  {day.date.getDate()}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-3 text-[10.5px] text-ink-soft">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-ink/[0.08]" /> No activity
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-accent" /> Solved
        </span>
      </div>
    </Card>
  );
}

// Local-calendar-date helpers. The backend stamps `completedAt` using the
// server JVM's local timezone (LocalDate.now()), so the frontend must key
// dates by local calendar day too -- not UTC (Date#toISOString), which
// silently shifts by a day for part of the day in timezones ahead of UTC.

export function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date, n) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + n);
  return copy;
}

// Parses a "YYYY-MM-DD" key as a local-midnight Date. Deliberately not
// `new Date(key)` -- that parses date-only strings as UTC, which drifts
// from the local dates `dateKey`/`addDays` produce.
export function parseKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Current and longest consecutive-day streaks from a { "YYYY-MM-DD": count } map. */
export function computeStreaks(dayCounts) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hasToday = (dayCounts[dateKey(today)] ?? 0) > 0;
  let cursor = hasToday ? today : addDays(today, -1);
  let current = 0;
  while ((dayCounts[dateKey(cursor)] ?? 0) > 0) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  const activeDates = Object.keys(dayCounts)
    .filter((key) => dayCounts[key] > 0)
    .sort();
  let longest = 0;
  let run = 0;
  let prevKey = null;
  for (const key of activeDates) {
    if (prevKey !== null && dateKey(addDays(parseKey(prevKey), 1)) === key) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prevKey = key;
  }

  return { current, longest: Math.max(longest, current) };
}

/** Rolls a sheet's topics up into the numbers the header, dashboard, and achievements all need. */
export function computeSheetStats(topics) {
  const allProblems = topics.flatMap((t) => t.problems);
  const total = allProblems.length;
  const done = allProblems.filter((p) => p.status === "DONE").length;
  const revise = allProblems.filter((p) => p.status === "REVISE").length;
  const bookmarked = allProblems.filter((p) => p.bookmarked).length;

  const byDifficulty = {};
  for (const p of allProblems) {
    byDifficulty[p.difficulty] ??= { done: 0, total: 0 };
    byDifficulty[p.difficulty].total += 1;
    if (p.status === "DONE") byDifficulty[p.difficulty].done += 1;
  }

  const dayCounts = {};
  for (const p of allProblems) {
    if (p.completedAt) {
      dayCounts[p.completedAt] = (dayCounts[p.completedAt] ?? 0) + 1;
    }
  }

  const { current, longest } = computeStreaks(dayCounts);

  return { total, done, revise, bookmarked, byDifficulty, dayCounts, currentStreak: current, longestStreak: longest };
}

/** Every solved problem across a topic list, newest first -- shared by Profile's "Recent
 *  activity" card and the sheet view's RecentActivityWidget. */
export function recentActivity(topics, limit = 6) {
  if (!topics) return [];
  return topics
    .flatMap((t) => t.problems.map((p) => ({ ...p, topicName: t.name })))
    .filter((p) => p.completedAt)
    .sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1))
    .slice(0, limit);
}

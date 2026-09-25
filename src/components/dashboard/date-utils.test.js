import { describe, expect, it } from "vitest";
import { addDays, computeSheetStats, dateKey } from "./date-utils.js";

function problem({ status = "TODO", difficulty = "EASY", bookmarked = false, completedAt = null }) {
  return { status, difficulty, bookmarked, completedAt };
}

function topics(problems) {
  return [{ id: 1, name: "Topic", problems }];
}

describe("computeSheetStats", () => {
  it("returns all zeros for an empty sheet", () => {
    const stats = computeSheetStats([]);
    expect(stats).toMatchObject({ total: 0, done: 0, revise: 0, bookmarked: 0, currentStreak: 0, longestStreak: 0 });
    expect(stats.byDifficulty).toEqual({});
  });

  it("counts total/done/revise/bookmarked correctly", () => {
    const stats = computeSheetStats(topics([
      problem({ status: "DONE" }),
      problem({ status: "DONE" }),
      problem({ status: "REVISE" }),
      problem({ status: "TODO", bookmarked: true }),
    ]));

    expect(stats.total).toBe(4);
    expect(stats.done).toBe(2);
    expect(stats.revise).toBe(1);
    expect(stats.bookmarked).toBe(1);
  });

  it("breaks totals down by difficulty", () => {
    const stats = computeSheetStats(topics([
      problem({ difficulty: "EASY", status: "DONE" }),
      problem({ difficulty: "EASY", status: "TODO" }),
      problem({ difficulty: "HARD", status: "DONE" }),
    ]));

    expect(stats.byDifficulty.EASY).toEqual({ done: 1, total: 2 });
    expect(stats.byDifficulty.HARD).toEqual({ done: 1, total: 1 });
  });

  it("computes a current streak that includes today", () => {
    const today = new Date();
    const yesterday = addDays(today, -1);
    const twoDaysAgo = addDays(today, -2);

    const stats = computeSheetStats(topics([
      problem({ status: "DONE", completedAt: dateKey(today) }),
      problem({ status: "DONE", completedAt: dateKey(yesterday) }),
      problem({ status: "DONE", completedAt: dateKey(twoDaysAgo) }),
    ]));

    expect(stats.currentStreak).toBe(3);
    expect(stats.longestStreak).toBe(3);
  });

  it("current streak is 0 when nothing was solved today or yesterday", () => {
    const longAgo = addDays(new Date(), -10);
    const stats = computeSheetStats(topics([
      problem({ status: "DONE", completedAt: dateKey(longAgo) }),
    ]));

    expect(stats.currentStreak).toBe(0);
    expect(stats.longestStreak).toBe(1); // the old streak still counts toward "longest"
  });

  it("a gap breaks the current streak but longest still reflects the earlier run", () => {
    const today = new Date();
    const fiveDaysAgo = addDays(today, -5);
    const sixDaysAgo = addDays(today, -6);
    const sevenDaysAgo = addDays(today, -7);

    const stats = computeSheetStats(topics([
      problem({ status: "DONE", completedAt: dateKey(today) }), // current streak = 1
      problem({ status: "DONE", completedAt: dateKey(fiveDaysAgo) }),
      problem({ status: "DONE", completedAt: dateKey(sixDaysAgo) }),
      problem({ status: "DONE", completedAt: dateKey(sevenDaysAgo) }), // an older 3-day run
    ]));

    expect(stats.currentStreak).toBe(1);
    expect(stats.longestStreak).toBe(3);
  });

  it("multiple problems completed on the same day only count once toward the streak", () => {
    const today = new Date();
    const stats = computeSheetStats(topics([
      problem({ status: "DONE", completedAt: dateKey(today) }),
      problem({ status: "DONE", completedAt: dateKey(today) }),
      problem({ status: "DONE", completedAt: dateKey(today) }),
    ]));

    expect(stats.currentStreak).toBe(1);
    expect(stats.dayCounts[dateKey(today)]).toBe(3);
  });
});

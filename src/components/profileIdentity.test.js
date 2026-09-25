import { describe, expect, it } from "vitest";
import { computeLevel, initials, LEVEL_TIERS } from "./profileIdentity.js";

describe("initials", () => {
  it("takes the first letter of up to two words, uppercased", () => {
    expect(initials("Saksham Singla")).toBe("SS");
  });

  it("handles a single-word name", () => {
    expect(initials("Saksham")).toBe("S");
  });

  it("ignores extra whitespace between words", () => {
    expect(initials("  Saksham   Singla  ")).toBe("SS");
  });

  it("takes only the first two words when given more", () => {
    expect(initials("A B C D")).toBe("AB");
  });

  it("returns an empty string for null/blank input", () => {
    expect(initials(null)).toBe("");
    expect(initials("")).toBe("");
    expect(initials("   ")).toBe("");
  });
});

describe("computeLevel", () => {
  it("starts at the lowest tier at 0 solved", () => {
    const level = computeLevel(0);
    expect(level.title).toBe("Newcomer");
    expect(level.next).toBe("Novice");
    expect(level.nextMin).toBe(1);
    expect(level.progress).toBe(0);
  });

  it("treats null/undefined as 0 solved", () => {
    expect(computeLevel(undefined).title).toBe("Newcomer");
    expect(computeLevel(null).title).toBe("Newcomer");
  });

  it("lands exactly on a tier boundary", () => {
    expect(computeLevel(10).title).toBe("Apprentice");
    expect(computeLevel(9).title).toBe("Novice"); // one below the boundary stays in the previous tier
  });

  it("is at 100% max tier progress once beyond the last tier's minimum", () => {
    const level = computeLevel(500); // past Master's min of 200, and Master has no next tier
    expect(level.title).toBe("Master");
    expect(level.next).toBeNull();
    expect(level.progress).toBe(100);
  });

  it("computes a sensible progress percentage toward the next tier", () => {
    // Apprentice starts at 10, Practitioner at 25 -- solving 17 is (17-10)/(25-10) = 47%
    const level = computeLevel(17);
    expect(level.title).toBe("Apprentice");
    expect(level.progress).toBe(Math.round(((17 - 10) / (25 - 10)) * 100));
  });

  it("every tier is reachable and strictly increasing in its minimum", () => {
    for (let i = 1; i < LEVEL_TIERS.length; i++) {
      expect(LEVEL_TIERS[i].min).toBeGreaterThan(LEVEL_TIERS[i - 1].min);
    }
  });
});

// Shared by Profile.jsx and ShareCard.jsx -- both render a user's identity (initials, account
// level) and had drifted into independent copies of this logic. One source of truth here.

/** Up to two initials from a display name (or email as a fallback), for an avatar circle. */
export function initials(name) {
  return (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

// Account-wide level, based on total problems solved across every sheet -- not the
// currently-selected sheet's count, which would make the title jump around when switching sheets.
export const LEVEL_TIERS = [
  { title: "Newcomer", min: 0 },
  { title: "Novice", min: 1 },
  { title: "Apprentice", min: 10 },
  { title: "Practitioner", min: 25 },
  { title: "Skilled", min: 50 },
  { title: "Expert", min: 100 },
  { title: "Master", min: 200 },
];

/** Returns { title, next, nextMin, solved, progress } for the tier `done` solved problems falls
 *  into -- `progress` is 0-100% toward `next` (100 once there's no next tier). */
export function computeLevel(done) {
  const solved = done ?? 0;
  let idx = 0;
  for (let i = 0; i < LEVEL_TIERS.length; i++) {
    if (solved >= LEVEL_TIERS[i].min) idx = i;
  }
  const current = LEVEL_TIERS[idx];
  const next = LEVEL_TIERS[idx + 1];
  const progress = next ? Math.min(100, Math.round(((solved - current.min) / (next.min - current.min)) * 100)) : 100;
  return { title: current.title, next: next?.title ?? null, nextMin: next?.min ?? null, solved, progress };
}

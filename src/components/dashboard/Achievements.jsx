import { FiAward, FiBookmark, FiCalendar, FiCheckCircle, FiRepeat, FiTarget, FiZap } from "react-icons/fi";
import { GiCrown, GiFlame, GiLaurelsTrophy, GiSprout, GiTrophyCup } from "react-icons/gi";
import { ProgressBar } from "../ui/index.js";

function badge(id, Icon, title, description, current, target, tone) {
  return { id, Icon, title, description, current: Math.min(current, target), target, unlocked: current >= target, tone };
}

function buildBadges(stats) {
  const easy = stats.byDifficulty.EASY ?? { done: 0, total: 0 };
  const medium = stats.byDifficulty.MEDIUM ?? { done: 0, total: 0 };
  const hard = stats.byDifficulty.HARD ?? { done: 0, total: 0 };

  const badges = [
    badge("first-blood", FiTarget, "First Blood", "Solve your first problem", stats.done, 1),
    badge("warmed-up", GiFlame, "Getting Warmed Up", "Solve 10 problems", stats.done, 10),
    badge("half-century", FiZap, "Half Century", "Solve 50 problems", stats.done, 50),
    badge("century", FiAward, "Century Club", "Solve 100 problems", stats.done, 100),
    badge("streak-3", GiSprout, "Streak Starter", "Hit a 3-day streak", stats.longestStreak, 3),
    badge("streak-7", FiCalendar, "Week Warrior", "Hit a 7-day streak", stats.longestStreak, 7),
    badge("streak-30", GiTrophyCup, "Streak Master", "Hit a 30-day streak", stats.longestStreak, 30),
    badge("curator", FiBookmark, "Curator", "Bookmark 10 problems", stats.bookmarked, 10),
    badge("quarter-century", FiZap, "Quarter Century", "Solve 25 problems", stats.done, 25),
    badge("double-century", GiLaurelsTrophy, "Double Century", "Solve 200 problems", stats.done, 200),
    badge("unstoppable", GiFlame, "Unstoppable", "Hit a 14-day streak", stats.longestStreak, 14),
    badge("legend", GiTrophyCup, "Legend", "Hit a 60-day streak", stats.longestStreak, 60),
    badge("reviewer", FiRepeat, "Reviewer", "Flag 5 problems for revision", stats.revise, 5),
    badge("super-curator", FiBookmark, "Super Curator", "Bookmark 25 problems", stats.bookmarked, 25),
  ];

  if (easy.total > 0) badges.push(badge("easy-sweep", FiCheckCircle, "Easy Sweep", "Finish every Easy problem", easy.done, easy.total, "easy"));
  if (medium.total > 0) badges.push(badge("medium-sweep", FiCheckCircle, "Medium Sweep", "Finish every Medium problem", medium.done, medium.total, "medium"));
  if (hard.total > 0) badges.push(badge("hard-sweep", FiCheckCircle, "Hard Sweep", "Finish every Hard problem", hard.done, hard.total, "hard"));
  if (stats.total > 0) badges.push(badge("sheet-complete", GiCrown, "Sheet Complete", "Finish the whole sheet", stats.done, stats.total));

  return badges;
}

function AchievementCard({ badge: b }) {
  return (
    <div
      title={b.description}
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5
        ${b.unlocked ? "border-line bg-paper-raised" : "border-line bg-ink/[0.015]"}`}
    >
      <span
        className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 text-lg
          ${b.unlocked ? "bg-accent-soft text-accent" : "bg-ink/5 text-ink-soft/50"}`}
      >
        <b.Icon aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className={`text-[13px] font-medium truncate ${b.unlocked ? "text-ink" : "text-ink-soft"}`}>{b.title}</div>
        <div className="text-[11.5px] text-ink-soft truncate">{b.description}</div>
        {!b.unlocked && <ProgressBar value={(b.current / b.target) * 100} size="sm" className="mt-1.5" />}
      </div>
    </div>
  );
}

export default function Achievements({ stats }) {
  const badges = buildBadges(stats);
  const unlocked = badges.filter((b) => b.unlocked);
  // Closest-to-unlock first -- more motivating than an arbitrary fixed order.
  const locked = badges.filter((b) => !b.unlocked).sort((a, b) => b.current / b.target - a.current / a.target);

  return (
    <div className="space-y-5">
      <div className="mono text-[12.5px] text-ink-soft">
        {unlocked.length} / {badges.length} unlocked
      </div>

      {unlocked.length > 0 && (
        <div>
          <div className="text-[11.5px] font-semibold text-ink-soft uppercase tracking-wide mb-2">Unlocked</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {unlocked.map((b) => (
              <AchievementCard key={b.id} badge={b} />
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <div className="text-[11.5px] font-semibold text-ink-soft uppercase tracking-wide mb-2">In progress</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {locked.map((b) => (
              <AchievementCard key={b.id} badge={b} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

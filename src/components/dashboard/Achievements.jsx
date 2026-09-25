import { FiAward, FiBookmark, FiCalendar, FiCheckCircle, FiTarget, FiZap } from "react-icons/fi";
import { GiCrown, GiFlame, GiSprout, GiTrophyCup } from "react-icons/gi";

function badge(id, Icon, title, description, current, target, color) {
  return { id, Icon, title, description, current: Math.min(current, target), target, unlocked: current >= target, color };
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
  ];

  if (easy.total > 0) badges.push(badge("easy-sweep", FiCheckCircle, "Easy Sweep", "Finish every Easy problem", easy.done, easy.total, "var(--easy)"));
  if (medium.total > 0) badges.push(badge("medium-sweep", FiCheckCircle, "Medium Sweep", "Finish every Medium problem", medium.done, medium.total, "var(--medium)"));
  if (hard.total > 0) badges.push(badge("hard-sweep", FiCheckCircle, "Hard Sweep", "Finish every Hard problem", hard.done, hard.total, "var(--hard)"));
  if (stats.total > 0) badges.push(badge("sheet-complete", GiCrown, "Sheet Complete", "Finish the whole sheet", stats.done, stats.total));

  return badges;
}

function AchievementCard({ badge: b }) {
  return (
    <div className={`achievement-card ${b.unlocked ? "unlocked" : "locked"}`} title={b.description}>
      <span className="achievement-icon" aria-hidden="true" style={b.unlocked && b.color ? { color: b.color } : undefined}>
        <b.Icon />
      </span>
      <div className="achievement-body">
        <div className="achievement-title">{b.title}</div>
        <div className="achievement-desc">{b.description}</div>
        {!b.unlocked && (
          <div className="achievement-progress-track">
            <div className="achievement-progress-fill" style={{ width: `${(b.current / b.target) * 100}%` }} />
          </div>
        )}
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
    <div className="achievements">
      <div className="achievements-summary mono">
        {unlocked.length} / {badges.length} unlocked
      </div>

      {unlocked.length > 0 && (
        <>
          <div className="achievements-group-label">Unlocked</div>
          <div className="achievements-grid">
            {unlocked.map((b) => (
              <AchievementCard key={b.id} badge={b} />
            ))}
          </div>
        </>
      )}

      {locked.length > 0 && (
        <>
          <div className="achievements-group-label">In progress</div>
          <div className="achievements-grid">
            {locked.map((b) => (
              <AchievementCard key={b.id} badge={b} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

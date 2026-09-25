import { FiBookmark, FiCheckCircle, FiSearch, FiShuffle, FiStar } from "react-icons/fi";
import { GiFlame } from "react-icons/gi";
import UserMenu from "./UserMenu.jsx";
import SheetSwitcher from "./SheetSwitcher.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

const STATUS_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "TODO", label: "To-do" },
  { value: "DONE", label: "Done" },
  { value: "REVISE", label: "Revise" },
];

const DIFFICULTY_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

// The title/subtitle/stat-tiles/sheet-switcher only make sense on the Sheet view -- they're
// all scoped to "the sheet you're currently browsing". Showing them unchanged on every other
// tab (Profile, Contest, ...) was stale, redundant with what those views show themselves, and
// wasted vertical space. Each other view gets a short, relevant heading instead.
const VIEW_META = {
  sheet: {
    title: "DSA Problem Tracker",
    lede: "Your own problem sheet, sorted by topic. Mark what's done, flag what needs another pass, and jump out to the real problem when you're ready to solve it.",
  },
  dashboard: { title: "Dashboard", lede: "Your progress across every sheet, at a glance." },
  insights: { title: "Insights", lede: "Submission history, verdicts, and where to focus next." },
  contest: { title: "Contest", lede: "Timed practice sessions to sharpen your skills under pressure." },
  leaderboard: { title: "Leaderboard", lede: "See how you stack up against everyone else here." },
  review: { title: "Review Queue", lede: "Spaced repetition for problems you've flagged to revisit." },
  profile: { title: "Profile", lede: "Your identity, progress, and account settings." },
};

export default function Header({
  total,
  done,
  topicCount,
  streak,
  bookmarkedCount,
  view,
  onViewChange,
  reviewDueCount,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  difficultyFilter,
  onDifficultyFilterChange,
  bookmarkedOnly,
  onBookmarkedOnlyChange,
  sheets,
  activeSheetSlug,
  onSheetChange,
  activeSheetName,
  user,
  onLogout,
  onOpenPalette,
  onRandom,
  isDark,
  onToggleTheme,
}) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform || navigator.userAgent);
  const meta = VIEW_META[view] ?? VIEW_META.sheet;
  const onSheetView = view === "sheet";

  const activeFilterChips = [];
  if (search.trim()) {
    activeFilterChips.push({
      key: "search",
      label: `"${search.trim()}"`,
      onRemove: () => onSearchChange(""),
    });
  }
  if (statusFilter !== "ALL") {
    activeFilterChips.push({
      key: "status",
      label: STATUS_FILTERS.find((f) => f.value === statusFilter)?.label ?? statusFilter,
      onRemove: () => onStatusFilterChange("ALL"),
    });
  }
  if (difficultyFilter !== "ALL") {
    activeFilterChips.push({
      key: "difficulty",
      label: DIFFICULTY_FILTERS.find((f) => f.value === difficultyFilter)?.label ?? difficultyFilter,
      onRemove: () => onDifficultyFilterChange("ALL"),
    });
  }
  if (bookmarkedOnly) {
    activeFilterChips.push({ key: "bookmarked", label: "Bookmarked", onRemove: () => onBookmarkedOnlyChange(false) });
  }

  return (
    <header className="hero">
      <div className="hero-top-row">
        <span className="eyebrow">
          {onSheetView
            ? `${activeSheetName ? `${activeSheetName} · ` : ""}${total} problems · ${topicCount} topics`
            : view === "review" && reviewDueCount > 0
              ? `${reviewDueCount} problem${reviewDueCount === 1 ? "" : "s"} due for review`
              : "DSA Problem Tracker"}
        </span>
        <div className="hero-top-actions">
          <button className="palette-hint" onClick={onOpenPalette}>
            <FiSearch aria-hidden="true" />
            <span className="palette-hint-label">Jump to a problem</span>
            <kbd>{isMac ? "⌘" : "Ctrl"}K</kbd>
          </button>
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          {user && <UserMenu user={user} onLogout={onLogout} onViewProfile={() => onViewChange("profile")} />}
        </div>
      </div>
      <h1 className={onSheetView ? "" : "hero-title-compact"}>{meta.title}</h1>
      <p className={`lede ${onSheetView ? "" : "lede-compact"}`}>{meta.lede}</p>

      {onSheetView && (
        <>
          <div className="hero-stat-strip">
            <div className="hero-stat-tile">
              <span className="hero-stat-icon icon-easy" aria-hidden="true">
                <FiCheckCircle />
              </span>
              <span className="hero-stat-value mono">
                {done}
                <span className="hero-stat-of">/{total}</span>
              </span>
              <span className="hero-stat-label">solved</span>
            </div>
            <div className="hero-stat-tile">
              <span className={`hero-stat-icon icon-flame ${streak > 0 ? "flame-active" : ""}`} aria-hidden="true">
                <GiFlame />
              </span>
              <span className="hero-stat-value mono">{streak}</span>
              <span className="hero-stat-label">day streak</span>
            </div>
            <div className="hero-stat-tile">
              <span className="hero-stat-icon icon-accent" aria-hidden="true">
                <FiBookmark />
              </span>
              <span className="hero-stat-value mono">{bookmarkedCount}</span>
              <span className="hero-stat-label">bookmarked</span>
            </div>
            <div className="hero-stat-tile">
              <span className="hero-stat-icon hero-stat-ring" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 26 26">
                  <circle cx="13" cy="13" r="10" fill="none" stroke="var(--line)" strokeWidth="3" />
                  <circle
                    cx="13"
                    cy="13"
                    r="10"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 10}
                    strokeDashoffset={2 * Math.PI * 10 * (1 - pct / 100)}
                    transform="rotate(-90 13 13)"
                  />
                </svg>
              </span>
              <span className="hero-stat-value mono">{pct}%</span>
              <span className="hero-stat-label">complete</span>
            </div>
          </div>

          <SheetSwitcher sheets={sheets} activeSlug={activeSheetSlug} onChange={onSheetChange} />
        </>
      )}

      <div className="view-switch" role="group" aria-label="View">
        <button className={`view-tab ${view === "sheet" ? "active" : ""}`} onClick={() => onViewChange("sheet")}>
          Sheet
        </button>
        <button
          className={`view-tab ${view === "dashboard" ? "active" : ""}`}
          onClick={() => onViewChange("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`view-tab ${view === "insights" ? "active" : ""}`}
          onClick={() => onViewChange("insights")}
        >
          Insights
        </button>
        <button
          className={`view-tab ${view === "contest" ? "active" : ""}`}
          onClick={() => onViewChange("contest")}
        >
          Contest
        </button>
        <button
          className={`view-tab ${view === "leaderboard" ? "active" : ""}`}
          onClick={() => onViewChange("leaderboard")}
        >
          Leaderboard
        </button>
        <button
          className={`view-tab ${view === "review" ? "active" : ""}`}
          onClick={() => onViewChange("review")}
        >
          Review
          {reviewDueCount > 0 && <span className="view-tab-badge mono">{reviewDueCount}</span>}
        </button>
        <button
          className={`view-tab ${view === "profile" ? "active" : ""}`}
          onClick={() => onViewChange("profile")}
        >
          Profile
        </button>
      </div>

      {view === "sheet" && (
        <div className="hero-controls">
            <div className="search-box">
              <FiSearch aria-hidden="true" />
              <input
                type="text"
                placeholder="Search by name or tag&hellip;"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            <div className="filter-group" role="group" aria-label="Filter by status">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  className={`filter-chip ${statusFilter === f.value ? "active" : ""}`}
                  onClick={() => onStatusFilterChange(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="filter-group" role="group" aria-label="Filter by difficulty">
              {DIFFICULTY_FILTERS.map((f) => (
                <button
                  key={f.value}
                  className={`filter-chip ${difficultyFilter === f.value ? "active" : ""}`}
                  onClick={() => onDifficultyFilterChange(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button className={`filter-chip bookmark-filter ${bookmarkedOnly ? "active" : ""}`} onClick={() => onBookmarkedOnlyChange(!bookmarkedOnly)}>
              <FiStar aria-hidden="true" /> Bookmarked
            </button>

            <button className="ghost-btn random-btn" onClick={onRandom} title="Jump to a random unsolved problem">
              <FiShuffle aria-hidden="true" /> Random
            </button>
        </div>
      )}

      {view === "sheet" && activeFilterChips.length > 0 && (
        <div className="active-filters" aria-label="Active filters">
          {activeFilterChips.map((chip) => (
            <button key={chip.key} type="button" className="chip active-filter-chip" onClick={chip.onRemove}>
              {chip.label}
              <span className="active-filter-chip-x" aria-hidden="true">
                &times;
              </span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

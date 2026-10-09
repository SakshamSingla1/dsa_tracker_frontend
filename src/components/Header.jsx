import { FiBookmark, FiCheckCircle, FiSearch, FiShuffle, FiStar } from "react-icons/fi";
import { GiFlame } from "react-icons/gi";
import UserMenu from "./UserMenu.jsx";
import SheetSwitcher from "./SheetSwitcher.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import { Tabs, Button } from "./ui/index.js";

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

const VIEW_TABS = [
  { value: "sheet", label: "Sheet" },
  { value: "dashboard", label: "Dashboard" },
  { value: "insights", label: "Insights" },
  { value: "contest", label: "Contest" },
  { value: "interview", label: "Interview" },
  { value: "visualizer", label: "Visualizer" },
  { value: "leaderboard", label: "Leaderboard" },
  { value: "review", label: "Review" },
  { value: "profile", label: "Profile" },
];

const VIEW_META = {
  sheet: { title: "DSA Problem Tracker" },
  dashboard: { title: "Dashboard" },
  insights: { title: "Insights" },
  contest: { title: "Contest" },
  interview: { title: "Interview" },
  visualizer: { title: "Algorithm Visualizer" },
  leaderboard: { title: "Leaderboard" },
  review: { title: "Review Queue" },
  profile: { title: "Profile" },
};

function StatChip({ icon, value, label, flame = false }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-paper-raised border border-line">
      <span className={`h-5 w-5 flex items-center justify-center ${flame ? "text-medium" : "text-ink-soft"}`}>{icon}</span>
      <span className="mono text-[13px] font-semibold text-ink">{value}</span>
      <span className="text-[12px] text-ink-soft">{label}</span>
    </div>
  );
}

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

  const tabsWithBadge = VIEW_TABS.map((t) =>
    t.value === "review" && reviewDueCount > 0
      ? { ...t, label: (
          <span className="flex items-center gap-1.5">
            {t.label}
            <span className="mono text-[10px] font-bold bg-accent text-accent-ink rounded-pill px-1.5 py-0.5">
              {reviewDueCount}
            </span>
          </span>
        ) }
      : t
  );

  const activeFilterChips = [];
  if (search.trim()) {
    activeFilterChips.push({ key: "search", label: `"${search.trim()}"`, onRemove: () => onSearchChange("") });
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
    <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur-sm border-b border-line">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold text-ink leading-tight truncate">{meta.title}</h1>
            {onSheetView && (
              <p className="text-[12px] text-ink-soft leading-tight truncate">
                {activeSheetName ? `${activeSheetName} · ` : ""}
                {total} problems · {topicCount} topics
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenPalette}
              className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg border border-line text-ink-soft text-[13px] hover:border-line-strong hover:text-ink transition-colors"
            >
              <FiSearch aria-hidden="true" className="h-3.5 w-3.5" />
              <span>Jump to a problem</span>
              <kbd className="mono text-[10px] text-ink-soft/70 bg-ink/5 rounded px-1 py-0.5">{isMac ? "⌘K" : "Ctrl K"}</kbd>
            </button>
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
            {user && <UserMenu user={user} onLogout={onLogout} onViewProfile={() => onViewChange("profile")} />}
          </div>
        </div>

        <Tabs items={tabsWithBadge} value={view} onChange={onViewChange} className="-mb-px overflow-x-auto" />
      </div>

      {onSheetView && (
        <div className="border-t border-line bg-paper">
          <div className="max-w-[1280px] mx-auto px-5 lg:px-8 py-3 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatChip icon={<FiCheckCircle />} value={`${done}/${total}`} label="solved" />
              <StatChip icon={<GiFlame />} value={streak} label="day streak" flame={streak > 0} />
              <StatChip icon={<FiBookmark />} value={bookmarkedCount} label="bookmarked" />
              <StatChip icon={<span className="text-[11px] font-bold">%</span>} value={pct} label="complete" />
              <div className="ml-auto">
                <SheetSwitcher sheets={sheets} activeSlug={activeSheetSlug} onChange={onSheetChange} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-line bg-paper-raised min-w-[220px] flex-1 max-w-sm">
                <FiSearch className="h-4 w-4 text-ink-soft shrink-0" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search by name or tag…"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-transparent text-sm text-ink placeholder:text-ink-soft/70 outline-none"
                />
              </div>

              <FilterGroup options={STATUS_FILTERS} value={statusFilter} onChange={onStatusFilterChange} />
              <FilterGroup options={DIFFICULTY_FILTERS} value={difficultyFilter} onChange={onDifficultyFilterChange} />

              <button
                onClick={() => onBookmarkedOnlyChange(!bookmarkedOnly)}
                className={`flex items-center gap-1.5 h-8 px-3 rounded-pill text-[13px] font-medium border transition-colors
                  ${bookmarkedOnly ? "bg-accent text-accent-ink border-transparent" : "bg-paper-raised text-ink-soft border-line hover:text-ink"}`}
              >
                <FiStar aria-hidden="true" className="h-3.5 w-3.5" /> Bookmarked
              </button>

              <Button variant="ghost" size="sm" icon={<FiShuffle className="h-3.5 w-3.5" />} onClick={onRandom} title="Jump to a random unsolved problem">
                Random
              </Button>
            </div>

            {activeFilterChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {activeFilterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onRemove}
                    className="flex items-center gap-1 h-6 px-2 rounded-pill bg-accent-soft text-accent text-[12px] font-medium hover:brightness-95"
                  >
                    {chip.label}
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function FilterGroup({ options, value, onChange }) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-line bg-paper-raised" role="group">
      {options.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`h-7 px-2.5 rounded-md text-[12.5px] font-medium transition-colors
            ${value === f.value ? "bg-accent text-accent-ink" : "text-ink-soft hover:text-ink"}`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

import { FiBell, FiRefreshCw, FiSearch } from "react-icons/fi";
import UserMenu from "./UserMenu.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Header({ user, onLogout, onViewChange, onOpenPalette, onRefresh, reviewDueCount, isDark, onToggleTheme }) {
  const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform || navigator.userAgent);

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 h-16 px-5 lg:px-8 border-b border-line bg-paper/90 backdrop-blur-sm">
      <button
        onClick={onOpenPalette}
        className="flex items-center gap-2.5 h-10 px-4 rounded-lg border border-line bg-paper-raised text-ink-soft text-[13.5px] hover:border-line-strong hover:text-ink hover:shadow-md transition-all duration-150 flex-1 max-w-xl"
      >
        <FiSearch aria-hidden="true" />
        <span className="flex-1 text-left">Search a problem by name, number or tag…</span>
        <kbd className="mono text-[10px] text-ink-soft/70 bg-ink/5 rounded px-1.5 py-0.5">{isMac ? "⌘K" : "Ctrl K"}</kbd>
      </button>

      <div className="flex items-center gap-2 ml-auto shrink-0">
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh"
            aria-label="Refresh"
            className="group h-9 w-9 flex items-center justify-center rounded-lg border border-line text-ink-soft hover:text-ink hover:border-line-strong transition-colors"
          >
            <FiRefreshCw className="h-3.5 w-3.5 transition-transform duration-500 group-active:rotate-180" />
          </button>
        )}
        <button
          onClick={() => onViewChange("review")}
          title="Review queue"
          aria-label="Review queue"
          className="relative h-9 w-9 flex items-center justify-center rounded-lg border border-line text-ink-soft hover:text-ink hover:border-line-strong transition-colors"
        >
          <FiBell className="h-3.5 w-3.5" />
          {reviewDueCount > 0 && (
            <span className="absolute top-2 right-2 flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-hard opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-hard" />
            </span>
          )}
        </button>
        {user && <UserMenu user={user} onLogout={onLogout} onViewProfile={() => onViewChange("profile")} />}
      </div>
    </header>
  );
}

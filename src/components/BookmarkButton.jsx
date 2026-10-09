export default function BookmarkButton({ bookmarked, onToggle, className = "" }) {
  return (
    <button
      type="button"
      title={bookmarked ? "Remove from watchlist" : "Add to watchlist"}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? "Remove from watchlist" : "Add to watchlist"}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`h-7 w-7 flex items-center justify-center rounded-md shrink-0 transition-colors
        ${bookmarked ? "text-accent" : "text-ink-soft/50 hover:text-ink-soft"} ${className}`}
    >
      <svg width="15" height="15" viewBox="0 0 15 15" fill={bookmarked ? "currentColor" : "none"} aria-hidden="true">
        <path
          d="M4 1.5h7a0.5 0.5 0 0 1 0.5 0.5v11.2a0.4 0.4 0 0 1-0.63 0.33L7.5 10.7l-3.37 2.83A0.4 0.4 0 0 1 3.5 13.2V2a0.5 0.5 0 0 1 0.5-0.5z"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

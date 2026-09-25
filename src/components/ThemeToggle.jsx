export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
          <circle cx="7.5" cy="7.5" r="3.2" stroke="currentColor" strokeWidth="1.3" />
          <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <line x1="7.5" y1="0.8" x2="7.5" y2="2.3" />
            <line x1="7.5" y1="12.7" x2="7.5" y2="14.2" />
            <line x1="0.8" y1="7.5" x2="2.3" y2="7.5" />
            <line x1="12.7" y1="7.5" x2="14.2" y2="7.5" />
            <line x1="2.6" y1="2.6" x2="3.6" y2="3.6" />
            <line x1="11.4" y1="11.4" x2="12.4" y2="12.4" />
            <line x1="2.6" y1="12.4" x2="3.6" y2="11.4" />
            <line x1="11.4" y1="3.6" x2="12.4" y2="2.6" />
          </g>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
          <path
            d="M12.9 9.3A5.6 5.6 0 0 1 5.7 2.1a5.6 5.6 0 1 0 7.2 7.2z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

const BASE = `w-full h-9 px-3 text-sm rounded-lg bg-paper-raised border text-ink
  placeholder:text-ink-soft/70 transition-colors
  focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent-line`;

export function Input({ error = false, className = "", ...rest }) {
  return <input className={`${BASE} ${error ? "border-hard" : "border-line hover:border-line-strong"} ${className}`} {...rest} />;
}

export function Textarea({ error = false, className = "", rows = 3, ...rest }) {
  return (
    <textarea
      rows={rows}
      className={`${BASE} h-auto py-2 resize-y ${error ? "border-hard" : "border-line hover:border-line-strong"} ${className}`}
      {...rest}
    />
  );
}

export function Label({ children, className = "", ...rest }) {
  return (
    <label className={`block text-[13px] font-medium text-ink-soft mb-1.5 ${className}`} {...rest}>
      {children}
    </label>
  );
}

export function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-[12px] text-hard">{children}</p>;
}

export function Select({ error = false, className = "", children, ...rest }) {
  return (
    <div className="relative">
      <select
        className={`${BASE} appearance-none pr-8 cursor-pointer
          ${error ? "border-hard" : "border-line hover:border-line-strong"} ${className}`}
        {...rest}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft"
      >
        <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
      </svg>
    </div>
  );
}

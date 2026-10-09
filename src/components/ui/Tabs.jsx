/** Underline-style tab list. `items` is [{ value, label, icon? }]. Controlled via value/onChange. */
export default function Tabs({ items, value, onChange, className = "" }) {
  return (
    <div role="tablist" className={`flex items-center gap-1 border-b border-line ${className}`}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={`relative flex items-center gap-1.5 px-3 h-9 text-[13.5px] font-medium rounded-t-md
              transition-colors
              ${active ? "text-ink" : "text-ink-soft hover:text-ink"}`}
          >
            {item.icon}
            {item.label}
            {active && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent rounded-full" />}
          </button>
        );
      })}
    </div>
  );
}

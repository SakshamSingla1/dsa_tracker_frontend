/** Pill-button filter group -- `options` is [{ value, label }]. Controlled via value/onChange. */
export default function SegmentedControl({ options, value, onChange, className = "" }) {
  return (
    <div className={`flex items-center gap-0.5 p-0.5 rounded-lg border border-line bg-paper-raised ${className}`} role="group">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`h-7 px-2.5 rounded-md text-[12.5px] font-medium whitespace-nowrap transition-colors
            ${value === opt.value ? "bg-accent text-accent-ink" : "text-ink-soft hover:text-ink"}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

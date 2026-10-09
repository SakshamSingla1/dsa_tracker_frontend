export default function SheetSwitcher({ sheets, activeSlug, onChange }) {
  if (!sheets || sheets.length < 2) return null;

  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-line bg-paper-raised" role="group" aria-label="Problem sheet">
      {sheets.map((sheet) => {
        const active = activeSlug === sheet.slug;
        return (
          <button
            key={sheet.id}
            onClick={() => onChange(sheet.slug)}
            title={sheet.description}
            className={`h-7 px-2.5 rounded-md text-[12.5px] font-medium whitespace-nowrap transition-colors
              ${active ? "bg-accent text-accent-ink" : "text-ink-soft hover:text-ink"}`}
          >
            {sheet.name}
          </button>
        );
      })}
    </div>
  );
}

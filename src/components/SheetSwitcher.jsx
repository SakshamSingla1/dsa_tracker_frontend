export default function SheetSwitcher({ sheets, activeSlug, onChange }) {
  if (!sheets || sheets.length < 2) return null;

  return (
    <div className="sheet-switch" role="group" aria-label="Problem sheet">
      {sheets.map((sheet) => (
        <button
          key={sheet.id}
          className={`sheet-tab ${activeSlug === sheet.slug ? "active" : ""}`}
          onClick={() => onChange(sheet.slug)}
          title={sheet.description}
        >
          {sheet.name}
        </button>
      ))}
    </div>
  );
}

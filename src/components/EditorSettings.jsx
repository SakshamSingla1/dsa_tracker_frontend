import { useEffect, useRef, useState } from "react";
import { FiSettings, FiMinus, FiPlus } from "react-icons/fi";

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 20;

export default function EditorSettings({ prefs, onChange, vimAvailable }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const setFontSize = (delta) => {
    const next = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, prefs.fontSize + delta));
    onChange({ ...prefs, fontSize: next });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Editor settings"
        aria-label="Editor settings"
        aria-expanded={open}
        className="h-8 w-8 flex items-center justify-center rounded-lg border border-line text-ink-soft hover:text-ink hover:border-line-strong"
      >
        <FiSettings className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Editor settings"
          className="absolute right-0 mt-2 w-56 bg-paper-raised border border-line rounded-lg shadow-lg p-3 z-40 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] text-ink">Font size</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFontSize(-1)}
                disabled={prefs.fontSize <= MIN_FONT_SIZE}
                aria-label="Decrease font size"
                className="h-6 w-6 flex items-center justify-center rounded border border-line text-ink-soft hover:text-ink disabled:opacity-40"
              >
                <FiMinus className="h-3 w-3" />
              </button>
              <span className="mono text-[12px] text-ink w-10 text-center">{prefs.fontSize}px</span>
              <button
                onClick={() => setFontSize(1)}
                disabled={prefs.fontSize >= MAX_FONT_SIZE}
                aria-label="Increase font size"
                className="h-6 w-6 flex items-center justify-center rounded border border-line text-ink-soft hover:text-ink disabled:opacity-40"
              >
                <FiPlus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {vimAvailable && (
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-[12.5px] text-ink">Vim mode</span>
              <input
                type="checkbox"
                checked={prefs.vimMode}
                onChange={(e) => onChange({ ...prefs, vimMode: e.target.checked })}
                className="h-4 w-4 accent-[var(--accent)]"
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}

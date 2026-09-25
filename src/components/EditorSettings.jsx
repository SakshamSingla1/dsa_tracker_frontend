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
    <div className="editor-settings" ref={ref}>
      <button
        className="ghost-btn editor-settings-trigger"
        onClick={() => setOpen((v) => !v)}
        title="Editor settings"
        aria-label="Editor settings"
        aria-expanded={open}
      >
        <FiSettings />
      </button>
      {open && (
        <div className="editor-settings-popover" role="menu" aria-label="Editor settings">
          <div className="editor-settings-row">
            <span className="editor-settings-label">Font size</span>
            <div className="editor-settings-stepper">
              <button
                className="editor-settings-step-btn"
                onClick={() => setFontSize(-1)}
                disabled={prefs.fontSize <= MIN_FONT_SIZE}
                aria-label="Decrease font size"
              >
                <FiMinus />
              </button>
              <span className="editor-settings-step-value mono">{prefs.fontSize}px</span>
              <button
                className="editor-settings-step-btn"
                onClick={() => setFontSize(1)}
                disabled={prefs.fontSize >= MAX_FONT_SIZE}
                aria-label="Increase font size"
              >
                <FiPlus />
              </button>
            </div>
          </div>

          {vimAvailable && (
            <label className="editor-settings-row editor-settings-toggle-row">
              <span className="editor-settings-label">Vim mode</span>
              <input
                type="checkbox"
                checked={prefs.vimMode}
                onChange={(e) => onChange({ ...prefs, vimMode: e.target.checked })}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}

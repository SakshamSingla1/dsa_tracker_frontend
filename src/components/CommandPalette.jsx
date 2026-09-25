import { useEffect, useMemo, useRef, useState } from "react";
import { FiCheck, FiSearch } from "react-icons/fi";
import { useFocusTrap } from "../hooks/useFocusTrap.js";

export default function CommandPalette({ open, onClose, problems, onSelect }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const trapRef = useFocusTrap(open);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = !q
      ? problems
      : problems.filter((p) => (p.title + " " + p.topicName + " " + p.tags.join(" ")).toLowerCase().includes(q));
    return pool.slice(0, 8);
  }, [query, problems]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      const id = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(id);
    }
  }, [open]);

  useEffect(() => setActiveIndex(0), [query]);

  useEffect(() => {
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIndex]) onSelect(results[activeIndex].id);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="cmdk-overlay" onMouseDown={onClose}>
      <div
        ref={trapRef}
        className="cmdk-panel"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Jump to a problem"
      >
        <div className="cmdk-input-row">
          <FiSearch aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Jump to a problem…"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="cmdk-esc">esc</kbd>
        </div>

        <div className="cmdk-results" ref={listRef}>
          {results.length === 0 && <div className="cmdk-empty">No problems match &ldquo;{query}&rdquo;.</div>}
          {results.map((p, i) => (
            <button
              key={p.id}
              className={`cmdk-result ${i === activeIndex ? "active" : ""}`}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => onSelect(p.id)}
            >
              <span className={`pill diff-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
              <span className="cmdk-result-title">{p.title}</span>
              <span className="cmdk-result-topic mono">{p.topicName}</span>
              {p.status === "DONE" && (
                <span className="cmdk-result-done" aria-label="Done">
                  <FiCheck />
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="cmdk-footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span className="cmdk-footer-count mono">{problems.length} problems</span>
        </div>
      </div>
    </div>
  );
}

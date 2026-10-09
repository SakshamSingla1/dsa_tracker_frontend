import { useEffect, useMemo, useRef, useState } from "react";
import { FiCheck, FiSearch } from "react-icons/fi";
import { useFocusTrap } from "../hooks/useFocusTrap.js";
import { Badge, difficultyTone } from "./ui/index.js";

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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] p-4 bg-ink/40 backdrop-blur-[2px]" onMouseDown={onClose}>
      <div
        ref={trapRef}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Jump to a problem"
        className="w-full max-w-xl bg-paper-raised border border-line rounded-xl shadow-lg overflow-hidden flex flex-col max-h-[70vh]"
      >
        <div className="flex items-center gap-2.5 px-4 h-12 border-b border-line shrink-0">
          <FiSearch className="text-ink-soft shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Jump to a problem…"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 bg-transparent text-[14px] text-ink placeholder:text-ink-soft/70 outline-none"
          />
          <kbd className="mono text-[10px] text-ink-soft bg-ink/5 rounded px-1.5 py-0.5 shrink-0">esc</kbd>
        </div>

        <div ref={listRef} className="overflow-y-auto py-1.5">
          {results.length === 0 && <div className="px-4 py-6 text-center text-[13px] text-ink-soft">No problems match &ldquo;{query}&rdquo;.</div>}
          {results.map((p, i) => (
            <button
              key={p.id}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => onSelect(p.id)}
              className={`flex items-center gap-2.5 w-full px-4 py-2 text-left ${i === activeIndex ? "bg-accent-soft" : ""}`}
            >
              <Badge tone={difficultyTone(p.difficulty)} size="sm" className="shrink-0">
                {p.difficulty}
              </Badge>
              <span className="text-[13.5px] text-ink truncate flex-1">{p.title}</span>
              <span className="mono text-[11px] text-ink-soft shrink-0">{p.topicName}</span>
              {p.status === "DONE" && (
                <span className="text-done shrink-0" aria-label="Done">
                  <FiCheck className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 px-4 h-9 border-t border-line text-[11px] text-ink-soft shrink-0">
          <span className="flex items-center gap-1">
            <kbd className="bg-ink/5 rounded px-1">↑</kbd>
            <kbd className="bg-ink/5 rounded px-1">↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-ink/5 rounded px-1">↵</kbd> open
          </span>
          <span className="mono ml-auto">{problems.length} problems</span>
        </div>
      </div>
    </div>
  );
}

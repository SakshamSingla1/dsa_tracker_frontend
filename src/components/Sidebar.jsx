import { useEffect, useMemo, useState } from "react";

export default function Sidebar({ topics }) {
  const [activeId, setActiveId] = useState(null);

  // Only the set of topic ids/order matters for (re)wiring the observer -- not the whole
  // `topics` array, which gets a new reference on every problem update (status toggles etc.)
  // and would otherwise tear down/rebuild the observer far more often than needed.
  const topicIdsKey = useMemo(() => topics.map((t) => t.id).join(","), [topics]);

  useEffect(() => {
    const sections = topics
      .map((t) => document.getElementById(`topic-${t.id}`))
      .filter(Boolean);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topMost = visible.reduce((a, b) => (a.boundingClientRect.top <= b.boundingClientRect.top ? a : b));
        const id = topMost.target.id.replace("topic-", "");
        setActiveId(Number(id));
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicIdsKey]);

  const scrollTo = (id) => {
    document.getElementById(`topic-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleKeyDown = (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    // "sidebar"/"cat-link" are kept as literal class names (alongside the Tailwind utility
    // classes below) purely so this selector-based keyboard nav keeps working.
    const links = Array.from(e.currentTarget.closest(".sidebar")?.querySelectorAll(".cat-link") ?? []);
    const index = links.indexOf(e.currentTarget);
    const next = links[index + (e.key === "ArrowDown" ? 1 : -1)];
    next?.focus();
  };

  return (
    <nav className="sidebar hidden lg:flex flex-col gap-0.5 w-56 shrink-0" aria-label="Topics">
      {topics.map((topic) => {
        const done = topic.problems.filter((p) => p.status === "DONE").length;
        const pct = topic.problems.length === 0 ? 0 : Math.round((done / topic.problems.length) * 100);
        const active = topic.id === activeId;
        return (
          <button
            key={topic.id}
            onClick={() => scrollTo(topic.id)}
            onKeyDown={handleKeyDown}
            className={`cat-link group flex flex-col gap-1.5 text-left rounded-lg px-3 py-2 transition-colors
              ${active ? "bg-accent-soft" : "hover:bg-ink/5"}`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className={`text-[13px] font-medium truncate ${active ? "text-accent" : "text-ink"}`}>{topic.name}</span>
              <span className="mono text-[11px] text-ink-soft shrink-0">
                {done}/{topic.problems.length}
              </span>
            </span>
            <span className="h-1 rounded-pill bg-ink/8 overflow-hidden">
              <span
                className={`block h-full rounded-pill transition-[width] ${pct === 100 ? "bg-done" : "bg-accent"}`}
                style={{ width: `${pct}%` }}
              />
            </span>
          </button>
        );
      })}
    </nav>
  );
}

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
    const links = Array.from(e.currentTarget.closest(".sidebar")?.querySelectorAll(".cat-link") ?? []);
    const index = links.indexOf(e.currentTarget);
    const next = links[index + (e.key === "ArrowDown" ? 1 : -1)];
    next?.focus();
  };

  return (
    <nav className="sidebar" aria-label="Topics">
      {topics.map((topic) => {
        const done = topic.problems.filter((p) => p.status === "DONE").length;
        const pct = topic.problems.length === 0 ? 0 : Math.round((done / topic.problems.length) * 100);
        return (
          <button
            key={topic.id}
            className={`cat-link ${topic.id === activeId ? "active" : ""}`}
            onClick={() => scrollTo(topic.id)}
            onKeyDown={handleKeyDown}
          >
            <span className="cat-link-row">
              <span>{topic.name}</span>
              <span className="count mono">
                {done}/{topic.problems.length}
              </span>
            </span>
            <span className="cat-progress-track">
              <span className={`cat-progress-fill ${pct === 100 ? "complete" : ""}`} style={{ width: `${pct}%` }} />
            </span>
          </button>
        );
      })}
    </nav>
  );
}

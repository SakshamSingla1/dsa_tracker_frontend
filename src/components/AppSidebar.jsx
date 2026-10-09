import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiChevronDown,
  FiFlag,
  FiHome,
  FiMic,
  FiRefreshCw,
  FiSearch,
  FiUser,
} from "react-icons/fi";
import topicIcon from "./topicIcons.js";

const NAV_ITEMS = [
  { value: "sheet", label: "Sheet", icon: FiBookOpen },
  { value: "dashboard", label: "Dashboard", icon: FiHome },
  { value: "insights", label: "Insights", icon: FiBarChart2 },
  { value: "contest", label: "Contest", icon: FiFlag },
  { value: "interview", label: "Interview", icon: FiMic },
  { value: "visualizer", label: "Visualizer", icon: FiBarChart2 },
  { value: "leaderboard", label: "Leaderboard", icon: FiAward },
  { value: "review", label: "Review", icon: FiRefreshCw },
  { value: "profile", label: "Profile", icon: FiUser },
];

export default function AppSidebar({
  view,
  onViewChange,
  reviewDueCount,
  sheets,
  activeSheetSlug,
  activeSheetName,
  onSheetChange,
  topics,
}) {
  const [topicQuery, setTopicQuery] = useState("");
  const [sheetMenuOpen, setSheetMenuOpen] = useState(false);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const sheetMenuRef = useRef(null);

  useEffect(() => {
    if (!sheetMenuOpen) return;
    const onClick = (e) => {
      if (sheetMenuRef.current && !sheetMenuRef.current.contains(e.target)) setSheetMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [sheetMenuOpen]);

  const topicIdsKey = useMemo(() => (topics ?? []).map((t) => t.id).join(","), [topics]);

  useEffect(() => {
    if (view !== "sheet" || !topics) return;
    const sections = topics.map((t) => document.getElementById(`topic-${t.id}`)).filter(Boolean);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topMost = visible.reduce((a, b) => (a.boundingClientRect.top <= b.boundingClientRect.top ? a : b));
        setActiveTopicId(Number(topMost.target.id.replace("topic-", "")));
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicIdsKey, view]);

  const scrollToTopic = (id) => {
    document.getElementById(`topic-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const visibleTopics = useMemo(() => {
    if (!topics) return [];
    const q = topicQuery.trim().toLowerCase();
    return q ? topics.filter((t) => t.name.toLowerCase().includes(q)) : topics;
  }, [topics, topicQuery]);

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 h-screen sticky top-0 border-r border-line bg-paper-raised/60">
      <div className="flex items-center gap-2.5 px-4 h-16 shrink-0 border-b border-line">
        <span className="h-8 w-8 rounded-lg bg-accent text-accent-ink flex items-center justify-center text-[13px] font-bold shrink-0 glow-accent">
          {"</>"}
        </span>
        <div className="min-w-0 relative" ref={sheetMenuRef}>
          <h1 className="text-[14px] font-semibold text-ink leading-tight truncate">DSA Problem Tracker</h1>
          {sheets && sheets.length > 1 ? (
            <button
              onClick={() => setSheetMenuOpen((v) => !v)}
              className="flex items-center gap-1 text-[11px] text-ink-soft hover:text-ink leading-tight truncate"
            >
              <span className="truncate">{activeSheetName}</span>
              <FiChevronDown className="h-3 w-3 shrink-0" aria-hidden="true" />
            </button>
          ) : (
            activeSheetName && <p className="text-[11px] text-ink-soft leading-tight truncate">{activeSheetName}</p>
          )}
          {sheetMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-48 bg-paper-raised border border-line rounded-lg shadow-lg py-1 z-30">
              {sheets.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    onSheetChange(s.slug);
                    setSheetMenuOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-3 py-1.5 text-[13px] text-left hover:bg-ink/5
                    ${s.slug === activeSheetSlug ? "text-accent font-medium" : "text-ink"}`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-3 py-3 shrink-0" aria-label="Main">
        {NAV_ITEMS.map((item) => {
          const active = view === item.value;
          return (
            <button
              key={item.value}
              onClick={() => onViewChange(item.value)}
              className={`flex items-center gap-2.5 h-9 px-3 rounded-lg text-[13.5px] font-medium transition-all duration-150
                ${active ? "bg-accent text-accent-ink glow-accent" : "text-ink-soft hover:text-ink hover:bg-ink/5 hover:translate-x-0.5"}`}
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.value === "review" && reviewDueCount > 0 && (
                <span
                  className={`mono text-[10px] font-bold rounded-pill px-1.5 py-0.5 ${
                    active ? "bg-accent-ink/20 text-accent-ink" : "bg-accent text-accent-ink animate-pulse-glow"
                  }`}
                >
                  {reviewDueCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {view === "sheet" && topics && (
        <div className="flex flex-col flex-1 min-h-0 border-t border-line">
          <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
            <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wide">Topics ({topics.length})</span>
          </div>
          <div className="px-3 pb-2 shrink-0">
            <div className="flex items-center gap-2 h-8 px-2.5 rounded-lg border border-line bg-paper">
              <FiSearch className="h-3.5 w-3.5 text-ink-soft shrink-0" aria-hidden="true" />
              <input
                value={topicQuery}
                onChange={(e) => setTopicQuery(e.target.value)}
                placeholder="Search topics…"
                className="w-full bg-transparent text-[12.5px] text-ink placeholder:text-ink-soft/70 outline-none"
              />
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 space-y-0.5">
            {visibleTopics.map((topic) => {
              const Icon = topicIcon(topic.name);
              const done = topic.problems.filter((p) => p.status === "DONE").length;
              const total = topic.problems.length;
              const pct = total === 0 ? 0 : Math.round((done / total) * 100);
              const active = topic.id === activeTopicId;
              return (
                <button
                  key={topic.id}
                  onClick={() => scrollToTopic(topic.id)}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-left border-l-2 transition-all duration-150
                    ${active ? "bg-accent-soft border-accent" : "border-transparent hover:bg-ink/5 hover:border-line-strong"}`}
                >
                  <span
                    className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 transition-all duration-150
                      ${active ? "bg-accent text-accent-ink glow-accent" : "bg-accent/15 text-accent"}`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className={`flex-1 min-w-0 text-[12.5px] truncate ${active ? "text-accent font-medium" : "text-ink"}`}>
                    {topic.name}
                  </span>
                  <span className="mono text-[10.5px] text-ink-soft shrink-0">{pct === 100 ? "✓" : `${done}/${total}`}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}

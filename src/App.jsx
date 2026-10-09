import { useEffect, useMemo, useRef, useState } from "react";
import { FiBookmark, FiCheckCircle, FiSearch, FiStar, FiShuffle } from "react-icons/fi";
import { fetchProblem, fetchReviewQueue, fetchSheets, fetchTopics, updateProblem } from "./api/client.js";
import { useAuth } from "./auth/AuthContext.jsx";
import { useTheme } from "./hooks/useTheme.js";
import { useAccent } from "./hooks/useAccent.js";
import { useReminders } from "./hooks/useReminders.js";
import { useToast } from "./components/ToastProvider.jsx";
import { computeSheetStats, dateKey } from "./components/dashboard/date-utils.js";
import { GiFlame } from "react-icons/gi";
import AuthPage from "./components/AuthPage.jsx";
import Header from "./components/Header.jsx";
import AppSidebar from "./components/AppSidebar.jsx";
import TopicSection from "./components/TopicSection.jsx";
import StatCard from "./components/StatCard.jsx";
import StudyCalendarWidget from "./components/widgets/StudyCalendarWidget.jsx";
import ProgressDonutWidget from "./components/widgets/ProgressDonutWidget.jsx";
import QuickActionsWidget from "./components/widgets/QuickActionsWidget.jsx";
import RecentActivityWidget from "./components/widgets/RecentActivityWidget.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";
import Insights from "./components/insights/Insights.jsx";
import Contest from "./components/contest/Contest.jsx";
import Interview from "./components/interview/Interview.jsx";
import Leaderboard from "./components/Leaderboard.jsx";
import Profile from "./components/profile/Profile.jsx";
import ReviewQueue from "./components/ReviewQueue.jsx";
import ProblemOfDay from "./components/ProblemOfDay.jsx";
import SolveView from "./components/SolveView.jsx";
import CommandPalette from "./components/CommandPalette.jsx";
import SkeletonSheet from "./components/SkeletonSheet.jsx";
import Confetti from "./components/Confetti.jsx";
import ShareCard from "./components/ShareCard.jsx";
import AlgorithmVisualizer from "./components/visualizer/AlgorithmVisualizer.jsx";
import { Button, SegmentedControl, Spinner } from "./components/ui/index.js";
import "./App.css";

const STATUS_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "TODO", label: "To-do" },
  { value: "DONE", label: "Done" },
  { value: "REVISE", label: "Revise" },
];

const DIFFICULTY_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

const SHEET_KEY = "dsa-active-sheet";
const VALID_VIEWS = new Set([
  "sheet", "dashboard", "insights", "contest", "interview", "leaderboard", "review", "profile", "visualizer",
]);

function loadSheetSlug() {
  try {
    return localStorage.getItem(SHEET_KEY) || "a2z";
  } catch {
    return "a2z";
  }
}

/** Reads the view/sheet/solve state the URL was loaded with, so a refresh or a shared link
 *  lands back where you were instead of always resetting to the default sheet view. */
function readUrlState() {
  try {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    const solve = params.get("solve");
    return {
      view: VALID_VIEWS.has(view) ? view : null,
      sheet: params.get("sheet") || null,
      solve: solve ? Number(solve) : null,
    };
  } catch {
    return { view: null, sheet: null, solve: null };
  }
}

const initialUrlState = readUrlState();

export default function App() {
  const { user, logout } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();
  const { accent, setAccent } = useAccent(isDark);
  const toast = useToast();
  const [sheets, setSheets] = useState([]);
  const [activeSheetSlug, setActiveSheetSlug] = useState(() => initialUrlState.sheet || loadSheetSlug());
  const [topics, setTopics] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState(() => initialUrlState.view || "sheet");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [solvingId, setSolvingId] = useState(() => initialUrlState.solve ?? null);
  const [activeContestId, setActiveContestId] = useState(null);
  const [collapsedTopics, setCollapsedTopics] = useState(() => new Set());
  // Holds the *full* problem detail (statement/examples/constraints/hints/test counts) for
  // whichever problem is currently being solved. The topics list only carries a lightweight
  // summary per problem (see ProblemSummaryResponse on the backend) to keep the sheet view fast,
  // so entering Solve mode always fetches the complete detail fresh, regardless of whether the
  // problem came from the current sheet or a contest on a different one.
  const [solvingDetail, setSolvingDetail] = useState(null);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [reviewDueCount, setReviewDueCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchSheets().then(setSheets).catch(() => {});
    // Only re-fetch on an actual login/logout/switch-user, not on every profile-field edit
    // (updateUser() creates a new `user` object reference for those, on purpose).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    fetchReviewQueue()
      .then((items) => setReviewDueCount(items.length))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Keep the URL in sync with the view/sheet/problem so a refresh or a copied link lands
  // back in the same place. Deliberately uses replaceState (not pushState) -- this is meant
  // to make deep-linking/refresh work, not to turn the browser back button into an in-app
  // navigation stack, which would need a lot more care to get right.
  const skipNextUrlSync = useRef(true);
  useEffect(() => {
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false;
      return;
    }
    try {
      const params = new URLSearchParams();
      params.set("view", view);
      params.set("sheet", activeSheetSlug);
      if (solvingId != null) params.set("solve", String(solvingId));
      const qs = `?${params.toString()}`;
      if (qs !== window.location.search) {
        window.history.replaceState(null, "", qs);
      }
    } catch {
      /* URL/history API unavailable -- state just won't survive a refresh */
    }
  }, [view, activeSheetSlug, solvingId]);

  const loadTopics = () => {
    if (!user) return;
    return fetchTopics(activeSheetSlug)
      .then(setTopics)
      .catch(() => setError("Couldn't reach the backend. Is it running on http://localhost:8081?"));
  };

  const isFirstTopicsLoad = useRef(true);
  useEffect(() => {
    if (!user) return;
    setTopics(null);
    setError(null);
    // Don't clear a solve id the URL asked to restore on the very first load -- only a
    // genuine sheet switch afterwards should kick you out of the problem you're solving.
    if (!isFirstTopicsLoad.current) {
      setSolvingId(null);
    }
    isFirstTopicsLoad.current = false;
    loadTopics();
    // Keyed on identity, not the object reference -- a profile edit (name/bio) must not
    // blank the sheet view or kick the user out of a problem they're mid-solve on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, activeSheetSlug]);

  useEffect(() => {
    if (!user) return;
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdkOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const celebrate = () => setCelebrateKey((k) => k + 1);

  const handleSheetChange = (slug) => {
    setActiveSheetSlug(slug);
    try {
      localStorage.setItem(SHEET_KEY, slug);
    } catch {
      /* ignore */
    }
  };

  const flatProblems = useMemo(() => {
    if (!topics) return [];
    return topics.flatMap((topic) => topic.problems.map((p) => ({ ...p, topicName: topic.name })));
  }, [topics]);

  // Entering Solve mode always fetches the full problem detail fresh -- the topics list only
  // has the lightweight summary (see solvingDetail above).
  useEffect(() => {
    if (solvingId == null) return;
    fetchProblem(solvingId)
      .then((res) => setSolvingDetail({ ...res.problem, topicName: res.topicName }))
      .catch(() => toast.error("Couldn't load that problem."));
  }, [solvingId]);

  const handleUpdate = (problemId, patch) => {
    const before = flatProblems.find((p) => p.id === problemId);

    updateProblem(problemId, patch)
      .then((updated) => {
        setTopics((prev) =>
          prev.map((topic) => ({
            ...topic,
            problems: topic.problems.map((p) => (p.id === updated.id ? updated : p)),
          }))
        );
        // Keep the Solve view's own copy in sync too, e.g. a status/bookmark change made
        // while solving should reflect immediately rather than only after leaving and
        // re-entering (which would re-fetch and pick it up anyway, but this avoids the flicker).
        setSolvingDetail((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev));
        if (patch.status === "DONE" && before?.status !== "DONE") {
          celebrate();
        }
        if (patch.bookmarked !== undefined) {
          toast.show(
            patch.bookmarked ? (
              <>
                <FiBookmark className="toast-icon" /> Bookmarked
              </>
            ) : (
              "Bookmark removed"
            ),
            { duration: 1800 }
          );
        }
      })
      .catch(() => toast.error("Couldn't save that change. Try again."));
  };

  const filtered = useMemo(() => {
    if (!topics) return [];
    const query = search.trim().toLowerCase();
    return topics.map((topic) => ({
      topic,
      visibleProblems: topic.problems.filter((p) => {
        if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
        if (difficultyFilter !== "ALL" && p.difficulty !== difficultyFilter) return false;
        if (bookmarkedOnly && !p.bookmarked) return false;
        if (query) {
          const haystack = (p.title + " " + p.tags.join(" ")).toLowerCase();
          if (!haystack.includes(query)) return false;
        }
        return true;
      }),
    }));
  }, [topics, search, statusFilter, difficultyFilter, bookmarkedOnly]);

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "ALL" || difficultyFilter !== "ALL" || bookmarkedOnly;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setDifficultyFilter("ALL");
    setBookmarkedOnly(false);
  };

  const toggleTopicCollapsed = (topicId) => {
    setCollapsedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  };
  const collapseAllTopics = () => setCollapsedTopics(new Set(filtered.map(({ topic }) => topic.id)));
  const expandAllTopics = () => setCollapsedTopics(new Set());

  const stats = useMemo(() => (topics ? computeSheetStats(topics) : null), [topics]);
  const solvedToday = stats ? (stats.dayCounts[dateKey(new Date())] ?? 0) > 0 : false;
  const reminders = useReminders({
    reviewDueCount,
    solvedToday,
    currentStreak: stats?.currentStreak ?? 0,
  });
  const [streakBannerDismissed, setStreakBannerDismissed] = useState(false);
  const showStreakBanner =
    reminders.prefs.enabled &&
    reminders.prefs.streakAtRisk &&
    !streakBannerDismissed &&
    !solvedToday &&
    (stats?.currentStreak ?? 0) > 0;

  const solvingIndex = solvingId == null ? -1 : flatProblems.findIndex((p) => p.id === solvingId);
  const solvingProblem = solvingDetail?.id === solvingId ? solvingDetail : null;

  const handleNavigateSolve = (delta) => {
    if (solvingIndex < 0) return; // standalone problem (e.g. from a contest) isn't part of flatProblems
    const nextIndex = solvingIndex + delta;
    if (nextIndex >= 0 && nextIndex < flatProblems.length) {
      setSolvingId(flatProblems[nextIndex].id);
    }
  };

  const handleSelectFromPalette = (problemId) => {
    setCmdkOpen(false);
    setSolvingId(problemId);
  };

  const handleSolveFromContest = (problemId, contestId) => {
    setActiveContestId(contestId);
    setSolvingId(problemId);
  };

  const handleBackFromSolve = () => {
    setSolvingId(null);
    setActiveContestId(null);
    setSolvingDetail(null);
  };

  const handleRandom = () => {
    if (flatProblems.length === 0) return;
    const unsolved = flatProblems.filter((p) => p.status !== "DONE");
    const pool = unsolved.length > 0 ? unsolved : flatProblems;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setSolvingId(pick.id);
  };

  /** "Continue Sheet" quick action -- jumps to the first not-yet-done problem in sheet order,
   *  a reasonable "pick up where you left off" since per-problem "last viewed" isn't tracked. */
  const handleContinue = () => {
    const next = flatProblems.find((p) => p.status !== "DONE");
    if (next) setSolvingId(next.id);
  };

  const activeSheetName = sheets.find((s) => s.slug === activeSheetSlug)?.name;

  if (!user) {
    return <AuthPage />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="text-[14px] text-ink-soft">{error}</p>
      </div>
    );
  }

  if (!topics) {
    return <SkeletonSheet />;
  }

  if (solvingId != null && !solvingProblem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Spinner size="lg" />
      </div>
    );
  }

  if (solvingProblem) {
    return (
      <>
        <Confetti burstKey={celebrateKey} />
        <SolveView
          problem={solvingProblem}
          topicName={solvingProblem.topicName}
          onBack={handleBackFromSolve}
          onUpdate={handleUpdate}
          onNavigate={handleNavigateSolve}
          hasPrev={solvingIndex > 0}
          hasNext={solvingIndex >= 0 && solvingIndex < flatProblems.length - 1}
          user={user}
          onLogout={logout}
          onRefreshTopics={loadTopics}
          onCelebrate={celebrate}
          contestSessionId={activeContestId}
        />
        <CommandPalette
          open={cmdkOpen}
          onClose={() => setCmdkOpen(false)}
          problems={flatProblems}
          onSelect={handleSelectFromPalette}
        />
      </>
    );
  }

  const allEmpty = filtered.every((f) => f.visibleProblems.length === 0);

  return (
    <div className="flex min-h-screen bg-paper">
      <Confetti burstKey={celebrateKey} />
      <CommandPalette
        open={cmdkOpen}
        onClose={() => setCmdkOpen(false)}
        problems={flatProblems}
        onSelect={handleSelectFromPalette}
      />

      <AppSidebar
        view={view}
        onViewChange={setView}
        reviewDueCount={reviewDueCount}
        sheets={sheets}
        activeSheetSlug={activeSheetSlug}
        activeSheetName={activeSheetName}
        onSheetChange={handleSheetChange}
        topics={view === "sheet" ? topics : null}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          user={user}
          onLogout={logout}
          onViewChange={setView}
          onOpenPalette={() => setCmdkOpen(true)}
          onRefresh={loadTopics}
          reviewDueCount={reviewDueCount}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        {shareOpen && <ShareCard user={user} accent={accent} onClose={() => setShareOpen(false)} />}

        {showStreakBanner && (
          <div className="px-5 lg:px-8 pt-4">
            <div className="flex items-center gap-2.5 rounded-lg border border-medium/30 bg-medium-soft px-4 py-2.5 text-[13.5px] text-medium">
              <GiFlame aria-hidden="true" className="shrink-0" />
              <span className="flex-1">
                You haven&rsquo;t solved anything today — your {stats.currentStreak}-day streak is at risk.
              </span>
              <button
                onClick={() => setStreakBannerDismissed(true)}
                aria-label="Dismiss"
                className="shrink-0 h-5 w-5 flex items-center justify-center rounded hover:bg-medium/10"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {view === "dashboard" && (
          <div className="max-w-[1280px] px-5 lg:px-8 py-6" key="dashboard">
            <Dashboard topics={topics} onSolve={setSolvingId} />
          </div>
        )}

        {view === "insights" && (
          <div className="max-w-[1280px] px-5 lg:px-8 py-6" key="insights">
            <Insights />
          </div>
        )}

        {view === "visualizer" && (
          <div className="max-w-[1280px] px-5 lg:px-8 py-6" key="visualizer">
            <AlgorithmVisualizer />
          </div>
        )}

        {view === "contest" && (
          <div className="max-w-[1280px] px-5 lg:px-8 py-6" key="contest">
            <Contest onSolveProblem={handleSolveFromContest} />
          </div>
        )}

        {view === "interview" && (
          <div className="max-w-[1280px] px-5 lg:px-8 py-6" key="interview">
            <Interview />
          </div>
        )}

        {view === "leaderboard" && (
          <div className="max-w-[1280px] px-5 lg:px-8 py-6" key="leaderboard">
            <Leaderboard sheets={sheets} />
          </div>
        )}

        {view === "review" && (
          <div className="max-w-[1280px] px-5 lg:px-8 py-6" key="review">
            <ReviewQueue onSolve={setSolvingId} onQueueChange={setReviewDueCount} />
          </div>
        )}

        {view === "profile" && (
          <div className="max-w-[1280px] px-5 lg:px-8 py-6" key="profile">
            <Profile
              stats={stats}
              activeSheetName={activeSheetName}
              sheets={sheets}
              onOpenShare={() => setShareOpen(true)}
              onNavigateToContest={() => setView("contest")}
              onLogout={logout}
              isDark={isDark}
              onToggleTheme={toggleTheme}
              accent={accent}
              onAccentChange={setAccent}
              notifSupported={reminders.supported}
              notifPrefs={reminders.prefs}
              onNotifPrefsChange={reminders.setPrefs}
              notifPermission={reminders.permission}
              onNotifRequestPermission={reminders.requestPermission}
            />
          </div>
        )}

        {view === "sheet" && (
          <div className="px-5 lg:px-8 py-6" key="sheet">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start max-w-[1600px]">
              <div className="min-w-0 space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    index={0}
                    tone="done"
                    icon={<FiCheckCircle />}
                    value={`${stats.done} / ${stats.total}`}
                    label="Solved"
                    subtitle={stats.total === 0 ? "—" : `${((stats.done / stats.total) * 100).toFixed(1)}%`}
                    pct={stats.total === 0 ? 0 : (stats.done / stats.total) * 100}
                  />
                  <StatCard
                    index={1}
                    tone="medium"
                    icon={<GiFlame />}
                    value={stats.currentStreak}
                    label="Current Streak"
                    subtitle={stats.currentStreak > 0 ? "Keep going!" : "Start today!"}
                    pct={Math.min(100, (stats.currentStreak / 30) * 100)}
                  />
                  <StatCard
                    index={2}
                    tone="accent"
                    icon={<FiStar />}
                    value={stats.bookmarked}
                    label="Bookmarked"
                    subtitle="Save for later"
                    pct={Math.min(100, (stats.bookmarked / 20) * 100)}
                  />
                  <StatCard
                    index={3}
                    tone="cyan"
                    icon={<span className="text-[10px] font-bold">%</span>}
                    value={stats.total === 0 ? "0%" : `${Math.round((stats.done / stats.total) * 100)}%`}
                    label="Completion"
                    subtitle={`${stats.total - stats.done} remaining`}
                    pct={stats.total === 0 ? 0 : (stats.done / stats.total) * 100}
                  />
                </div>

                <ProblemOfDay sheetSlug={activeSheetSlug} onSolve={setSolvingId} />

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-line bg-paper-raised min-w-[200px] flex-1 max-w-sm">
                    <FiSearch className="h-4 w-4 text-ink-soft shrink-0" aria-hidden="true" />
                    <input
                      type="text"
                      placeholder="Search problems by name or tag…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-transparent text-sm text-ink placeholder:text-ink-soft/70 outline-none"
                    />
                  </div>
                  <SegmentedControl options={STATUS_FILTERS} value={statusFilter} onChange={setStatusFilter} />
                  <SegmentedControl options={DIFFICULTY_FILTERS} value={difficultyFilter} onChange={setDifficultyFilter} />
                  <button
                    onClick={() => setBookmarkedOnly((v) => !v)}
                    className={`flex items-center gap-1.5 h-8 px-3 rounded-pill text-[13px] font-medium border transition-colors
                      ${bookmarkedOnly ? "bg-accent text-accent-ink border-transparent" : "bg-paper-raised text-ink-soft border-line hover:text-ink"}`}
                  >
                    <FiStar aria-hidden="true" className="h-3.5 w-3.5" /> Bookmarked
                  </button>
                  <Button variant="ghost" size="sm" icon={<FiShuffle className="h-3.5 w-3.5" />} onClick={handleRandom} title="Jump to a random unsolved problem">
                    Shuffle
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <h2 className="text-[15px] font-semibold text-ink">All Topics</h2>
                  {!allEmpty && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={expandAllTopics}>
                        Expand all
                      </Button>
                      <Button variant="ghost" size="sm" onClick={collapseAllTopics}>
                        Collapse all
                      </Button>
                    </div>
                  )}
                </div>

                {/* "content" kept as a literal class -- ProblemRow's keyboard nav selects
                    rows via .closest(".content") */}
                <main className="content">
                  {allEmpty && (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <span className="h-10 w-10 rounded-full bg-ink/5 text-ink-soft flex items-center justify-center" aria-hidden="true">
                        <FiSearch />
                      </span>
                      <p className="text-[14px] text-ink-soft">No problems match your filters.</p>
                      {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                          Clear filters
                        </Button>
                      )}
                    </div>
                  )}
                  {filtered.map(({ topic, visibleProblems }, index) => (
                    <TopicSection
                      key={topic.id}
                      index={index}
                      topic={topic}
                      visibleProblems={visibleProblems}
                      onUpdate={handleUpdate}
                      onSolve={setSolvingId}
                      onTagClick={setSearch}
                      collapsed={collapsedTopics.has(topic.id)}
                      onToggleCollapse={() => toggleTopicCollapsed(topic.id)}
                    />
                  ))}
                </main>
              </div>

              <div className="space-y-5 min-w-0">
                <StudyCalendarWidget dayCounts={stats.dayCounts} />
                <ProgressDonutWidget stats={stats} onViewDetails={() => setView("dashboard")} />
                <QuickActionsWidget
                  onRandom={handleRandom}
                  onContinue={handleContinue}
                  onWeakTopics={() => setView("insights")}
                  onMockTest={() => setView("interview")}
                />
                <RecentActivityWidget topics={topics} onViewAll={() => setView("profile")} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

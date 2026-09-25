import { useEffect, useMemo, useRef, useState } from "react";
import { FiBookmark, FiSearch } from "react-icons/fi";
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
import Sidebar from "./components/Sidebar.jsx";
import TopicSection from "./components/TopicSection.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";
import Insights from "./components/insights/Insights.jsx";
import Contest from "./components/contest/Contest.jsx";
import Leaderboard from "./components/Leaderboard.jsx";
import Profile from "./components/profile/Profile.jsx";
import ReviewQueue from "./components/ReviewQueue.jsx";
import ProblemOfDay from "./components/ProblemOfDay.jsx";
import SolveView from "./components/SolveView.jsx";
import CommandPalette from "./components/CommandPalette.jsx";
import SkeletonSheet from "./components/SkeletonSheet.jsx";
import Confetti from "./components/Confetti.jsx";
import ShareCard from "./components/ShareCard.jsx";
import "./App.css";

const SHEET_KEY = "dsa-active-sheet";
const VALID_VIEWS = new Set(["sheet", "dashboard", "insights", "contest", "leaderboard", "review", "profile"]);

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
  const [standaloneProblem, setStandaloneProblem] = useState(null);
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

  // A contest can draw a problem from a sheet other than the one currently loaded into
  // `topics` -- fall back to fetching it standalone when it's not among flatProblems.
  useEffect(() => {
    if (solvingId == null) return;
    if (flatProblems.some((p) => p.id === solvingId)) return;
    fetchProblem(solvingId)
      .then((res) => setStandaloneProblem({ ...res.problem, topicName: res.topicName }))
      .catch(() => toast.error("Couldn't load that problem."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solvingId, flatProblems]);

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
  const solvingProblem =
    solvingIndex >= 0 ? flatProblems[solvingIndex] : standaloneProblem?.id === solvingId ? standaloneProblem : null;

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
    setStandaloneProblem(null);
  };

  const handleRandom = () => {
    if (flatProblems.length === 0) return;
    const unsolved = flatProblems.filter((p) => p.status !== "DONE");
    const pool = unsolved.length > 0 ? unsolved : flatProblems;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setSolvingId(pick.id);
  };

  const activeSheetName = sheets.find((s) => s.slug === activeSheetSlug)?.name;

  if (!user) {
    return <AuthPage />;
  }

  if (error) {
    return (
      <div className="app-shell state-message">
        <p>{error}</p>
      </div>
    );
  }

  if (!topics) {
    return <SkeletonSheet />;
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

  return (
    <div className="app-shell">
      <Confetti burstKey={celebrateKey} />
      <CommandPalette
        open={cmdkOpen}
        onClose={() => setCmdkOpen(false)}
        problems={flatProblems}
        onSelect={handleSelectFromPalette}
      />
      <Header
        total={stats.total}
        done={stats.done}
        topicCount={topics.length}
        streak={stats.currentStreak}
        bookmarkedCount={stats.bookmarked}
        view={view}
        onViewChange={setView}
        reviewDueCount={reviewDueCount}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        difficultyFilter={difficultyFilter}
        onDifficultyFilterChange={setDifficultyFilter}
        bookmarkedOnly={bookmarkedOnly}
        onBookmarkedOnlyChange={setBookmarkedOnly}
        sheets={sheets}
        activeSheetSlug={activeSheetSlug}
        activeSheetName={activeSheetName}
        onSheetChange={handleSheetChange}
        user={user}
        onLogout={logout}
        onOpenPalette={() => setCmdkOpen(true)}
        onRandom={handleRandom}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {shareOpen && <ShareCard user={user} accent={accent} onClose={() => setShareOpen(false)} />}

      {showStreakBanner && (
        <div className="streak-risk-banner glass-panel">
          <GiFlame aria-hidden="true" />
          <span>
            You haven&rsquo;t solved anything today &mdash; your {stats.currentStreak}-day streak is at risk.
          </span>
          <button
            className="streak-risk-banner-dismiss"
            onClick={() => setStreakBannerDismissed(true)}
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      )}

      {view === "dashboard" && (
        <div className="view-transition" key="dashboard">
          <Dashboard topics={topics} />
        </div>
      )}

      {view === "insights" && (
        <div className="view-transition" key="insights">
          <Insights />
        </div>
      )}

      {view === "contest" && (
        <div className="view-transition" key="contest">
          <Contest onSolveProblem={handleSolveFromContest} />
        </div>
      )}

      {view === "leaderboard" && (
        <div className="view-transition" key="leaderboard">
          <Leaderboard sheets={sheets} />
        </div>
      )}

      {view === "review" && (
        <div className="view-transition" key="review">
          <ReviewQueue onSolve={setSolvingId} onQueueChange={setReviewDueCount} />
        </div>
      )}

      {view === "profile" && (
        <div className="view-transition" key="profile">
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
        <div className="view-transition" key="sheet">
          <ProblemOfDay sheetSlug={activeSheetSlug} onSolve={setSolvingId} />
          <div className="layout">
            <Sidebar topics={topics} />
            <main className="content">
              {filtered.every((f) => f.visibleProblems.length === 0) && (
                <div className="empty-state">
                  <span className="empty-state-icon" aria-hidden="true">
                    <FiSearch />
                  </span>
                  <p>No problems match your filters.</p>
                  {hasActiveFilters && (
                    <button className="ghost-btn-light" onClick={clearFilters}>
                      Clear filters
                    </button>
                  )}
                </div>
              )}
              {!filtered.every((f) => f.visibleProblems.length === 0) && (
                <div className="topics-toolbar">
                  <button className="ghost-btn-light" onClick={expandAllTopics}>
                    Expand all
                  </button>
                  <button className="ghost-btn-light" onClick={collapseAllTopics}>
                    Collapse all
                  </button>
                </div>
              )}
              {filtered.map(({ topic, visibleProblems }) => (
                <TopicSection
                  key={topic.id}
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
        </div>
      )}
    </div>
  );
}

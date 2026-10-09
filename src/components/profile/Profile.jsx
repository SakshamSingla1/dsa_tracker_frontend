import { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiAlertTriangle,
  FiAward,
  FiBell,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiCode,
  FiDownload,
  FiEdit2,
  FiFlag,
  FiLayers,
  FiLock,
  FiPieChart,
  FiSettings,
  FiShare2,
  FiSliders,
  FiSun,
  FiX,
} from "react-icons/fi";
import { GiFlame } from "react-icons/gi";
import {
  changePassword,
  deleteAccount,
  fetchAnalyticsSummary,
  fetchContestHistory,
  fetchLeaderboard,
  fetchProfile,
  fetchProgressSummary,
  fetchTopics,
  updateProfile as updateProfileRequest,
} from "../../api/client.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useToast } from "../ToastProvider.jsx";
import { ACCENTS, ACCENT_ORDER } from "../../theme/accents.js";
import { LoadingState, ErrorState } from "../InlineState.jsx";
import ProgressRing from "../dashboard/ProgressRing.jsx";
import Achievements from "../dashboard/Achievements.jsx";
import StreakCalendar from "../dashboard/StreakCalendar.jsx";
import DifficultyBreakdown from "../dashboard/DifficultyBreakdown.jsx";
import ThemeToggle from "../ThemeToggle.jsx";
import { computeSheetStats } from "../dashboard/date-utils.js";
import { computeLevel } from "../profileIdentity.js";
import { Avatar, Badge, Button, Card, difficultyTone, FieldError, Input, Label, Modal, ProgressBar, Tabs, Textarea } from "../ui/index.js";

/** A small styled toggle switch backed by a real checkbox input, for boolean prefs. */
function ToggleSwitch({ checked, onChange, disabled, label }) {
  return (
    <label className={`relative inline-flex items-center ${disabled ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} aria-label={label} className="sr-only peer" />
      <span className="h-5 w-9 rounded-pill bg-ink/15 peer-checked:bg-accent transition-colors" />
      <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
    </label>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="flex flex-col">
      <span className="mono text-lg font-bold text-ink">{value}</span>
      <span className="text-[11.5px] text-ink-soft">{label}</span>
    </div>
  );
}

function formatMemberSince(iso) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(iso));
  } catch {
    return null;
  }
}

const RECENT_DATE_FMT = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });

const ACCEPTANCE_CLASS = {
  good: "bg-done-soft text-done",
  mid: "bg-medium-soft text-medium",
  low: "bg-hard-soft text-hard",
};

function acceptanceTier(rate) {
  if (rate >= 0.7) return "good";
  if (rate >= 0.4) return "mid";
  return "low";
}

const LANGUAGE_LABELS = { JAVA: "Java", PYTHON: "Python", JAVASCRIPT: "JavaScript", CPP: "C++" };

function topLanguage(byLanguage) {
  const entries = Object.entries(byLanguage || {});
  if (entries.length === 0) return null;
  const [lang] = entries.sort((a, b) => b[1] - a[1])[0];
  return LANGUAGE_LABELS[lang] ?? lang;
}

function contestSummary(sessions) {
  if (!sessions || sessions.length === 0) return null;
  const finished = sessions.filter((s) => s.status === "FINISHED").length;
  const abandoned = sessions.filter((s) => s.status === "ABANDONED").length;
  const totalSolved = sessions.reduce((sum, s) => sum + s.solvedCount, 0);
  const best = sessions.reduce((b, s) => {
    const ratio = s.totalCount === 0 ? 0 : s.solvedCount / s.totalCount;
    const bestRatio = b && b.totalCount > 0 ? b.solvedCount / b.totalCount : -1;
    return ratio > bestRatio ? s : b;
  }, null);
  return { played: sessions.length, finished, abandoned, totalSolved, best };
}

/** Every solved problem across every sheet, newest first -- derived from the cross-sheet
 *  progress summary already fetched for the streak calendar/difficulty breakdown below. */
function recentActivity(allTopics, limit = 6) {
  if (!allTopics) return [];
  return allTopics
    .flatMap((t) => t.problems.map((p) => ({ ...p, topicName: t.name })))
    .filter((p) => p.completedAt)
    .sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1))
    .slice(0, limit);
}

export default function Profile({
  stats,
  activeSheetName,
  sheets,
  onOpenShare,
  onNavigateToContest,
  onLogout,
  isDark,
  onToggleTheme,
  accent,
  onAccentChange,
  notifSupported,
  notifPrefs,
  onNotifPrefsChange,
  notifPermission,
  onNotifRequestPermission,
}) {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  // The cached auth user (from login/register) only has {id, email, displayName} -- bio and
  // createdAt live on the fuller profile record, fetched once here and merged into the auth
  // context so the rest of the app could read them too if it ever needs to.
  const [loadError, setLoadError] = useState(null);
  const [loaded, setLoaded] = useState(user.createdAt != null);

  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [bio, setBio] = useState(user.bio || "");
  const [profileError, setProfileError] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Cross-sheet progress (streak calendar, difficulty breakdown, recent activity) -- fetched
  // the same way Dashboard.jsx fetches its "all sheets" view, independently of that view.
  const [allTopics, setAllTopics] = useState(null);
  const [allTopicsError, setAllTopicsError] = useState(null);
  const allStats = useMemo(() => (allTopics ? computeSheetStats(allTopics) : null), [allTopics]);
  const recent = useMemo(() => recentActivity(allTopics), [allTopics]);

  const loadAllTopics = () => {
    setAllTopicsError(null);
    fetchProgressSummary("all")
      .then(setAllTopics)
      .catch(() => setAllTopicsError("Couldn't load your cross-sheet progress."));
  };

  // Per-sheet breakdown -- the "all" summary above merges every sheet's topics into one list,
  // so a clean per-sheet total is simplest fetched directly, one small request per sheet.
  const [sheetStats, setSheetStats] = useState(null);
  const [sheetStatsError, setSheetStatsError] = useState(null);

  const loadSheetStats = () => {
    if (!sheets || sheets.length === 0) return;
    setSheetStatsError(null);
    Promise.all(sheets.map((s) => fetchTopics(s.slug).then((topics) => [s, computeSheetStats(topics)])))
      .then((pairs) => setSheetStats(pairs))
      .catch(() => setSheetStatsError("Couldn't load your per-sheet progress."));
  };

  useEffect(loadAllTopics, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(loadSheetStats, [sheets]); // eslint-disable-line react-hooks/exhaustive-deps

  // Contest activity, submission stats, and leaderboard rank -- each an independent card with
  // its own loading/error state, same pattern as the cards above, so one slow/failed fetch
  // never blocks the rest of the page.
  const [contests, setContests] = useState(null);
  const [contestsError, setContestsError] = useState(null);
  const contestStats = useMemo(() => contestSummary(contests), [contests]);

  const loadContests = () => {
    setContestsError(null);
    fetchContestHistory()
      .then(setContests)
      .catch(() => setContestsError("Couldn't load your contest history."));
  };

  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState(null);

  const loadAnalytics = () => {
    setAnalyticsError(null);
    fetchAnalyticsSummary()
      .then(setAnalytics)
      .catch(() => setAnalyticsError("Couldn't load your submission stats."));
  };

  const [rank, setRank] = useState(undefined); // undefined = loading, null = failed, {position,of} | "unranked"
  const loadRank = () => {
    setRank(undefined);
    fetchLeaderboard({ scope: "ALL" })
      .then((entries) => {
        const idx = entries.findIndex((e) => e.isYou);
        setRank(idx === -1 ? "unranked" : { position: idx + 1, of: entries.length });
      })
      .catch(() => setRank(null));
  };

  useEffect(loadContests, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(loadAnalytics, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(loadRank, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [tab, setTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProfile = () => {
    setLoadError(null);
    fetchProfile()
      .then((res) => {
        updateUser({
          displayName: res.displayName,
          bio: res.bio,
          createdAt: res.createdAt,
          xp: res.xp,
          xpLevel: res.level,
          xpIntoLevel: res.xpIntoLevel,
          xpForNextLevel: res.xpForNextLevel,
        });
        setDisplayName(res.displayName || "");
        setBio(res.bio || "");
        setLoaded(true);
      })
      .catch(() => setLoadError("Couldn't load your profile."));
  };

  useEffect(loadProfile, []); // eslint-disable-line react-hooks/exhaustive-deps

  const memberSince = formatMemberSince(user.createdAt);
  const profileDirty = displayName.trim() !== (user.displayName || "") || bio !== (user.bio || "");
  const level = useMemo(() => computeLevel(allStats?.done), [allStats]);

  const handleExportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      account: { email: user.email, displayName: user.displayName, bio: user.bio, memberSince: user.createdAt },
      level,
      progress: allStats
        ? {
            done: allStats.done,
            total: allStats.total,
            currentStreak: allStats.currentStreak,
            longestStreak: allStats.longestStreak,
            bookmarked: allStats.bookmarked,
            byDifficulty: allStats.byDifficulty,
          }
        : null,
      bySheet: sheetStats?.map(([sheet, s]) => ({ sheet: sheet.name, done: s.done, total: s.total })) ?? null,
      recentActivity: recent.map((p) => ({ title: p.title, difficulty: p.difficulty, completedAt: p.completedAt })),
      contests: contestStats,
      submissions: analytics,
      leaderboardRank: rank && rank !== "unranked" ? rank : null,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dsa-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded");
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setProfileError("Display name can't be blank.");
      return;
    }
    setProfileError(null);
    setSavingProfile(true);
    updateProfileRequest({ displayName: displayName.trim(), bio })
      .then((res) => {
        updateUser({ displayName: res.displayName, bio: res.bio });
        toast.success("Profile updated");
        setEditOpen(false);
      })
      .catch((err) => setProfileError(err.message || "Couldn't save your profile."))
      .finally(() => setSavingProfile(false));
  };

  const openEditProfile = () => {
    setDisplayName(user.displayName || "");
    setBio(user.bio || "");
    setProfileError(null);
    setEditOpen(true);
  };

  const cancelEditProfile = () => {
    setDisplayName(user.displayName || "");
    setBio(user.bio || "");
    setProfileError(null);
    setEditOpen(false);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }
    setPasswordError(null);
    setSavingPassword(true);
    changePassword({ currentPassword, newPassword })
      .then(() => {
        toast.success("Password changed");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      })
      .catch((err) => setPasswordError(err.message || "Couldn't change your password."))
      .finally(() => setSavingPassword(false));
  };

  const handleDeleteAccount = (e) => {
    e.preventDefault();
    if (!deletePassword) return;
    setDeleteError(null);
    setDeleting(true);
    deleteAccount({ currentPassword: deletePassword })
      .then(() => {
        // The account and every row it owned are gone server-side -- just drop the session,
        // the app already falls back to the auth page once `user` is null.
        onLogout();
      })
      .catch((err) => {
        setDeleteError(err.message || "Couldn't delete your account.");
        setDeleting(false);
      });
  };

  const closeDeleteDialog = () => {
    if (deleting) return;
    setDeleteOpen(false);
    setDeletePassword("");
    setDeleteError(null);
  };

  if (loadError) return <ErrorState message={loadError} onRetry={loadProfile} />;
  if (!loaded) return <LoadingState label="Loading your profile…" />;

  return (
    <div className="space-y-5">
      <Card padding="lg" className="flex flex-wrap items-start gap-5">
        <Avatar name={user.displayName || user.email} size="lg" />
        <div className="flex-1 min-w-[240px]">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[17px] font-semibold text-ink">{user.displayName}</h2>
            <Badge tone="accent" icon={<FiAward className="h-3 w-3" aria-hidden="true" />}>
              {level.title}
            </Badge>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-[12.5px] text-ink-soft mt-1">
            <span>{user.email}</span>
            {memberSince && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span className="flex items-center gap-1">
                  <FiCalendar aria-hidden="true" /> Member since {memberSince}
                </span>
              </>
            )}
          </div>

          {user.bio && <p className="text-[13px] text-ink mt-2">{user.bio}</p>}

          {level.next && (
            <div
              className="flex items-center gap-2.5 mt-3 max-w-xs"
              title={`${level.solved}/${level.nextMin} to ${level.next}`}
            >
              <span className="mono text-[10px] font-semibold text-ink-soft">LVL</span>
              <ProgressBar value={level.progress} size="sm" />
              <span className="mono text-[11px] text-ink-soft whitespace-nowrap">
                {level.nextMin - level.solved} to {level.next}
              </span>
            </div>
          )}
        </div>
        {onOpenShare && (
          <Button variant="secondary" icon={<FiShare2 className="h-3.5 w-3.5" />} onClick={onOpenShare}>
            Share progress
          </Button>
        )}
      </Card>

      <Tabs
        items={[
          { value: "overview", label: "Overview" },
          { value: "settings", label: <span className="flex items-center gap-1.5"><FiSliders aria-hidden="true" /> Settings</span> },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "overview" && (
        <div className="space-y-5">
          <div className="text-[11.5px] font-semibold text-ink-soft uppercase tracking-wide">Your progress</div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card padding="lg">
              <h2 className="text-[14px] font-semibold text-ink mb-4">Overall progress</h2>
              <div className="flex flex-col items-center gap-3">
                <ProgressRing done={allStats?.done ?? 0} total={allStats?.total ?? 0} />
                <p className="text-[12px] text-ink-soft text-center">
                  Across every sheet{activeSheetName ? ` — you're viewing ${activeSheetName}` : ""}
                </p>
              </div>
            </Card>
            <Card padding="lg">
              <h2 className="text-[14px] font-semibold text-ink mb-4">Stats</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <span className={`h-5 w-5 mb-1 ${allStats?.currentStreak > 0 ? "text-medium" : "text-ink-soft"}`} aria-hidden="true">
                    <GiFlame />
                  </span>
                  <span className="mono text-lg font-bold text-ink">{allStats ? allStats.currentStreak : "—"}</span>
                  <span className="text-[11.5px] text-ink-soft">current streak</span>
                </div>
                <MiniStat value={allStats ? allStats.longestStreak : "—"} label="longest streak" />
                <MiniStat value={allStats ? allStats.bookmarked : "—"} label="bookmarked" />
                <MiniStat
                  value={rank && rank !== "unranked" && rank !== null ? `#${rank.position}` : "—"}
                  label={rank && rank !== "unranked" && rank !== null ? `of ${rank.of} rank` : "leaderboard rank"}
                />
                <MiniStat value={analytics ? `${Math.round(analytics.acceptanceRate * 100)}%` : "—"} label="acceptance rate" />
                <div className="flex flex-col" title={`${user.xpIntoLevel ?? 0} / ${user.xpForNextLevel ?? "—"} XP to next level`}>
                  <span className="mono text-lg font-bold text-ink">{user.xp != null ? `Lv ${user.xpLevel}` : "—"}</span>
                  <span className="text-[11.5px] text-ink-soft">{user.xp != null ? `${user.xp} XP total` : "level"}</span>
                </div>
              </div>
            </Card>
          </div>

          <Card padding="lg">
            <h2 className="text-[14px] font-semibold text-ink mb-4 flex items-center gap-1.5">
              <FiActivity aria-hidden="true" /> Daily activity, every sheet
            </h2>
            {allTopicsError ? (
              <ErrorState message={allTopicsError} onRetry={loadAllTopics} />
            ) : !allStats ? (
              <LoadingState label="Crunching your stats…" />
            ) : (
              <StreakCalendar dayCounts={allStats.dayCounts} currentStreak={allStats.currentStreak} longestStreak={allStats.longestStreak} />
            )}
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card padding="lg">
              <h2 className="text-[14px] font-semibold text-ink mb-4 flex items-center gap-1.5">
                <FiPieChart aria-hidden="true" /> By difficulty, every sheet
              </h2>
              {allStats ? <DifficultyBreakdown byDifficulty={allStats.byDifficulty} /> : <LoadingState label="Loading…" />}
            </Card>

            <Card padding="lg">
              <h2 className="text-[14px] font-semibold text-ink mb-4 flex items-center gap-1.5">
                <FiLayers aria-hidden="true" /> By sheet
              </h2>
              {sheetStatsError ? (
                <ErrorState message={sheetStatsError} onRetry={loadSheetStats} />
              ) : !sheetStats ? (
                <LoadingState label="Loading…" />
              ) : (
                <div className="space-y-3">
                  {sheetStats.map(([sheet, s]) => {
                    const pct = s.total === 0 ? 0 : Math.round((s.done / s.total) * 100);
                    return (
                      <div key={sheet.slug} className="flex items-center gap-3">
                        <span className="text-[13px] text-ink w-32 shrink-0 truncate">{sheet.name}</span>
                        <ProgressBar value={pct} />
                        <span className="mono text-[12.5px] text-ink-soft w-14 text-right shrink-0">
                          {s.done}/{s.total}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <div className="text-[11.5px] font-semibold text-ink-soft uppercase tracking-wide">Your activity</div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card padding="lg">
              <h2 className="text-[14px] font-semibold text-ink mb-4 flex items-center gap-1.5">
                <FiFlag aria-hidden="true" /> Contest activity
              </h2>
              {contestsError ? (
                <ErrorState message={contestsError} onRetry={loadContests} />
              ) : !contests ? (
                <LoadingState label="Loading…" />
              ) : !contestStats ? (
                <div className="space-y-3">
                  <p className="text-[13px] text-ink-soft">No contests yet — try a timed challenge to see your stats here.</p>
                  {onNavigateToContest && (
                    <Button variant="ghost" size="sm" onClick={onNavigateToContest}>
                      Start a contest
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <MiniStat value={contestStats.played} label="played" />
                  <MiniStat value={contestStats.finished} label="finished" />
                  <MiniStat value={contestStats.totalSolved} label="problems solved" />
                  {contestStats.best && (
                    <MiniStat value={`${contestStats.best.solvedCount}/${contestStats.best.totalCount}`} label="best result" />
                  )}
                </div>
              )}
            </Card>

            <Card padding="lg">
              <h2 className="text-[14px] font-semibold text-ink mb-4 flex items-center gap-1.5">
                <FiCode aria-hidden="true" /> Submission stats
              </h2>
              {analyticsError ? (
                <ErrorState message={analyticsError} onRetry={loadAnalytics} />
              ) : !analytics ? (
                <LoadingState label="Loading…" />
              ) : analytics.totalSubmissions === 0 ? (
                <p className="text-[13px] text-ink-soft">No submissions yet — run or submit a solution to see your stats here.</p>
              ) : (
                <div className="flex items-center gap-6">
                  <MiniStat value={analytics.totalSubmissions} label="submissions" />
                  <span className={`mono text-[12.5px] font-semibold rounded-pill px-2.5 py-1 ${ACCEPTANCE_CLASS[acceptanceTier(analytics.acceptanceRate)]}`}>
                    {Math.round(analytics.acceptanceRate * 100)}% accepted
                  </span>
                  {topLanguage(analytics.byLanguage) && <MiniStat value={topLanguage(analytics.byLanguage)} label="top language" />}
                </div>
              )}
            </Card>
          </div>

          <Card padding="lg">
            <h2 className="text-[14px] font-semibold text-ink mb-4 flex items-center gap-1.5">
              <FiClock aria-hidden="true" /> Recent activity
            </h2>
            {!allTopics ? (
              <LoadingState label="Loading…" />
            ) : recent.length === 0 ? (
              <p className="text-[13px] text-ink-soft">Nothing solved yet -- your recent solves will show up here.</p>
            ) : (
              <ul className="space-y-2">
                {recent.map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <FiCheckCircle className="text-done shrink-0" aria-hidden="true" />
                    <span className="text-[13px] text-ink flex-1 truncate">{p.title}</span>
                    <Badge tone={difficultyTone(p.difficulty)}>{p.difficulty}</Badge>
                    <span className="mono text-[12px] text-ink-soft shrink-0">{RECENT_DATE_FMT.format(new Date(p.completedAt))}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {stats && (
            <>
              <div className="text-[11.5px] font-semibold text-ink-soft uppercase tracking-wide">Achievements</div>
              <Card padding="lg">
                <h2 className="text-[14px] font-semibold text-ink mb-4 flex items-center gap-1.5">
                  <FiAward aria-hidden="true" /> Achievements
                </h2>
                <Achievements stats={stats} />
              </Card>
            </>
          )}
        </div>
      )}

      {tab === "settings" && (
        <div className="space-y-5">
          <Card padding="lg">
            <h2 className="text-[14px] font-semibold text-ink mb-4 flex items-center gap-1.5">
              <FiSettings aria-hidden="true" /> Preferences
            </h2>

            <div className="mb-6">
              <h3 className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-soft uppercase tracking-wide mb-3">
                <FiSun aria-hidden="true" /> Appearance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[13.5px] text-ink">Theme</span>
                    <span className="text-[12px] text-ink-soft">{isDark ? "Dark" : "Light"}</span>
                  </div>
                  <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex flex-col">
                    <span className="text-[13.5px] text-ink">Accent color</span>
                    <span className="text-[12px] text-ink-soft">{ACCENTS[accent]?.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {ACCENT_ORDER.map((key) => (
                      <button
                        key={key}
                        style={{ background: ACCENTS[key].swatch }}
                        title={ACCENTS[key].label}
                        aria-label={ACCENTS[key].label}
                        aria-pressed={accent === key}
                        onClick={() => onAccentChange(key)}
                        className={`h-7 w-7 rounded-full flex items-center justify-center transition-transform
                          ${accent === key ? "ring-2 ring-offset-2 ring-offset-paper-raised ring-ink/30 scale-105" : "hover:scale-105"}`}
                      >
                        {accent === key && <FiCheck className="text-white h-3.5 w-3.5" aria-hidden="true" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-soft uppercase tracking-wide mb-3">
                <FiBell aria-hidden="true" /> Notifications
              </h3>

              {!notifSupported ? (
                <p className="text-[13px] text-ink-soft">Notifications aren&rsquo;t supported in this browser.</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] text-ink">Daily reminders</span>
                    <ToggleSwitch
                      label="Daily reminders"
                      checked={notifPrefs.enabled}
                      onChange={() => {
                        if (!notifPrefs.enabled && notifPermission === "default") {
                          onNotifRequestPermission().then((result) => {
                            if (result === "granted") onNotifPrefsChange({ enabled: true });
                          });
                          return;
                        }
                        onNotifPrefsChange({ enabled: !notifPrefs.enabled });
                      }}
                    />
                  </div>
                  {notifPermission === "denied" && (
                    <p className="flex items-center gap-1.5 text-[12.5px] text-medium">
                      <FiAlertTriangle aria-hidden="true" /> Blocked for this site &mdash; re-enable notifications in your
                      browser&rsquo;s site settings.
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] text-ink">Remind me at</span>
                    <input
                      type="time"
                      value={notifPrefs.dailyTime}
                      disabled={!notifPrefs.enabled}
                      onChange={(e) => onNotifPrefsChange({ dailyTime: e.target.value })}
                      className="h-8 px-2 rounded-lg border border-line bg-paper-raised text-[13px] text-ink disabled:opacity-40"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] text-ink">Due reviews</span>
                    <ToggleSwitch
                      label="Due reviews"
                      checked={notifPrefs.reviewDue}
                      disabled={!notifPrefs.enabled}
                      onChange={(e) => onNotifPrefsChange({ reviewDue: e.target.checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] text-ink">Streak at risk</span>
                    <ToggleSwitch
                      label="Streak at risk"
                      checked={notifPrefs.streakAtRisk}
                      disabled={!notifPrefs.enabled}
                      onChange={(e) => onNotifPrefsChange({ streakAtRisk: e.target.checked })}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {!editOpen ? (
              <Card padding="lg">
                <h2 className="text-[14px] font-semibold text-ink mb-3">Edit profile</h2>
                <div className="mb-4">
                  <div className="text-[13.5px] font-medium text-ink">{user.displayName}</div>
                  <div className={`text-[13px] mt-0.5 ${user.bio ? "text-ink-soft" : "text-ink-soft/50 italic"}`}>
                    {user.bio || "No bio yet"}
                  </div>
                </div>
                <Button variant="secondary" size="sm" icon={<FiEdit2 className="h-3.5 w-3.5" />} onClick={openEditProfile}>
                  Edit
                </Button>
              </Card>
            ) : (
              <Card as="form" padding="lg" onSubmit={handleSaveProfile}>
                <h2 className="text-[14px] font-semibold text-ink mb-4">Edit profile</h2>
                <div className="space-y-4">
                  <div>
                    <Label>Display name</Label>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={80} autoFocus />
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={280}
                      rows={3}
                      placeholder="A short line about yourself (optional)"
                    />
                    <span className="mono text-[11px] text-ink-soft/70">{bio.length}/280</span>
                  </div>
                  <FieldError>{profileError}</FieldError>
                  <div className="flex items-center gap-2">
                    <Button type="submit" variant="primary" loading={savingProfile} disabled={!profileDirty}>
                      Save changes
                    </Button>
                    <Button type="button" variant="ghost" icon={<FiX className="h-3.5 w-3.5" />} onClick={cancelEditProfile} disabled={savingProfile}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <Card as="form" padding="lg" onSubmit={handleChangePassword}>
              <h2 className="text-[14px] font-semibold text-ink mb-4 flex items-center gap-1.5">
                <FiLock aria-hidden="true" /> Change password
              </h2>
              <div className="space-y-4">
                <div>
                  <Label>Current password</Label>
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
                </div>
                <div>
                  <Label>New password</Label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
                </div>
                <div>
                  <Label>Confirm new password</Label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                </div>
                <FieldError>{passwordError}</FieldError>
                <Button type="submit" variant="primary" loading={savingPassword} disabled={!currentPassword || !newPassword || !confirmPassword}>
                  Change password
                </Button>
              </div>
            </Card>
          </div>

          <Card padding="lg">
            <h2 className="text-[14px] font-semibold text-ink mb-2 flex items-center gap-1.5">
              <FiDownload aria-hidden="true" /> Your data
            </h2>
            <p className="text-[13px] text-ink-soft mb-3">
              Download everything on this page &mdash; progress, achievements, contest and submission stats, recent
              activity &mdash; as a JSON file.
            </p>
            <Button variant="secondary" size="sm" icon={<FiDownload className="h-3.5 w-3.5" />} onClick={handleExportData}>
              Download my data
            </Button>
          </Card>

          <Card padding="lg" className="border-hard/30">
            <h2 className="text-[14px] font-semibold text-hard mb-2 flex items-center gap-1.5">
              <FiAlertTriangle aria-hidden="true" /> Danger zone
            </h2>
            <p className="text-[13px] text-ink-soft mb-3">
              Permanently delete your account and everything in it -- every problem status, note, bookmark,
              submission, and contest session. This can&rsquo;t be undone.
            </p>
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
              Delete account
            </Button>
          </Card>
        </div>
      )}

      <Modal
        open={deleteOpen}
        onClose={closeDeleteDialog}
        title="Delete your account?"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeDeleteDialog} disabled={deleting}>
              Cancel
            </Button>
            <Button type="submit" form="delete-account-form" variant="danger" loading={deleting} disabled={!deletePassword}>
              Permanently delete
            </Button>
          </>
        }
      >
        <form onSubmit={handleDeleteAccount} id="delete-account-form">
          <p className="text-[13.5px] text-ink-soft mb-4">
            This permanently deletes <strong className="text-ink">{user.email}</strong> and everything tied to it.
            There&rsquo;s no undo. Enter your password to confirm.
          </p>
          <Label>Current password</Label>
          <Input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} autoComplete="current-password" autoFocus />
          <FieldError>{deleteError}</FieldError>
        </form>
      </Modal>
    </div>
  );
}

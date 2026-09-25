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
  FiUser,
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
import { initials, computeLevel } from "../profileIdentity.js";
import { useFocusTrap } from "../../hooks/useFocusTrap.js";

/** A small styled toggle switch backed by a real checkbox input, for boolean prefs. */
function ToggleSwitch({ checked, onChange, disabled, label }) {
  return (
    <label className={`toggle-switch ${disabled ? "disabled" : ""}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} aria-label={label} />
      <span className="toggle-track">
        <span className="toggle-thumb" />
      </span>
    </label>
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

// Duplicated in miniature from VerdictBreakdown.jsx/LanguageUsage.jsx (not exported there) --
// small enough that importing would mean exporting internals of a component just for this.
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
  const deleteTrapRef = useFocusTrap(deleteOpen);

  const loadProfile = () => {
    setLoadError(null);
    fetchProfile()
      .then((res) => {
        updateUser({ displayName: res.displayName, bio: res.bio, createdAt: res.createdAt });
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
    <div className="dashboard profile">
      <div
        className="dashboard-card profile-identity-card"
      >
        <span className="profile-avatar" aria-hidden="true">
          {initials(user.displayName || user.email) || <FiUser />}
        </span>
        <div className="profile-identity-body">
          <div className="profile-name-row">
            <h2 className="profile-name">{user.displayName}</h2>
            <span className="chip profile-level-chip">
              <FiAward aria-hidden="true" /> {level.title}
            </span>
          </div>

          <div className="profile-meta-row">
            <span>{user.email}</span>
            {memberSince && (
              <>
                <span className="profile-meta-dot" aria-hidden="true">
                  &middot;
                </span>
                <span>
                  <FiCalendar aria-hidden="true" /> Member since {memberSince}
                </span>
              </>
            )}
          </div>

          {user.bio && <p className="profile-bio">{user.bio}</p>}

          {level.next && (
            <div className="profile-level-progress" title={`${level.solved}/${level.nextMin} to ${level.next}`}>
              <span className="profile-level-progress-label mono">LVL</span>
              <div className="topic-bar-track profile-xp-track">
                <div className="topic-bar-fill profile-xp-fill" style={{ width: `${level.progress}%` }} />
              </div>
              <span className="profile-level-next mono">{level.nextMin - level.solved} to {level.next}</span>
            </div>
          )}
        </div>
        {onOpenShare && (
          <button className="profile-share-btn" onClick={onOpenShare}>
            <FiShare2 aria-hidden="true" /> Share progress
          </button>
        )}
      </div>

      <div className="profile-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "overview"}
          className={`profile-tab ${tab === "overview" ? "active" : ""}`}
          onClick={() => setTab("overview")}
        >
          Overview
        </button>
        <button
          role="tab"
          aria-selected={tab === "settings"}
          className={`profile-tab ${tab === "settings" ? "active" : ""}`}
          onClick={() => setTab("settings")}
        >
          <FiSliders aria-hidden="true" /> Settings
        </button>
      </div>

      {tab === "overview" && (
      <>

      <div className="profile-section-label">Your progress</div>

      <div className="dashboard-top">
        <div className="dashboard-card dashboard-ring-card">
          <h2>Overall progress</h2>
          <ProgressRing done={allStats?.done ?? 0} total={allStats?.total ?? 0} />
          <p className="profile-ring-caption">Across every sheet{activeSheetName ? ` — you're viewing ${activeSheetName}` : ""}</p>
        </div>
        <div className="dashboard-card">
          <h2>Stats</h2>
          <div className="profile-mini-stats profile-mini-stats-wide">
            <div className="profile-mini-stat">
              <span className={`hero-stat-icon icon-flame ${allStats?.currentStreak > 0 ? "flame-active" : ""}`} aria-hidden="true">
                <GiFlame />
              </span>
              <span className="profile-mini-value mono">{allStats ? allStats.currentStreak : "—"}</span>
              <span className="profile-mini-label">current streak</span>
            </div>
            <div className="profile-mini-stat">
              <span className="profile-mini-value mono">{allStats ? allStats.longestStreak : "—"}</span>
              <span className="profile-mini-label">longest streak</span>
            </div>
            <div className="profile-mini-stat">
              <span className="profile-mini-value mono">{allStats ? allStats.bookmarked : "—"}</span>
              <span className="profile-mini-label">bookmarked</span>
            </div>
            <div className="profile-mini-stat">
              <span className="profile-mini-value mono">
                {rank && rank !== "unranked" && rank !== null ? `#${rank.position}` : "—"}
              </span>
              <span className="profile-mini-label">
                {rank && rank !== "unranked" && rank !== null ? `of ${rank.of} rank` : "leaderboard rank"}
              </span>
            </div>
            <div className="profile-mini-stat">
              <span className="profile-mini-value mono">
                {analytics ? `${Math.round(analytics.acceptanceRate * 100)}%` : "—"}
              </span>
              <span className="profile-mini-label">acceptance rate</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <h2><FiActivity aria-hidden="true" /> Daily activity, every sheet</h2>
        {allTopicsError ? (
          <ErrorState message={allTopicsError} onRetry={loadAllTopics} />
        ) : !allStats ? (
          <LoadingState label="Crunching your stats…" />
        ) : (
          <StreakCalendar
            dayCounts={allStats.dayCounts}
            currentStreak={allStats.currentStreak}
            longestStreak={allStats.longestStreak}
          />
        )}
      </div>

      <div className="dashboard-top">
        <div className="dashboard-card">
          <h2><FiPieChart aria-hidden="true" /> By difficulty, every sheet</h2>
          {allStats ? <DifficultyBreakdown byDifficulty={allStats.byDifficulty} /> : <LoadingState label="Loading…" />}
        </div>

        <div className="dashboard-card">
          <h2><FiLayers aria-hidden="true" /> By sheet</h2>
          {sheetStatsError ? (
            <ErrorState message={sheetStatsError} onRetry={loadSheetStats} />
          ) : !sheetStats ? (
            <LoadingState label="Loading…" />
          ) : (
            <div className="profile-sheet-breakdown">
              {sheetStats.map(([sheet, s]) => {
                const pct = s.total === 0 ? 0 : Math.round((s.done / s.total) * 100);
                return (
                  <div className="profile-sheet-row" key={sheet.slug}>
                    <span className="profile-sheet-name">{sheet.name}</span>
                    <div className="topic-bar-track">
                      <div className="topic-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="topic-bar-count mono">
                      {s.done}/{s.total}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="profile-section-label">Your activity</div>

      <div className="dashboard-top">
        <div className="dashboard-card">
          <h2><FiFlag aria-hidden="true" /> Contest activity</h2>
          {contestsError ? (
            <ErrorState message={contestsError} onRetry={loadContests} />
          ) : !contests ? (
            <LoadingState label="Loading…" />
          ) : !contestStats ? (
            <div className="profile-empty-note profile-empty-note-block">
              <p>No contests yet — try a timed challenge to see your stats here.</p>
              {onNavigateToContest && (
                <button type="button" className="ghost-btn-light" onClick={onNavigateToContest}>
                  Start a contest
                </button>
              )}
            </div>
          ) : (
            <div className="profile-mini-stats">
              <div className="profile-mini-stat">
                <span className="profile-mini-value mono">{contestStats.played}</span>
                <span className="profile-mini-label">played</span>
              </div>
              <div className="profile-mini-stat">
                <span className="profile-mini-value mono">{contestStats.finished}</span>
                <span className="profile-mini-label">finished</span>
              </div>
              <div className="profile-mini-stat">
                <span className="profile-mini-value mono">{contestStats.totalSolved}</span>
                <span className="profile-mini-label">problems solved</span>
              </div>
              {contestStats.best && (
                <div className="profile-mini-stat">
                  <span className="profile-mini-value mono">
                    {contestStats.best.solvedCount}/{contestStats.best.totalCount}
                  </span>
                  <span className="profile-mini-label">best result</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h2><FiCode aria-hidden="true" /> Submission stats</h2>
          {analyticsError ? (
            <ErrorState message={analyticsError} onRetry={loadAnalytics} />
          ) : !analytics ? (
            <LoadingState label="Loading…" />
          ) : analytics.totalSubmissions === 0 ? (
            <p className="profile-empty-note">No submissions yet — run or submit a solution to see your stats here.</p>
          ) : (
            <div className="profile-mini-stats">
              <div className="profile-mini-stat">
                <span className="profile-mini-value mono">{analytics.totalSubmissions}</span>
                <span className="profile-mini-label">submissions</span>
              </div>
              <div className="profile-mini-stat">
                <span className={`chip insights-acceptance-chip tier-${acceptanceTier(analytics.acceptanceRate)} mono`}>
                  {Math.round(analytics.acceptanceRate * 100)}% accepted
                </span>
              </div>
              {topLanguage(analytics.byLanguage) && (
                <div className="profile-mini-stat">
                  <span className="profile-mini-value">{topLanguage(analytics.byLanguage)}</span>
                  <span className="profile-mini-label">top language</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card">
        <h2><FiClock aria-hidden="true" /> Recent activity</h2>
        {!allTopics ? (
          <LoadingState label="Loading…" />
        ) : recent.length === 0 ? (
          <p className="profile-empty-note">Nothing solved yet -- your recent solves will show up here.</p>
        ) : (
          <ul className="profile-recent-list">
            {recent.map((p) => (
              <li className="profile-recent-row" key={p.id}>
                <FiCheckCircle className="profile-recent-icon" aria-hidden="true" />
                <span className="profile-recent-title">{p.title}</span>
                <span className={`chip pill diff-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                <span className="profile-recent-date mono">{RECENT_DATE_FMT.format(new Date(p.completedAt))}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {stats && (
        <>
          <div className="profile-section-label">Achievements</div>
          <div className="dashboard-card profile-achievements-card">
            <h2><FiAward aria-hidden="true" /> Achievements</h2>
            <Achievements stats={stats} />
          </div>
        </>
      )}

      </>
      )}

      {tab === "settings" && (
      <>

      <div className="dashboard-card profile-prefs-card">
        <h2><FiSettings aria-hidden="true" /> Preferences</h2>

        <div className="profile-pref-group">
          <h3 className="profile-pref-group-label"><FiSun aria-hidden="true" /> Appearance</h3>
          <div className="profile-prefs">
            <div className="profile-pref-row">
              <div className="profile-pref-label">
                <span>Theme</span>
                <span className="profile-pref-hint">{isDark ? "Dark" : "Light"}</span>
              </div>
              <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
            </div>

            <div className="profile-pref-row profile-pref-row-wrap">
              <div className="profile-pref-label">
                <span>Accent color</span>
                <span className="profile-pref-hint">{ACCENTS[accent]?.label}</span>
              </div>
              <div className="profile-accent-swatches">
                {ACCENT_ORDER.map((key) => (
                  <button
                    key={key}
                    className={`accent-swatch ${accent === key ? "active" : ""}`}
                    style={{ background: ACCENTS[key].swatch }}
                    title={ACCENTS[key].label}
                    aria-label={ACCENTS[key].label}
                    aria-pressed={accent === key}
                    onClick={() => onAccentChange(key)}
                  >
                    {accent === key && <FiCheck className="accent-swatch-check" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-pref-group">
          <h3 className="profile-pref-group-label"><FiBell aria-hidden="true" /> Notifications</h3>

          {!notifSupported ? (
            <p className="profile-pref-note profile-pref-note-muted">
              Notifications aren&rsquo;t supported in this browser.
            </p>
          ) : (
            <div className="profile-prefs">
              <div className="profile-pref-row">
                <span>Daily reminders</span>
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
                <p className="profile-pref-note profile-pref-note-warn">
                  <FiAlertTriangle aria-hidden="true" /> Blocked for this site &mdash; re-enable notifications in
                  your browser&rsquo;s site settings.
                </p>
              )}
              <div className="profile-pref-row">
                <span>Remind me at</span>
                <input
                  type="time"
                  className="profile-time-input"
                  value={notifPrefs.dailyTime}
                  disabled={!notifPrefs.enabled}
                  onChange={(e) => onNotifPrefsChange({ dailyTime: e.target.value })}
                />
              </div>
              <div className="profile-pref-row">
                <span>Due reviews</span>
                <ToggleSwitch
                  label="Due reviews"
                  checked={notifPrefs.reviewDue}
                  disabled={!notifPrefs.enabled}
                  onChange={(e) => onNotifPrefsChange({ reviewDue: e.target.checked })}
                />
              </div>
              <div className="profile-pref-row">
                <span>Streak at risk</span>
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
      </div>

      <div className="dashboard-top">
        {!editOpen ? (
          <div className="dashboard-card profile-form">
            <h2>Edit profile</h2>
            <p className="profile-edit-summary">
              <span className="profile-edit-summary-name">{user.displayName}</span>
              {user.bio && <span className="profile-edit-summary-bio">{user.bio}</span>}
              {!user.bio && <span className="profile-edit-summary-bio profile-edit-summary-empty">No bio yet</span>}
            </p>
            <button type="button" className="ghost-btn" onClick={openEditProfile}>
              <FiEdit2 aria-hidden="true" /> Edit
            </button>
          </div>
        ) : (
          <form className="dashboard-card profile-form" onSubmit={handleSaveProfile}>
            <h2>Edit profile</h2>
            <label className="auth-field">
              <span>Display name</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
                autoFocus
              />
            </label>
            <label className="auth-field">
              <span>Bio</span>
              <textarea
                className="profile-bio-input"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={280}
                rows={3}
                placeholder="A short line about yourself (optional)"
              />
              <span className="profile-char-count mono">{bio.length}/280</span>
            </label>
            {profileError && <p className="auth-error">{profileError}</p>}
            <div className="profile-edit-actions">
              <button type="submit" className="submit-btn" disabled={savingProfile || !profileDirty}>
                {savingProfile ? "Saving…" : "Save changes"}
              </button>
              <button type="button" className="ghost-btn-light" onClick={cancelEditProfile} disabled={savingProfile}>
                <FiX aria-hidden="true" /> Cancel
              </button>
            </div>
          </form>
        )}

        <form className="dashboard-card profile-form" onSubmit={handleChangePassword}>
          <h2>
            <FiLock aria-hidden="true" /> Change password
          </h2>
          <label className="auth-field">
            <span>Current password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <label className="auth-field">
            <span>New password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </label>
          <label className="auth-field">
            <span>Confirm new password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </label>
          {passwordError && <p className="auth-error">{passwordError}</p>}
          <button
            type="submit"
            className="submit-btn"
            disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
          >
            {savingPassword ? "Updating…" : "Change password"}
          </button>
        </form>
      </div>

      <div className="dashboard-card">
        <h2><FiDownload aria-hidden="true" /> Your data</h2>
        <p className="profile-danger-note">
          Download everything on this page &mdash; progress, achievements, contest and submission
          stats, recent activity &mdash; as a JSON file.
        </p>
        <button type="button" className="ghost-btn-light" onClick={handleExportData}>
          <FiDownload aria-hidden="true" /> Download my data
        </button>
      </div>

      <div className="dashboard-card profile-danger-card">
        <h2>
          <FiAlertTriangle aria-hidden="true" /> Danger zone
        </h2>
        <p className="profile-danger-note">
          Permanently delete your account and everything in it -- every problem status, note,
          bookmark, submission, and contest session. This can&rsquo;t be undone.
        </p>
        <button className="profile-danger-btn" onClick={() => setDeleteOpen(true)}>
          Delete account
        </button>
      </div>

      </>
      )}

      {deleteOpen && (
        <div className="confirm-overlay" onMouseDown={closeDeleteDialog}>
          <form
            ref={deleteTrapRef}
            className="confirm-panel profile-delete-panel"
            onMouseDown={(e) => e.stopPropagation()}
            onSubmit={handleDeleteAccount}
            role="alertdialog"
            aria-modal="true"
            aria-label="Delete account"
          >
            <h3>
              <FiAlertTriangle aria-hidden="true" /> Delete your account?
            </h3>
            <p>
              This permanently deletes <strong>{user.email}</strong> and everything tied to it.
              There&rsquo;s no undo. Enter your password to confirm.
            </p>
            <label className="auth-field">
              <span>Current password</span>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
              />
            </label>
            {deleteError && <p className="auth-error">{deleteError}</p>}
            <div className="confirm-actions">
              <button type="button" className="ghost-btn-light" onClick={closeDeleteDialog} disabled={deleting}>
                Cancel
              </button>
              <button type="submit" className="confirm-danger-btn" disabled={deleting || !deletePassword}>
                {deleting ? "Deleting…" : "Permanently delete"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

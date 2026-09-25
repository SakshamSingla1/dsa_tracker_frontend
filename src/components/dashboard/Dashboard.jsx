import { useEffect, useMemo, useState } from "react";
import ProgressRing from "./ProgressRing.jsx";
import TopicBars from "./TopicBars.jsx";
import DifficultyBreakdown from "./DifficultyBreakdown.jsx";
import StreakCalendar from "./StreakCalendar.jsx";
import AnimatedNumber from "./AnimatedNumber.jsx";
import Achievements from "./Achievements.jsx";
import { computeSheetStats } from "./date-utils.js";
import { fetchProgressSummary } from "../../api/client.js";
import { LoadingState, ErrorState } from "../InlineState.jsx";

export default function Dashboard({ topics }) {
  // "all" pools every sheet's progress so switching the active sheet doesn't reset your
  // visible streak/achievements -- that's the whole point of tracking them. "sheet" shows
  // just the currently selected sheet, for when you want to see how *this* list is going.
  const [scope, setScope] = useState("all");
  const [allTopics, setAllTopics] = useState(null);
  const [allTopicsError, setAllTopicsError] = useState(null);

  const loadAllTopics = () => {
    setAllTopicsError(null);
    fetchProgressSummary("all")
      .then(setAllTopics)
      .catch(() => setAllTopicsError("Couldn't load your progress across sheets."));
  };

  useEffect(() => {
    if (scope === "all" && allTopics === null && !allTopicsError) loadAllTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const activeTopics = scope === "all" ? allTopics : topics;
  const stats = useMemo(() => (activeTopics ? computeSheetStats(activeTopics) : null), [activeTopics]);

  return (
    <div className="dashboard">
      <div className="view-switch dashboard-scope-switch" role="group" aria-label="Stats scope">
        <button className={`view-tab ${scope === "all" ? "active" : ""}`} onClick={() => setScope("all")}>
          All sheets
        </button>
        <button className={`view-tab ${scope === "sheet" ? "active" : ""}`} onClick={() => setScope("sheet")}>
          This sheet
        </button>
      </div>

      {scope === "all" && allTopicsError && <ErrorState message={allTopicsError} onRetry={loadAllTopics} />}

      {!stats ? (
        <LoadingState label="Crunching your stats…" />
      ) : (
        <>
          <div className="dashboard-top">
            <div className="dashboard-card dashboard-ring-card">
              <h2>Overall progress</h2>
              <ProgressRing done={stats.done} total={stats.total} />
              <div className="dashboard-stat-row">
                <div className="dashboard-stat-tile">
                  <AnimatedNumber value={stats.total} />
                  <span>Total</span>
                </div>
                <div className="dashboard-stat-tile">
                  <AnimatedNumber value={stats.done} />
                  <span>Done</span>
                </div>
                <div className="dashboard-stat-tile">
                  <AnimatedNumber value={stats.revise} />
                  <span>Revise</span>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <h2>By difficulty</h2>
              <DifficultyBreakdown byDifficulty={stats.byDifficulty} />
            </div>
          </div>

          <div className="dashboard-card">
            <h2>Daily activity</h2>
            <StreakCalendar
              dayCounts={stats.dayCounts}
              currentStreak={stats.currentStreak}
              longestStreak={stats.longestStreak}
            />
          </div>

          <div className="dashboard-card">
            <h2>Achievements</h2>
            <Achievements stats={stats} />
          </div>

          <div className="dashboard-card">
            <h2>By topic</h2>
            <TopicBars topics={activeTopics} />
          </div>
        </>
      )}
    </div>
  );
}

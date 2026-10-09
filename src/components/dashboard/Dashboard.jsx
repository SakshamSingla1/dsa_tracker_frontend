import { useEffect, useMemo, useState } from "react";
import ProgressRing from "./ProgressRing.jsx";
import TopicBars from "./TopicBars.jsx";
import DifficultyBreakdown from "./DifficultyBreakdown.jsx";
import StreakCalendar from "./StreakCalendar.jsx";
import AnimatedNumber from "./AnimatedNumber.jsx";
import Achievements from "./Achievements.jsx";
import Recommendations from "./Recommendations.jsx";
import CoachNote from "./CoachNote.jsx";
import { computeSheetStats } from "./date-utils.js";
import { fetchProgressSummary } from "../../api/client.js";
import { LoadingState, ErrorState } from "../InlineState.jsx";
import { Card, Tabs } from "../ui/index.js";

function StatTile({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <AnimatedNumber value={value} className="mono text-2xl font-bold text-ink" />
      <span className="text-[12px] text-ink-soft">{label}</span>
    </div>
  );
}

export default function Dashboard({ topics, onSolve }) {
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
    <div className="space-y-5">
      <Tabs
        items={[
          { value: "all", label: "All sheets" },
          { value: "sheet", label: "This sheet" },
        ]}
        value={scope}
        onChange={setScope}
      />

      {scope === "all" && allTopicsError && <ErrorState message={allTopicsError} onRetry={loadAllTopics} />}

      {!stats ? (
        <LoadingState label="Crunching your stats…" />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card padding="lg">
              <h2 className="text-[14px] font-semibold text-ink mb-5">Overall progress</h2>
              <div className="flex flex-col items-center gap-5">
                <ProgressRing done={stats.done} total={stats.total} />
                <div className="flex gap-8">
                  <StatTile value={stats.total} label="Total" />
                  <StatTile value={stats.done} label="Done" />
                  <StatTile value={stats.revise} label="Revise" />
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <h2 className="text-[14px] font-semibold text-ink mb-5">By difficulty</h2>
              <DifficultyBreakdown byDifficulty={stats.byDifficulty} />
            </Card>
          </div>

          <Card padding="lg">
            <h2 className="text-[14px] font-semibold text-ink mb-5">Daily activity</h2>
            <StreakCalendar dayCounts={stats.dayCounts} currentStreak={stats.currentStreak} longestStreak={stats.longestStreak} />
          </Card>

          <Card padding="lg">
            <h2 className="text-[14px] font-semibold text-ink mb-4">Recommended for you</h2>
            <CoachNote />
            <Recommendations onSolve={onSolve} />
          </Card>

          <Card padding="lg">
            <h2 className="text-[14px] font-semibold text-ink mb-4">Achievements</h2>
            <Achievements stats={stats} />
          </Card>

          <Card padding="lg">
            <h2 className="text-[14px] font-semibold text-ink mb-4">By topic</h2>
            <TopicBars topics={activeTopics} />
          </Card>
        </>
      )}
    </div>
  );
}

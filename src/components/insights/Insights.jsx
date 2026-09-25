import { useEffect, useState } from "react";
import { fetchAnalyticsSummary } from "../../api/client.js";
import { LoadingState, ErrorState } from "../InlineState.jsx";
import SubmissionTrend from "./SubmissionTrend.jsx";
import VerdictBreakdown from "./VerdictBreakdown.jsx";
import LanguageUsage from "./LanguageUsage.jsx";
import WeakSpots from "./WeakSpots.jsx";

const DAYS = 90;

export default function Insights() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    fetchAnalyticsSummary(DAYS)
      .then(setSummary)
      .catch(() => setError("Couldn't load your submission history."));
  };

  useEffect(load, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!summary) return <LoadingState label="Crunching your submissions…" />;

  return (
    <div className="dashboard insights">
      <div className="dashboard-top">
        <div className="dashboard-card">
          <h2>Activity</h2>
          <SubmissionTrend dailyActivity={summary.dailyActivity} days={DAYS} />
        </div>

        <div className="dashboard-card">
          <h2>Verdicts</h2>
          <VerdictBreakdown byVerdict={summary.byVerdict} acceptanceRate={summary.acceptanceRate} />
        </div>
      </div>

      <div className="dashboard-top">
        <div className="dashboard-card">
          <h2>Languages</h2>
          <LanguageUsage byLanguage={summary.byLanguage} />
        </div>

        <div className="dashboard-card">
          <h2>Weak spots</h2>
          <WeakSpots byTopic={summary.byTopic} />
        </div>
      </div>
    </div>
  );
}

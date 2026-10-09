import { useEffect, useState } from "react";
import { fetchAnalyticsSummary } from "../../api/client.js";
import { LoadingState, ErrorState } from "../InlineState.jsx";
import { Card } from "../ui/index.js";
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card padding="lg">
        <h2 className="text-[14px] font-semibold text-ink mb-4">Activity</h2>
        <SubmissionTrend dailyActivity={summary.dailyActivity} days={DAYS} />
      </Card>

      <Card padding="lg">
        <h2 className="text-[14px] font-semibold text-ink mb-4">Verdicts</h2>
        <VerdictBreakdown byVerdict={summary.byVerdict} acceptanceRate={summary.acceptanceRate} />
      </Card>

      <Card padding="lg">
        <h2 className="text-[14px] font-semibold text-ink mb-4">Languages</h2>
        <LanguageUsage byLanguage={summary.byLanguage} />
      </Card>

      <Card padding="lg">
        <h2 className="text-[14px] font-semibold text-ink mb-4">Weak spots</h2>
        <WeakSpots byTopic={summary.byTopic} />
      </Card>
    </div>
  );
}

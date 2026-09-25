import { FiAlertTriangle } from "react-icons/fi";
import InsightsEmptyState from "./InsightsEmptyState.jsx";

/** Topics with the lowest accepted/attempted ratio among topics you've actually attempted --
 *  a more honest "what needs work" signal than done/total, since it's driven by real submission
 *  outcomes rather than just whether a problem is currently marked done. */
export default function WeakSpots({ byTopic }) {
  const attempted = byTopic.filter((t) => t.attempted > 0);
  if (attempted.length === 0) {
    return <InsightsEmptyState message="Submit a few solutions and your weakest topics will show up here." />;
  }

  const ranked = [...attempted]
    .map((t) => ({ ...t, ratio: t.accepted / t.attempted }))
    .sort((a, b) => a.ratio - b.ratio || b.attempted - a.attempted)
    .slice(0, 5);

  return (
    <ul className="insights-weakspots">
      {ranked.map((t) => (
        <li key={t.topicName} className="insights-weakspot-row">
          <FiAlertTriangle className="insights-weakspot-icon" aria-hidden="true" />
          <span className="insights-weakspot-name">{t.topicName}</span>
          <span className="insights-weakspot-ratio mono">
            {t.accepted}/{t.attempted} accepted
          </span>
        </li>
      ))}
    </ul>
  );
}

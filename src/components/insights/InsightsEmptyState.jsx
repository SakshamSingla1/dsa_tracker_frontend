import { FiBarChart2 } from "react-icons/fi";

/** Shared empty state for the Insights cards -- an icon + message so a fresh account with no
 *  submissions yet reads as "nothing here yet" rather than "this is broken". */
export default function InsightsEmptyState({ message }) {
  return (
    <div className="insights-empty">
      <FiBarChart2 className="insights-empty-icon" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

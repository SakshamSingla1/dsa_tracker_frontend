import { FiBarChart2 } from "react-icons/fi";

/** Shared empty state for the Insights cards -- an icon + message so a fresh account with no
 *  submissions yet reads as "nothing here yet" rather than "this is broken". */
export default function InsightsEmptyState({ message }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <FiBarChart2 className="h-7 w-7 text-ink-soft/50" aria-hidden="true" />
      <p className="text-[13px] text-ink-soft max-w-xs">{message}</p>
    </div>
  );
}

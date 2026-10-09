import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { recentActivity } from "../dashboard/date-utils.js";
import { Card } from "../ui/index.js";

const DATE_FMT = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });

export default function RecentActivityWidget({ topics, onViewAll }) {
  const recent = recentActivity(topics, 4);

  return (
    <Card padding="lg" hoverable className="animate-fade-up" style={{ animationDelay: "180ms" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13.5px] font-semibold text-ink">Recent Activity</h3>
        {onViewAll && (
          <button onClick={onViewAll} className="flex items-center gap-1 text-[11.5px] text-accent hover:underline">
            View All <FiArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {recent.length === 0 ? (
        <p className="text-[12.5px] text-ink-soft">Nothing solved yet — your recent solves will show up here.</p>
      ) : (
        <ul className="space-y-3">
          {recent.map((p) => (
            <li key={p.id} className="flex items-start gap-2.5">
              <span className="h-6 w-6 rounded-full bg-done-soft text-done flex items-center justify-center shrink-0 mt-0.5">
                <FiCheckCircle className="h-3 w-3" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] text-ink leading-snug">
                  Solved <span className="font-medium">{p.title}</span>
                </p>
                <p className="text-[11px] text-ink-soft">
                  {p.topicName} · {DATE_FMT.format(new Date(p.completedAt))}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

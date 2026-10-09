import { FiShuffle, FiPlay, FiTarget, FiMic } from "react-icons/fi";
import { Card } from "../ui/index.js";

const ACTIONS = (handlers) => [
  { label: "Random Problem", icon: FiShuffle, tone: "done", onClick: handlers.onRandom },
  { label: "Continue Sheet", icon: FiPlay, tone: "accent", onClick: handlers.onContinue },
  { label: "Weak Topics", icon: FiTarget, tone: "medium", onClick: handlers.onWeakTopics },
  { label: "Mock Test", icon: FiMic, tone: "cyan", onClick: handlers.onMockTest },
];

const TONE_CLASS = {
  done: "bg-done-soft text-done hover:brightness-95",
  accent: "bg-accent-soft text-accent hover:brightness-95",
  medium: "bg-medium-soft text-medium hover:brightness-95",
  cyan: "bg-cyan-soft text-cyan hover:brightness-95",
};

export default function QuickActionsWidget({ onRandom, onContinue, onWeakTopics, onMockTest }) {
  const actions = ACTIONS({ onRandom, onContinue, onWeakTopics, onMockTest });

  return (
    <Card padding="lg" hoverable className="animate-fade-up" style={{ animationDelay: "120ms" }}>
      <h3 className="text-[13.5px] font-semibold text-ink mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className={`flex flex-col items-start gap-2 rounded-lg px-3 py-2.5 text-left transition-all duration-200 hover:scale-[1.04] hover:shadow-md active:scale-[0.97] ${TONE_CLASS[a.tone]}`}
          >
            <a.icon className="h-4 w-4" aria-hidden="true" />
            <span className="text-[12px] font-medium leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

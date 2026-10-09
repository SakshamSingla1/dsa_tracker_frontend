import { FiCpu } from "react-icons/fi";
import { Badge, Button, Card, difficultyTone } from "../ui/index.js";

export default function InterviewResults({ session, onNewInterview }) {
  return (
    <Card padding="lg" className="max-w-2xl">
      <h2 className="text-[16px] font-semibold text-ink mb-3">Interview feedback</h2>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[13.5px] text-ink">{session.problemTitle}</span>
        <Badge tone={difficultyTone(session.problemDifficulty)}>{session.problemDifficulty}</Badge>
      </div>

      <div className="flex gap-3 rounded-lg border border-accent-line bg-accent-soft px-4 py-3 mb-4">
        <FiCpu className="text-accent shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-[13.5px] text-ink leading-relaxed">{session.feedback}</p>
      </div>

      <details className="mb-5">
        <summary className="text-[13px] font-medium text-accent cursor-pointer hover:underline">View full transcript</summary>
        <div className="space-y-3 mt-3" role="list">
          {session.messages.map((m) => (
            <div key={m.id} role="listitem" className={`flex gap-2.5 max-w-[85%] ${m.role === "USER" ? "ml-auto flex-row-reverse" : ""}`}>
              {m.role === "ASSISTANT" && (
                <span className="h-7 w-7 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
                  <FiCpu aria-hidden="true" className="h-3.5 w-3.5" />
                </span>
              )}
              <p
                className={`text-[13.5px] leading-relaxed rounded-lg px-3 py-2 whitespace-pre-wrap
                  ${m.role === "USER" ? "bg-accent text-accent-ink" : "bg-ink/[0.04] text-ink"}`}
              >
                {m.content}
              </p>
            </div>
          ))}
        </div>
      </details>

      <Button variant="primary" onClick={onNewInterview}>
        Start another interview
      </Button>
    </Card>
  );
}

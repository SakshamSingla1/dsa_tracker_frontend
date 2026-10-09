import { useState } from "react";
import { FiCpu } from "react-icons/fi";
import { Badge, Button, Card, difficultyTone, Textarea } from "../ui/index.js";

/** The active back-and-forth with the AI interviewer, plus an "End interview" button that
 *  asks it for a final verdict on the whole transcript. */
export default function InterviewRun({ session, onSendMessage, onEnd, sending, ending }) {
  const [body, setBody] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setBody("");
  };

  return (
    <Card padding="lg" className="max-w-2xl">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-[16px] font-semibold text-ink">{session.problemTitle}</h2>
        <Badge tone={difficultyTone(session.problemDifficulty)}>{session.problemDifficulty}</Badge>
      </div>

      <div className="space-y-3 max-h-[360px] overflow-y-auto mb-4 pr-1" role="list" aria-label="Interview transcript">
        {session.messages.map((m) => (
          <div
            key={m.id}
            role="listitem"
            className={`flex gap-2.5 max-w-[85%] ${m.role === "USER" ? "ml-auto flex-row-reverse" : ""}`}
          >
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

      {!session.aiAvailable && (
        <div className="rounded-lg bg-medium-soft text-medium text-[13px] px-3 py-2 mb-4">
          AI interviewer isn&rsquo;t configured for this app yet.
        </div>
      )}

      <form onSubmit={handleSend} className="flex gap-2 mb-4">
        <Textarea
          placeholder="Talk through your approach, or paste your code… (Enter to send, Shift+Enter for a new line)"
          rows={3}
          maxLength={4000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          className="flex-1"
        />
        <Button type="submit" variant="secondary" disabled={sending || !body.trim()}>
          {sending ? "…" : "Send"}
        </Button>
      </form>

      <Button variant="danger" onClick={onEnd} disabled={ending}>
        {ending ? "Wrapping up…" : "End interview"}
      </Button>
    </Card>
  );
}

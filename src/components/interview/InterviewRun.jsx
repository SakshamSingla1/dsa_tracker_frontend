import { useState } from "react";
import { FiCpu } from "react-icons/fi";

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
    <div className="interview-run glass-card">
      <div className="interview-run-header">
        <h2>{session.problemTitle}</h2>
        <span className={`chip pill diff-${session.problemDifficulty.toLowerCase()}`}>{session.problemDifficulty}</span>
      </div>

      <div className="tutor-chat-list interview-transcript" role="list" aria-label="Interview transcript">
        {session.messages.map((m) => (
          <div className={`tutor-chat-message tutor-chat-${m.role.toLowerCase()}`} role="listitem" key={m.id}>
            {m.role === "ASSISTANT" && <FiCpu className="tutor-chat-icon" aria-hidden="true" />}
            <p>{m.content}</p>
          </div>
        ))}
      </div>

      {!session.aiAvailable && (
        <div className="tutor-chat-unavailable">AI interviewer isn&rsquo;t configured for this app yet.</div>
      )}

      <form className="tutor-chat-form" onSubmit={handleSend}>
        <textarea
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
        />
        <button type="submit" className="ghost-btn-light" disabled={sending || !body.trim()}>
          {sending ? "…" : "Send"}
        </button>
      </form>

      <button className="submit-btn interview-end-btn" onClick={onEnd} disabled={ending}>
        {ending ? "Wrapping up…" : "End interview"}
      </button>
    </div>
  );
}

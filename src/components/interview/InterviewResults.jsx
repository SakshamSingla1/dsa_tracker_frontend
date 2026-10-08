import { FiCpu } from "react-icons/fi";

export default function InterviewResults({ session, onNewInterview }) {
  return (
    <div className="interview-results glass-card">
      <h2>Interview feedback</h2>
      <div className="interview-results-header">
        <span>{session.problemTitle}</span>
        <span className={`chip pill diff-${session.problemDifficulty.toLowerCase()}`}>{session.problemDifficulty}</span>
      </div>

      <div className="coach-note">
        <FiCpu className="coach-note-icon" aria-hidden="true" />
        <p className="coach-note-text">{session.feedback}</p>
      </div>

      <details className="interview-transcript-details">
        <summary>View full transcript</summary>
        <div className="tutor-chat-list interview-transcript">
          {session.messages.map((m) => (
            <div className={`tutor-chat-message tutor-chat-${m.role.toLowerCase()}`} role="listitem" key={m.id}>
              {m.role === "ASSISTANT" && <FiCpu className="tutor-chat-icon" aria-hidden="true" />}
              <p>{m.content}</p>
            </div>
          ))}
        </div>
      </details>

      <button className="submit-btn" onClick={onNewInterview}>
        Start another interview
      </button>
    </div>
  );
}

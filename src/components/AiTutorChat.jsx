import { useEffect, useState } from "react";
import { FiCpu, FiTrash2 } from "react-icons/fi";
import { clearTutorMessages, fetchTutorMessages, sendTutorMessage } from "../api/client.js";
import { LoadingState, ErrorState } from "./InlineState.jsx";
import { useToast } from "./ToastProvider.jsx";

/** Real multi-turn chat with an AI tutor about this specific problem -- unlike AiHintPanel's
 *  one-shot hint, this is a persisted back-and-forth the user can leave and resume. */
export default function AiTutorChat({ problemId, code, language }) {
  const toast = useToast();
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState(null);
  const [unavailable, setUnavailable] = useState(false);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const load = () => {
    setError(null);
    fetchTutorMessages(problemId)
      .then(setMessages)
      .catch(() => setError("Couldn't load the tutor chat."));
  };

  useEffect(load, [problemId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setSending(true);
    setUnavailable(false);
    sendTutorMessage(problemId, { content: trimmed, code, language })
      .then((res) => {
        setBody("");
        setMessages((prev) => [
          ...(prev ?? []),
          res.userMessage,
          ...(res.assistantMessage ? [res.assistantMessage] : []),
        ]);
        if (!res.available) setUnavailable(true);
      })
      .catch(() => toast.error("Couldn't reach the AI tutor."))
      .finally(() => setSending(false));
  };

  const handleClear = () => {
    const before = messages;
    setMessages([]);
    clearTutorMessages(problemId).catch(() => {
      setMessages(before);
      toast.error("Couldn't clear the chat.");
    });
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (messages === null) return <LoadingState label="Loading tutor chat…" />;

  return (
    <div className="tutor-chat">
      {messages.length === 0 ? (
        <div className="tutor-chat-empty">
          <FiCpu aria-hidden="true" />
          <span>Ask the AI tutor anything about this problem -- your approach, complexity, or your code.</span>
        </div>
      ) : (
        <>
          <div className="tutor-chat-list" role="list" aria-label="Tutor chat">
            {messages.map((m) => (
              <div className={`tutor-chat-message tutor-chat-${m.role.toLowerCase()}`} role="listitem" key={m.id}>
                {m.role === "ASSISTANT" && <FiCpu className="tutor-chat-icon" aria-hidden="true" />}
                <p>{m.content}</p>
              </div>
            ))}
          </div>
          <button className="ghost-btn-light tutor-chat-clear" onClick={handleClear} type="button">
            <FiTrash2 aria-hidden="true" /> Clear chat
          </button>
        </>
      )}

      {unavailable && (
        <div className="tutor-chat-unavailable">AI tutor isn&rsquo;t configured for this app yet -- your message was saved.</div>
      )}

      <form className="tutor-chat-form" onSubmit={handleSend}>
        <textarea
          placeholder="Ask about your approach, complexity, or your code… (Enter to send, Shift+Enter for a new line)"
          rows={2}
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
          {sending ? "Thinking…" : "Send"}
        </button>
      </form>
    </div>
  );
}

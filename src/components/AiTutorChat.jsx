import { useEffect, useState } from "react";
import { FiCpu, FiTrash2 } from "react-icons/fi";
import { clearTutorMessages, fetchTutorMessages, sendTutorMessage } from "../api/client.js";
import { LoadingState, ErrorState } from "./InlineState.jsx";
import { useToast } from "./ToastProvider.jsx";
import { Button, Textarea } from "./ui/index.js";

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
        setMessages((prev) => [...(prev ?? []), res.userMessage, ...(res.assistantMessage ? [res.assistantMessage] : [])]);
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
    <div className="space-y-3">
      {messages.length === 0 ? (
        <div className="flex items-center gap-2 text-[13px] text-ink-soft">
          <FiCpu aria-hidden="true" />
          <span>Ask the AI tutor anything about this problem -- your approach, complexity, or your code.</span>
        </div>
      ) : (
        <>
          <div className="space-y-2.5 max-h-72 overflow-y-auto" role="list" aria-label="Tutor chat">
            {messages.map((m) => (
              <div key={m.id} role="listitem" className={`flex gap-2 max-w-[90%] ${m.role === "USER" ? "ml-auto flex-row-reverse" : ""}`}>
                {m.role === "ASSISTANT" && (
                  <span className="h-6 w-6 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
                    <FiCpu aria-hidden="true" className="h-3 w-3" />
                  </span>
                )}
                <p
                  className={`text-[13px] leading-relaxed rounded-lg px-3 py-1.5 whitespace-pre-wrap
                    ${m.role === "USER" ? "bg-accent text-accent-ink" : "bg-ink/[0.04] text-ink"}`}
                >
                  {m.content}
                </p>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" icon={<FiTrash2 className="h-3.5 w-3.5" />} onClick={handleClear}>
            Clear chat
          </Button>
        </>
      )}

      {unavailable && (
        <div className="rounded-lg bg-medium-soft text-medium text-[12.5px] px-3 py-2">
          AI tutor isn&rsquo;t configured for this app yet -- your message was saved.
        </div>
      )}

      <form onSubmit={handleSend} className="flex gap-2">
        <Textarea
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
          className="flex-1"
        />
        <Button type="submit" variant="secondary" size="sm" disabled={sending || !body.trim()}>
          {sending ? "Thinking…" : "Send"}
        </Button>
      </form>
    </div>
  );
}

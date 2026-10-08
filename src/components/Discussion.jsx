import { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { fetchComments, postComment, deleteComment } from "../api/client.js";
import { LoadingState, ErrorState } from "./InlineState.jsx";
import { useToast } from "./ToastProvider.jsx";

// Small enough to duplicate rather than export an internal from SubmissionHistory.jsx for it.
function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function Discussion({ problemId }) {
  const toast = useToast();
  const [comments, setComments] = useState(null);
  const [error, setError] = useState(null);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const load = () => {
    setError(null);
    fetchComments(problemId)
      .then(setComments)
      .catch(() => setError("Couldn't load the discussion."));
  };

  useEffect(load, [problemId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePost = (e) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setPosting(true);
    postComment(problemId, trimmed)
      .then((created) => {
        setComments((prev) => [...(prev ?? []), created]);
        setBody("");
      })
      .catch(() => toast.error("Couldn't post that comment."))
      .finally(() => setPosting(false));
  };

  const handleDelete = (id) => {
    const before = comments;
    setComments((prev) => prev.filter((c) => c.id !== id));
    deleteComment(id).catch(() => {
      setComments(before);
      toast.error("Couldn't delete that comment.");
    });
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (comments === null) return <LoadingState label="Loading discussion…" />;

  return (
    <div className="discussion">
      {comments.length === 0 ? (
        <div className="discussion-empty">No discussion yet -- be the first to share your approach.</div>
      ) : (
        <div className="discussion-list" role="list" aria-label="Discussion">
          {comments.map((c) => (
            <div className="discussion-row" role="listitem" key={c.id}>
              <div className="discussion-row-header">
                <span className="discussion-author">{c.authorName}</span>
                <span className="discussion-time mono">{timeAgo(c.createdAt)}</span>
                {c.mine && (
                  <button
                    className="discussion-delete"
                    onClick={() => handleDelete(c.id)}
                    aria-label="Delete comment"
                    title="Delete comment"
                  >
                    <FiTrash2 aria-hidden="true" />
                  </button>
                )}
              </div>
              <p className="discussion-body">{c.body}</p>
            </div>
          ))}
        </div>
      )}

      <form className="discussion-form" onSubmit={handlePost}>
        <textarea
          placeholder="Share your approach, ask a question, or point out a gotcha… (Enter to post, Shift+Enter for a new line)"
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
        <button type="submit" className="ghost-btn-light" disabled={posting || !body.trim()}>
          {posting ? "Posting…" : "Post"}
        </button>
      </form>
    </div>
  );
}

import { useEffect, useState } from "react";
import { addComment, getComments } from "../api/comments-Supabase";

const MAX_LENGTH = 500;

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AlbumComments({ albumId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    let ignore = false;
    setComments([]);
    setError("");
    setLoading(true);

    getComments(albumId)
      .then((data) => { if (!ignore) setComments(data); })
      .catch((err) => { if (!ignore) setError(err.message); })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [albumId]);

  async function onSubmit(e) {
    e.preventDefault();
    const name = author.trim();
    const message = text.trim();
    if (!name || !message) return;

    setSending(true);
    setSendError("");
    try {
      const saved = await addComment({ albumId, author: name, text: message });
      setComments((prev) => [saved, ...prev]);
      setText("");
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  let statusText = "";
  if (loading) statusText = "Loading comments...";
  else if (error) statusText = `Could not load comments: ${error}`;
  else if (!comments.length) statusText = "No comments yet. Be the first to share your thoughts!";

  return (
    <div className="details-comments">
      <h2>
        Comments {!loading && !error && <span className="comments-count">({comments.length})</span>}
      </h2>

      <form className="comment-form" onSubmit={onSubmit}>
        <input
          type="text"
          className="comment-author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name"
          maxLength={50}
          aria-label="Your name"
          required
        />
        <textarea
          className="comment-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What do you think about this album?"
          maxLength={MAX_LENGTH}
          rows={4}
          aria-label="Your comment"
          required
        />
        <div className="comment-form-footer">
          <span className="comment-chars">{text.length}/{MAX_LENGTH}</span>
          <button
            type="submit"
            className="details-play"
            disabled={sending || !author.trim() || !text.trim()}
          >
            {sending ? "Posting..." : "Post Comment"}
          </button>
        </div>
        {sendError && <p className="comment-error">Could not post your comment: {sendError}</p>}
      </form>

      {statusText ? (
        <p className="catalog-subtitle">{statusText}</p>
      ) : (
        <ul className="comment-list">
          {comments.map((c) => (
            <li key={c.id} className="comment">
              <div className="comment-head">
                <span className="comment-name">{c.author}</span>
                <time className="comment-date" dateTime={c.created_at}>{formatDate(c.created_at)}</time>
              </div>
              <p className="comment-body">{c.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router";
import { addComment, deleteComment, getComments, updateComment } from "../api/comments-Supabase";
import { useAuth } from "../contexts/AuthContext";

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
  const { user, isLoggedIn, getSession } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    const message = text.trim();
    if (!message) return;

    setSending(true);
    setSendError("");
    try {
      const session = await getSession();
      const saved = await addComment(session, { albumId, content: message });
      setComments((prev) => [saved, ...prev]);
      setText("");
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function onEdit(commentId, content) {
    const session = await getSession();
    const saved = await updateComment(session, commentId, content);
    setComments((prev) => prev.map((c) => (c.id === commentId ? saved : c)));
  }

  async function onDelete(commentId) {
    const session = await getSession();
    await deleteComment(session, commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
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

      {isLoggedIn ? (
      <form className="comment-form" onSubmit={onSubmit}>
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
            disabled={sending || !text.trim()}
          >
            {sending ? "Posting..." : "Post Comment"}
          </button>
        </div>
        {sendError && <p className="comment-error">Could not post your comment: {sendError}</p>}
      </form>
      ) : (
        <p className="catalog-subtitle">
          <Link to="/login" state={{ from: `/albums/${albumId}`, message: "Log in to leave a comment." }}>
            Log in
          </Link>{" "}
          to leave a comment.
        </p>
      )}

      {statusText ? (
        <p className="catalog-subtitle">{statusText}</p>
      ) : (
        <ul className="comment-list">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              isOwn={Boolean(user) && c.user_id === user.id}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}


function CommentItem({ comment, isOwn, onEdit, onDelete }) {
  const [mode, setMode] = useState("view"); 
  const [draft, setDraft] = useState(comment.content);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function startEdit() {
    setDraft(comment.content);
    setError("");
    setMode("edit");
  }

  function cancel() {
    setError("");
    setMode("view");
  }

  async function run(action) {
    setBusy(true);
    setError("");
    try {
      await action();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function onSave(e) {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    if (content === comment.content) return setMode("view");
    if (await run(() => onEdit(comment.id, content))) setMode("view");
  }

  
  const confirmDelete = () => run(() => onDelete(comment.id));

  return (
    <li className="comment">
      <div className="comment-head">
        <span className="comment-name">{isOwn ? "You" : comment.author || "Listener"}</span>
        <span className="comment-date">
          <time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time>
          {comment.updated_at && (
            <span className="comment-edited" title={`Edited ${formatDate(comment.updated_at)}`}>
              {" "}· edited
            </span>
          )}
        </span>
      </div>

      {mode === "edit" ? (
        <form className="comment-edit" onSubmit={onSave}>
          <textarea
            className="comment-text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={MAX_LENGTH}
            rows={3}
            aria-label="Edit your comment"
            autoFocus
            required
          />
          <div className="comment-form-footer">
            <span className="comment-chars">{draft.length}/{MAX_LENGTH}</span>
            <div className="comment-actions">
              <button type="button" className="comment-btn" onClick={cancel} disabled={busy}>
                Cancel
              </button>
              <button type="submit" className="comment-btn is-primary" disabled={busy || !draft.trim()}>
                {busy ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="comment-body">{comment.content}</p>
      )}

      {isOwn && mode === "view" && (
        <div className="comment-actions">
          <button type="button" className="comment-btn" onClick={startEdit}>
            ✎ Edit
          </button>
          <button
            type="button"
            className="comment-btn is-danger"
            onClick={() => { setError(""); setMode("confirm-delete"); }}
          >
            🗑 Delete
          </button>
        </div>
      )}

      {mode === "confirm-delete" && (
        <div className="comment-actions comment-confirm" role="alert">
          <span>Delete this comment?</span>
          <button type="button" className="comment-btn" onClick={cancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="comment-btn is-danger" onClick={confirmDelete} disabled={busy}>
            {busy ? "Deleting..." : "Yes, delete"}
          </button>
        </div>
      )}

      {error && <p className="comment-error">{error}</p>}
    </li>
  );
}

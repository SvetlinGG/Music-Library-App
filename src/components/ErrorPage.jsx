import { Link, useNavigate } from "react-router";

// Shared heavy-metal error screen. Use it for 404s and for any page that failed to load.
//   code     – big number at the top ("404"); leave it out for errors without a status
//   title    – headline in the metal font
//   message  – one or two sentences explaining what happened
//   children – optional custom buttons (defaults to "Back to Catalog" + "Go Back")
export default function ErrorPage({ code, title, message, children }) {
  const navigate = useNavigate();

  return (
    <section className="error-page" aria-labelledby="error-title">
      <div className="error-stage">
        <svg className="error-bolt" viewBox="0 0 64 128" aria-hidden="true">
          <polygon points="38,0 6,72 30,72 18,128 58,48 34,48 50,0" />
        </svg>
        {code && (
          <p className="error-code" role="img" aria-label={`Error ${code}`}>
            <span className="error-code-ghost" aria-hidden="true">{code}</span>
            <span className="error-code-text" aria-hidden="true">{code}</span>
          </p>
        )}
      </div>

      <div className="error-spikes" aria-hidden="true" />

      <h1 id="error-title" className="error-title">{title}</h1>
      {message && <p className="error-message">{message}</p>}

      <div className="error-actions">
        {children ?? (
          <>
            <Link to="/" className="details-play">🤘 Back to Catalog</Link>
            <button type="button" className="details-fav" onClick={() => navigate(-1)}>
              ← Go Back
            </button>
          </>
        )}
      </div>
    </section>
  );
}

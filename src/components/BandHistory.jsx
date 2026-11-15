import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { getBandInfo } from "../api/wikipedia";
import ErrorPage from "./ErrorPage";
import NotFound from "./NotFound";


export default function BandHistory() {
  const { artistName } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();

  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setInfo(null);
    setError("");
    setLoading(true);

    getBandInfo(artistName)
      .then((data) => { if (!ignore) setInfo(data); })
      .catch((err) => { if (!ignore) setError(err.message); })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [artistName]);

  
  const cameFromApp = location.key !== "default";
  const goBack = () => (cameFromApp ? navigate(-1) : navigate("/"));

  if (loading) {
    return (
      <section className="catalog band-page">
        <p className="catalog-subtitle">Loading {artistName}'s story from Wikipedia...</p>
      </section>
    );
  }

  if (error) {
    return <ErrorPage title="The Amp Blew Up" message={`Could not load the band history. ${error}`} />;
  }

  if (!info) {
    return (
      <NotFound
        title="Band Not Found"
        message={`No Wikipedia article was found for "${artistName}". Check the name or pick a band from the catalog.`}
      />
    );
  }

  return (
    <section className="catalog band-page">
      <button type="button" className="details-back band-page-back" onClick={goBack}>
        ← {cameFromApp ? "Back" : "Back to Catalog"}
      </button>

      <header className="band-page-head">
        {info.thumbnail && <img className="band-page-photo" src={info.thumbnail} alt={info.title} />}
        <div>
          <span className="eyebrow">Band History</span>
          <h1>{info.title}</h1>
          {info.description && <p className="catalog-subtitle">{info.description}</p>}
        </div>
      </header>

      <div className="band-history-panel">
        <div className="band-history-text" tabIndex={0} aria-label={`History of ${info.title}`}>
          {info.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        <div className="band-page-footer">
          <a className="band-history-link" href={info.url} target="_blank" rel="noreferrer">
            Read more on Wikipedia →
          </a>
          <Link to="/" className="band-history-link">Browse the catalog</Link>
        </div>
      </div>

      <p className="band-page-credit">Text from Wikipedia, available under CC BY-SA 4.0.</p>
    </section>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { albums } from "../data/albums";
import { findAlbum, formatDuration, getAlbum, getSongs } from "../api/iTunes";
import YouTubePlayer from "./YouTubePlayer";
import AlbumComments from "./AlbumComments";
import BandHistory from "./BandHistory";
import ErrorPage from "./ErrorPage";
import NotFound from "./NotFound";
import { useAuth } from "../contexts/AuthContext";
import useCollection from "../hooks/useCollection";


function findLocalAlbum(albumId) {
  return albums.find((a) => String(a.id) === albumId) ?? null;
}

export default function AlbumDetails() {
  const { albumId } = useParams();

  const [album, setAlbum] = useState(() => findLocalAlbum(albumId));
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  
  const [nowPlaying, setNowPlaying] = useState(null);

  const { isLoggedIn } = useAuth();
  const { findItem, add, remove } = useCollection();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [collectionError, setCollectionError] = useState("");

  useEffect(() => {
    let ignore = false; 

    const local = findLocalAlbum(albumId);
    setAlbum(local);
    setSongs([]);
    setError("");
    setNotFound(false);
    setCoverFailed(false);
    setNowPlaying(null);
    setLoading(true);

    async function load() {
      let itunesId = albumId;

      if (local) {
        
        const found = await findAlbum(local.title, local.artist);
        if (!found) return [];
        itunesId = found.id;
      } else {
        const info = await getAlbum(albumId);
        if (ignore) return [];
        if (!info) {
          setNotFound(true);
          return [];
        }
        setAlbum({ ...info, title: info.album });
      }

      return getSongs(itunesId);
    }

    load()
      .then((tracks) => { if (!ignore) setSongs(tracks); })
      .catch((err) => { if (!ignore) setError(err.message); })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [albumId]);

  
  if (notFound) {
    return (
      <NotFound
        title="Album Not Found"
        message="This album was never pressed on vinyl. Check the link or pick something heavy from the catalog."
      />
    );
  }

  if (!album) {
    if (loading) {
      return (
        <section className="catalog details">
          <Link to="/" className="details-back">← Back to Catalog</Link>
          <p className="catalog-subtitle">Loading album...</p>
        </section>
      );
    }
    return (
      <ErrorPage
        title="The Amp Blew Up"
        message={`We could not load this album. ${error}`}
      />
    );
  }

  const { title, artist, year, genre, cover, releaseDate } = album;

  const isLocal = Boolean(findLocalAlbum(albumId));
  const cardAlbum = { id: album.id ?? albumId, title, artist, year, genre, cover };
  const savedRow = findItem(cardAlbum, isLocal);

  async function collectionHandler() {
    if (!isLoggedIn) {
      return navigate("/login", {
        state: { from: `/albums/${albumId}`, message: "Log in to add albums to your own collection." },
      });
    }
    setSaving(true);
    setCollectionError("");
    try {
      if (savedRow) await remove(savedRow.id);
      else await add(cardAlbum, isLocal);
    } catch (err) {
      setCollectionError(err.message);
    } finally {
      setSaving(false);
    }
  }
  const totalLength = songs.reduce((sum, s) => sum + (s.length ?? 0), 0);
  const hasManyDiscs = songs.some((s) => s.disc > 1);

  let tracksText = "";
  if (loading) tracksText = "Loading tracklist from iTunes...";
  else if (error) tracksText = `Could not load the tracklist: ${error}`;
  else if (!songs.length) tracksText = "No tracklist found for this album.";

  return (
    <section className="catalog details">
      <Link to="/" className="details-back">
        ← Back to Catalog
      </Link>

      <div className="details-layout">
        <div className="details-cover">
          <div className="details-vinyl" aria-hidden="true" />
          {cover && !coverFailed ? (
            <img
              className="details-cover-art details-cover-img"
              src={cover}
              alt={`${title} by ${artist}`}
              onError={() => setCoverFailed(true)}
            />
          ) : (
            <div className="details-cover-art" role="img" aria-label={`${title} by ${artist}`}>
              <span className="cover-artist">{artist}</span>
              <span className="cover-title">{title}</span>
            </div>
          )}
        </div>

        <div className="details-info">
          <span className="eyebrow">Album</span>
          <h1>{title}</h1>
          <p className="details-artist">{artist}</p>

          <ul className="details-meta">
            <li>
              <span className="meta-label">Year</span>
              <span className="meta-value">{year || "—"}</span>
            </li>
            <li>
              <span className="meta-label">Genre</span>
              <span className="meta-value">{genre || "—"}</span>
            </li>
            <li>
              <span className="meta-label">Tracks</span>
              <span className="meta-value">{loading ? "…" : songs.length}</span>
            </li>
            {totalLength > 0 && (
              <li>
                <span className="meta-label">Length</span>
                <span className="meta-value">{formatDuration(totalLength)}</span>
              </li>
            )}
          </ul>

          <p className="details-description">
            {releaseDate ? `First released on ${releaseDate}.` : year ? `Released in ${year}.` : ""}
            {" "}{findLocalAlbum(albumId) ? "Tracklist" : "Album data and tracklist"} from iTunes.
          </p>

          <div className="details-actions">
            <button className="details-play" onClick={() => setNowPlaying({ song: "" })}>
              ▶ Play
            </button>
            <button className="details-fav" onClick={collectionHandler} disabled={saving}>
              {saving ? "Saving..." : savedRow ? "✓ In Collection · Remove" : "+ Add to Collection"}
            </button>
          </div>
          {collectionError && <p className="auth-error" role="alert">{collectionError}</p>}
          {savedRow && !saving && (
            <p className="auth-success" role="status">
              This album is in your collection. <Link to="/my-collection">View My Collection →</Link>
            </p>
          )}

          <BandHistory artist={artist} />

          {nowPlaying && (
            <YouTubePlayer
              artist={artist}
              album={title}
              song={nowPlaying.song}
              onClose={() => setNowPlaying(null)}
            />
          )}
        </div>
      </div>

      <div className="details-tracks">
        <h2>Tracklist</h2>
        {tracksText ? (
          <p className="catalog-subtitle">{tracksText}</p>
        ) : (
          <ol>
            {songs.map((song) => (
              <li key={song.id} className={nowPlaying?.song === song.title ? "is-playing" : ""}>
                <button
                  className="track-btn"
                  onClick={() => setNowPlaying({ song: song.title })}
                  aria-label={`Play ${song.title}`}
                >
                  <span className="track-no">
                    {hasManyDiscs ? `${song.disc}.${song.position}` : song.position}
                  </span>
                  <span className="track-title">{song.title}</span>
                  <span className="track-time">{song.duration}</span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      <AlbumComments albumId={albumId} />
    </section>
  );
}

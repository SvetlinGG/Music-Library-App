import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { albums } from "../data/albums";
import { findAlbum, formatDuration, getAlbum, getSongs } from "../api/musicBrainz";


function findLocalAlbum(albumId) {
  return albums.find((a) => String(a.id) === albumId) ?? null;
}

export default function AlbumDetails() {
  const { albumId } = useParams();

  const [album, setAlbum] = useState(() => findLocalAlbum(albumId));
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coverFailed, setCoverFailed] = useState(false);

  useEffect(() => {
    let ignore = false; 

    const local = findLocalAlbum(albumId);
    setAlbum(local);
    setSongs([]);
    setError("");
    setCoverFailed(false);
    setLoading(true);

    async function load() {
      let mbId = albumId;

      if (local) {
        
        const found = await findAlbum(local.title, local.artist);
        if (!found) return [];
        mbId = found.id;
      } else {
        const info = await getAlbum(albumId);
        if (ignore) return [];
        setAlbum({ ...info, title: info.album });
      }

      return getSongs(mbId);
    }

    load()
      .then((tracks) => { if (!ignore) setSongs(tracks); })
      .catch((err) => { if (!ignore) setError(err.message); })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [albumId]);

  
  if (!album) {
    return (
      <section className="catalog details">
        <Link to="/" className="details-back">← Back to Catalog</Link>
        <p className="catalog-subtitle">
          {loading ? "Loading album..." : `Could not load this album. ${error}`}
        </p>
      </section>
    );
  }

  const { title, artist, year, genre, cover, releaseDate } = album;
  const totalLength = songs.reduce((sum, s) => sum + (s.length ?? 0), 0);
  const hasManyDiscs = songs.some((s) => s.disc > 1);

  let tracksText = "";
  if (loading) tracksText = "Loading tracklist from MusicBrainz...";
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
            {" "}Album data and tracklist from MusicBrainz.
          </p>

          <div className="details-actions">
            <button className="details-play">▶ Play</button>
            <button className="details-fav">♡ Add to Collection</button>
          </div>
        </div>
      </div>

      <div className="details-tracks">
        <h2>Tracklist</h2>
        {tracksText ? (
          <p className="catalog-subtitle">{tracksText}</p>
        ) : (
          <ol>
            {songs.map((song) => (
              <li key={song.id}>
                <span className="track-no">
                  {hasManyDiscs ? `${song.disc}.${song.position}` : song.position}
                </span>
                <span className="track-title">{song.title}</span>
                <span className="track-time">{song.duration}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}


import { Link } from "react-router";
//import { albums } from "../data/albums";
export default function AlbumDetails({
  title = "Title",
  artist = "Artist",
  year = "Year",
  genre = "",
  cover = "",
}) {



  return (
    
    <section className="catalog details">
      <Link to="/" className="details-back">
        ← Back to Catalog
      </Link>

      <div className="details-layout">
        <div className="details-cover">
          <div className="details-vinyl" aria-hidden="true" />
          <div className="details-cover-art" role="img" aria-label="Album cover">
            <span className="cover-artist">Artist</span>
            <span className="cover-title">{cover}</span>
          </div>
        </div>

        <div className="details-info">
          <span className="eyebrow">Title</span>
          <h1>{title}</h1>
          <p className="details-artist">{artist}</p>

          <ul className="details-meta">
            <li>
              <span className="meta-label">Year</span>
              <span className="meta-value">{year}</span>
            </li>
            <li>
              <span className="meta-label">Genre</span>
              <span className="meta-value">{genre}</span>
            </li>
            <li>
              <span className="meta-label">Tracks</span>
              <span className="meta-value">8</span>
            </li>
          </ul>

          <p className="details-description">
            A short description of the album goes here — its history, sound and
            why it matters.
          </p>

          <div className="details-actions">
            <button className="details-play">▶ Play</button>
            <button className="details-fav">♡ Add to Collection</button>
          </div>
        </div>
      </div>

      <div className="details-tracks">
        <h2>Tracklist</h2>
        <ol>
          <li>
            <span className="track-no">1</span>
            <span className="track-title">Track Title</span>
            <span className="track-time">5:12</span>
          </li>
          <li>
            <span className="track-no">2</span>
            <span className="track-title">Track Title</span>
            <span className="track-time">4:47</span>
          </li>
          <li>
            <span className="track-no">3</span>
            <span className="track-title">Track Title</span>
            <span className="track-time">6:03</span>
          </li>
        </ol>
      </div>
    </section>
    
  );
}

import { useState } from "react";
import { Link } from "react-router";

// colour for the placeholder cover; works for number ids (1, 2...) and MusicBrainz text ids
function getHue(id) {
  if (typeof id === "number") return (id * 47) % 360;
  let hue = 0;
  for (const char of String(id)) hue = (hue * 31 + char.charCodeAt(0)) % 360;
  return hue;
}

export default function MusicCard({
  id = 0,
  title = "Title",
  artist = "Artist",
  year = "Year",
  genre = "",
  cover = "",
  hasDetails = true,
}) {

  const hue = getHue(id);
  const [coverFailed, setCoverFailed] = useState(false);

  return (
    <article className="music-card" style={{ "--hue": hue }}>
      <div className="cover">
        <div className="vinyl" aria-hidden="true" />

        {cover && !coverFailed ? (
          <img src={cover} alt={`${title} by ${artist}`} onError={() => setCoverFailed(true)} />
        ) : (
          <div className="cover-art" role="img" aria-label={`${title} by ${artist}`}>
            <span className="cover-artist">{artist}</span>
            <span className="cover-title">{title}</span>
          </div>
        )}

        {genre && <span className="genre-badge">{genre}</span>}

        <button className="play-btn" aria-label={`Play ${title}`}>
          ▶
        </button>
      </div>

      <div className="card-content">
        <h3 title={title}>{title}</h3>
        <p>{artist}</p>

        <div className="card-footer">
          <span className="year">{year}</span>

          {hasDetails && (
            <Link to={`/albums/${id}`} className="details-btn">
              Details
            </Link>
          )}

          <button className="fav-btn" aria-label={`Add ${title} to favorites`}>
            ♡
          </button>
        </div>
      </div>
    </article>
  );
}

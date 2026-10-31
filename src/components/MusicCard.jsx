export default function MusicCard({
  id = 0,
  title = "Title",
  artist = "Artist",
  year = "Year",
  genre = "",
  cover = "",
}) {
  
  const hue = (id * 47) % 360;

  return (
    <article className="music-card" style={{ "--hue": hue }}>
      <div className="cover">
        <div className="vinyl" aria-hidden="true" />

        {cover ? (
          <img src={cover} alt={`${title} by ${artist}`} />
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

          <button className="fav-btn" aria-label={`Add ${title} to favorites`}>
            ♡
          </button>
        </div>
      </div>
    </article>
  );
}

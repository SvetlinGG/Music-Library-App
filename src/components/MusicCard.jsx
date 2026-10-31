export default function MusicCard() {
    return (
        <article className="music-card">
      <img
        src=''
        alt=''
      />

      <div className="card-content">
        <h3>Title</h3>
        <p>Artist</p>
        <span>Year</span>

        <div className="card-actions">
          <button>
            ♡ Favorite
          </button>

          <button>▶ Play</button>
        </div>
      </div>
    </article>
    );
}
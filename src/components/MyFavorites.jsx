import { Link } from "react-router";

export default function MyFavorites() {
  return (
    <section className="catalog collection favorites">
      <header className="collection-hero">
        <div className="collection-hero-text">
          <span className="eyebrow">Loved Records</span>
          <h1>My Favorites</h1>
          <p className="catalog-subtitle">
            The albums you've marked with ♡, ready to play again.
          </p>
        </div>

        <ul className="collection-stats">
          <li className="stat">
            <span className="stat-value">0</span>
            <span className="stat-label">Favorites</span>
          </li>
          <li className="stat">
            <span className="stat-value">0</span>
            <span className="stat-label">Artists</span>
          </li>
          <li className="stat">
            <span className="stat-value">0</span>
            <span className="stat-label">Genres</span>
          </li>
        </ul>
      </header>

      <div className="music-grid">
        {/* favorite MusicCard items go here */}
      </div>

      <div className="collection-empty">
        <div className="empty-heart" aria-hidden="true">♡</div>
        <h2>No favorites yet</h2>
        <p>Tap ♡ on any album in the catalog to keep it here.</p>
        <Link to="/" className="btn-register">Explore Catalog</Link>
      </div>
    </section>
  );
}

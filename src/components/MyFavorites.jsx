import { useState } from "react";
import { Link, Navigate } from "react-router";
import MusicCard from "./MusicCard";
import { useAuth } from "../contexts/AuthContext";
import useFavorites from "../hooks/useFavorites";

export default function MyFavorites() {
  const { isLoggedIn, user } = useAuth();
  const { items, loading, error, busyId, toggleFavorite } = useFavorites();
  const [actionError, setActionError] = useState("");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: "/my-favorites", message: "Log in to see your favorites." }} />;
  }

  const artistCount = new Set(items.map((row) => row.artist)).size;
  const genreCount = new Set(items.map((row) => row.genre).filter(Boolean)).size;

  
  async function onToggleFavorite(album) {
    setActionError("");
    try {
      await toggleFavorite(album);
    } catch (err) {
      setActionError(`Could not remove "${album.title}": ${err.message}`);
    }
  }

  let subtitle = `${user.username}'s loved records, ready to play again.`;
  if (loading) subtitle = "Loading your favorites...";
  else if (error) subtitle = `Could not load your favorites: ${error}`;

  return (
    <section className="catalog collection favorites">
      <header className="collection-hero">
        <div className="collection-hero-text">
          <span className="eyebrow">Loved Records</span>
          <h1>My Favorites</h1>
          <p className="catalog-subtitle">{subtitle}</p>
          {actionError && <p className="auth-error" role="alert">{actionError}</p>}
        </div>

        <ul className="collection-stats">
          <li className="stat">
            <span className="stat-value">{items.length}</span>
            <span className="stat-label">Favorites</span>
          </li>
          <li className="stat">
            <span className="stat-value">{artistCount}</span>
            <span className="stat-label">Artists</span>
          </li>
          <li className="stat">
            <span className="stat-value">{genreCount}</span>
            <span className="stat-label">Genres</span>
          </li>
        </ul>
      </header>

      {items.length > 0 && (
        <div className="music-grid">
          {items.map((row) => (
            <MusicCard
              key={row.id}
              id={row.itunes_id}
              title={row.title}
              artist={row.artist}
              year={row.year ?? ""}
              genre={row.genre ?? ""}
              cover={row.cover ?? ""}
              isFavorite
              favoriteBusy={busyId === row.itunes_id}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="collection-empty">
          <div className="empty-heart" aria-hidden="true">♡</div>
          <h2>No favorites yet</h2>
          <p>Tap ♡ on any album in the catalog to keep it here.</p>
          <Link to="/" className="btn-register">Explore Catalog</Link>
        </div>
      )}
    </section>
  );
}

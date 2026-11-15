import { useState } from "react";
import { Link, Navigate } from "react-router";
import MusicCard from "./MusicCard";
import { useAuth } from "../contexts/AuthContext";
import useCollection from "../hooks/useCollection";
import useFavorites from "../hooks/useFavorites";

export default function MyCollection() {
  const { isLoggedIn, user } = useAuth();
  const { items, loading, error, remove } = useCollection();
  const { findFavorite, toggleFavorite, busyId } = useFavorites();
  const [actionError, setActionError] = useState("");

  
  if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: "/my-collection" }} />;

  const artistCount = new Set(items.map((row) => row.artist)).size;
  const genreCount = new Set(items.map((row) => row.genre).filter(Boolean)).size;

  async function onDelete(rowId) {
    setActionError("");
    try {
      await remove(rowId);
    } catch (err) {
      setActionError(`Could not remove the album: ${err.message}`);
    }
  }

  async function onToggleFavorite(album) {
    setActionError("");
    try {
      await toggleFavorite(album);
    } catch (err) {
      setActionError(`Could not update favorites: ${err.message}`);
    }
  }

  let subtitle = `${user.username}'s records, all in one place.`;
  if (loading) subtitle = "Loading your collection...";
  else if (error) subtitle = `Could not load your collection: ${error}`;

  return (
    <section className="catalog collection">
      <header className="collection-hero">
        <div className="collection-hero-text">
          <span className="eyebrow">Personal Shelf</span>
          <h1>My Collection</h1>
          <p className="catalog-subtitle">{subtitle}</p>
          {actionError && <p className="auth-error" role="alert">{actionError}</p>}
        </div>

        <ul className="collection-stats">
          <li className="stat">
            <span className="stat-value">{items.length}</span>
            <span className="stat-label">Albums</span>
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
              onDelete={() => onDelete(row.id)}
              isFavorite={Boolean(findFavorite({ id: row.itunes_id, title: row.title, artist: row.artist }))}
              favoriteBusy={busyId === row.itunes_id}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="collection-empty">
          <div className="empty-disc" aria-hidden="true" />
          <h2>Your shelf is empty</h2>
          <p>Browse the catalog and tap "+ Add to Collection" to start building your collection.</p>
          <Link to="/" className="btn-register">Explore Catalog</Link>
        </div>
      )}
    </section>
  );
}

import { Link } from "react-router";
import MusicCard from "./MusicCard";
import { useState } from "react";

const collectionAlbums = []

export default function MyCollection() {

  const [albums, setAlbums] = useState(collectionAlbums);

  

  

  return (
    <section className="catalog collection">
      <header className="collection-hero">
        <div className="collection-hero-text">
          <span className="eyebrow">Personal Shelf</span>
          <h1>My Collection</h1>
          <p className="catalog-subtitle">
            The records you've saved, all in one place.
          </p>
        </div>

        <ul className="collection-stats">
          <li className="stat">
            <span className="stat-value">4</span>
            <span className="stat-label">Albums</span>
          </li>
          <li className="stat">
            <span className="stat-value">Artist</span>
            <span className="stat-label">Artists</span>
          </li>
          <li className="stat">
            <span className="stat-value">Genre</span>
            <span className="stat-label">Genres</span>
          </li>
        </ul>
      </header>

      <div className="music-grid">
        {collectionAlbums.map((album) => (
          <MusicCard key={album.id} {...album} />
        ))}
      </div>

      <div className="collection-empty">
        <div className="empty-disc" aria-hidden="true" />
        <h2>Your shelf is empty</h2>
        <p>Browse the catalog and tap ♡ to start building your collection.</p>
        <Link to="/" className="btn-register">Explore Catalog</Link>
      </div>
    </section>
  );
}

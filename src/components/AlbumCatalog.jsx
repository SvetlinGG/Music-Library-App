import MusicCard from "./MusicCard";
import { albums } from "../data/albums";

export default function AlbumCatalog() {
  return (
    <section className="catalog">
      <header className="catalog-header">
        <span className="eyebrow">Your Library</span>
        <h1>Music Catalog</h1>
        <p className="catalog-subtitle">
          {albums.length} albums · Classic records that shaped rock history
        </p>
      </header>

      <div className="filters">
        <input
          type="text"
          placeholder="Search artist or album..."
        />

        <select>
          <option value="">All years</option>
        </select>
      </div>

      <div className="music-grid">
        {albums.map((album) => (
          <MusicCard key={album.id} {...album} />
        ))}
      </div>
    </section>
  );
}

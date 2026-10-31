import MusicCard from "./MusicCard";
import { albums } from "../data/albums";
import { useState } from "react";



export default function AlbumCatalog() {

  const [query, setQuery] = useState("");
const [sortBy, setSortBy] = useState("year");

const q = query.trim().toLowerCase();
const visibleAlbums = albums
  .filter(a => a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q))
  .toSorted((a, b) => sortBy === "year" ? a.year - b.year : a[sortBy].localeCompare(b[sortBy]));


  return (
    <section className="catalog">
      <header className="catalog-header">
        <span className="eyebrow">Your Library</span>
        <h1>Music Catalog</h1>
        <p className="catalog-subtitle">
          {visibleAlbums.length} albums · Classic records that shaped rock history
        </p>
      </header>

      <div className="filters">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search artist or album..."
        />

        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="years">Years</option>
          <option value="title">Title</option>
          <option value="artist">Artist</option>
        </select>
      </div>

      <div className="music-grid">
        {visibleAlbums.map((album) => (
          <MusicCard key={album.id} {...album} />
        ))}
      </div>
    </section>
  );
}

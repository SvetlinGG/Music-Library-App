import MusicCard from "./MusicCard";
//import { albums } from "../data/albums";
import { useState } from "react";



export default function AlbumCatalog() {

  const [albums, setAlbums] = useState({
    albums: albums
});

  const searchData = async (e) => {
    setAlbums(state => ({
      ...state,
        albums: state.albums.filter(album => 
        album.title.toLowerCase().includes(e.target.value) ||
        album.artist.toLowerCase().includes(e.target.value)
      )
    }))
  }

  




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
          onSubmit={searchData}
          placeholder="Search artist or album..."
        />

        <select>
          <option value="years">Years</option>
          <option value="title">Title</option>
          <option value="artist">Artist</option>
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

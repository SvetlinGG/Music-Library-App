import { Link } from "react-router";
import MusicCard from "./MusicCard";
import { useEffect, useState } from "react";
import { albums } from "../data/albums";




const collectionAlbums = []

export default function MyCollection() {

  //const [selectAlbum, setSelectAlbum] = useState(collectionAlbums)

  // useEffect((album) => {
  //   if (selectAlbum.find(item => item.id === album.id)) {
  //     setSelectAlbum(selectAlbum.filter(item => item.id !== album.id))
  //     collectionAlbums.push(selectAlbum)
  //   } else {
  //     setSelectAlbum([...selectAlbum, album])
  //   }
  // },[selectAlbum])

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

      {/* <div className="collection-toolbar">
        <div className="collection-tabs" role="tablist">
          <button className="collection-tab active" role="tab" aria-selected="true">All</button>
          <button className="collection-tab" role="tab" aria-selected="false">Favorites</button>
          <button className="collection-tab" role="tab" aria-selected="false">Wishlist</button>
        </div>

        <div className="filters collection-filters">
          <input type="text" placeholder="Search your collection..." />
          <select defaultValue="year">
            <option value="year">Year</option>
            <option value="title">Title</option>
            <option value="artist">Artist</option>
          </select>
        </div>
      </div> */}

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

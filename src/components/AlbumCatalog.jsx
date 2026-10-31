import MusicCard from "./MusicCard";
export default function AlbumCatalog() {
    return (
        <section className="catalog">
      <h1>Music Catalog</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search artist or album..."
        />

        <select>
          <option value="">All years</option>

        </select>
      </div>

      <div className="music-grid"><MusicCard/>
      </div>
    </section>
    );
}
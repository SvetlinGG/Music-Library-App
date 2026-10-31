export default function AlbumCatalog() {
    return (
        <section className="catalog">
      <h1>Music Catalog</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search artist or album..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          value={year}
          onChange={e => setYear(e.target.value)}
        >
          <option value="">All years</option>

          {years.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="music-grid">
        {filteredAlbums.map(album => (
          <MusicCard
            key={album.id}
            album={album}
            onFavorite={handleFavorite}
          />
        ))}
      </div>
    </section>
    );
}
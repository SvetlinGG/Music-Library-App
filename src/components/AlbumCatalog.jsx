import MusicCard from "./MusicCard";
import { albums } from "../data/albums";
import { useEffect, useState } from "react";
import { search } from "../api/musicBrainz";

const SEARCH_DELAY_MS = 500; 


function toCard(type, item) {
  if (type === "album") {
    return { key: item.id, id: item.id, title: item.album, artist: item.artist, year: item.year ?? "", genre: item.genre, cover: item.cover };
  }
  if (type === "song") {
    return { key: item.id, id: item.albumId, title: item.title, artist: item.artist, year: item.year ?? "", genre: item.album, cover: item.cover, hasDetails: Boolean(item.albumId) };
  }

  return { key: item.id, id: item.id, title: item.name, artist: [item.type, item.country].filter(Boolean).join(" · "), year: item.disambiguation, hasDetails: false };
}

export default function AlbumCatalog() {

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("year");
  const [searchType, setSearchType] = useState("album");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const q = query.trim();
  const isSearching = q.length > 0;

  
  useEffect(() => {
    if (!q) {
      setResults([]);
      setError("");
      setLoading(false);
      return;
    }

    let ignore = false; 
    setLoading(true);
    setError("");

    const timer = setTimeout(() => {
      search(searchType, q)
        .then((data) => { if (!ignore) setResults(data.map((item) => toCard(searchType, item))); })
        .catch((err) => { if (!ignore) setError(err.message); })
        .finally(() => { if (!ignore) setLoading(false); });
    }, SEARCH_DELAY_MS);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [q, searchType]);

  
  const catalogAlbums = albums
    .toSorted((a, b) => sortBy === "year" ? a.year - b.year : a[sortBy].localeCompare(b[sortBy]));

  let subtitle = `${catalogAlbums.length} albums · Classic records that shaped rock history`;
  if (isSearching) {
    if (loading) subtitle = `Searching MusicBrainz for "${q}"...`;
    else if (error) subtitle = `Search failed: ${error}`;
    else subtitle = `${results.length} ${searchType} results for "${q}" from MusicBrainz`;
  }

  return (
    <section className="catalog">
      <header className="catalog-header">
        <span className="eyebrow">Your Library</span>
        <h1>Music Catalog</h1>
        <p className="catalog-subtitle">{subtitle}</p>
      </header>

      <div className="filters">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={`Search ${searchType}s on MusicBrainz...`}
        />

        <select value={searchType} onChange={e => setSearchType(e.target.value)} aria-label="Search type">
          <option value="album">Albums</option>
          <option value="song">Songs</option>
          <option value="artist">Artists</option>
        </select>

        {!isSearching && (
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort by">
            <option value="year">Year</option>
            <option value="artist">Artist</option>
            <option value="title">Title</option>
          </select>
        )}
      </div>

      <div className="music-grid">
        {isSearching
          ? !loading && results.map(({ key, ...card }) => <MusicCard key={key} {...card} />)
          : catalogAlbums.map((album) => <MusicCard key={album.id} {...album} />)}
      </div>
    </section>
  );
}

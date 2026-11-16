

const BASE_URL = "https://itunes.apple.com";

const PROXY_URL = "/.netlify/functions/itunes";
const useProxy = import.meta.env.PROD;


async function request(path, params = {}) {
    const url = useProxy
        ? new URL(PROXY_URL, window.location.origin)
        : new URL(`${BASE_URL}/${path}`);
    if (useProxy) url.searchParams.set("path", path);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) url.searchParams.set(key, value);
    });

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`iTunes error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.results ?? [];
}


function searchRequest(term, entity, limit = 25) {
    return request("search", { term: term.trim(), entity, media: "music", limit });
}


function lookupRequest(id, params = {}) {
    return request("lookup", { id, ...params });
}

// make helpers
export function formatDuration(ms) {
    if (!ms) return "";
    const totalSeconds = Math.round(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
}

// album picture: iTunes gives 100x100, but the size in the url can be changed
export function getCoverUrl(artworkUrl, size = 600) {
    if (!artworkUrl) return null;
    return artworkUrl.replace(/\/\d+x\d+bb\./, `/${size}x${size}bb.`);
}

function getYear(releaseDate = "") {
    return releaseDate ? Number(releaseDate.slice(0, 4)) : null;
}

// "1986-03-03T08:00:00Z" -> "1986-03-03"
function getDate(releaseDate = "") {
    return releaseDate.slice(0, 10);
}

function toArtist(item) {
    return {
        id: item.artistId,
        name: item.artistName,
        country: "",
        type: item.artistType ?? "",
        genre: item.primaryGenreName ?? "",
        disambiguation: item.primaryGenreName ?? "",
    };
}

function toAlbum(item, coverSize = 600) {
    const releaseDate = getDate(item.releaseDate);
    return {
        id: item.collectionId,
        album: item.collectionName,
        artist: item.artistName,
        genre: item.primaryGenreName ?? "",
        type: item.collectionType ?? "",
        year: getYear(releaseDate),
        releaseDate,
        trackCount: item.trackCount ?? 0,
        cover: getCoverUrl(item.artworkUrl100, coverSize),
    };
}

function toSong(item) {
    const releaseDate = getDate(item.releaseDate);
    return {
        id: item.trackId,
        disc: item.discNumber ?? 1,
        position: item.trackNumber,
        title: item.trackName,
        artist: item.artistName,
        album: item.collectionName ?? "",
        albumId: item.collectionId ?? null,
        year: getYear(releaseDate),
        releaseDate,
        length: item.trackTimeMillis ?? null,
        duration: formatDuration(item.trackTimeMillis),
        preview: item.previewUrl ?? null,
        cover: getCoverUrl(item.artworkUrl100),
    };
}

// search artists
export async function searchArtists(name, limit = 25) {
    const results = await searchRequest(name, "musicArtist", limit);
    return results.map(toArtist);
}

// one artist by iTunes id
export async function getArtist(artistId) {
    const [artist] = await lookupRequest(artistId);
    return artist ? toArtist(artist) : null;
}

// all albums of one artist
export async function getAlbums(artistId, limit = 200) {
    const results = await lookupRequest(artistId, { entity: "album", limit });
    return results
        .filter((item) => item.wrapperType === "collection")
        .map((item) => toAlbum(item))
        .sort((a, b) => (a.releaseDate || "9999").localeCompare(b.releaseDate || "9999"));
}

// songs of one album
export async function getSongs(albumId) {
    const results = await lookupRequest(albumId, { entity: "song" });
    return results
        .filter((item) => item.wrapperType === "track" && item.kind === "song")
        .map(toSong)
        .sort((a, b) => a.disc - b.disc || a.position - b.position);
}

// search albums
export async function searchAlbums(title, limit = 25) {
    const results = await searchRequest(title, "album", limit);
    return results.map((item) => toAlbum(item));
}

// one album by iTunes id
export async function getAlbum(albumId) {
    const [album] = await lookupRequest(albumId);
    return album ? toAlbum(album, 1000) : null;
}

// find one album by title + artist (used for the local catalog albums)
export async function findAlbum(title, artist) {
    const results = await searchRequest(`${artist} ${title}`, "album", 25);
    const sameArtist = results.filter(
        (item) => item.artistName?.toLowerCase() === artist.toLowerCase()
    );
    const list = sameArtist.length ? sameArtist : results;

    // prefer the exact title, then a title that starts with it ("... (Remastered)")
    const t = title.toLowerCase();
    const found =
        list.find((item) => item.collectionName.toLowerCase() === t) ??
        list.find((item) => item.collectionName.toLowerCase().startsWith(t)) ??
        list[0];

    return found ? toAlbum(found) : null;
}

// search songs by title
export async function searchSongs(title, limit = 25) {
    const results = await searchRequest(title, "song", limit);
    return results.map(toSong);
}

// entry point for the search page. type: 'artist' | 'album' | 'song'
export async function search(type, text) {
    if (type === "artist") return searchArtists(text);
    if (type === "album") return searchAlbums(text);
    if (type === "song") return searchSongs(text);
    throw new Error(`Unknown search type: ${type}`);
}

// search everything together
export async function getArtistFull(artistName) {
    const [found] = await searchArtists(artistName, 1);
    if (!found) return null;

    const albums = await getAlbums(found.id);
    for (const album of albums) {
        album.songs = await getSongs(album.id);
    }

    return { ...found, albums };
}

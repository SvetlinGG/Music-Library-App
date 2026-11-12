// Rules from MusicBrainz:
//  - max ~1 request per second (we queue requests below)
//  - no API key needed

const BASE_URL = 'https://musicbrainz.org/ws/2';
const COVER_URL = 'https://coverartarchive.org';
const MIN_DELAY_MS = 1100;    // a bit more than 1 sec to be safe
const MAX_RETRIES = 3;        // retries when the server says "too busy" (503)

// low level request with rate limit

let queue = Promise.resolve();
let lastRequestTime = 0;

function wait(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function request(path, params = {}){
    const url = new URL (`${BASE_URL}/${path}`);
    Object.entries({...params, fmt: 'json'}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) url.searchParams.set(key, value);
    });

    const run = async () => {
        for ( let attempt = 0; attempt <=MAX_RETRIES; attempt ++){
            const elapsed = Date.now() - lastRequestTime;
            if( elapsed < MIN_DELAY_MS ) await wait(MIN_DELAY_MS - elapsed);
            lastRequestTime = Date.now();

            const response = await fetch(url, { headers: { Accept: 'application/json'} });
            if ( response.ok ) return response.json();

            if ( response.status === 503 && attempt < MAX_RETRIES) {
                await wait(MIN_DELAY_MS * 2 ** (attempt + 1 ));
                continue;
            }
            throw new Error(`MusicBrainz error ${response.status}: ${response.statusText}`);
        }
    };
    const result = queue.then(run, run);
    queue = result.catch(() => {}); // one failed request must not block the queue
    return result;
}

// make helpers
export function formatDuration(ms){
    if (!ms) return '';
    const totalSeconds = Math.round(ms / 1000);
    const minutes = Math.floor( totalSeconds / 60 );
    const seconds = String( totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
}

// album picture 
export function getCoverUrl(albumId, size = 250){
    return `${COVER_URL}/release-group/${albumId}/front-${size}`;

}

function topGenre(genres = []){
    if (!genres.length) return '';
    return [...genres].sort((a, b) => b.count - a.count)[0].name;
}

// search text without chars like -> ( ) : " " ? !
function escapeQuery(text){
    return text.trim().replace(/([+\-&|!(){}[\]^"~*?:\\/])/g, '\\$1');
}

function creditName(credit = []){
    return credit.map((c) => c.name + (c.joinphrase ?? '')).join('');
}

// search artist 
export async function searchArtists(name, limit = 10){
    const data = await request('artist', { query: `artist: (${escapeQuery(name)})`, limit});
    return data.artists.map((artist) => ({
        id: artist.id,
        name: artist.name,
        country: artist.country ?? '',
        type: artist.type ?? '',
        disambiguation: artist.disambiguation ?? '',
    }));
}

// one artist by MusicBrainz id
export async function getArtist(artistId){
    const artist = await request(`artist/${artistId}`, { inc: 'genres'});
    return {
        id: artist.id,
        name: artist.name,
        country: artist.country ?? '',
        type: artist.type ?? '',
        genre: topGenre(artist.genres),
        lifeSpan: artist['life-span'] ?? {},
    };
}

// search albums 
export async function getAlbums(artistId, artistName = '', limit = 100){
    const data = await request('release-group', {
        artist: artistId,
        type: 'album',
        inc: 'genres',
        limit
    });
    return data['release-groups']
        .filter((rg) => (rg['secondary-types'] ?? []).length === 0)
        .map((rg) => {
            const releaseDate = rg['first-release-date'] ?? '';
            return {
                id: rg.id,
                album: rg.title,
                artist: artistName,
                genre: topGenre(rg.genres),
                year: releaseDate ? Number(releaseDate.slice(0, 4)) : null,
                releaseDate,
                cover: getCoverUrl(rg.id),
            };
        })
        .sort((a, b) => (a.releaseDate || '9999').localeCompare(b.releaseDate || '9999'));
}

// search songs
export async function getSongs(albumId){
    const data = await request('release', {
        'release-group': albumId,
        status: 'official',
        inc: 'recordings media',
        limit: 1,
    });
    const release = data.releases[0]
    if (!release) return [];

    return release.media.flatMap((disc) => 
    disc.tracks.map((track) => ({
        id: track.id,
        disc: disc.position,
        position: track.position,
        title: track.title,
        length: track.length,
        duration: formatDuration(track.length),
    }))
    );
}

// search albums and songs
export async function searchAlbums(title, limit = 20){
    const data = await request('release-group', {
        query: `releasegroup:(${escapeQuery(title)}) AND primarytype:album`,
        limit,
    });
    return data['release-groups'].map((rg) => {
        const releaseDate = rg['first-release-date'] ?? '';
        return {
            id: rg.id,
            album: rg.title,
            artist: creditName(rg['artist-credit']),
            genre: rg.tags?.length ? topGenre(rg.tags) : '',
            year: releaseDate ? Number(releaseDate.slice(0, 4)) : null,
            releaseDate,
            cover: getCoverUrl(rg.id),
        }
    })
}

// one album (release group) by MusicBrainz id
export async function getAlbum(albumId){
    const rg = await request(`release-group/${albumId}`, { inc: 'artist-credits genres' });
    const releaseDate = rg['first-release-date'] ?? '';
    return {
        id: rg.id,
        album: rg.title,
        artist: creditName(rg['artist-credit']),
        genre: topGenre(rg.genres),
        type: rg['primary-type'] ?? '',
        year: releaseDate ? Number(releaseDate.slice(0, 4)) : null,
        releaseDate,
        cover: getCoverUrl(rg.id, 500),
    };
}

// find one album by title + artist (used for the local catalog albums)
export async function findAlbum(title, artist){
    const data = await request('release-group', {
        query: `releasegroup:(${escapeQuery(title)}) AND artist:(${escapeQuery(artist)}) AND primarytype:album`,
        limit: 1,
    });
    return data['release-groups'][0] ?? null;
}

// search songs by title
export async function searchSongs(title, limit = 20){
    const data = await request('recording', {
        query: `recording:(${escapeQuery(title)})`,
        limit,
    });
    return data.recordings.map((rec) => {
        const release = rec.releases?.[0];
        const albumId = release?.['release-group']?.id ?? null;
        const releaseDate = rec['first-release-date'] ?? release?.date ?? '';
        return {
            id: rec.id,
            title: rec.title,
            artist: creditName(rec['artist-credit']),
            album: release?.title ?? '',
            albumId,
            year: releaseDate ? Number(releaseDate.slice(0, 4)) : null,
            releaseDate,
            length: rec.length ?? null,
            duration: formatDuration(rec.length),
            cover: albumId ? getCoverUrl(albumId) : null,
        };
    });
}

// entry point for the search page. type: 'artist' | 'album' | 'song'
export async function search(type, text){
    if ( type === 'artist') return searchArtists(text, 20);
    if ( type === 'album') return searchAlbums(text);
    if ( type === 'song') return searchSongs(text);
    throw new Error(`Unknown search type: ${type}`)
}

// search everything together

export async function getArtistFull(artistName){
    const [found] = await searchArtists(artistName, 1);

    if ( !found) return null;

    const artist = await getArtist(found.id);
    const albums = await getAlbums(artist.id, artist.name);

    for ( const album of albums){
        album.songs = await getSongs(album.id);
    }

    return { ...artist, albums};
}


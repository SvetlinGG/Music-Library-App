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
            throw new Error(`MusicBrainz error ${response.status}: ${response.stausText}`);
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

function getGenre(genres = []){
    if (!genres.length) return '';
    return [...genres].sort((a, b) => b.count - a.count)[0].name;
}

// search text without chars like -> ( ) : " " ? !
function escapeQuery(text){
    return text.trim().replace(/([+\-&|!(){}[\]^"~*?:\\/])/g, '\\$1');
}

function creditName(credit = []){
    return credit.map((c) => c.name + (c.joinphase ?? '')).join('');
}
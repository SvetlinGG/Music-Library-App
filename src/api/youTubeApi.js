

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const IFRAME_API_URL = 'https://www.youtube.com/iframe_api';
const CACHE_KEY = 'yt-video-cache-v1';
const MUSIC_CATEGORY_ID = '10';



const memoryCache = new Map(loadCache());
const pending = new Map(); 

function loadCache() {
    try {
        return Object.entries(JSON.parse(localStorage.getItem(CACHE_KEY)) ?? {});
    } catch {
        return [];
    }
}

function saveCache() {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(memoryCache)));
    } catch {
        // storage is full or blocked -> ignore, the memory cache still works
    }
}

//  YouTube Data API: search -> video id 


export function buildQuery({ artist = '', album = '', song = '' }) {
    return [artist, song || album, 'Official Audio']
        .map((part) => part.trim())
        .filter(Boolean)
        .join(' ');
}


export async function searchVideo(query) {
    const key = query.trim().toLowerCase();
    if (!key) throw new Error('Nothing to search for.');

    if (memoryCache.has(key)) return memoryCache.get(key);
    if (pending.has(key)) return pending.get(key);

    if (!API_KEY) {
        throw new Error('YouTube API key is missing. Add VITE_YOUTUBE_API_KEY to .env.local and restart the dev server.');
    }

    const url = new URL(SEARCH_URL);
    Object.entries({
        part: 'snippet',
        type: 'video',
        maxResults: 1,
        q: query,
        videoEmbeddable: 'true',      
        videoCategoryId: MUSIC_CATEGORY_ID,
        fields: 'items(id/videoId,snippet(title,channelTitle,thumbnails/medium/url))',
        key: API_KEY,
    }).forEach(([name, value]) => url.searchParams.set(name, value));

    const run = async () => {
        const response = await fetch(url);
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            const reason = body.error?.errors?.[0]?.reason;
            if (reason === 'quotaExceeded') {
                throw new Error('Daily YouTube quota is used up. Try again tomorrow.');
            }
            throw new Error(`YouTube error ${response.status}: ${body.error?.message ?? response.statusText}`);
        }

        const data = await response.json();
        const item = data.items?.[0];
        const video = item
            ? {
                videoId: item.id.videoId,
                title: decodeHtml(item.snippet.title),
                channel: item.snippet.channelTitle,
                thumbnail: item.snippet.thumbnails?.medium?.url ?? '',
            }
            : null;

        memoryCache.set(key, video); 
        saveCache();
        return video;
    };

    const result = run().finally(() => pending.delete(key));
    pending.set(key, result);
    return result;
}


function decodeHtml(text) {
    const el = document.createElement('textarea');
    el.innerHTML = text;
    return el.value;
}

// shortcut: artist + album/song -> video
export function findVideo({ artist, album, song }) {
    return searchVideo(buildQuery({ artist, album, song }));
}

// YouTube IFrame Player

let iframeApiPromise = null;


export function loadIframeApi() {
    if (iframeApiPromise) return iframeApiPromise;

    iframeApiPromise = new Promise((resolve, reject) => {
        if (window.YT?.Player) {
            resolve(window.YT);
            return;
        }

        const previousCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            previousCallback?.();
            resolve(window.YT);
        };

        const script = document.createElement('script');
        script.src = IFRAME_API_URL;
        script.async = true;
        script.onerror = () => {
            iframeApiPromise = null; 
            reject(new Error('Could not load the YouTube player.'));
        };
        document.head.appendChild(script);
    });

    return iframeApiPromise;
}


export async function createPlayer(element, videoId, events = {}) {
    const YT = await loadIframeApi();
    return new YT.Player(element, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
            autoplay: 1,
            playsinline: 1,
            rel: 0,             
            modestbranding: 1,
        },
        events,
    });
}


export function playerErrorMessage(code) {
    if (code === 2) return 'Invalid video id.';
    if (code === 5) return 'This video cannot be played in the browser.';
    if (code === 100) return 'The video was removed or is private.';
    if (code === 101 || code === 150) return 'The owner does not allow this video to play on other sites.';
    return 'The video could not be played.';
}

import { supabaseUrl, userApiKey } from "./user-Supabase-request";

// table "music-collection" in Supabase (see supabase/music-collection.sql)
// columns: id (uuid), user_id (uuid -> auth.users.id), itunes_id (bigint, Apple's collectionId),
//          title, artist, year (integer), genre, cover, created_at (timestamptz)
const COLLECTION_URL = `${supabaseUrl}/rest/v1/music-collection`;


function headers(session, extra = {}) {
    return {
        apikey: userApiKey,
        Authorization: `Bearer ${session.accessToken}`,
        ...extra,
    };
}

async function handle(response) {
    const result = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(result?.message || `Error: ${response.status}`);
    }
    return result;
}


export async function getMyCollection(session) {
    const url = new URL(COLLECTION_URL);
    url.searchParams.set("user_id", `eq.${session.user.id}`);
    url.searchParams.set("order", "created_at.desc");

    const response = await fetch(url, { headers: headers(session) });
    return handle(response);
}


export async function addToCollection(session, album) {
    const response = await fetch(COLLECTION_URL, {
        method: "POST",
        headers: headers(session, {
            "Content-Type": "application/json",
            Prefer: "return=representation",
        }),
        body: JSON.stringify({
            user_id: session.user.id,
            itunes_id: Number(album.itunesId),
            title: album.title,
            artist: album.artist,
            year: album.year ? Number(album.year) || null : null,
            genre: album.genre || null,
            cover: album.cover || null,
        }),
    });
    const [saved] = await handle(response);
    return saved;
}


export async function removeFromCollection(session, rowId) {
    const url = new URL(COLLECTION_URL);
    url.searchParams.set("id", `eq.${rowId}`);
    url.searchParams.set("user_id", `eq.${session.user.id}`);

    const response = await fetch(url, { method: "DELETE", headers: headers(session) });
    await handle(response);
}

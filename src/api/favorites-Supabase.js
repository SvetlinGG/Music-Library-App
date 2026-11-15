import { supabaseUrl, userApiKey } from "./user-Supabase-request";

const FAVORITES_URL = `${supabaseUrl}/rest/v1/favorites`;

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


export async function getMyFavorites(session) {
    const url = new URL(FAVORITES_URL);
    url.searchParams.set("user_id", `eq.${session.user.id}`);
    url.searchParams.set("order", "created_at.desc");

    const response = await fetch(url, { headers: headers(session) });
    return handle(response);
}


export async function addToFavorites(session, album) {
    const response = await fetch(FAVORITES_URL, {
        method: "POST",
        headers: headers(session, {
            "Content-Type": "application/json",
            Prefer: "return=representation",
        }),
        body: JSON.stringify({
            user_id: session.user.id,
            itunes_id: Number(album.id),
            title: album.title,
            artist: album.artist,
            cover: album.cover || null,
            year: Number(album.year) || null,
            genre: album.genre || null,
        }),
    });
    const [saved] = await handle(response);
    return saved;
}


export async function removeFromFavorites(session, rowId) {
    const url = new URL(FAVORITES_URL);
    url.searchParams.set("id", `eq.${rowId}`);
    url.searchParams.set("user_id", `eq.${session.user.id}`);

    const response = await fetch(url, { method: "DELETE", headers: headers(session) });
    await handle(response);
}

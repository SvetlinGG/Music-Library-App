import { supabaseUrl, userApiKey } from "./user-Supabase-request";

const COMMENTS_URL = `${supabaseUrl}/rest/v1/comments`;

async function handle(response) {
    const result = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(result?.message || `Error: ${response.status}`);
    }
    return result;
}


export async function getComments(albumId) {
    const url = new URL(COMMENTS_URL);
    url.searchParams.set("album_id", `eq.${Number(albumId)}`);
    url.searchParams.set("order", "created_at.desc");

    const response = await fetch(url, {
        headers: { apikey: userApiKey, Authorization: `Bearer ${userApiKey}` },
    });
    return handle(response);
}


export async function addComment(session, { albumId, content }) {
    const response = await fetch(COMMENTS_URL, {
        method: "POST",
        headers: {
            apikey: userApiKey,
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
        },
        body: JSON.stringify({
            album_id: Number(albumId),
            user_id: session.user.id,
            content,
        }),
    });
    const [saved] = await handle(response);
    return saved;
}

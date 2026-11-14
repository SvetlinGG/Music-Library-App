import { supabaseUrl, userApiKey } from "./user-Supabase-request";

// table "comments" in Supabase (see supabase/comments.sql)
const COMMENTS_URL = `${supabaseUrl}/rest/v1/comments`;

const headers = {
    apikey: userApiKey,
    Authorization: `Bearer ${userApiKey}`,
};

async function handle(response) {
    const result = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(result?.message || `Error: ${response.status}`);
    }
    return result;
}

// all comments for one album, newest first
export async function getComments(albumId) {
    const url = new URL(COMMENTS_URL);
    url.searchParams.set("album_id", `eq.${albumId}`);
    url.searchParams.set("order", "created_at.desc");

    const response = await fetch(url, { headers });
    return handle(response);
}

// add a comment and return the saved row
export async function addComment({ albumId, author, text }) {
    const response = await fetch(COMMENTS_URL, {
        method: "POST",
        headers: {
            ...headers,
            "Content-Type": "application/json",
            Prefer: "return=representation",
        },
        body: JSON.stringify({ album_id: String(albumId), author, text }),
    });
    const [saved] = await handle(response);
    return saved;
}

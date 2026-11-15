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


function authHeaders(session, extra = {}) {
    return {
        apikey: userApiKey,
        Authorization: `Bearer ${session.accessToken}`,
        ...extra,
    };
}


function ownCommentUrl(session, commentId) {
    const url = new URL(COMMENTS_URL);
    url.searchParams.set("id", `eq.${commentId}`);
    url.searchParams.set("user_id", `eq.${session.user.id}`);
    return url;
}


export async function updateComment(session, commentId, content) {
    const response = await fetch(ownCommentUrl(session, commentId), {
        method: "PATCH",
        headers: authHeaders(session, {
            "Content-Type": "application/json",
            Prefer: "return=representation",
        }),
        body: JSON.stringify({ content }),
    });
    const [saved] = await handle(response);
    if (!saved) throw new Error("You can only edit your own comments.");
    return saved;
}


export async function deleteComment(session, commentId) {
    const response = await fetch(ownCommentUrl(session, commentId), {
        method: "DELETE",
        headers: authHeaders(session, { Prefer: "return=representation" }),
    });
    const deleted = await handle(response);
    if (!deleted?.length) throw new Error("You can only delete your own comments.");
}

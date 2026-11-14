import { supabaseUrl, userApiKey } from "./user-Supabase-request";

export async function signUp({ username, email, password }) {
  const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: userApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      data: { user_name: username },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.msg || result.error_description || result.message || `Error: ${response.status}`);
  }

  
  if (Array.isArray(result.identities) && result.identities.length === 0) {
    throw new Error("This email is already registered.");
  }

  return result;
}

//login / logout / session 

const SESSION_KEY = "soundvibe-session";

function readError(result, status) {
  return result?.msg || result?.error_description || result?.message || `Error: ${status}`;
}

function toSession(result) {
  return {
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
    
    expiresAt: Date.now() + (result.expires_in - 60) * 1000,
    user: {
      id: result.user.id,
      email: result.user.email,
      username: result.user.user_metadata?.user_name || result.user.email,
    },
  };
}


export function saveSession(session, remember = true) {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    if (session) (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // to do error handling
  }
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isRemembered() {
  try {
    return localStorage.getItem(SESSION_KEY) !== null;
  } catch {
    return false;
  }
}

export async function signIn({ email, password }) {
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: userApiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(readError(result, response.status));
  return toSession(result);
}

export async function signOut(session) {
  if (!session?.accessToken) return;
  
  await fetch(`${supabaseUrl}/auth/v1/logout`, {
    method: "POST",
    headers: { apikey: userApiKey, Authorization: `Bearer ${session.accessToken}` },
  }).catch(() => {});
}

async function refreshSession(session) {
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: userApiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: session.refreshToken }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error("Your session expired. Please log in again.");
  return toSession(result);
}


export async function getValidSession(session) {
  if (!session) throw new Error("You need to log in first.");
  if (Date.now() < session.expiresAt) return session;

  const fresh = await refreshSession(session);
  saveSession(fresh, isRemembered());
  return fresh;
}

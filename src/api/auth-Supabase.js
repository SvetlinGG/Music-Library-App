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

// Proxy for the iTunes Search API.
// Why: on iPhone (Safari and Chrome) iTunes answers /search with a redirect to the
// Apple Music app (musics://...), so fetch fails with "Load failed".
// A request from the server does not get that redirect.
// Usage: /.netlify/functions/itunes?path=search&term=...&entity=album

const ALLOWED_PATHS = ["search", "lookup"];

export default async (req) => {
  const params = new URL(req.url).searchParams;
  const path = params.get("path");

  if (!ALLOWED_PATHS.includes(path)) {
    return Response.json({ message: "Unknown iTunes path" }, { status: 400 });
  }
  params.delete("path");

  try {
    const response = await fetch(`https://itunes.apple.com/${path}?${params}`);
    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return Response.json({ message: "Could not reach iTunes" }, { status: 502 });
  }
};

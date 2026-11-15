

const SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary";
const ACTION_URL = "https://en.wikipedia.org/w/api.php";


const MUSIC_WORDS = /\b(band|musician|singer|rapper|group|duo|trio|composer|songwriter|guitarist|vocalist|dj|producer|orchestra|music|musical|artist)\b/i;

function pageName(title) {
    return encodeURIComponent(title.replace(/ /g, "_"));
}

async function getSummary(title) {
    const response = await fetch(`${SUMMARY_URL}/${pageName(title)}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Wikipedia error ${response.status}`);
    return response.json();
}


async function getIntro(title) {
    const url = new URL(ACTION_URL);
    url.search = new URLSearchParams({
        action: "query",
        prop: "extracts",
        exintro: "1",
        explaintext: "1",
        redirects: "1",
        format: "json",
        formatversion: "2",
        origin: "*",
        titles: title,
    });
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    const text = data?.query?.pages?.[0]?.extract ?? "";
    return text.split("\n").map((p) => p.trim()).filter(Boolean);
}


export async function getBandInfo(artist) {
    const name = artist.trim();
    if (!name) return null;

    for (const candidate of [`${name} (band)`, name, `${name} (musician)`]) {
        const summary = await getSummary(candidate);
        if (!summary || summary.type !== "standard") continue;
        if (!MUSIC_WORDS.test(summary.description ?? "")) continue;

        const intro = await getIntro(summary.title).catch(() => []);
        return {
            title: summary.title.replace(/\s*\((band|musician)\)$/i, ""),
            description: summary.description ?? "",
            thumbnail: summary.thumbnail?.source ?? "",
            paragraphs: intro.length ? intro : [summary.extract],
            url: summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${pageName(summary.title)}`,
        };
    }
    return null;
}

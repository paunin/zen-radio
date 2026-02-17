import type { RadioBrowserStation, Station } from "~/types/station";

const API_BASE = "https://de1.api.radio-browser.info";

function mapToStation(s: RadioBrowserStation): Station | null {
  const streamUrl = s.url_resolved || s.url;
  if (!streamUrl) return null;

  return {
    id: `rb-${s.stationuuid}`,
    name: s.name,
    description: [s.country, s.tags]
      .filter(Boolean)
      .join(" · ")
      .substring(0, 80),
    streamUrl,
    source: "Radio Browser",
    votes: s.votes || 0,
    clickcount: s.clickcount || 0,
    clicktrend: s.clicktrend || 0,
    bitrate: s.bitrate || 0,
    codec: s.codec || "",
    favicon: s.favicon || "",
    country: s.country || "",
    tags: s.tags || "",
  };
}

export async function searchStations(
  query: string,
  signal?: AbortSignal
): Promise<Station[]> {
  const params = new URLSearchParams({
    name: query,
    limit: "15",
    order: "votes",
    reverse: "true",
    hidebroken: "true",
  });

  const response = await fetch(
    `${API_BASE}/json/stations/search?${params}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }

  const data: RadioBrowserStation[] = await response.json();
  return data.map(mapToStation).filter((s): s is Station => s !== null);
}

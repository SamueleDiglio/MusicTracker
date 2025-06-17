export interface Album {
  name: string;
  artist: string;
  url: string;
  image: { "#text": string; size: string }[];
  mbid?: string;
  tracks?: {
    track: {
      name: string;
      duration?: string;
      "@attr"?: { rank: string };
    }[];
  };
  wiki?: { summary: string };
}

const API_KEY = import.meta.env.VITE_LASTFM_API_KEY;
const BASE_URL = "https://ws.audioscrobbler.com/2.0/";

async function fetchFromLastFM(params: Record<string, string>): Promise<any> {
  const url = new URL(BASE_URL);
  url.searchParams.append("api_key", API_KEY);
  url.searchParams.append("format", "json");
  for (const key in params) {
    url.searchParams.append(key, params[key]);
  }

  const response = await fetch(url.toString());
  if (!response.ok)
    throw new Error(`Last.fm API error: ${response.statusText}`);
  return response.json();
}

export async function getTopAlbums(
  tag: string,
  limit: number
): Promise<Album[]> {
  const data = await fetchFromLastFM({
    method: "tag.gettopalbums",
    tag,
    limit: limit.toString(),
  });
  return data.albums.album as Album[];
}

export async function getAlbumDetailsByMbid(
  mbid: string
): Promise<Album | null> {
  try {
    const data = await fetchFromLastFM({
      method: "album.getinfo",
      mbid,
    });
    return data.album as Album;
  } catch (error) {
    console.error("Failed to fetch album details:", error);
    return null;
  }
}

export async function getAlbumDetailsByName(artist: string, album: string) {
  try {
    const data = await fetchFromLastFM({
      method: "album.getinfo",
      artist: artist,
      album: album,
    });

    console.log("API Response:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch album details:", error);
    throw new Error("Errore nella richiesta API");
  }
}

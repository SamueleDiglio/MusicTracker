import { useState, useEffect, useCallback } from "react";
import type { Album } from "../services/lastfmApi";
import type { Artist } from "../services/lastfmApi";
import {
  fetchArtistAlbums,
  getAlbumDetailsByName,
  getArtistDetails,
  getTopAlbums,
} from "../services/lastfmApi";

export function useLastApi(query: string, limit: number) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbums = useCallback(async () => {
    if (albums.length > 0) return;
    if (!query) return;

    setLoading(true);
    setError(null);
    try {
      const result = await getTopAlbums(query, limit);
      setAlbums(result);
    } catch (err) {
      setError("Errore durante il caricamento degli album");
    } finally {
      setLoading(false);
    }
  }, [albums, limit, query]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  return { albums, loading, error };
}

export function useLastApiAlbum(artist: string, album: string) {
  const [details, setDetails] = useState<Album | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!artist || !album) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getAlbumDetailsByName(artist, album);
      setDetails(data.album);
    } catch (err) {
      console.error(err);
      setError("Errore durante il caricamento dei dettagli dell'album");
    } finally {
      setLoading(false);
    }
  }, [artist, album]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return { details, loading, error };
}

export function useLastApiArtist(artist: string) {
  const [details, setDetails] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!artist) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getArtistDetails(artist);
      setDetails(data.artist);
    } catch (err) {
      console.error(err);
      setError("Errore durante il caricamento dei dettagli dell'album");
    } finally {
      setLoading(false);
    }
  }, [artist]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return { details, loading, error };
}

export function useLastApiArtistAlbums(artist: string) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbums = useCallback(async () => {
    if (!artist) return;

    setLoading(true);
    setError(null);
    try {
      const result = await fetchArtistAlbums(artist);
      let albums = result.topalbums?.album || [];
      // Normalize: if not an array, make it an array
      if (albums && !Array.isArray(albums)) {
        albums = [albums];
      }
      setAlbums(albums);
    } catch (err) {
      setError("Errore durante il caricamento degli album");
    } finally {
      setLoading(false);
    }
  }, [artist]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  return { albums, loading, error };
}
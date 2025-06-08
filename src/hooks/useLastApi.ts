import { useState, useEffect, useCallback } from 'react';
import type { Album } from '../services/lastfmApi';
import { getTopAlbums } from '../services/lastfmApi';

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
      setError('Errore durante il caricamento degli album');
    } finally {
      setLoading(false);
    }
  }, [albums, limit, query]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  return { albums, loading, error };
}

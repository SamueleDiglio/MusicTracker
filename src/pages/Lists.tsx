import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { albumService } from '../services/albumService';

const Lists = () => {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlbums = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await albumService.getUserAlbums(user.$id);
        setAlbums(response.documents);
      } catch (error) {
        console.error('Failed to load albums:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAlbums();
  }, [user]);

  const handleListened = async (albumId: string, current: boolean) => {
    try {
      await albumService.markAsListened(albumId, !current);
      setAlbums(albums =>
        albums.map(album =>
          album.$id === albumId ? { ...album, listened: !current } : album
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return <p>Please log in to see your listened albums.</p>;
  if (loading) return <p>Loading...</p>;
  if (albums.length === 0) return <p>No listened albums found.</p>;

  return (
    <div>
      <h1>La tua lista</h1>
      <ul>
        {albums.filter(album => !album.listened).map(album => (
          <li key={album.$id} style={{ marginBottom: '2rem' }}>
            <img
              src={album.image || ''}
              alt={album.albumName}
            />
            <div>
              <strong>{album.albumName}</strong> by {album.artistName}
              <button onClick={() => handleListened(album.$id, album.listened)}>
                Marca come ascoltato
              </button>
            </div>
          </li>
        ))}
      </ul>
      <h1>Album che hai ascoltato</h1>
      <ul>
        {albums.filter(album => album.listened).map(album => (
          <li key={album.$id} style={{ marginBottom: '2rem' }}>
            <img
              src={album.image || ''}
              alt={album.albumName}
            />
            <div>
              <strong>{album.albumName}</strong> by {album.artistName}
              <button onClick={() => handleListened(album.$id, album.listened)}>
                Rimuovi da ascoltati
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lists;
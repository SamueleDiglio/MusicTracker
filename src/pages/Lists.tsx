import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { albumService } from "../services/albumService";
import "./Lists.css";

const Lists = () => {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Funzione di caricamento albums, memorizzata con useCallback per evitare ricreazioni
  const loadAlbums = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await albumService.getUserAlbums(user.$id);
      setAlbums(response.documents);
    } catch (error) {
      console.error("Failed to load albums:", error);
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  const handleListened = useCallback(
    async (albumId: string, current: boolean) => {
      try {
        await albumService.markAsListened(albumId, !current);
        setAlbums((prevAlbums) =>
          prevAlbums.map((album) =>
            album.$id === albumId ? { ...album, listened: !current } : album
          )
        );
      } catch (error) {
        console.error(error);
      }
    },
    []
  );

  const handleRemove = useCallback(async (albumId: string) => {
    try {
      await albumService.removeFromList(albumId);
      setAlbums((prevAlbums) =>
        prevAlbums.filter((album) => album.$id !== albumId)
      );
    } catch (error) {
      console.error(error);
    }
  }, []);

  if (!user) return <p>Please log in to see your listened albums.</p>;
  if (loading) return <p>Loading...</p>;
  if (albums.length === 0) return <p>No listened albums found.</p>;

  return (
    <div>
      <h1>La tua lista</h1>
      <div className="list-container">
        {albums
          .filter((album) => !album.listened)
          .map((album) => (
            <div key={album.$id} className="list-album">
              <img src={album.image || ""} alt={album.albumName} />
              <div>
                <h3>{album.albumName}</h3>
                <p>{album.artistName}</p>
                <button
                  onClick={() => handleListened(album.$id, album.listened)}
                  className="list-button"
                >
                  Marca come ascoltato
                </button>
                <button
                  onClick={() => handleRemove(album.$id)}
                  className="list-button"
                >
                  Rimuovi dalla lista
                </button>
              </div>
            </div>
          ))}
      </div>

      <h1>Album che hai ascoltato</h1>
      <div className="list-container">
        {albums
          .filter((album) => album.listened)
          .map((album) => (
            <div key={album.$id} className="list-album">
              <img src={album.image || ""} alt={album.albumName} />
              <div>
                <h3>{album.albumName}</h3>
                <p>{album.artistName}</p>
                <button
                  onClick={() => handleListened(album.$id, album.listened)}
                  className="list-button"
                >
                  Rimuovi da ascoltati
                </button>
                <button
                  onClick={() => handleRemove(album.$id)}
                  className="list-button"
                >
                  Rimuovi dalla lista
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Lists;

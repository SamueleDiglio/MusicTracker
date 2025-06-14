import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { albumService } from "../services/albumService";
import "./Lists.css";
import AlbumCard from "../components/AlbumCard";

const Lists = () => {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleAlbumChange = useCallback(() => {
    loadAlbums();
  }, [loadAlbums]);

  if (!user) return <p>Accedi per visualizzare le tue liste</p>;
  if (loading) return <p>Caricamento...</p>;

  return (
    <div className="page-container">
      <h1 className="title">Le tue liste</h1>
      <div className="list-section">
        <h1 className="subtitle">Album da ascoltare</h1>
        <div className="list-grid">
          {albums
            .filter((album) => !album.listened)
            .map((album) => (
              <AlbumCard
                className=""
                key={album.$id}
                mbid={album.albumId}
                image={album.image}
                albumName={album.albumName}
                artistName={album.artistName}
                listened={album.listened}
                onChange={handleAlbumChange}
              />
            ))}
        </div>
      </div>

      <div className="list-section">
        <h1 className="subtitle">Album ascoltati</h1>
        <div className="list-grid">
          {albums
            .filter((album) => album.listened)
            .map((album) => (
              <AlbumCard
                className=""
                key={album.$id}
                mbid={album.albumId}
                image={album.image}
                albumName={album.albumName}
                artistName={album.artistName}
                listened={album.listened}
                onChange={handleAlbumChange}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Lists;

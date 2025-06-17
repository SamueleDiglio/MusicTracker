import { useAuth } from "../contexts/AuthContext";
import { useUserAlbums } from "../contexts/UserAlbumContext";
import "./Lists.css";
import AlbumCard from "../components/AlbumCard";

const Lists = () => {
  const { user } = useAuth();
  const { userAlbums, loading, error } = useUserAlbums();

  if (!user) return <p>Accedi per visualizzare le tue liste</p>;
  if (loading) return <p>Caricamento...</p>;
  if (error) return <p>Errore nel caricamento: {error}</p>;

  return (
    <div className="page-container">
      <h1 className="title">Le tue liste</h1>
      <div className="list-section">
        <h1 className="subtitle">Album da ascoltare</h1>
        <div className="list-grid">
          {userAlbums
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
              />
            ))}
        </div>
      </div>

      <div className="list-section">
        <h1 className="subtitle">Album ascoltati</h1>
        <div className="list-grid">
          {userAlbums
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
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Lists;

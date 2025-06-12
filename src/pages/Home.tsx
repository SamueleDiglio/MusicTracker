import { useCallback, useState, useEffect } from "react";
import { useLastApi } from "../hooks/useLastApi";
import AlbumCard from "../components/AlbumCard";
import { useAuth } from "../contexts/AuthContext";
import { albumService } from "../services/albumService";
import AlbumSlider from "../components/AlbumSlider";
import "./Home.css";

interface UserAlbum {
  $id: string;
  albumId: string;
  albumName: string;
  artistName: string;
  image: string;
  listened: boolean;
}

const Home = () => {
  const {
    albums: popAlbums,
    loading: loadingPop,
    error: errorPop,
  } = useLastApi("pop", 30);
  const {
    albums: rapAlbums,
    loading: loadingRap,
    error: errorRap,
  } = useLastApi("rap", 30);

  const { user } = useAuth();
  const [userAlbums, setUserAlbums] = useState<UserAlbum[]>([]);

  const fetchUserAlbums = useCallback(async () => {
    if (!user) {
      setUserAlbums([]);
      return;
    }
    try {
      const response = await albumService.getUserAlbums(user.$id);
      setUserAlbums(response.documents);
    } catch {
      setUserAlbums([]);
    }
  }, [user]);

  // Fetch user albums on mount and when user changes
  useEffect(() => {
    fetchUserAlbums();
  }, [fetchUserAlbums]);

  // Optionally, refresh user albums every 60s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchUserAlbums();
    }, 60000);
    return () => clearInterval(interval);
  }, [user, fetchUserAlbums]);

  const getListenedStatus = useCallback(
    (albumId: string) => {
      return userAlbums.some((a) => a.albumId === albumId && a.listened);
    },
    [userAlbums]
  );

  const handleAlbumChange = useCallback(() => {
    fetchUserAlbums();
  }, [fetchUserAlbums]);

  return (
    <div className="page-container">
      <h1 className="title">
        Ciao {user ? user.name.split(" ")[0] : ""}! Cosa ascolterai oggi?
      </h1>

      <AlbumSlider
        albums={userAlbums.filter((album) => !album.listened)}
        renderAlbum={(album) => (
          <AlbumCard
            key={album.$id}
            mbid={album.albumId}
            image={album.image}
            albumName={album.albumName}
            artistName={album.artistName}
            listened={album.listened}
            onChange={handleAlbumChange}
          />
        )}
        title="La tua lista"
        showIfEmpty={
          user ? (
            <p>
              Non è presente alcun album nella tua lista. Aggiungine qualcuno.
            </p>
          ) : null
        }
      />

      <AlbumSlider
        albums={popAlbums}
        renderAlbum={(album) => {
          const mbid = album.mbid || `${album.name}-${album.artist.name}`;
          const image = Array.isArray(album.image)
            ? album.image.find(
                (img: { size: string; ["#text"]: string }) =>
                  img.size === "large"
              )?.["#text"] || ""
            : album.image;
          return (
            <AlbumCard
              key={mbid}
              mbid={mbid}
              image={image}
              albumName={album.name}
              artistName={album.artist.name}
              listened={getListenedStatus(mbid)}
              onChange={handleAlbumChange}
            />
          );
        }}
        title="Top album Pop"
        loading={loadingPop}
        error={errorPop ?? undefined}
      />

      <AlbumSlider
        albums={rapAlbums}
        renderAlbum={(album) => {
          const mbid = album.mbid || `${album.name}-${album.artist.name}`;
          const image = Array.isArray(album.image)
            ? album.image.find(
                (img: { size: string; ["#text"]: string }) =>
                  img.size === "large"
              )?.["#text"] || ""
            : album.image;
          return (
            <AlbumCard
              key={mbid}
              mbid={mbid}
              image={image}
              albumName={album.name}
              artistName={album.artist.name}
              listened={getListenedStatus(mbid)}
              onChange={handleAlbumChange}
            />
          );
        }}
        title="Top album Rap"
        loading={loadingRap}
        error={errorRap ?? undefined}
      />
    </div>
  );
};

export default Home;

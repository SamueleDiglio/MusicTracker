import { useCallback } from "react";
import { useLastApi } from "../hooks/useLastApi";
import AlbumCard from "../components/AlbumCard";
import { useAuth } from "../contexts/AuthContext";
import { useUserAlbums } from "../contexts/UserAlbumContext";
import AlbumSlider from "../components/AlbumSlider";
import "./Home.css";

const Home = () => {
  const {
    albums: popAlbums,
    loading: loadingPop,
    error: errorPop,
  } = useLastApi("pop", 45);
  const {
    albums: rnbAlbums,
    loading: loadingRnb,
    error: errorRnb,
  } = useLastApi("rnb", 45);
  const {
    albums: hipHopAlbums,
    loading: loadingHipHop,
    error: errorHipHop,
  } = useLastApi("hip-hop", 45);
  const {
    albums: indieAlbums,
    loading: loadingIndie,
    error: errorIndie,
  } = useLastApi("indie", 45);

  const { user } = useAuth();
  const { userAlbums, getAlbumStatus } = useUserAlbums();

  const getListenedStatus = useCallback(
    (albumId: string) => {
      return getAlbumStatus(albumId).listened;
    },
    [getAlbumStatus]
  );

  return (
    <div className="page-container">
      <h1 className="title">
        Ciao{user ? " " + user.name.split(" ")[0] : ""}! Cosa ascolterai oggi?
      </h1>

      <AlbumSlider
        albums={userAlbums.filter((album) => !album.listened)}
        renderAlbum={(album) => (
          <AlbumCard
            className="slider-card"
            key={album.$id}
            mbid={album.albumId}
            image={album.image}
            albumName={album.albumName}
            artistName={album.artistName}
            listened={album.listened}
          />
        )}
        title="La tua lista"
        showIfEmpty={
          user ? (
            <p>
              Non è presente alcun album nella tua lista. Aggiungine qualcuno.
            </p>
          ) : (
            <p>Accedi per visualizzare la tua lista</p>
          )
        }
      />

      <AlbumSlider
        albums={hipHopAlbums}
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
              className="slider-card"
              key={mbid}
              mbid={mbid}
              image={image}
              albumName={album.name}
              artistName={album.artist.name}
              listened={getListenedStatus(mbid)}
            />
          );
        }}
        title="Top album Hip-Hop"
        loading={loadingHipHop}
        error={errorHipHop ?? undefined}
      />

      <AlbumSlider
        albums={rnbAlbums}
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
              className="slider-card"
              key={mbid}
              mbid={mbid}
              image={image}
              albumName={album.name}
              artistName={album.artist.name}
              listened={getListenedStatus(mbid)}
            />
          );
        }}
        title="Top album R&B"
        loading={loadingRnb}
        error={errorRnb ?? undefined}
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
              className="slider-card"
              key={mbid}
              mbid={mbid}
              image={image}
              albumName={album.name}
              artistName={album.artist.name}
              listened={getListenedStatus(mbid)}
            />
          );
        }}
        title="Top album Pop"
        loading={loadingPop}
        error={errorPop ?? undefined}
      />

      <AlbumSlider
        albums={indieAlbums}
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
              className="slider-card"
              key={mbid}
              mbid={mbid}
              image={image}
              albumName={album.name}
              artistName={album.artist.name}
              listened={getListenedStatus(mbid)}
            />
          );
        }}
        title="Top album Indie"
        loading={loadingIndie}
        error={errorIndie ?? undefined}
      />
    </div>
  );
};

export default Home;

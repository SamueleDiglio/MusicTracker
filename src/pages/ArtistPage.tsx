import { Link, useParams } from "react-router-dom";
import { useLastApiArtist, useLastApiArtistAlbums } from "../hooks/useLastApi";
import { useAuth } from "../contexts/AuthContext";
import { useUserAlbums } from "../contexts/UserAlbumContext";
import { useCallback } from "react";
import AlbumSlider from "../components/AlbumSlider";
import AlbumCard from "../components/AlbumCard";

const ArtistPage = () => {
  const { artist } = useParams<{ artist: string }>();
  const decodedArtist = artist ? decodeURIComponent(artist) : "";
  const { details, loading, error } = useLastApiArtist(decodedArtist);
  const { user } = useAuth();
  const { userAlbums, getAlbumStatus } = useUserAlbums();
  const {
    albums: artistAlbums,
    loading: loadingArtistAlbums,
    error: errorArtistAlbums,
  } = useLastApiArtistAlbums(decodedArtist);

  const getListenedStatus = useCallback(
    (albumId: string) => {
      return getAlbumStatus(albumId).listened;
    },
    [getAlbumStatus]
  );

  if (loading) return <p>Caricamento...</p>;
  if (error) return <p>Errore: {error}</p>;
  if (!details) return <p>Nessun dettaglio disponibile.</p>;

  if (loadingArtistAlbums) return <p>Caricamento...</p>;
  if (errorArtistAlbums) return <p>Errore: {error}</p>;
  if (!artistAlbums) return <p>Nessun album disponibile.</p>;

  const imageUrl =
    details.image?.find((img) => img.size === "mega")?.["#text"] ||
    details.image?.[0]?.["#text"];

  return (
    <div className="page-container">
      {imageUrl ? (
        <img src={imageUrl} alt={details.name} />
      ) : (
        <div>
          <p>Immagine non disponibile</p>
        </div>
      )}
      <h1>{details.name}</h1>
      {details.bio?.summary ? (
        <p
          className="desc"
          dangerouslySetInnerHTML={{
            __html: details.bio.summary.replace(
              /(<a[^>]*>read more)/gi,
              "... $1"
            ),
          }}
        />
      ) : (
        <p className="desc">Non è presente alcuna descrizione.</p>
      )}
      {details.ontour == 1 ? <p>In tour</p> : <p>Non in tour</p>}

      <h1>Artisti simili</h1>
      {details.similar.artist.map((artist) => (
        <Link to={`/ArtistPage/${artist.name}`} title={`vai a ${artist.name}`}>
          <p key={artist.name}>{artist.name}</p>
        </Link>
      ))}

      <AlbumSlider
        albums={artistAlbums}
        renderAlbum={(album) => {
          const mbid = album.mbid || `${album.name}-${album.artist}`;
          const image = Array.isArray(album.image)
            ? album.image.find(
                (img: { size: string }) => img.size === "large"
              )?.["#text"] || ""
            : album.image;
          return (
            <AlbumCard
              className="slider-card"
              key={mbid}
              mbid={mbid}
              image={image}
              albumName={album.name}
              artistName={decodedArtist}
              listened={getListenedStatus(mbid)}
            />
          );
        }}
        title="Discografia dell'artista (comprende anche singoli)"
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
    </div>
  );
};

export default ArtistPage;

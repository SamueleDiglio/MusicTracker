import { Link, useParams } from "react-router-dom";
import { useLastApiAlbum } from "../hooks/useLastApi";
import { useAuth } from "../contexts/AuthContext";
import { useUserAlbums } from "../contexts/UserAlbumContext";
import "./AlbumDetails.css";

const normalizeAlbumId = (albumId: string) => {
  let normalized = albumId.trim().toLowerCase();
  normalized = normalized.replace(/-\d+$/, "");
  return normalized;
};

const normalizeId = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");

const AlbumDetails = () => {
  const { artist, album } = useParams<{ artist: string; album: string }>();
  const { user } = useAuth();
  const { addAlbum, updateAlbumStatus, removeAlbum, getAlbumStatus } =
    useUserAlbums();

  const decodedArtist = artist ? decodeURIComponent(artist) : "";
  const decodedAlbum = album ? decodeURIComponent(album) : "";

  const { details, loading, error } = useLastApiAlbum(
    decodedArtist,
    decodedAlbum
  );

  let albumStatus: {
    added: boolean;
    listened: boolean;
    docId?: string;
  } = { added: false, listened: false };

  let activeId = "";
  if (details) {
    const mbidId = details.mbid
      ? normalizeAlbumId(normalizeId(details.mbid))
      : null;
    const nameArtistId = normalizeAlbumId(
      normalizeId(`${details.name}-${details.artist}`)
    );

    albumStatus = getAlbumStatus(nameArtistId);
    activeId = nameArtistId;

    if (!albumStatus.added && mbidId && mbidId !== nameArtistId) {
      const mbidStatus = getAlbumStatus(mbidId);
      if (mbidStatus.added) {
        albumStatus = mbidStatus;
        activeId = mbidId;
      }
    }
  } else {
    activeId = normalizeAlbumId(
      normalizeId(`${decodedAlbum}-${decodedArtist}`)
    );
    albumStatus = getAlbumStatus(activeId);
  }

  const handleMarkAsAdded = async () => {
    if (!user) {
      alert("Devi essere loggato per aggiungere un album alla lista.");
      return;
    }
    if (albumStatus.added) {
      alert("Album già presente nella tua lista!");
      return;
    }
    if (!details) return;

    try {
      const imageUrl =
        details.image?.find((img) => img.size === "mega")?.["#text"] ||
        details.image?.[0]?.["#text"] ||
        "";

      await addAlbum({
        albumId: activeId,
        albumName: details.name,
        artistName: details.artist,
        image: imageUrl,
        listened: false,
      });
    } catch (error) {
      alert("Errore nell'aggiunta dell'album.");
      console.error(error);
    }
  };

  const handleMarkAsListened = async () => {
    if (!user) {
      alert("Devi essere loggato per segnare come ascoltato.");
      return;
    }
    if (!details) return;

    try {
      const imageUrl =
        details.image?.find((img) => img.size === "mega")?.["#text"] ||
        details.image?.[0]?.["#text"] ||
        "";

      if (!albumStatus.added) {
        await addAlbum({
          albumId: activeId,
          albumName: details.name,
          artistName: details.artist,
          image: imageUrl,
          listened: true,
        });
      } else if (albumStatus.docId && !albumStatus.listened) {
        await updateAlbumStatus(albumStatus.docId, true);
      } else if (albumStatus.listened) {
        alert("Album già segnato come ascoltato!");
      }
    } catch (error) {
      alert("Errore nel segnare come ascoltato.");
      console.error(error);
    }
  };

  const handleMarkAsUnlistened = async () => {
    if (!user) {
      alert("Devi essere loggato per modificare lo stato.");
      return;
    }
    if (!albumStatus.docId) return;

    try {
      await updateAlbumStatus(albumStatus.docId, false);
    } catch (error) {
      alert("Errore nel segnare come non ascoltato.");
      console.error(error);
    }
  };

  const handleRemoveFromList = async () => {
    if (!user) {
      alert("Devi essere loggato per rimuovere un album dalla lista.");
      return;
    }
    if (!albumStatus.docId) return;

    try {
      await removeAlbum(albumStatus.docId);
    } catch (error) {
      alert("Errore nella rimozione dell'album.");
      console.error(error);
    }
  };

  if (loading) return <p>Caricamento...</p>;
  if (error) return <p>Errore: {error}</p>;
  if (!details) return <p>Nessun dettaglio disponibile.</p>;

  const imageUrl =
    details.image?.find((img) => img.size === "mega")?.["#text"] ||
    details.image?.[0]?.["#text"];

  const tracks = details.tracks?.track || details.tracks || [];
  const hasValidTracks = Array.isArray(tracks) && tracks.length > 0;

  function getMinutes(duration: number) {
    const minutes = Math.floor(duration / 60);
    let seconds = duration - minutes * 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  }

  return (
    <div className="page-container">
      <div className="album-details-content">
        <div className="album-info-container">
          {imageUrl ? (
            <img src={imageUrl} alt={details.name} className="cover" />
          ) : (
            <div>
              <p>Immagine non disponibile</p>
            </div>
          )}
          <div>
            <h1 className="title">{details.name}</h1>
            <Link
              to={`/ArtistPage/${decodedArtist}`}
              title={`vai a ${decodedArtist}`}
            >
              <h1 className="subtitle">{details.artist}</h1>
            </Link>

            <div className="details-buttons">
              {user && albumStatus.added ? (
                <button
                  onClick={handleRemoveFromList}
                  className="listened-button disabled"
                >
                  Rimuovi dalla lista
                </button>
              ) : (
                <button onClick={handleMarkAsAdded} className="listened-button">
                  Aggiungi alla lista
                </button>
              )}

              {user && albumStatus.listened ? (
                <button
                  onClick={handleMarkAsUnlistened}
                  className="listened-button disabled"
                >
                  Rimuovi da ascoltati
                </button>
              ) : (
                <button
                  onClick={handleMarkAsListened}
                  className="listened-button"
                >
                  Segna come ascoltato
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="album-info">
          <h1 className="subtitle">Descrizione:</h1>
          {details.wiki?.summary ? (
            <p
              className="desc"
              dangerouslySetInnerHTML={{
                __html: details.wiki.summary.replace(
                  /(<a[^>]*>read more)/gi,
                  "... $1"
                ),
              }}
            />
          ) : (
            <p className="desc">Non è presente alcuna descrizione.</p>
          )}

          <h1 className="subtitle">Tracce:</h1>
          {hasValidTracks ? (
            <ol>
              {tracks.map((track: any, index: number) => (
                <li key={index} className="tracks">
                  {typeof track === "string"
                    ? track
                    : track.name || `Track ${index + 1}`}
                  {track.duration && <span>{getMinutes(track.duration)}</span>}
                </li>
              ))}
            </ol>
          ) : (
            <p>Informazioni sulle tracce non disponibili per questo album.</p>
          )}

          {details.url && (
            <div>
              <a href={details.url} target="_blank" className="lastfm">
                Visualizza su Last.fm →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlbumDetails;

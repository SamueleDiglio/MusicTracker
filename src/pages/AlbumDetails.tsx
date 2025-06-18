import { useParams } from "react-router-dom";
import { useLastApiAlbum } from "../hooks/useLastApi";
import "./AlbumDetails.css";

const AlbumDetails = () => {
  const { artist, album } = useParams<{ artist: string; album: string }>();

  const decodedArtist = artist ? decodeURIComponent(artist) : "";
  const decodedAlbum = album ? decodeURIComponent(album) : "";

  const { details, loading, error } = useLastApiAlbum(
    decodedArtist,
    decodedAlbum
  );

  if (loading) return <p>Caricamento...</p>;
  if (error) return <p>Errore: {error}</p>;
  if (!details) return <p>Nessun dettaglio disponibile.</p>;

  console.log("Album details:", details);

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
          <h1 className="title">{details.name}</h1>
          <h1 className="subtitle">{details.artist}</h1>
        </div>

        <div className="album-info">
          <h1 className="subtitle">Descrizione:</h1>
          {details.wiki?.summary ? (
            <div
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

import { useParams } from "react-router-dom";
import { useLastApiAlbum } from "../hooks/useLastApi";

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
    details.image?.find((img) => img.size === "large")?.["#text"] ||
    details.image?.[0]?.["#text"];

  const tracks = details.tracks?.track || details.tracks || [];
  const hasValidTracks = Array.isArray(tracks) && tracks.length > 0;

  function getMinutes(duration: number) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration - minutes * 60;
    return `${minutes}:${seconds}`;
  }

  return (
    <div className="page-container">
      <div>
        <h1>{details.name}</h1>
        <h2>by {details.artist}</h2>

        {imageUrl && (
          <img
            src={imageUrl}
            alt={details.name}
            style={{ maxWidth: "300px", height: "auto", marginBottom: "20px" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}

        {details.wiki?.summary && (
          <div style={{ marginBottom: "20px" }}>
            <h3>Descrizione:</h3>
            <div
              dangerouslySetInnerHTML={{
                __html: details.wiki.summary.replace(
                  /(<a[^>]*>read more)/gi,
                  "... $1"
                ),
              }}
            />
          </div>
        )}

        <h3>Tracce:</h3>
        {hasValidTracks ? (
          <ol>
            {tracks.map((track: any, index: number) => (
              <li key={index} style={{ marginBottom: "5px" }}>
                {typeof track === "string"
                  ? track
                  : track.name || `Track ${index + 1}`}
                {track.duration && (
                  <span style={{ color: "#666", marginLeft: "10px" }}>
                    ({getMinutes(track.duration)})
                  </span>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p>
            Informazioni sulle tracce non disponibili per questo album.
          </p>
        )}

        {details.url && (
          <div style={{ marginTop: "20px" }}>
            <a href={details.url} target="_blank">
              Visualizza su Last.fm →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumDetails;

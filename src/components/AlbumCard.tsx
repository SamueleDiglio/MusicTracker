import "./AlbumCard.css";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useUserAlbums } from "../contexts/UserAlbumContext";
import inListSvg from "../assets/inList.svg";
import AddToListSvg from "../assets/addToList.svg";

type AlbumCardProps = {
  mbid: string;
  image: string;
  albumName: string;
  artistName: string;
  listened: boolean;
  onChange?: () => void;
  className: string;
};

const AlbumCard = ({
  mbid,
  image,
  albumName,
  artistName,
  className,
}: AlbumCardProps) => {
  const { user } = useAuth();
  const { addAlbum, updateAlbumStatus, getAlbumStatus } = useUserAlbums();
  const { added, listened, docId } = getAlbumStatus(mbid);
  const isListened = listened;

  const handleMarkAsAdded = async () => {
    if (!user) {
      alert("You must be logged in to add an album to the list.");
      return;
    }
    if (added) {
      alert("Album already added to list.");
      return;
    }
    try {
      await addAlbum({
        albumId: mbid,
        albumName,
        artistName,
        image,
        listened: false,
      });
    } catch (error) {
      alert("Failed to add album.");
      console.error(error);
    }
  };

  const handleMarkAsListened = async () => {
    if (!user) {
      alert("You must be logged in to mark as listened");
      return;
    }
    try {
      if (!added) {
        await addAlbum({
          albumId: mbid,
          albumName,
          artistName,
          image,
          listened: true,
        });
      } else if (docId && !isListened) {
        await updateAlbumStatus(docId, true);
      } else if (isListened) {
        alert("Album already listened");
      }
    } catch (error) {
      alert("Impossibile segnare l'album come ascoltato");
      console.error(error);
    }
  };

  const [imgError, setImgError] = useState(false);
  const encodedAlbum = encodeURIComponent(albumName);
  const encodedArtist = encodeURIComponent(artistName);

  return (
    <div className={`album-card-background ${className}`}>
      <div className="image-wrapper">
        <Link
          to={`/AlbumDetails/${encodedArtist}/${encodedAlbum}`}
          title={`${albumName} di ${artistName}`}
        >
          {image && !imgError ? (
            <img
              src={image}
              alt={albumName}
              className="album-image"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="no-image">
              <p>Immagine non trovata</p>
            </div>
          )}
        </Link>
        <button className="icon-container">
          {user && added ? (
            <img src={inListSvg} alt="nella lista" className="icon" />
          ) : (
            <img
              onClick={handleMarkAsAdded}
              src={AddToListSvg}
              alt="nella lista"
              className="icon"
            />
          )}
        </button>
      </div>
      <p className="album-title">{albumName}</p>
      <p className="album-artist">{artistName}</p>
      {user && isListened ? (
        <button
          className="listened-button disabled"
          onClick={handleMarkAsListened}
          disabled={isListened}
        >
          Ascoltato
        </button>
      ) : (
        <button className="listened-button" onClick={handleMarkAsListened}>
          Segna come ascoltato
        </button>
      )}
    </div>
  );
};

export default AlbumCard;
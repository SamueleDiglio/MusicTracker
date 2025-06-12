import "./AlbumCard.css";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { albumService } from "../services/albumService";
import {
  databases,
  MUSIC_DB_ID,
  USER_ALBUMS_COLLECTION_ID,
} from "../lib/appwrite";
import { Query } from "appwrite";

type AlbumCardProps = {
  mbid: string;
  image: string;
  albumName: string;
  artistName: string;
  listened: boolean;
  onChange?: () => void;
};

const AlbumCard = ({
  mbid,
  image,
  albumName,
  artistName,
  listened,
  onChange,
}: AlbumCardProps) => {
  const [added, setAdded] = useState(false);
  const [isListened, setIsListened] = useState(listened);
  const [docId, setDocId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const checkIfAdded = async () => {
      if (!user) return;
      const existing = await databases.listDocuments(
        MUSIC_DB_ID,
        USER_ALBUMS_COLLECTION_ID,
        [Query.equal("userId", user.$id), Query.equal("albumId", mbid)]
      );
      if (existing.total > 0) {
        setAdded(true);
        setDocId(existing.documents[0].$id);
        setIsListened(existing.documents[0].listened);
      } else {
        setAdded(false);
        setDocId(null);
        setIsListened(false);
      }
    };
    checkIfAdded();
  }, [user, mbid]);

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
      await albumService.addUserAlbum(user.$id, {
        albumId: mbid,
        albumName,
        artistName,
        image,
        listened: false,
      });
      setAdded(true);
      setIsListened(false);
      if (onChange) onChange();
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
      let currentDocId = docId;
      if (!added) {
        const doc = await albumService.addUserAlbum(user.$id, {
          albumId: mbid,
          albumName,
          artistName,
          image,
          listened: false,
        });
        setAdded(true);
        currentDocId = doc.$id;
        setDocId(doc.$id);
        setIsListened(false);
        if (onChange) onChange();
      }
      if (!isListened && currentDocId) {
        await albumService.markAsListened(currentDocId, true);
        setIsListened(true);
        if (onChange) onChange();
      } else if (isListened) {
        alert("Album already listened");
      }
    } catch (error) {
      alert("Impossibile segnare l'album come ascoltato");
      console.error(error);
    }
  };

  useEffect(() => {
    setIsListened(listened);
  }, [listened]);

  const [imgError, setImgError] = useState(false);

  return (
    <div className="album-card-background">
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
      <button className="icon-container">
        {user && added ? (
          <img src="src\assets\inList.svg" alt="nella lista" className="icon" />
        ) : (
          <img
            onClick={handleMarkAsAdded}
            src="src\assets\addToList.svg"
            alt="nella lista"
            className="icon"
          />
        )}
      </button>
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

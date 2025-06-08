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
import { BsBookmarkPlus } from "react-icons/bs";
import { BsBookmarkPlusFill } from "react-icons/bs";
import { BsCheckCircle } from "react-icons/bs";
import { BsMusicNoteBeamed } from "react-icons/bs";

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

  return (
    <div className="album-card-background">
      <img src={image} alt={albumName} />
      <div className="album-card-buttons">
        {user && (
          <button
            onClick={handleMarkAsAdded}
            disabled={added}
            className="button-icon"
          >
            {added ? (
              <BsBookmarkPlusFill className="album-card-icon checked" />
            ) : (
              <BsBookmarkPlus className="album-card-icon" />
            )}
          </button>
        )}
        {user && (
          <button
            onClick={handleMarkAsListened}
            disabled={isListened}
            className="button-icon"
          >
            {isListened ? (
              <BsMusicNoteBeamed className="album-card-icon checked" />
            ) : (
              <BsCheckCircle className="album-card-icon" />
            )}
          </button>
        )}
      </div>
      <h3>{albumName}</h3>
      <p>{artistName}</p>
    </div>
  );
};

export default AlbumCard;

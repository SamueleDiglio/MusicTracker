import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { albumService, type UserAlbum } from "../services/albumService";

interface UserAlbumDocument extends UserAlbum {
  $id: string;
  userId: string;
}

interface UserAlbumContextType {
  userAlbums: UserAlbumDocument[];
  loading: boolean;
  error: string | null;
  addAlbum: (album: UserAlbum) => Promise<UserAlbumDocument>;
  updateAlbumStatus: (documentId: string, listened: boolean) => Promise<void>;
  removeAlbum: (documentId: string) => Promise<void>;
  refreshAlbums: () => Promise<void>;
  isAlbumAdded: (albumId: string) => boolean;
  getAlbumStatus: (albumId: string) => {
    added: boolean;
    listened: boolean;
    docId?: string;
  };
  findAlbumByNameAndArtist: (albumName: string, artistName: string) => {
    added: boolean;
    listened: boolean;
    docId?: string;
  };
}

const UserAlbumContext = createContext<UserAlbumContextType | null>(null);

const normalizeId = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");

// Enhanced normalization for better matching
const normalizeForComparison = (str: string) => {
  return str
    .toLowerCase()
    .replace(/['\"""'']/g, "") // Remove all types of quotes and apostrophes
    .replace(/[^\w\s]/g, "") // Remove all punctuation except word chars and spaces
    .replace(/\s+/g, " ") // Normalize multiple spaces to single space
    .trim();
};

// Check if two strings are similar enough to be considered the same
const isSimilarString = (str1: string, str2: string): boolean => {
  const normalized1 = normalizeForComparison(str1);
  const normalized2 = normalizeForComparison(str2);
  
  // Exact match after normalization
  if (normalized1 === normalized2) return true;
  
  // Check if one contains the other (for cases like "feat." additions)
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true;
  }
  
  return false;
};

export function UserAlbumProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userAlbums, setUserAlbums] = useState<UserAlbumDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserAlbums();
    } else {
      setUserAlbums([]);
      setLoading(false);
      setError(null);
    }
  }, [user]);

  const fetchUserAlbums = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await albumService.getUserAlbums(user.$id);
      setUserAlbums(response.documents);
    } catch (err) {
      console.error("Failed to fetch user albums:", err);
      setError("Failed to load albums");
      setUserAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  const addAlbum = async (album: UserAlbum): Promise<UserAlbumDocument> => {
    if (!user) throw new Error("User must be logged in");

    try {
      const newAlbum = await albumService.addUserAlbum(user.$id, album);
      const albumDocument = {
        ...album,
        $id: newAlbum.$id,
        userId: user.$id,
      };

      setUserAlbums((prev) => [...prev, albumDocument]);
      return albumDocument;
    } catch (error) {
      console.error("Error adding album:", error);
      throw error;
    }
  };

  const updateAlbumStatus = async (documentId: string, listened: boolean) => {
    try {
      await albumService.markAsListened(documentId, listened);
      setUserAlbums((prev) =>
        prev.map((album) =>
          album.$id === documentId ? { ...album, listened } : album
        )
      );
    } catch (error) {
      console.error("Error updating album status:", error);
      throw error;
    }
  };

  const removeAlbum = async (documentId: string) => {
    try {
      await albumService.removeFromList(documentId);
      setUserAlbums((prev) => prev.filter((album) => album.$id !== documentId));
    } catch (error) {
      console.error("Error removing album:", error);
      throw error;
    }
  };

  const refreshAlbums = async () => {
    await fetchUserAlbums();
  };

  const isAlbumAdded = (albumId: string): boolean => {
    const normalizedId = normalizeId(albumId);
    return userAlbums.some(
      (album) => normalizeId(album.albumId) === normalizedId
    );
  };

  const getAlbumStatus = (albumId: string) => {
    const normalizedId = normalizeId(albumId);
    const album = userAlbums.find(
      (album) => normalizeId(album.albumId) === normalizedId
    );

    return {
      added: !!album,
      listened: album?.listened ?? false,
      docId: album?.$id,
    };
  };

  const findAlbumByNameAndArtist = (albumName: string, artistName: string) => {
    // First try to find by exact normalized names
    const album = userAlbums.find(
      (userAlbum) =>
        isSimilarString(userAlbum.albumName, albumName) &&
        isSimilarString(userAlbum.artistName, artistName)
    );

    return {
      added: !!album,
      listened: album?.listened ?? false,
      docId: album?.$id,
    };
  };

  const value: UserAlbumContextType = {
    userAlbums,
    loading,
    error,
    addAlbum,
    updateAlbumStatus,
    removeAlbum,
    refreshAlbums,
    isAlbumAdded,
    getAlbumStatus,
    findAlbumByNameAndArtist,
  };

  return (
    <UserAlbumContext.Provider value={value}>
      {children}
    </UserAlbumContext.Provider>
  );
}

export function useUserAlbums() {
  const context = useContext(UserAlbumContext);
  if (!context) {
    throw new Error("useUserAlbums must be used within UserAlbumProvider");
  }
  return context;
}
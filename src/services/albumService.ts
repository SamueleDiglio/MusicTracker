import {
  databases,
  MUSIC_DB_ID,
  USER_ALBUMS_COLLECTION_ID,
} from "../lib/appwrite";
import { ID, Query } from "appwrite";

export interface UserAlbum {
  albumId: string;
  albumName: string;
  artistName: string;
  image: string;
  listened: boolean;
}

// Funzione per normalizzare albumId (minuscolo, senza spazi, rimuove suffissi -0, -1, ...)
const normalizeAlbumId = (albumId: string) => {
  let normalized = albumId.trim().toLowerCase();
  normalized = normalized.replace(/-\d+$/, "");
  return normalized;
};

export const albumService = {
  async addUserAlbum(userId: string, album: UserAlbum) {
    try {
      // Normalizzo l'albumId prima di cercare duplicati e salvarlo
      const normalizedAlbumId = normalizeAlbumId(album.albumId);

      const existing = await databases.listDocuments(
        MUSIC_DB_ID,
        USER_ALBUMS_COLLECTION_ID,
        [
          Query.equal("userId", userId),
          Query.equal("albumId", normalizedAlbumId),
        ]
      );
      if (existing.total > 0) {
        throw new Error("Album already added to list.");
      }

      return await databases.createDocument(
        MUSIC_DB_ID,
        USER_ALBUMS_COLLECTION_ID,
        ID.unique(),
        {
          userId,
          albumId: normalizedAlbumId,
          albumName: album.albumName,
          artistName: album.artistName,
          image: album.image,
          listened: album.listened,
        }
      );
    } catch (error) {
      console.error("Error adding user album:", error);
      throw error;
    }
  },

  async getUserAlbums(userId: string) {
    console.log("Fetching albums for userId:", userId);

    let allAlbums: any[] = [];
    let cursor: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const queries = [Query.equal("userId", userId), Query.limit(100)];
      if (cursor) {
        queries.push(Query.cursorAfter(cursor));
      }

      const response = await databases.listDocuments(
        MUSIC_DB_ID,
        USER_ALBUMS_COLLECTION_ID,
        queries
      );

      allAlbums = [...allAlbums, ...response.documents];

      if (response.documents.length < 100) {
        hasMore = false;
      } else {
        cursor = response.documents[response.documents.length - 1].$id;
      }
    }

    console.log("Total albums fetched:", allAlbums.length);
    return { documents: allAlbums };
  },

  async updateAlbumRating(documentId: string, rating: number) {
    try {
      return await databases.updateDocument(
        MUSIC_DB_ID,
        USER_ALBUMS_COLLECTION_ID,
        documentId,
        { rating }
      );
    } catch (error) {
      console.error("Error updating album rating:", error);
      throw error;
    }
  },

  async markAsListened(documentId: string, listened: boolean) {
    try {
      return await databases.updateDocument(
        MUSIC_DB_ID,
        USER_ALBUMS_COLLECTION_ID,
        documentId,
        { listened }
      );
    } catch (error) {
      console.error("Impossibile segnare l'album come ascoltato");
      throw error;
    }
  },

  async removeFromList(documentId: string) {
    try {
      return await databases.deleteDocument(
        MUSIC_DB_ID,
        USER_ALBUMS_COLLECTION_ID,
        documentId
      );
    } catch (error) {
      console.error("Impossibile rimuovere l'album dalla lista");
      throw error;
    }
  },

  async searchAlbums(query: string) {
    try {
      const API_KEY = import.meta.env.VITE_LASTFM_API_KEY;
      const url = `https://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(
        query
      )}&api_key=${API_KEY}&format=json&limit=30`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      // Adapt this mapping to your AlbumCard props structure
      return (
        data.results.albummatches.album.map((album: any) => ({
          mbid: album.mbid,
          name: album.name,
          artist: { name: album.artist },
          image: album.image, // array of images with different sizes
        })) || []
      );
    } catch (error) {
      console.error("Error searching albums:", error);
      throw error;
    }
  },
};

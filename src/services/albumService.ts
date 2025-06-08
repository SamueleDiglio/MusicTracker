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

export const albumService = {
  async addUserAlbum(userId: string, album: UserAlbum) {
    try {
      const existing = await databases.listDocuments(
        MUSIC_DB_ID,
        USER_ALBUMS_COLLECTION_ID,
        [Query.equal("userId", userId), Query.equal("albumId", album.albumId)]
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
          albumId: album.albumId,
          albumName: album.albumName,
          artistName: album.artistName,
          image: album.image,
          listened: false,
        }
      );
    } catch (error) {
      console.error("Error adding user album:", error);
      throw error;
    }
  },

  async getUserAlbums(userId: string) {
    try {
      return await databases.listDocuments(
        MUSIC_DB_ID,
        USER_ALBUMS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );
    } catch (error) {
      console.error("Error fetching user albums:", error);
      throw error;
    }
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

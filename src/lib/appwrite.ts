import { Client, Databases, Account } from "appwrite";

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT);

export const databases = new Databases(client);
export const account = new Account(client);

export const MUSIC_DB_ID = import.meta.env.VITE_APPWRITE_MUSIC_DB_ID;
export const USER_ALBUMS_COLLECTION_ID = import.meta.env
  .VITE_APPWRITE_USER_ALBUMS_COLLECTION_ID;

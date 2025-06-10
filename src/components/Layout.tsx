import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { albumService } from "../services/albumService";
import {
  BsBookmarkPlus,
  BsBookmarkPlusFill,
  BsCheckCircle,
  BsMusicNoteBeamed,
} from "react-icons/bs";
import "./Layout.css";

const normalizeId = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");

const Layout = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [userAlbums, setUserAlbums] = useState<any[]>([]);

  const fetchUserAlbums = async () => {
    if (!user) {
      setUserAlbums([]);
      return;
    }
    try {
      const response = await albumService.getUserAlbums(user.$id);
      setUserAlbums(response.documents);
    } catch {
      setUserAlbums([]);
    }
  };

  useEffect(() => {
    fetchUserAlbums();
  }, [user]);

  const refreshSearchResults = async () => {
    if (!searchTerm.trim()) return;
    try {
      const results = await albumService.searchAlbums(searchTerm.trim());
      setSearchResults(Array.isArray(results) ? results : []);
    } catch {
      setSearchResults([]);
      setSearchError("Errore nella ricerca.");
    }
  };

  const handleMarkAsAdded = async (
    album: any,
    artistName: string,
    image: string
  ) => {
    if (!user) {
      alert("Devi essere loggato per aggiungere un album.");
      return;
    }

    const mbid = normalizeId(album.mbid || `${album.name}-${artistName}`);
    const existingAlbum = userAlbums.find(
      (a) => normalizeId(a.albumId) === mbid
    );

    if (existingAlbum) {
      alert("Album già presente nella tua lista!");
      return;
    }

    try {
      await albumService.addUserAlbum(user.$id, {
        albumId: mbid,
        albumName: album.name,
        artistName,
        image,
        listened: false,
      });
      await fetchUserAlbums();
      await refreshSearchResults();
    } catch {
      alert("Errore nell'aggiunta dell'album.");
    }
  };

  const handleMarkAsListened = async (
    album: any,
    artistName: string,
    image: string
  ) => {
    if (!user) {
      alert("Devi essere loggato per segnare come ascoltato.");
      return;
    }

    const mbid = normalizeId(album.mbid || `${album.name}-${artistName}`);
    const existingAlbum = userAlbums.find(
      (a) => normalizeId(a.albumId) === mbid
    );

    try {
      if (existingAlbum) {
        if (existingAlbum.listened) {
          alert("Album già segnato come ascoltato!");
          return;
        }
        await albumService.markAsListened(existingAlbum.$id, true);
      } else {
        await albumService.addUserAlbum(user.$id, {
          albumId: mbid,
          albumName: album.name,
          artistName,
          image,
          listened: true,
        });
      }
      await fetchUserAlbums();
      await refreshSearchResults();
    } catch {
      alert("Errore nel segnare come ascoltato.");
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    const timeout = setTimeout(async () => {
      try {
        const results = await albumService.searchAlbums(searchTerm.trim());
        setSearchResults(Array.isArray(results) ? results : []);
      } catch {
        setSearchResults([]);
        setSearchError("Errore nella ricerca.");
      } finally {
        setSearchLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  return (
    <>
      <nav>
        <ul className="nav-ul">
          <li>
            <Link to="/" className="subtitle">
              Home
            </Link>
          </li>
          {user && (
            <li>
              <Link to="/Lists" className="subtitle">
                Le mie liste
              </Link>
            </li>
          )}
        </ul>

        <div className="search-container">
          <input
            type="text"
            placeholder="Cerca album o artista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="search-results">
            {searchLoading && <p>Caricamento risultati...</p>}
            {searchError && <p style={{ color: "red" }}>{searchError}</p>}
            {searchResults.length > 0 && (
              <ul className="search-results-list">
                {searchResults.map((album, idx) => {
                  const artistName =
                    album.artist?.name ||
                    album.artistName ||
                    (typeof album.artist === "string"
                      ? album.artist
                      : "Sconosciuto");

                  let image = "";
                  if (Array.isArray(album.image)) {
                    image =
                      album.image.find((img: any) => img.size === "large")?.[
                        "#text"
                      ] || "";
                  } else if (typeof album.image === "string") {
                    image = album.image;
                  }

                  const mbid = normalizeId(
                    album.mbid || `${album.name}-${artistName}`
                  );
                  const userAlbum = userAlbums.find(
                    (a) => normalizeId(a.albumId) === mbid
                  );
                  const isAdded = !!userAlbum;
                  const isListened = userAlbum?.listened ?? false;

                  return (
                    <li key={`search-${idx}`}>
                      <div className="search-results-content">
                        <img
                          src={image}
                          alt={album.name}
                          className="search-result-image"
                        />
                        <div className="search-result-info">
                          <h3 className="search-result-title">
                            {album.name || "Sconosciuto"}
                          </h3>
                          <h4 className="search-result-artist">{artistName}</h4>
                          <div className="search-result-buttons">
                            {user && (
                              <button
                                onClick={() =>
                                  handleMarkAsAdded(album, artistName, image)
                                }
                                disabled={isAdded}
                                className="button-icon"
                              >
                                {isAdded ? (
                                  <BsBookmarkPlusFill className="result-icon checked" />
                                ) : (
                                  <BsBookmarkPlus className="result-icon" />
                                )}
                              </button>
                            )}
                            {user && (
                              <button
                                onClick={() =>
                                  handleMarkAsListened(album, artistName, image)
                                }
                                disabled={isListened}
                                className="button-icon"
                              >
                                {isListened ? (
                                  <BsMusicNoteBeamed className="result-icon checked" />
                                ) : (
                                  <BsCheckCircle className="result-icon" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <ul className="nav-ul">
          <li>
            <Link to="/Profile" className="subtitle">
              {user ? "Profilo" : "Login"}
            </Link>
          </li>
        </ul>
      </nav>

      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;

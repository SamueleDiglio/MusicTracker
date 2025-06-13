import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { albumService } from "../services/albumService";
import { BsSearch } from "react-icons/bs";
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
  const [transparent, setTransparent] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setTransparent(window.scrollY < 96);
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const handleMarkAsAdded = async (
    album: any,
    artistName: string,
    image: string
  ) => {
    if (!user) return alert("Devi essere loggato per aggiungere un album.");

    const mbid = normalizeId(album.mbid || `${album.name}-${artistName}`);
    const existingAlbum = userAlbums.find(
      (a) => normalizeId(a.albumId) === mbid
    );

    if (existingAlbum) return alert("Album già presente nella tua lista!");

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
    if (!user) return alert("Devi essere loggato per segnare come ascoltato.");

    const mbid = normalizeId(album.mbid || `${album.name}-${artistName}`);
    const existingAlbum = userAlbums.find(
      (a) => normalizeId(a.albumId) === mbid
    );

    try {
      if (existingAlbum) {
        if (existingAlbum.listened)
          return alert("Album già segnato come ascoltato!");
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

  return (
    <>
      <nav className={transparent ? "" : "translucent"}>
        <ul className="nav-ul">
          <img src="src/assets/logo.svg" alt="" className="logo" />
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
          <div className="search-wrapper">
            <BsSearch className="search-icon-inside" />
            <input
              type="text"
              placeholder="cosa vuoi ascoltare?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <ul className="nav-ul">
          <li>
            <Link to="/Profile" className="subtitle">
              {user ? (
                <span className="avatar">
                  {user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              ) : (
                "Login"
              )}
            </Link>
          </li>
        </ul>
      </nav>

      {searchTerm.trim() && (
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
                if (Array.isArray(album.image))
                  image =
                    album.image.find((img: any) => img.size === "large")?.[
                      "#text"
                    ] || "";
                else if (typeof album.image === "string") image = album.image;

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
                              <img
                                src={`src/assets/${
                                  isAdded ? "inList.svg" : "addToList.svg"
                                }`}
                                alt={isAdded ? "in list" : "add to list"}
                                className="search-icon"
                              />
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
                              <img
                                src={`src/assets/${
                                  isListened ? "listened.svg" : "unlistened.svg"
                                }`}
                                alt={isListened ? "listened" : "unlistened"}
                                className="search-icon"
                              />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <hr className="divisor" />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;

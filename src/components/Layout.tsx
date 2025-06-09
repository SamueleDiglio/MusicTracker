import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { albumService } from "../services/albumService";
import "./Layout.css";

const Navbar = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

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
      } catch (error) {
        setSearchError("Errore nella ricerca.");
        setSearchResults([]);
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
          {user ? (
            <li>
              <Link to="/Lists" className="subtitle">
                Le mie liste
              </Link>
            </li>
          ) : (
            ""
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
          </div>
        </div>
        <ul className="nav-ul">
          {user ? (
            <li>
              <Link to="/Profile" className="subtitle">
                Profilo
              </Link>
            </li>
          ) : (
            <li>
              <Link to="/Profile" className="subtitle">
                Login
              </Link>
            </li>
          )}
        </ul>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Navbar;

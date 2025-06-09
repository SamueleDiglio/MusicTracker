import { useEffect, useRef, useState } from "react";
import { useLastApi } from "../hooks/useLastApi";
import AlbumCard from "../components/AlbumCard";
import { useAuth } from "../contexts/AuthContext";
import { albumService } from "../services/albumService";
import { BsChevronLeft } from "react-icons/bs";
import { BsChevronRight } from "react-icons/bs";

const Home = () => {
  const { user } = useAuth();
  const {
    albums: popAlbums,
    loading: loadingPop,
    error: errorPop,
  } = useLastApi("pop", 30);
  const {
    albums: rapAlbums,
    loading: loadingRap,
    error: errorRap,
  } = useLastApi("rap", 30);

  const [userAlbums, setUserAlbums] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const popSliderRef = useRef<HTMLDivElement>(null);
  const rapSliderRef = useRef<HTMLDivElement>(null);
  const userSliderRef = useRef<HTMLDivElement>(null);
  const searchSliderRef = useRef<HTMLDivElement>(null);

  const [userSliderOverflow, setUserSliderOverflow] = useState(false);
  const [searchSliderOverflow, setSearchSliderOverflow] = useState(false);

  useEffect(() => {
    const fetchUserAlbums = async () => {
      if (!user) {
        setUserAlbums([]);
        return;
      }
      try {
        const response = await albumService.getUserAlbums(user.$id);
        setUserAlbums(response.documents);
      } catch (error) {
        setUserAlbums([]);
      }
    };
    fetchUserAlbums();
  }, [user]);

  const getListenedStatus = (albumId: string) => {
    const found = userAlbums.find((a) => a.albumId === albumId);
    return found ? !!found.listened : false;
  };

  useEffect(() => {
    const checkOverflow = () => {
      const el = userSliderRef.current;
      if (el) setUserSliderOverflow(el.scrollWidth > el.clientWidth);
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [userAlbums.filter((album) => !album.listened).length]);

  useEffect(() => {
    const checkOverflow = () => {
      const el = searchSliderRef.current;
      if (el) setSearchSliderOverflow(el.scrollWidth > el.clientWidth);
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [searchResults.length]);

  const scroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right"
  ) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -700 : 700,
        behavior: "smooth",
      });
    }
  };

  const refreshUserAlbums = async () => {
    if (!user) {
      setUserAlbums([]);
      return;
    }
    try {
      const response = await albumService.getUserAlbums(user.$id);
      setUserAlbums(response.documents);
    } catch (error) {
      setUserAlbums([]);
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
      {user ? (
        <h1 className="title">
          Ciao {user?.name.split(" ")[0]}! Cosa ascolterai oggi?
        </h1>
      ) : (
        <h1 className="title">Ciao! Cosa ascolterai oggi?</h1>
      )}
      <h2 className="subtitle">Cerca album</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Cerca album o artista..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: 8, width: "70%", marginRight: 8 }}
        />
        <button
          onClick={() => setSearchTerm("")}
          disabled={searchLoading && !!searchTerm}
        >
          Cancella
        </button>
      </div>
      {searchLoading && <p>Caricamento risultati...</p>}
      {searchError && <p style={{ color: "red" }}>{searchError}</p>}
      {searchTerm.trim() && (
        <>
          {searchResults.length > 0 ? (
            <div className="horizontal-slider">
              {searchSliderOverflow && (
                <div
                  className="slider-arrow-btn"
                  style={{ left: 0 }}
                  onClick={() => scroll(searchSliderRef, "left")}
                >
                  <BsChevronLeft />
                </div>
              )}
              <div className="album-container" ref={searchSliderRef}>
                {searchResults.map((album, idx) => {
                  const mbid =
                    album.mbid ||
                    `${album.name}-${
                      album.artist?.name ||
                      album.artistName ||
                      album.artist ||
                      "Sconosciuto"
                    }-${idx}`;
                  const artistName =
                    album.artist?.name ||
                    album.artistName ||
                    (typeof album.artist === "string"
                      ? album.artist
                      : "Sconosciuto");
                  let image = "";
                  if (Array.isArray(album.image)) {
                    image =
                      album.image.find(
                        (img: { size?: string }) => img.size === "large"
                      )?.["#text"] || "";
                  } else if (typeof album.image === "string") {
                    image = album.image;
                  }
                  return (
                    <AlbumCard
                      key={mbid}
                      mbid={mbid}
                      image={image}
                      albumName={album.name || "Sconosciuto"}
                      artistName={artistName}
                      listened={getListenedStatus(mbid)}
                      onChange={refreshUserAlbums}
                    />
                  );
                })}
              </div>
              {searchSliderOverflow && (
                <div
                  className="slider-arrow-btn"
                  style={{ right: 0 }}
                  onClick={() => scroll(searchSliderRef, "right")}
                >
                  <BsChevronRight />
                </div>
              )}
            </div>
          ) : (
            !searchLoading && !searchError && <p>Nessun risultato trovato.</p>
          )}
        </>
      )}

      <h2 className="subtitle">La tua lista</h2>
      {user && userAlbums.filter((album) => !album.listened).length === 0 ? (
        <p>Nessun album nella tua lista da ascoltare.</p>
      ) : (
        <div className="horizontal-slider">
          {userSliderOverflow && (
            <div
              className="slider-arrow-btn"
              style={{ left: 0 }}
              onClick={() => scroll(userSliderRef, "left")}
            >
              <BsChevronLeft />
            </div>
          )}
          <div className="album-container" ref={userSliderRef}>
            {userAlbums
              .filter((album) => !album.listened)
              .map((album) => (
                <AlbumCard
                  key={album.$id}
                  mbid={album.albumId}
                  image={album.image}
                  albumName={album.albumName}
                  artistName={album.artistName}
                  listened={album.listened}
                  onChange={refreshUserAlbums}
                />
              ))}
          </div>
          {userSliderOverflow && (
            <div
              className="slider-arrow-btn"
              style={{ right: 0 }}
              onClick={() => scroll(userSliderRef, "right")}
            >
              <BsChevronRight />
            </div>
          )}
        </div>
      )}

      <h2 className="subtitle">Top album Pop</h2>
      {loadingPop && <p>Caricamento...</p>}
      {errorPop && <p style={{ color: "red" }}>{errorPop}</p>}
      <div className="horizontal-slider">
        <div
          className="slider-arrow-btn"
          style={{ left: 0 }}
          onClick={() => scroll(popSliderRef, "left")}
        >
          <BsChevronLeft />
        </div>
        <div className="album-container" ref={popSliderRef}>
          {popAlbums.map((album) => (
            <AlbumCard
              key={album.mbid || `${album.name}-${album.artist.name}`}
              mbid={album.mbid || `${album.name}-${album.artist.name}`}
              image={
                Array.isArray(album.image)
                  ? album.image.find((img) => img.size === "large")?.[
                      "#text"
                    ] || ""
                  : album.image
              }
              albumName={album.name}
              artistName={album.artist.name}
              listened={getListenedStatus(
                album.mbid || `${album.name}-${album.artist.name}`
              )}
              onChange={refreshUserAlbums}
            />
          ))}
        </div>
        <div
          className="slider-arrow-btn"
          style={{ right: 0 }}
          onClick={() => scroll(popSliderRef, "right")}
        >
          <BsChevronRight />
        </div>
      </div>

      <h2 className="subtitle">Top album Rap</h2>
      {loadingRap && <p>Caricamento...</p>}
      {errorRap && <p style={{ color: "red" }}>{errorRap}</p>}
      <div className="horizontal-slider">
        <div
          className="slider-arrow-btn"
          onClick={() => scroll(rapSliderRef, "left")}
        >
          <BsChevronLeft />
        </div>
        <div className="album-container" ref={rapSliderRef}>
          {rapAlbums.map((album) => (
            <AlbumCard
              key={album.mbid || `${album.name}-${album.artist.name}`}
              mbid={album.mbid || `${album.name}-${album.artist.name}`}
              image={
                Array.isArray(album.image)
                  ? album.image.find((img) => img.size === "large")?.[
                      "#text"
                    ] || ""
                  : album.image
              }
              albumName={album.name}
              artistName={album.artist.name}
              listened={getListenedStatus(
                album.mbid || `${album.name}-${album.artist.name}`
              )}
              onChange={refreshUserAlbums}
            />
          ))}
        </div>
        <div
          className="slider-arrow-btn"
          style={{ right: 0 }}
          onClick={() => scroll(rapSliderRef, "right")}
        >
          <BsChevronRight />
        </div>
      </div>
    </>
  );
};

export default Home;

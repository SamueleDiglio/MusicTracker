import { useEffect, useRef, useState, useCallback } from "react";
import { useLastApi } from "../hooks/useLastApi";
import AlbumCard from "../components/AlbumCard";
import { useAuth } from "../contexts/AuthContext";
import { albumService } from "../services/albumService";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

interface UserAlbum {
  $id: string;
  albumId: string;
  albumName: string;
  artistName: string;
  image: string;
  listened: boolean;
}

const SCROLL_AMOUNT = 700;

const Home = () => {
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

  const { user } = useAuth();
  const [userAlbums, setUserAlbums] = useState<UserAlbum[]>([]);

  const popSliderRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const rapSliderRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const userSliderRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  const [userSliderOverflow, setUserSliderOverflow] = useState(false);

  const fetchUserAlbums = useCallback(async () => {
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
  }, [user]);

  // Fetch user albums on mount or user change
  useEffect(() => {
    fetchUserAlbums();
  }, [fetchUserAlbums]);

  // Refresh user albums every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchUserAlbums();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, fetchUserAlbums]);

  // Check if user slider overflows container (using ResizeObserver for robustness)
  useEffect(() => {
    const el = userSliderRef.current;
    if (!el) return;

    const updateOverflow = () =>
      setUserSliderOverflow(el.scrollWidth > el.clientWidth);

    updateOverflow();

    const resizeObserver = new ResizeObserver(() => updateOverflow());
    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, [userAlbums]);

  const getListenedStatus = useCallback(
    (albumId: string) => {
      return userAlbums.some((a) => a.albumId === albumId && a.listened);
    },
    [userAlbums]
  );

  const scroll = useCallback(
    (ref: React.RefObject<HTMLDivElement>, direction: "left" | "right") => {
      if (ref.current) {
        ref.current.scrollBy({
          left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
          behavior: "smooth",
        });
      }
    },
    []
  );

  const handleAlbumChange = useCallback(() => {
    fetchUserAlbums();
  }, [fetchUserAlbums]);

  return (
    <>
      <h1 className="title">
        Ciao {user ? user.name.split(" ")[0] : ""}! Cosa ascolterai oggi?
      </h1>

      <h2 className="subtitle">La tua lista</h2>
      {user && userAlbums.filter((album) => !album.listened).length === 0 ? (
        <p>Nessun album nella tua lista da ascoltare.</p>
      ) : (
        <div className="horizontal-slider">
          {userSliderOverflow && (
            <button
              aria-label="Scorri a sinistra"
              className="slider-arrow-btn"
              style={{ left: 0 }}
              onClick={() => scroll(userSliderRef, "left")}
            >
              <BsChevronLeft />
            </button>
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
                  onChange={handleAlbumChange}
                />
              ))}
          </div>
          {userSliderOverflow && (
            <button
              aria-label="Scorri a destra"
              className="slider-arrow-btn"
              style={{ right: 0 }}
              onClick={() => scroll(userSliderRef, "right")}
            >
              <BsChevronRight />
            </button>
          )}
        </div>
      )}

      <h2 className="subtitle">Top album Pop</h2>
      {loadingPop && <p>Caricamento...</p>}
      {errorPop && <p style={{ color: "red" }}>{errorPop}</p>}
      <div className="horizontal-slider">
        <button
          aria-label="Scorri Pop a sinistra"
          className="slider-arrow-btn"
          style={{ left: 0 }}
          onClick={() => scroll(popSliderRef, "left")}
        >
          <BsChevronLeft />
        </button>
        <div className="album-container" ref={popSliderRef}>
          {popAlbums.map((album) => {
            const mbid = album.mbid || `${album.name}-${album.artist.name}`;
            const image = Array.isArray(album.image)
              ? album.image.find((img) => img.size === "large")?.["#text"] || ""
              : album.image;

            return (
              <AlbumCard
                key={mbid}
                mbid={mbid}
                image={image}
                albumName={album.name}
                artistName={album.artist.name}
                listened={getListenedStatus(mbid)}
                onChange={handleAlbumChange}
              />
            );
          })}
        </div>
        <button
          aria-label="Scorri Pop a destra"
          className="slider-arrow-btn"
          style={{ right: 0 }}
          onClick={() => scroll(popSliderRef, "right")}
        >
          <BsChevronRight />
        </button>
      </div>

      <h2 className="subtitle">Top album Rap</h2>
      {loadingRap && <p>Caricamento...</p>}
      {errorRap && <p style={{ color: "red" }}>{errorRap}</p>}
      <div className="horizontal-slider">
        <button
          aria-label="Scorri Rap a sinistra"
          className="slider-arrow-btn"
          onClick={() => scroll(rapSliderRef, "left")}
        >
          <BsChevronLeft />
        </button>
        <div className="album-container" ref={rapSliderRef}>
          {rapAlbums.map((album) => {
            const mbid = album.mbid || `${album.name}-${album.artist.name}`;
            const image = Array.isArray(album.image)
              ? album.image.find((img) => img.size === "large")?.["#text"] || ""
              : album.image;

            return (
              <AlbumCard
                key={mbid}
                mbid={mbid}
                image={image}
                albumName={album.name}
                artistName={album.artist.name}
                listened={getListenedStatus(mbid)}
                onChange={handleAlbumChange}
              />
            );
          })}
        </div>
        <button
          aria-label="Scorri Rap a destra"
          className="slider-arrow-btn"
          style={{ right: 0 }}
          onClick={() => scroll(rapSliderRef, "right")}
        >
          <BsChevronRight />
        </button>
      </div>
    </>
  );
};

export default Home;

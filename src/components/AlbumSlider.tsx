import React, { useRef, useEffect, useState, useCallback } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import "./AlbumSlider.css"

interface HorizontalAlbumSliderProps {
  albums: any[];
  renderAlbum: (album: any) => React.ReactNode;
  loading?: boolean;
  error?: string;
  title: string;
  getListenedStatus?: (mbid: string) => boolean;
  showIfEmpty?: React.ReactNode;
}

const SCROLL_AMOUNT = 900;

const AlbumSlider: React.FC<HorizontalAlbumSliderProps> = ({
  albums,
  renderAlbum,
  loading,
  error,
  title,
  showIfEmpty,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const checkOverflow = () => setOverflow(el.scrollWidth > el.clientWidth);
    checkOverflow();
    const imgs = el.querySelectorAll("img");
    imgs.forEach((img) => img.addEventListener("load", checkOverflow));
    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(el);
    return () => {
      imgs.forEach((img) => img.removeEventListener("load", checkOverflow));
      resizeObserver.disconnect();
    };
  }, [albums]);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const handleScroll = () => {
      setAtStart(el.scrollLeft === 0);
      setAtEnd(Math.abs(el.scrollLeft + el.clientWidth - el.scrollWidth) < 2);
    };
    el.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [albums]);

  const scroll = useCallback((direction: "left" | "right") => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <div className="list-container">
      <h2 className="subtitle">{title}</h2>
      {loading && <p>Caricamento...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {albums.length === 0 && showIfEmpty}
      {albums.length > 0 && (
        <div className="horizontal-slider">
          {overflow && !atStart && (
            <button
              aria-label="Scorri a sinistra"
              className="slider-arrow-btn"
              onClick={() => scroll("left")}
            >
              <BsChevronLeft />
            </button>
          )}
          <div className="album-container" ref={sliderRef}>
            {albums.map(renderAlbum)}
          </div>
          {overflow && !atEnd && (
            <button
              aria-label="Scorri a destra"
              className="slider-arrow-btn"
              style={{ right: 0 }}
              onClick={() => scroll("right")}
            >
              <BsChevronRight />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AlbumSlider;

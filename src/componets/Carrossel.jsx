import React, { useEffect, useRef, useState } from 'react';
import '../css/carrossel.css';
// import default banners so the component is self-contained
import s1 from '../assets/banners/1.png';
import s2 from '../assets/banners/2.png';
import s3 from '../assets/banners/3.png';

export default function Carrossel({ slides = [] }) {
  const defaultSlides = [s1, s2, s3];
  const usedSlides =
    Array.isArray(slides) && slides.length ? slides : defaultSlides;
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);
  const isHovered = useRef(false);

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startAutoplay() {
    stopAutoplay();
    intervalRef.current = setInterval(() => {
      if (!isHovered.current) {
        setIndex((prev) => (prev + 1) % (usedSlides.length || 1));
      }
    }, 3000);
  }

  function stopAutoplay() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function goTo(i) {
    setIndex(i % (usedSlides.length || 1));
  }

  function prev() {
    setIndex(
      (i) => (i - 1 + (usedSlides.length || 1)) % (usedSlides.length || 1)
    );
  }

  function next() {
    setIndex((i) => (i + 1) % (usedSlides.length || 1));
  }

  return (
    <div
      className="ba-carousel"
      onMouseEnter={() => {
        isHovered.current = true;
      }}
      onMouseLeave={() => {
        isHovered.current = false;
      }}
    >
      <div className="ba-carousel-inner">
        {usedSlides.map((src, i) => (
          <div
            key={i}
            className={`ba-slide ${i === index ? 'active' : ''}`}
            style={{ backgroundImage: `url(${src})` }}
            aria-hidden={i !== index}
          />
        ))}
      </div>

      <button
        className="ba-carousel-arrow left"
        onClick={prev}
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        className="ba-carousel-arrow right"
        onClick={next}
        aria-label="Next"
      >
        ›
      </button>

      <div className="ba-carousel-dots">
        {usedSlides.map((_, i) => (
          <button
            key={i}
            className={`ba-dot ${i === index ? 'active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

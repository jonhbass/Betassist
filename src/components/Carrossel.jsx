import React, { useEffect, useRef, useState } from 'react';
import '../css/carrossel.css';

export default function Carrossel({ slides = [] }) {
  // Verificar se há banners personalizados no localStorage
  const getCustomBanners = () => {
    try {
      const stored = localStorage.getItem('CUSTOM_BANNERS');
      if (stored) {
        const banners = JSON.parse(stored);
        return Array.isArray(banners) && banners.length > 0
          ? banners.map((b) => b.url)
          : null;
      }
    } catch (e) {
      console.error('Erro ao carregar banners personalizados:', e);
    }
    return null;
  };

  const customBanners = getCustomBanners();
  const usedSlides =
    customBanners || (Array.isArray(slides) && slides.length ? slides : []);

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
        {usedSlides.length === 0 ? (
          <div className="ba-slide active ba-slide-placeholder">
            <div className="ba-placeholder-content">
              <h2>🖼️ Nenhum banner cadastrado</h2>
              <p>Configure os banners no painel de administração</p>
            </div>
          </div>
        ) : (
          usedSlides.map((src, i) => (
            <div
              key={i}
              className={`ba-slide ${i === index ? 'active' : ''}`}
              style={{ backgroundImage: `url(${src})` }}
              aria-hidden={i !== index}
            />
          ))
        )}
      </div>

      {usedSlides.length > 1 && (
        <>
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
        </>
      )}

      {usedSlides.length > 1 && (
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
      )}
    </div>
  );
}

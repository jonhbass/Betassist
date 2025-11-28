import React, { useEffect, useRef, useState } from 'react';
import '../css/carrossel.css';
import { getServerUrl } from '../utils/serverUrl';

export default function Carrossel({ slides = [] }) {
  const [bannerUrls, setBannerUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBanners = async () => {
      setIsLoading(true);
      let banners = [];
      // 1. Tentar carregar do servidor
      try {
        const serverUrl = getServerUrl();
        const res = await fetch(`${serverUrl}/banners`);
        if (res.ok) {
          banners = await res.json();
        }
      } catch (e) {
        console.error('Erro ao carregar banners do servidor:', e);
      }

      // 2. Fallback para LocalStorage (chave BANNERS)
      if (!banners.length) {
        try {
          const stored = localStorage.getItem('BANNERS');
          if (stored) {
            banners = JSON.parse(stored);
          }
        } catch (e) {
          console.error('Erro ao carregar banners locais:', e);
        }
      }

      // 3. Fallback para chave antiga (CUSTOM_BANNERS) se necessário
      if (!banners.length) {
        try {
          const stored = localStorage.getItem('CUSTOM_BANNERS');
          if (stored) {
            banners = JSON.parse(stored);
          }
        } catch {
          // ignore
        }
      }

      // Extrair URLs
      if (banners.length > 0) {
        const urls = banners.map((b) => b.url).filter(Boolean);
        setBannerUrls(urls);
        setIsLoading(false);
      } else {
        setBannerUrls(slides);
        setIsLoading(false);
      }
    };

    loadBanners();
  }, [slides]);

  const usedSlides = bannerUrls.length > 0 ? bannerUrls : [];

  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);
  const isHovered = useRef(false);

  useEffect(() => {
    if (usedSlides.length > 0) {
      startAutoplay();
    }
    return stopAutoplay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usedSlides.length]);

  function startAutoplay() {
    stopAutoplay();
    intervalRef.current = setInterval(() => {
      if (!isHovered.current && usedSlides.length > 0) {
        setIndex((prev) => (prev + 1) % usedSlides.length);
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
          <div
            className={`ba-slide active ba-slide-placeholder ${
              isLoading ? 'skeleton' : ''
            }`}
          >
            <div className="ba-placeholder-content">
              <h2>🖼️ Ningún banner registrado</h2>
              <p>Configure los banners en el panel de administración</p>
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

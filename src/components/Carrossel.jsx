import React, { useEffect, useRef, useState } from 'react';
import '../css/carrossel.css';
import { getServerUrl } from '../utils/serverUrl';

// Cache duration: 5 minutes
const CACHE_KEY = 'BANNERS_CACHE';
const CACHE_DURATION = 5 * 60 * 1000;

export default function Carrossel({ slides = [] }) {
  const [bannerUrls, setBannerUrls] = useState(() => {
    // Tentar carregar do cache imediatamente para evitar flash
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { urls, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION && urls?.length > 0) {
          return urls;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(bannerUrls.length === 0);

  useEffect(() => {
    // Se já temos banners do cache, não mostrar loading
    if (bannerUrls.length > 0) {
      setIsLoading(false);
    }

    const loadBanners = async () => {
      // Verificar cache primeiro
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const { urls, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION && urls?.length > 0) {
            setBannerUrls(urls);
            setIsLoading(false);
            return; // Cache válido, não precisa buscar do servidor
          }
        }
      } catch {
        // ignore cache errors
      }

      // Buscar do servidor
      let banners = [];
      try {
        const serverUrl = getServerUrl();
        const res = await fetch(`${serverUrl}/banners`);
        if (res.ok) {
          banners = await res.json();
        }
      } catch (e) {
        console.error('Erro ao carregar banners do servidor:', e);
      }

      // Fallback para LocalStorage
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

      // Fallback para chave antiga
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

      // Extrair URLs e salvar no cache
      if (banners.length > 0) {
        const urls = banners.map((b) => b.url).filter(Boolean);
        setBannerUrls(urls);
        // Salvar no cache
        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              urls,
              timestamp: Date.now(),
            })
          );
        } catch {
          // ignore
        }
      } else if (slides.length > 0) {
        setBannerUrls(slides);
      }
      setIsLoading(false);
    };

    loadBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

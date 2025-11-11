import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Dashboard.css";

export default function Dashboard() {
  const [user, setUser] = useState("tute4279");
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);
  const isHovered = useRef(false);
  const navigate = useNavigate();

  const slides = [
    "/src/assets/banners/1.png",
    "/src/assets/banners/2.png",
    "/src/assets/banners/3.png",
  ];

  useEffect(() => { 
    const u = localStorage.getItem("authUser"); 
    if (u) setUser(u); 
  }, []); 

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startAutoplay() {
    stopAutoplay();
    intervalRef.current = setInterval(() => {
      if (!isHovered.current) {
        setIndex((prev) => (prev + 1) % slides.length);
      }
    }, 5000); // 5 segundos
  }

  function stopAutoplay() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function goTo(i) {
    setIndex(i % slides.length);
  }

  function prev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }

  function next() {
    setIndex((i) => (i + 1) % slides.length);
  }

function handleLogout() {
  localStorage.removeItem("authUser");
  navigate("/login", { replace: true });
  }

return (

<div className="ba-dashboard">
<header className="ba-topbar">
  <div className="ba-logo">BetAssist</div>
  <div className="ba-top-actions">
  <button className="ba-btn small">💬 Mensajes</button>
  <button className="ba-btn small">🔔 Notificaciones</button>
  <button className="ba-btn small">☰</button>
  <button className="ba-btn small" onClick={handleLogout}>
       Sair
  </button>
</div>
</header>

<main className="ba-main">
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
      {slides.map((src, i) => (
      <div
      key={i}
      className={`ba-slide ${i === index ? "active" : ""}`}
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
    {slides.map((_, i) => (
    <button
      key={i}
      className={`ba-dot ${i === index ? "active" : ""}`}
      onClick={() => goTo(i)}
      aria-label={`Go to slide ${i + 1}`}
    />
  ))}
</div>
</div>

<h1 className="ba-welcome">
  ¡Hola, <span>{user}</span>!
</h1>

<div className="ba-actions-grid">
  <button className="ba-action primary">
    🔗 Copiar link de referido
  </button>
  <button className="ba-action highlight">
    Ir a jugar <strong>CLUBUNO.NET</strong>
  </button>
    <button className="ba-action">💳 Cargar fichas</button>
    <button className="ba-action">💸 Retirar fichas</button>
    <button className="ba-action">🧾 Historial</button>
</div>
</main>

<footer className="ba-footer">
</footer>
</div>
  );
}
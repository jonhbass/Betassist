import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';
import Sidebar from '../componets/Sidebar';
import Chat from '../componets/Chat';
import Modal from '../componets/Modal';
import { getAuthUser, removeAuthUser } from '../utils/auth';

// import banners as ESM so bundler handles them correctly
import s1 from '../assets/banners/1.png';
import s2 from '../assets/banners/2.png';
import s3 from '../assets/banners/3.png';

export default function Dashboard() {
  const [user, setUser] = useState('tute4279');
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);
  const isHovered = useRef(false);
  const navigate = useNavigate();

  const slides = [s1, s2, s3];

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState(null);

  function toggleSidebar() {
    setSidebarOpen((s) => !s);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  useEffect(() => {
    // collapse sidebar on small screens by default
    if (window.innerWidth && window.innerWidth < 900) setSidebarOpen(false);
  }, []);

  useEffect(() => {
    const u = getAuthUser();
    if (u) setUser(u);
  }, []);

  useEffect(() => {
    // quick debug log to help diagnose blank screen
    console.log('Dashboard mounted', { user: getAuthUser() });
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
    }, 3000); // 3 segundos
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
    removeAuthUser();
    navigate('/login', { replace: true });
  }

  // sidebar action handlers
  function handleCopyReferral() {
    const link = `${window.location.origin}/?ref=${user}`;
    navigator.clipboard
      .writeText(link)
      .then(() => showToast('Link copiado para a área de transferência'))
      .catch(() => showToast('Falha ao copiar link'));
  }

  function handlePlay() {
    window.open('https://clubuno.net', '_blank');
    showToast('Abrindo CLUBUNO.NET');
  }

  function handleLoad() {
    setModal('load');
  }

  function handleWithdraw() {
    setModal('withdraw');
  }

  function handleHistory() {
    setModal('history');
  }

  return (
    <div className="ba-dashboard">
      <header className="ba-topbar">
        <div className="ba-logo">BetAssist</div>
        <div className="ba-top-actions">
          <button className="ba-btn small">💬 Mensajes</button>
          <button className="ba-btn small">🔔 Notificações</button>
          {/* Botâo retrátil */}
          <button
            className="ba-btn small"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          {/* Botâo sair */}
          <button className="ba-btn small" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>
      <main className="ba-main">
        <div className="ba-layout">
          <aside className={`ba-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
            <Sidebar
              onCopyReferral={handleCopyReferral}
              onPlay={handlePlay}
              onLoad={handleLoad}
              onWithdraw={handleWithdraw}
              onHistory={handleHistory}
            />
          </aside>

          <div className="ba-content">
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
                {slides.map((_, i) => (
                  <button
                    key={i}
                    className={`ba-dot ${i === index ? 'active' : ''}`}
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <h1 className="ba-welcome">
              ¡Hola, <span>{user}</span>!
            </h1>

            <div className="ba-chat">
              <Chat />
            </div>
          </div>
        </div>
      </main>

      <footer className="ba-footer"></footer>
      {toast && (
        <div className="ba-toast" role="status">
          {toast}
        </div>
      )}
      {modal === 'load' && (
        <Modal title="Carregar fichas" onClose={() => setModal(null)}>
          <p>Formulário de carga (placeholder)</p>
          <button
            onClick={() => {
              setModal(null);
              showToast('Carga solicitada (simulada)');
            }}
          >
            Confirmar
          </button>
        </Modal>
      )}

      {modal === 'withdraw' && (
        <Modal title="Retirar fichas" onClose={() => setModal(null)}>
          <p>Formulário de saque (placeholder)</p>
          <button
            onClick={() => {
              setModal(null);
              showToast('Saque solicitado (simulado)');
            }}
          >
            Confirmar
          </button>
        </Modal>
      )}

      {modal === 'history' && (
        <Modal title="Histórico" onClose={() => setModal(null)}>
          <p>Histórico de transações (placeholder)</p>
        </Modal>
      )}
    </div>
  );
}

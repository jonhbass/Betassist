import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/sidebar.css';

// Sidebar receives callbacks from parent (Dashboard)
export default function Sidebar({
  isOpen = true,
  user = '',
  onToast = () => {},
  isAdmin = false,
  onToggleSidebar = () => {},
}) {
  const navigate = useNavigate();

  function handleCopyReferral() {
    const link = `${window.location.origin}/?ref=${user}`;
    navigator.clipboard
      .writeText(link)
      .then(() => onToast('Enlace copiado al portapapeles'))
      .catch(() => onToast('Fallo al copiar enlace'));
  }

  function handlePlay() {
    window.open('https://www.pulpobet.net/es/?pc=true', '_blank');
    onToast('Abriendo PULPOBET.NET');
  }

  function handleLoad() {
    navigate('/load-chips');
  }

  function handleWithdraw() {
    navigate('/withdraw-chips');
  }

  function handleHistory() {
    navigate('/requests');
  }

  function handleAdminPanel() {
    navigate('/admin');
  }

  return (
    <nav className="ba-sidebar-nav" aria-label="Main">
      <ul className="ba-sidebar-list">
        <li>
          <button
            className="ba-action ba-toggle-btn"
            onClick={onToggleSidebar}
            title={isOpen ? 'Contraer sidebar' : 'Expandir sidebar'}
            aria-label="Toggle sidebar"
          >
            <span className="ba-action-icon">{isOpen ? '«' : '»'}</span>
            {isOpen && (
              <span className="ba-action-text">
                {isOpen ? 'Contraer' : 'Expandir'}
              </span>
            )}
          </button>
        </li>
        {isAdmin && (
          <li>
            <button
              className="ba-action highlight"
              onClick={handleAdminPanel}
              title={!isOpen ? 'Panel de Admin' : ''}
            >
              <span className="ba-action-icon">⚙️</span>
              {isOpen && <span className="ba-action-text">Panel de Admin</span>}
            </button>
          </li>
        )}
        <li>
          <button
            className="ba-action primary"
            onClick={handleCopyReferral}
            title={!isOpen ? 'Copiar link de referido' : ''}
          >
            <span className="ba-action-icon">🔗</span>
            {isOpen && (
              <span className="ba-action-text">Copiar link de referido</span>
            )}
          </button>
        </li>
        <li>
          <button
            className="ba-action highlight"
            onClick={handlePlay}
            title={!isOpen ? 'Ir a jugar PULPOBET.NET' : ''}
          >
            <span className="ba-action-icon">🎮</span>
            {isOpen && (
              <span className="ba-action-text">
                jugar <strong>PULPOBET.NET</strong>
              </span>
            )}
          </button>
        </li>
        <li>
          <button
            className="ba-action"
            onClick={handleLoad}
            title={!isOpen ? 'Cargar fichas' : ''}
          >
            <span className="ba-action-icon">💳</span>
            {isOpen && <span className="ba-action-text">Cargar fichas</span>}
          </button>
        </li>
        <li>
          <button
            className="ba-action"
            onClick={handleWithdraw}
            title={!isOpen ? 'Retirar fichas' : ''}
          >
            <span className="ba-action-icon">💸</span>
            {isOpen && <span className="ba-action-text">Retirar fichas</span>}
          </button>
        </li>
        <li>
          <button
            className="ba-action"
            onClick={handleHistory}
            title={!isOpen ? 'Historial' : ''}
          >
            <span className="ba-action-icon">🧾</span>
            {isOpen && <span className="ba-action-text">Historial</span>}
          </button>
        </li>
      </ul>
    </nav>
  );
}

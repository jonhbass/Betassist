import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/sidebar.css';

// Sidebar receives callbacks from parent (Dashboard)
export default function Sidebar({
  isOpen = true,
  user = '',
  onToast = () => {},
  onOpenModal = () => {},
}) {
  const navigate = useNavigate();

  function handleCopyReferral() {
    const link = `${window.location.origin}/?ref=${user}`;
    navigator.clipboard
      .writeText(link)
      .then(() => onToast('Link copiado para a área de transferência'))
      .catch(() => onToast('Falha ao copiar link'));
  }

  function handlePlay() {
    window.open('https://www.pulpobet.net/es/?pc=true', '_blank');
    onToast('Abrindo CLUBUNO.NET');
  }

  function handleLoad() {
    navigate('/load-chips');
  }

  function handleWithdraw() {
    onOpenModal('withdraw');
  }

  function handleHistory() {
    onOpenModal('history');
  }

  return (
    <nav className="ba-sidebar-nav" aria-label="Main">
      <ul className="ba-sidebar-list">
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
            title={!isOpen ? 'Ir a jugar CLUBUNO.NET' : ''}
          >
            <span className="ba-action-icon">🎮</span>
            {isOpen && (
              <span className="ba-action-text">
                Ir a jugar <strong>CLUBUNO.NET</strong>
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

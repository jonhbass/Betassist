import React from 'react';

// Sidebar receives callbacks from parent (Dashboard)
export default function Sidebar({
  isOpen = true,
  onCopyReferral = () => {},
  onPlay = () => {},
  onLoad = () => {},
  onWithdraw = () => {},
  onHistory = () => {},
}) {
  return (
    <nav className="ba-sidebar-nav" aria-label="Main">
      <ul className="ba-sidebar-list">
        <li>
          <button
            className="ba-action primary"
            onClick={onCopyReferral}
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
            onClick={onPlay}
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
            onClick={onLoad}
            title={!isOpen ? 'Cargar fichas' : ''}
          >
            <span className="ba-action-icon">💳</span>
            {isOpen && <span className="ba-action-text">Cargar fichas</span>}
          </button>
        </li>
        <li>
          <button
            className="ba-action"
            onClick={onWithdraw}
            title={!isOpen ? 'Retirar fichas' : ''}
          >
            <span className="ba-action-icon">💸</span>
            {isOpen && <span className="ba-action-text">Retirar fichas</span>}
          </button>
        </li>
        <li>
          <button
            className="ba-action"
            onClick={onHistory}
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

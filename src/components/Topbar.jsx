import React from 'react';
import Icon from '../assets/icon.svg';
import '../css/topbar.css';

export default function Topbar({
  onToggleSidebar,
  onLogout,
  onMessageClick,
  onNotifyClick,
  simpleMode = false,
}) {
  return (
    <header className="ba-topbar">
      <div className="ba-top-left">
        <img src={Icon} alt="StarWin Logo" className="header-icon" />
        <div className="ba-logo">StarWin</div>
      </div>
      {!simpleMode && (
        <div className="ba-top-actions">
          <button
            className="ba-btn small"
            onClick={() => onMessageClick && onMessageClick()}
          >
            💬 Mensajes
          </button>
          <button
            className="ba-btn small"
            onClick={() => onNotifyClick && onNotifyClick()}
          >
            🔔 Notificações
          </button>
          <button
            className="ba-btn small"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <button className="ba-btn small" onClick={onLogout}>
            Sair
          </button>
        </div>
      )}
    </header>
  );
}

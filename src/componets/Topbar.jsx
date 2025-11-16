import React from 'react';

export default function Topbar({
  onToggleSidebar,
  onLogout,
  onMessageClick,
  onNotifyClick,
}) {
  return (
    <header className="ba-topbar">
      <div className="ba-logo">BetAssist</div>
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
    </header>
  );
}

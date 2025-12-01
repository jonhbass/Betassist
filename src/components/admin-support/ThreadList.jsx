import React from 'react';

// Função auxiliar para gerar cor consistente baseada no nome (mesma do Chat.jsx)
const getUserColor = (username) => {
  if (!username || username === 'system' || username === 'admin') return null;
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 50%)`;
};

export default function ThreadList({
  threads,
  activeThread,
  openThread,
  onDeleteThread,
}) {
  if (!threads) return null;
  return (
    <div
      className="ba-admin-threads"
      // Remover estilos inline fixos para permitir responsividade via CSS
    >
      {threads.length === 0 && <div className="ba-muted">Ningún mensaje</div>}
      {threads.map((t) => {
        const isExternalVisitor =
          t.id.startsWith('usuario') || t.id.startsWith('visitante_');
        const userColor = !isExternalVisitor ? getUserColor(t.id) : null;

        const avatarBg = isExternalVisitor
          ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(249, 115, 22, 0.25))'
          : userColor || 'rgba(255,255,255,0.06)';

        const avatarColor = isExternalVisitor ? '#fb923c' : '#fff';
        const avatarIcon = isExternalVisitor
          ? '👤'
          : t.id.slice(0, 1).toUpperCase();

        return (
          <div
            key={t.id}
            className={`ba-thread-item ${
              t.id === activeThread ? 'active' : ''
            }`}
            style={{
              display: 'flex',
              gap: 8,
              padding: '8px 10px',
              alignItems: 'center',
              cursor: 'pointer',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              justifyContent: 'space-between',
            }}
            onClick={() => openThread(t.id)}
          >
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                flex: 1,
              }}
            >
              <div
                className="ba-thread-avatar"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  background: avatarBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 14,
                  flex: '0 0 32px',
                  position: 'relative',
                  color: avatarColor,
                  border: isExternalVisitor
                    ? '2px solid rgba(251, 146, 60, 0.3)'
                    : userColor
                    ? '1px solid rgba(255,255,255,0.2)'
                    : 'none',
                }}
              >
                {avatarIcon}
                {t.unread > 0 && (
                  <div
                    className="ba-thread-badge"
                    aria-label={`${t.unread} mensagens não lidas`}
                  >
                    {t.unread > 9 ? '9+' : t.unread}
                  </div>
                )}
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: isExternalVisitor ? '#fb923c' : '#fff',
                }}
              >
                {t.id}
                {isExternalVisitor && (
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 10,
                      background: 'rgba(251, 146, 60, 0.2)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      color: '#fb923c',
                      fontWeight: 600,
                    }}
                  >
                    VISITANTE
                  </span>
                )}
              </div>
            </div>

            {onDeleteThread && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`¿Eliminar conversación con ${t.id}?`)) {
                    onDeleteThread(t.id);
                  }
                }}
                style={{
                  background: 'rgba(220, 38, 38, 0.1)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  color: '#f87171',
                  padding: '4px 8px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 12,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(220, 38, 38, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)';
                }}
              >
                🗑️
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

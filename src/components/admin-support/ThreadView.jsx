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

export default function ThreadView({
  activeThread,
  activeObj,
  listRef,
  replyText,
  setReplyText,
  sendReply,
  markAllHandled,
}) {
  return (
    <div
      className="ba-admin-thread-view"
      style={{
        flex: '1 1 auto',
        minHeight: 300,
        maxHeight: 600,
        display: 'flex',
        flexDirection: 'column',
      }}
      ref={listRef}
    >
      {!activeThread && (
        <div className="ba-muted">
          Seleccione una conversación a la izquierda
        </div>
      )}
      {activeThread && (
        <>
          <div
            className="ba-thread-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: 8,
            }}
          >
            <h4 style={{ margin: 0 }}>{activeThread}</h4>
            <button
              onClick={markAllHandled}
              className="ba-btn-mark-handled"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: 4,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Marcar todos atendidos
            </button>
          </div>

          <div
            className="ba-chat-list"
            style={{
              overflow: 'auto',
              padding: 8,
              flex: '1 1 auto',
              minHeight: 200,
              WebkitOverflowScrolling: 'touch' /* Safari smooth scroll */,
            }}
          >
            {activeObj?.messages.map((m) => {
              const isMe = m.from === 'admin';
              const userColor = !isMe ? getUserColor(m.from) : undefined;

              return (
                <div
                  key={m.id}
                  className={`ba-chat-msg ${isMe ? 'me' : 'other'}`}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    {/* Avatar restaurado e com cor dinâmica */}
                    <div
                      className="ba-chat-avatar"
                      style={{
                        width: 28,
                        height: 28,
                        fontSize: 13,
                        backgroundColor: userColor,
                        color: userColor ? '#fff' : undefined,
                        border: userColor
                          ? '1px solid rgba(255,255,255,0.2)'
                          : undefined,
                      }}
                    >
                      {m.from === 'admin'
                        ? 'A'
                        : String(m.from || '')
                            .slice(0, 1)
                            .toUpperCase()}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'rgba(255,255,255,0.6)',
                        fontWeight: 500,
                      }}
                    >
                      {m.from === 'admin'
                        ? `Admin ${m.adminName || ''}`
                        : m.from}
                    </div>
                    <div
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.38)',
                      }}
                    >
                      {new Date(m.time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="ba-chat-text">{m.text}</div>
                  <div style={{ marginTop: 4 }} />
                </div>
              );
            })}
          </div>

          <form
            className="ba-chat-form"
            onSubmit={sendReply}
            style={{ marginTop: 8 }}
          >
            <input
              placeholder="Escreva uma mensagem..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button type="submit">Enviar</button>
          </form>
        </>
      )}
    </div>
  );
}

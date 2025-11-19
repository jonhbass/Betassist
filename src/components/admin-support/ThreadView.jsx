import React from 'react';

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
        flex: 1,
        maxHeight: 600,
        display: 'flex',
        flexDirection: 'column',
      }}
      ref={listRef}
    >
      {!activeThread && (
        <div className="ba-muted">Selecione uma conversa à esquerda</div>
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
            <div>
              <button className="ba-btn small" onClick={markAllHandled}>
                Marcar todos atendidos
              </button>
            </div>
          </div>

          <div
            className="ba-chat-list"
            style={{ overflow: 'auto', padding: 8, flex: 1 }}
          >
            {activeObj?.messages.map((m) => {
              const isMe = m.from === 'admin';
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
                    <div
                      className="ba-chat-avatar"
                      style={{ width: 28, height: 28, fontSize: 13 }}
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
                      {m.from === 'admin' ? 'Admin' : m.from}
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

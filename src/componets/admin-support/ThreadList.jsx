import React from 'react';

export default function ThreadList({
  threads,
  knownUsersFetched,
  knownUsers,
  activeThread,
  openThread,
}) {
  if (!threads) return null;
  return (
    <div
      className="ba-admin-threads"
      style={{ width: 280, maxHeight: 520, overflow: 'auto' }}
    >
      {threads.length === 0 && <div className="ba-muted">Nenhuma mensagem</div>}
      {threads
        .filter((t) => {
          if (knownUsersFetched) return knownUsers.includes(String(t.id));
          return true;
        })
        .map((t) => (
          <div
            key={t.id}
            className={`ba-thread-item ${
              t.id === activeThread ? 'active' : ''
            }`}
            style={{
              display: 'flex',
              gap: 12,
              padding: 10,
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
                gap: 12,
                alignItems: 'center',
                flex: 1,
              }}
            >
              <div
                className="ba-thread-avatar"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  flex: '0 0 40px',
                  position: 'relative',
                }}
              >
                {t.id.slice(0, 1).toUpperCase()}
                {t.unread > 0 && (
                  <div
                    className="ba-thread-badge"
                    aria-label={`${t.unread} mensagens não lidas`}
                  >
                    {t.unread > 9 ? '9+' : t.unread}
                  </div>
                )}
              </div>
              <div style={{ fontWeight: 700 }}>{t.id}</div>
            </div>

            {/* badge moved into avatar for overlay positioning */}
          </div>
        ))}
    </div>
  );
}

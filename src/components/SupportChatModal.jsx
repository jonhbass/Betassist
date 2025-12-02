import React, { useEffect, useState, useRef } from 'react';
import { getAuthUser } from '../utils/auth';
import { getOrCreateVisitorId } from '../utils/visitorId';
import {
  ensureSocket,
  on as socketOn,
  off as socketOff,
} from '../utils/socket';
import { getServerUrl } from '../utils/serverUrl';

const API_URL = getServerUrl();
const USE_SOCKET = true;

export default function SupportChatModal({ onClose }) {
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem('ADMIN_MESSAGES');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      void e;
      return [];
    }
  });
  const [text, setText] = useState('');
  const listRef = useRef(null);
  const socketRef = useRef(null);
  const username = getAuthUser() || getOrCreateVisitorId();

  useEffect(() => {
    try {
      localStorage.setItem('ADMIN_MESSAGES', JSON.stringify(messages));
    } catch (e) {
      void e;
    }
    if (listRef.current)
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth',
      });
  }, [messages]);

  useEffect(() => {
    if (!USE_SOCKET) return;
    let mounted = true;
    let onHistory, onMessage, onMessagesSeen;
    (async () => {
      try {
        const s = await ensureSocket(API_URL);
        socketRef.current = s;
        onHistory = (list) => {
          if (!mounted) return;
          try {
            setMessages(list);
          } catch (e) {
            void e;
          }
        };
        onMessage = (msg) => {
          if (!mounted) return;
          try {
            const m =
              msg.from === 'admin' && msg.thread === username
                ? {
                    ...msg,
                    seenBy: Array.from(
                      new Set([...(msg.seenBy || []), username])
                    ),
                  }
                : msg;
            setMessages((prev) => [...prev, m]);
          } catch (e) {
            void e;
          }
        };
        onMessagesSeen = ({ thread, username: seenByUser }) => {
          if (!mounted) return;
          try {
            setMessages((prev) => {
              const next = prev.map((m) => {
                if (m.from === 'admin' && m.thread === thread) {
                  const seen = Array.isArray(m.seenBy) ? m.seenBy : [];
                  if (!seen.includes(seenByUser)) {
                    return { ...m, seenBy: [...seen, seenByUser] };
                  }
                }
                return m;
              });
              localStorage.setItem('ADMIN_MESSAGES', JSON.stringify(next));
              return next;
            });
          } catch (e) {
            void e;
          }
        };
        socketOn('chat:history', onHistory);
        socketOn('chat:message', onMessage);
        socketOn('chat:messages-seen', onMessagesSeen);
      } catch (e) {
        void e;
      }
    })();

    try {
      setMessages((prev) => {
        const next = prev.map((m) => {
          if (
            m.from === 'admin' &&
            (m.thread === username || m.to === username)
          ) {
            const seen = Array.isArray(m.seenBy) ? m.seenBy : [];
            if (!seen.includes(username))
              return { ...m, seenBy: [...seen, username] };
          }
          return m;
        });
        try {
          localStorage.setItem('ADMIN_MESSAGES', JSON.stringify(next));
        } catch (e) {
          void e;
        }
        return next;
      });
    } catch (e) {
      void e;
    }

    return () => {
      mounted = false;
      if (onHistory) socketOff('chat:history', onHistory);
      if (onMessage) socketOff('chat:message', onMessage);
      if (onMessagesSeen) socketOff('chat:messages-seen', onMessagesSeen);
    };
  }, [username]);

  useEffect(() => {
    if (!import.meta.env.VITE_USE_API) return;
    (async () => {
      try {
        await fetch(`${API_URL}/messages/seen`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ thread: username, username }),
        });
      } catch (e) {
        void e;
      }
    })();
  }, [username]);

  function sendMessage(e) {
    e && e.preventDefault();
    const t = text.trim();
    if (!t) return;
    const msg = {
      id: Date.now(),
      text: t,
      from: username,
      thread: username,
      time: new Date().toISOString(),
      handled: false,
    };
    if (USE_SOCKET && socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('chat:message', msg);
    } else if (import.meta.env.VITE_USE_API === 'true') {
      (async () => {
        try {
          await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msg),
          });
        } catch {
          setMessages((m) => [...m, msg]);
        }
      })();
    } else {
      setMessages((m) => [...m, msg]);
    }
    setText('');
  }

  const userMessages = messages.filter(
    (m) =>
      (m.thread && m.thread === username) ||
      m.from === username ||
      (m.to && m.to === username)
  );

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 380,
        maxWidth: 'calc(100vw - 40px)',
        height: 500,
        maxHeight: 'calc(100vh - 120px)',
        background: 'linear-gradient(135deg, #0a1929 0%, #051022 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10000,
        overflow: 'hidden',
        animation: 'slideUpFadeIn 0.3s ease-out',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16, color: '#e9f6ff' }}>
          Suporte ao Cliente
        </h3>
        <button
          onClick={onClose}
          title="Minimizar chat"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: 28,
            fontWeight: 300,
            cursor: 'pointer',
            padding: 0,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            lineHeight: 1,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = 'transparent')
          }
        >
          −
        </button>
      </div>

      <div
        ref={listRef}
        className="ba-support-modal-messages"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {userMessages.length === 0 && (
          <div
            style={{
              color: 'rgba(255,255,255,0.4)',
              textAlign: 'center',
              padding: 20,
            }}
          >
            Ningún mensaje aún. Envíe un mensaje para iniciar la conversación.
          </div>
        )}
        {userMessages.map((m) => {
          const isMe = m.from === username || m.from === 'system';
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  padding: '8px 12px',
                  borderRadius: 12,
                  background: isMe
                    ? 'linear-gradient(135deg, #0b5cc0 0%, #084a9a 100%)'
                    : 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>
                    {m.from === 'system'
                      ? 'Sistema'
                      : m.from === username
                      ? 'Usted'
                      : m.from === 'admin'
                      ? `Admin ${m.adminName || ''}`
                      : m.from}
                  </span>
                  <span
                    style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}
                  >
                    {new Date(m.time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div style={{ fontSize: 14 }}>{m.text}</div>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={sendMessage}
        style={{
          display: 'flex',
          gap: 8,
          padding: 12,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0, 0, 0, 0.2)',
        }}
      >
        <input
          type="text"
          placeholder="Escriba su mensaje..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            fontSize: 16 /* Prevents iOS Safari auto-zoom on focus */,
            outline: 'none',
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = 'rgba(11, 92, 192, 0.6)')
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)')
          }
        />
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: 'linear-gradient(135deg, #0b5cc0 0%, #084a9a 100%)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = 'scale(1.05)')
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}

import React, { useEffect, useState, useRef } from 'react';
import '../css/admin.css';
import '../css/chat.css';
import { getAuthUser } from '../utils/auth';
import {
  ensureSocket,
  on as socketOn,
  off as socketOff,
} from '../utils/socket';
import { getServerUrl } from '../utils/serverUrl';

const API_URL = getServerUrl();
const USE_SOCKET = true;

export default function UserSupport() {
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
  const username = getAuthUser() || 'Usuário';

  useEffect(() => {
    try {
      localStorage.setItem('ADMIN_MESSAGES', JSON.stringify(messages));
    } catch (e) {
      void e;
    }
    if (listRef.current)
      listRef.current.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    if (!USE_SOCKET) return;
    let mounted = true;
    let onHistory, onMessage;
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
        socketOn('chat:history', onHistory);
        socketOn('chat:message', onMessage);
      } catch (e) {
        void e;
      }
    })();

    // mark existing admin messages as seen by this user
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
    };
  }, [username]);

  // notify server that this user has seen admin messages for their thread
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
    // If socket connected, emit and let server persist/broadcast
    if (USE_SOCKET && socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('chat:message', msg);
    } else if (import.meta.env.VITE_USE_API === 'true') {
      // POST to API to persist and broadcast
      (async () => {
        try {
          await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msg),
          });
        } catch {
          // fallback to local
          setMessages((m) => [...m, msg]);
        }
      })();
    } else {
      // no server, fallback to local storage
      setMessages((m) => [...m, msg]);
    }
    setText('');
  }

  return (
    <div
      className="ba-user-support ba-chat"
      style={{ maxWidth: 1000, margin: '0 auto' }}
    >
      <div className="ba-chat-wrap" style={{ width: '100%', padding: 12 }}>
        <h2 style={{ margin: 0, marginBottom: 12 }}>Hablar con Soporte</h2>
        <div className="ba-chat-list" ref={listRef} style={{ marginTop: 0 }}>
          {messages.filter(
            (m) =>
              (m.thread && m.thread === username) ||
              m.from === username ||
              (m.to && m.to === username)
          ).length === 0 && <div className="ba-muted">Ningún mensaje</div>}
          {messages
            .filter(
              (m) =>
                (m.thread && m.thread === username) ||
                m.from === username ||
                (m.to && m.to === username)
            )
            .map((m) => {
              const isMe = m.from === username || m.from === 'system';
              return (
                <div
                  key={m.id}
                  className={`ba-chat-msg ${isMe ? 'me' : 'other'}`}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <div className="ba-chat-avatar">
                      {m.from === 'system'
                        ? '🔔'
                        : String(m.from || '')
                            .slice(0, 1)
                            .toUpperCase()}
                    </div>
                    <div
                      style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}
                    >
                      {m.from === 'system'
                        ? 'Sistema'
                        : m.from === username
                        ? 'Você'
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
                </div>
              );
            })}
        </div>

        <form
          className="ba-chat-form"
          onSubmit={sendMessage}
          style={{ marginTop: 12 }}
        >
          <input
            placeholder="Escreva uma mensagem..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit">Enviar</button>
        </form>
      </div>
    </div>
  );
}

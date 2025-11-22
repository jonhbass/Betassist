import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthUser } from '../utils/auth';
// import socket.io-client synchronously to avoid dynamic-import races during dev
import { io as ioClient } from 'socket.io-client';
import '../css/chat.css';

export default function Chat({ enabled = true }) {
  const navigate = useNavigate();
  const getCurrentUser = () => getAuthUser() || 'Guest';
  const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
  const USE_SOCKET =
    (import.meta.env.VITE_USE_SOCKET === 'true' ||
      import.meta.env.VITE_USE_API === 'true') &&
    enabled;

  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem('CHAT_MESSAGES');
      if (!raw)
        return [
          {
            id: 1,
            text: 'Bem-vindo ao chat! 👋',
            from: 'system',
            time: new Date().toISOString(),
          },
        ];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length
        ? parsed
        : [
            {
              id: 1,
              text: 'Bem-vindo ao chat! 👋',
              from: 'system',
              time: new Date().toISOString(),
            },
          ];
    } catch (e) {
      void e;
      // ignore parse errors and fall back
      return [
        {
          id: 1,
          text: 'Bem-vindo ao chat! 👋',
          from: 'system',
          time: new Date().toISOString(),
        },
      ];
    }
  });

  const [text, setText] = useState('');
  const [typing, setTyping] = useState('');
  const [socketState, setSocketState] = useState('disconnected'); // disconnected | connecting | connected
  const listRef = useRef(null);
  const socketRef = useRef(null);
  const connectingRef = useRef(false);
  const typingTimeout = useRef(null);
  // ensure socket is connected (used when user sends before dynamic import finished)
  const ensureSocketConnected = useCallback(async () => {
    if (!USE_SOCKET) return null;
    if (socketRef.current) return socketRef.current;
    if (connectingRef.current) {
      // wait until socketRef.current is set by the ongoing connection attempt
      return new Promise((resolve) => {
        const t = setInterval(() => {
          if (socketRef.current) {
            clearInterval(t);
            resolve(socketRef.current);
          }
        }, 50);
      });
    }
    connectingRef.current = true;
    const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const socket = ioClient(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      autoConnect: true,
    });
    socketRef.current = socket;
    connectingRef.current = false;
    // re-attach minimal listeners if they were not attached
    socket.on('connect', () => {
      console.log('chat socket connected (ensured)', socket.id);
      setSocketState('connected');
    });
    socket.on('chat:main-message', (msg) => {
      console.log('socket received chat:main-message (ensured)', msg);
      setMessages((m) => [...m, msg]);
    });
    socket.on('chat:main-history', (list) => setMessages(list));
    socket.on('chat:typing', (p) => {
      setTyping(p.name);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setTyping(''), 2000);
    });
    socket.on('connect_error', (err) => {
      console.warn('socket connect_error', err && err.message);
      setSocketState('disconnected');
    });
    socket.on('disconnect', (reason) => {
      console.log('socket disconnected', reason);
      setSocketState('disconnected');
    });
    return socket;
  }, [USE_SOCKET]);

  // Socket.IO connection (initial attach for clients that prefer the dynamic import path)
  useEffect(() => {
    if (!USE_SOCKET) return;
    // dynamic import to keep bundle small when not used
    let mounted = true;
    (async () => {
      const mod = await import('socket.io-client');
      const ioFn = mod.io || mod.default || mod;
      const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const socket = ioFn(url, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        autoConnect: true,
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('✅ Chat socket CONECTADO:', socket.id);
        setSocketState('connected');
      });

      socket.on('chat:main-history', (list) => {
        if (!mounted) return;
        console.log('📥 Histórico recebido:', list.length, 'mensagens');
        setMessages(list);
      });

      socket.on('chat:main-message', (msg) => {
        if (!mounted) return;
        console.log('📨 Nova mensagem recebida via socket:', msg);
        setMessages((m) => [...m, msg]);
      });

      socket.on('chat:typing', (p) => {
        if (!mounted) return;
        setTyping(p.name);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTyping(''), 2000);
      });

      socket.on('chat:cleared', () => {
        if (!mounted) return;
        console.log('🗑️ Chat limpo globalmente pelo admin');
        setMessages([]);
        try {
          localStorage.removeItem('CHAT_MESSAGES');
        } catch (e) {
          void e;
        }
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Erro de conexão do socket:', error);
        setSocketState('disconnected');
      });

      socket.on('disconnect', (reason) => {
        console.log('🔌 Socket desconectado:', reason);
        setSocketState('disconnected');
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket reconectado após', attemptNumber, 'tentativas');
        setSocketState('connected');
      });

      // reflect connection state
      try {
        setSocketState(socket && socket.connected ? 'connected' : 'connecting');
      } catch (e) {
        void e;
      }
    })();

    return () => {
      mounted = false;
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [USE_SOCKET]);

  // Disconnect socket when chat is disabled
  useEffect(() => {
    if (!enabled && socketRef.current) {
      console.log('Chat disabled - disconnecting socket');
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocketState('disconnected');
    }
  }, [enabled]);

  // proactively ensure a socket connection when the component mounts so we receive
  // messages in real time without requiring the user to type or refresh.
  useEffect(() => {
    if (!USE_SOCKET) return;
    (async () => {
      try {
        await ensureSocketConnected();
      } catch (e) {
        void e;
      }
    })();
  }, [USE_SOCKET, ensureSocketConnected]);

  useEffect(() => {
    // persist messages locally as fallback
    try {
      localStorage.setItem('CHAT_MESSAGES', JSON.stringify(messages));
    } catch (e) {
      void e; /* ignore storage errors */
    }
    if (listRef.current)
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth',
      });
  }, [messages]);

  function send(e) {
    e && e.preventDefault();
    const t = text.trim();
    if (!t) return;
    const currentUser = getCurrentUser();
    const msg = {
      id: Date.now(),
      text: t,
      from: currentUser,
      time: new Date().toISOString(),
    };
    console.log('chat send', msg);

    if (USE_SOCKET) {
      // ensure socket exists and emit — if not ready we'll connect and then emit
      (async () => {
        try {
          const s = await ensureSocketConnected();
          if (s) {
            s.emit('chat:main-message', msg);
            return;
          }
        } catch (err) {
          console.warn(
            'socket emit failed, falling back to local',
            err && err.message
          );
        }
        // fallback if socket not available
        setMessages((m) => [...m, msg]);
      })();
    } else {
      setMessages((m) => [...m, msg]);
    }

    setText('');
  }

  function onTyping(e) {
    setText(e.target.value);
    if (!USE_SOCKET) return;
    (async () => {
      try {
        const s = await ensureSocketConnected();
        if (s) s.emit('chat:typing', { name: getCurrentUser() });
      } catch (err) {
        void err;
      }
    })();
  }

  function formatTime(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      void e;
      return '';
    }
  }

  function clearChat() {
    const confirmMsg = isAdmin
      ? 'Limpar histórico do chat para TODOS os usuários?'
      : 'Limpar histórico do chat local?';

    if (!confirm(confirmMsg)) return;

    setMessages([]);

    try {
      localStorage.removeItem('CHAT_MESSAGES');
    } catch (e) {
      void e;
    }

    if (USE_SOCKET && socketRef.current) {
      if (isAdmin) {
        // Admin limpa para todos
        socketRef.current.emit('chat:clear-global');
      } else {
        // Usuário normal apenas notifica que limpou localmente
        socketRef.current.emit('chat:main-message', {
          id: Date.now(),
          text: `${getCurrentUser()} limpou o chat local`,
          from: 'system',
          time: new Date().toISOString(),
        });
      }
    }
  }

  return (
    <div className="ba-chat-wrap">
      <div className="ba-chat-header">
        <div className="ba-chat-title">Chat</div>
        <div className="ba-chat-controls">
          <div className={`ba-socket-badge ${socketState}`}>{socketState}</div>
          {!enabled && (
            <div className="ba-socket-badge disabled">desactivado</div>
          )}
          {isAdmin && (
            <button className="ba-btn small" onClick={clearChat} type="button">
              Limpar
            </button>
          )}
        </div>
      </div>

      {!enabled && (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#fbbf24',
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '8px',
            margin: '1rem',
          }}
        >
          <p style={{ margin: 0, fontWeight: 'bold' }}>
            ⚠️ Chat desactivado por el administrador
          </p>
        </div>
      )}

      <div className="ba-chat-list" ref={listRef}>
        {messages.map((m) => {
          const isMe = m.from === getCurrentUser();
          const handleAvatarClick = () => {
            // Se é admin e não é uma mensagem própria ou do sistema
            if (isAdmin && m.from !== 'system' && !isMe) {
              // Navegar para admin dashboard passando dados via state
              navigate('/admin', {
                state: {
                  section: 'support',
                  selectUser: m.from,
                },
              });
            }
          };

          return (
            <div key={m.id} className={`ba-chat-msg ${isMe ? 'me' : 'other'}`}>
              <div className="ba-chat-msg-header">
                <div
                  className="ba-chat-avatar"
                  onClick={handleAvatarClick}
                  style={{
                    cursor:
                      isAdmin && m.from !== 'system' && !isMe
                        ? 'pointer'
                        : 'default',
                  }}
                  title={
                    isAdmin && m.from !== 'system' && !isMe
                      ? `Abrir chat de suporte com ${m.from}`
                      : ''
                  }
                >
                  {m.from === 'system'
                    ? '🔔'
                    : m.from.slice(0, 1).toUpperCase()}
                </div>
                <div className="ba-chat-msg-user">
                  {m.from === 'system' ? 'Sistema' : m.from}
                </div>
                <div className="ba-chat-msg-time">{formatTime(m.time)}</div>
              </div>
              <div className="ba-chat-text">{m.text}</div>
            </div>
          );
        })}
      </div>

      {typing && enabled && (
        <div className="ba-chat-typing">{typing} está digitando...</div>
      )}

      <form className="ba-chat-form" onSubmit={send}>
        <input
          value={text}
          onChange={onTyping}
          placeholder={enabled ? `Escriba un mensaje...` : 'Chat desactivado'}
          disabled={!enabled}
        />
        <button type="submit" disabled={!enabled}>
          Enviar
        </button>
      </form>
    </div>
  );
}

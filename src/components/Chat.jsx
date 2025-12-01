import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthUser } from '../utils/auth';
import { ensureSocket } from '../utils/socket';
import { getServerUrl } from '../utils/serverUrl';
import '../css/chat.css';

// Função auxiliar para gerar cor consistente baseada no nome
const getUserColor = (username) => {
  if (!username || username === 'system') return null;
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  // HSL: Hue variável, Saturação alta, Luminosidade média para bom contraste no tema escuro
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 50%)`;
};

export default function Chat({ enabled = true }) {
  const navigate = useNavigate();
  const getCurrentUser = () => getAuthUser() || 'Guest';
  const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
  const USE_SOCKET = true;

  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem('CHAT_MESSAGES');
      if (!raw)
        return [
          {
            id: 1,
            text: '¡Bienvenido al chat! 👋',
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
              text: '¡Bienvenido al chat! 👋',
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
          text: '¡Bienvenido al chat! 👋',
          from: 'system',
          time: new Date().toISOString(),
        },
      ];
    }
  });

  const [text, setText] = useState('');
  const [typing, setTyping] = useState('');
  const [socketState, setSocketState] = useState('disconnected'); // disconnected | connecting | connected
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatBlocked, setChatBlocked] = useState(false); // Bloqueio de chat
  const [onlineCount, setOnlineCount] = useState(0); // Contador de usuários online
  const listRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeout = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiToggleRef = useRef(null);

  // Lista de emojis populares
  const EMOJI_LIST = [
    '😀',
    '😂',
    '😍',
    '🥰',
    '😎',
    '🤩',
    '😊',
    '🙂',
    '😉',
    '😏',
    '🤔',
    '😅',
    '😢',
    '😭',
    '😡',
    '🤬',
    '👍',
    '👎',
    '👏',
    '🙌',
    '🤝',
    '💪',
    '✌️',
    '🤞',
    '❤️',
    '🧡',
    '💛',
    '💚',
    '💙',
    '💜',
    '🖤',
    '💔',
    '🔥',
    '⭐',
    '✨',
    '💯',
    '🎉',
    '🎊',
    '🏆',
    '🥇',
    '⚽',
    '🏀',
    '🎮',
    '🎯',
    '🎲',
    '💰',
    '💵',
    '💸',
  ];

  // Fechar emoji picker ao clicar fora (exceto no botão toggle)
  useEffect(() => {
    function handleClickOutside(event) {
      const clickedOutsidePicker =
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target);
      const clickedOnToggle =
        emojiToggleRef.current && emojiToggleRef.current.contains(event.target);

      if (clickedOutsidePicker && !clickedOnToggle) {
        setShowEmojiPicker(false);
      }
    }
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  function insertEmoji(emoji) {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  }

  // Verificar se usuário está bloqueado no chat
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser === 'Guest') return;

    const checkBlockStatus = async () => {
      try {
        const serverUrl = getServerUrl();
        const res = await fetch(`${serverUrl}/users/${currentUser}/status`);
        if (res.ok) {
          const data = await res.json();
          setChatBlocked(data.chatBlocked || false);
        }
      } catch (err) {
        console.error('Erro ao verificar status de bloqueio:', err);
      }
    };

    checkBlockStatus();
  }, []);

  // Socket.IO connection
  useEffect(() => {
    if (!USE_SOCKET) return;

    let mounted = true;
    const url = getServerUrl();
    console.log('🌐 Chat conectando ao servidor via ensureSocket:', url);

    // Mostrar "Connecting..." enquanto aguarda
    setSocketState('connecting');

    ensureSocket(url).then((socket) => {
      if (!mounted) return;
      socketRef.current = socket;

      // Verificar estado atual do socket
      if (socket.connected) {
        console.log('✅ Chat socket já estava CONECTADO:', socket.id);
        setSocketState('connected');
        // Socket já conectado - emitir join imediatamente
        socket.emit('chat:join', { username: getCurrentUser() });
      } else {
        // Forçar reconexão se não estiver conectado
        console.log('🔄 Socket não conectado, tentando conectar...');
        socket.connect();
      }

      // Listener para atualização de bloqueio em tempo real
      const onChatBlocked = (data) => {
        if (data.username.toLowerCase() === getCurrentUser().toLowerCase()) {
          setChatBlocked(data.chatBlocked);
        }
      };
      socket.on('user:chat-blocked', onChatBlocked);

      const onConnect = () => {
        console.log('✅ Chat socket CONECTADO:', socket.id);
        if (mounted) setSocketState('connected');
        // Registrar usuário no chat
        socket.emit('chat:join', { username: getCurrentUser() });
      };

      const onOnlineCount = (data) => {
        if (mounted) setOnlineCount(data.count || 0);
      };

      const onHistory = (list) => {
        if (!mounted) return;
        setMessages(list);
      };

      const onMessage = (msg) => {
        if (!mounted) return;
        setMessages((m) => [...m, msg]);
      };

      const onTyping = (p) => {
        if (!mounted) return;
        setTyping(p.name);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
          if (mounted) setTyping('');
        }, 2000);
      };

      const onCleared = () => {
        if (!mounted) return;
        setMessages([]);
        try {
          localStorage.removeItem('CHAT_MESSAGES');
        } catch (e) {
          void e;
        }
      };

      const onConnectError = (err) => {
        console.warn('socket connect_error', err && err.message);
        if (mounted) setSocketState('disconnected');
      };

      const onDisconnect = (reason) => {
        console.log('socket disconnected', reason);
        if (mounted) setSocketState('disconnected');
      };

      socket.on('connect', onConnect);
      socket.on('chat:main-history', onHistory);
      socket.on('chat:main-message', onMessage);
      socket.on('chat:typing', onTyping);
      socket.on('chat:cleared', onCleared);
      socket.on('connect_error', onConnectError);
      socket.on('disconnect', onDisconnect);
      socket.on('chat:online-count', onOnlineCount);

      // Cleanup listeners on unmount
      return () => {
        socket.off('connect', onConnect);
        socket.off('chat:main-history', onHistory);
        socket.off('chat:main-message', onMessage);
        socket.off('chat:typing', onTyping);
        socket.off('chat:cleared', onCleared);
        socket.off('connect_error', onConnectError);
        socket.off('disconnect', onDisconnect);
        socket.off('user:chat-blocked', onChatBlocked);
        socket.off('chat:online-count', onOnlineCount);
      };
    });

    return () => {
      mounted = false;
      // Não desconectamos o socket pois é compartilhado (ensureSocket)
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

  // Não precisa de ensureSocketConnected separado - o useEffect principal já cria o socket
  // Removido para evitar duplicação de conexões

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

    // Verificar se usuário está bloqueado
    if (chatBlocked && !isAdmin) {
      alert('Tu cuenta está bloqueada para enviar mensajes en el chat.');
      return;
    }

    const t = text.trim();
    if (!t) return;
    const currentUser = getCurrentUser();
    const adminName = sessionStorage.getItem('adminUsername');
    const msg = {
      id: Date.now(),
      text: t,
      from: currentUser,
      time: new Date().toISOString(),
      ...(isAdmin && adminName ? { isAdmin: true, adminName: adminName } : {}),
    };
    console.log('chat send', msg);

    if (USE_SOCKET && socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('chat:main-message', msg);
    } else {
      // Fallback: send via REST
      const serverUrl = getServerUrl();
      fetch(`${serverUrl}/messages/main`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      })
        .then(() => {
          setMessages((m) => [...m, msg]);
        })
        .catch((err) => {
          console.error('Failed to send message via REST', err);
          setMessages((m) => [...m, msg]);
        });
    }

    setText('');
  }

  function onTyping(e) {
    setText(e.target.value);
    if (USE_SOCKET && socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('chat:typing', { name: getCurrentUser() });
    }
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
      ? '¿Limpiar historial del chat para TODOS los usuarios?'
      : '¿Limpiar historial del chat local?';

    if (!confirm(confirmMsg)) return;

    setMessages([]);

    try {
      localStorage.removeItem('CHAT_MESSAGES');
    } catch (e) {
      void e;
    }

    if (USE_SOCKET && socketRef.current) {
      if (isAdmin) {
        // Admin limpia para todos
        socketRef.current.emit('chat:clear-global');
      } else {
        // Usuario normal solo notifica que limpió localmente
        socketRef.current.emit('chat:main-message', {
          id: Date.now(),
          text: `${getCurrentUser()} limpió el chat local`,
          from: 'system',
          time: new Date().toISOString(),
        });
      }
    }
  }

  return (
    <div className="ba-chat-wrap">
      <div className="ba-chat-header">
        <div className="ba-chat-title">
          Chat
          {onlineCount > 0 && (
            <span className="ba-online-count" title="Usuarios en línea">
              <span className="ba-online-dot"></span>
              {onlineCount} Conectados
            </span>
          )}
        </div>
        <div className="ba-chat-controls">
          <div className={`ba-socket-badge ${socketState}`}>{socketState}</div>
          {!enabled && (
            <div className="ba-socket-badge disabled">desactivado</div>
          )}
          {isAdmin && (
            <button className="ba-btn small" onClick={clearChat} type="button">
              Limpiar
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
          const userColor =
            !isMe && m.from !== 'system' ? getUserColor(m.from) : undefined;

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
                    backgroundColor: userColor,
                    color: userColor ? '#fff' : undefined,
                    border: userColor
                      ? '1px solid rgba(255,255,255,0.2)'
                      : undefined,
                  }}
                  title={
                    isAdmin && m.from !== 'system' && !isMe
                      ? `Abrir chat de soporte con ${m.from}`
                      : ''
                  }
                >
                  {m.from === 'system'
                    ? '🔔'
                    : m.from.slice(0, 1).toUpperCase()}
                </div>
                <div className="ba-chat-msg-user">
                  {m.from === 'system'
                    ? 'Sistema'
                    : m.isAdmin
                    ? `Admin ${m.adminName || m.from}`
                    : m.from}
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
        <div className="ba-chat-input-wrapper">
          <input
            value={text}
            onChange={onTyping}
            placeholder={enabled ? `Escriba un mensaje...` : 'Chat desactivado'}
            disabled={!enabled}
          />
          <button
            type="button"
            ref={emojiToggleRef}
            className={`ba-emoji-toggle ${showEmojiPicker ? 'active' : ''}`}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            disabled={!enabled}
            title="Emojis"
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className="ba-emoji-picker" ref={emojiPickerRef}>
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="ba-emoji-item"
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="submit" disabled={!enabled}>
          Enviar
        </button>
      </form>
    </div>
  );
}

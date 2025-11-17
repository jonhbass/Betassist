import { useEffect, useRef, useState } from 'react';
import {
  ensureSocket,
  on as socketOn,
  off as socketOff,
} from '../../utils/socket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const USE_SOCKET =
  import.meta.env.VITE_USE_SOCKET === 'true' ||
  import.meta.env.VITE_USE_API === 'true';

export default function useAdminSupport() {
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem('ADMIN_MESSAGES');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      void e;
      return [];
    }
  });

  const [replyText, setReplyText] = useState('');
  const listRef = useRef(null);
  const socketRef = useRef(null);
  const [activeThread, setActiveThread] = useState(null);
  const activeThreadRef = useRef(activeThread);
  const [knownUsers, setKnownUsers] = useState([]);
  const [knownUsersFetched, setKnownUsersFetched] = useState(false);

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
    let onHistory;
    let onMessage;
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
            setMessages((prev) => {
              const incoming = { ...msg };
              try {
                const active = String(
                  activeThreadRef.current || ''
                ).toLowerCase();
                const mthread = String(
                  incoming.thread || incoming.from || ''
                ).toLowerCase();
                if (
                  incoming.from !== 'admin' &&
                  mthread &&
                  active &&
                  mthread === active
                ) {
                  incoming.handled = true;
                }
              } catch (err) {
                void err;
              }
              return [...prev, incoming];
            });
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
    return () => {
      mounted = false;
      if (onHistory) socketOff('chat:history', onHistory);
      if (onMessage) socketOff('chat:message', onMessage);
    };
  }, []);

  function emitOrPersist(msg) {
    if (USE_SOCKET && socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('chat:message', msg);
      return;
    }
    if (import.meta.env.VITE_USE_API === 'true') {
      (async () => {
        try {
          await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msg),
          });
          return;
        } catch (e) {
          void e;
        }
      })();
    }
    setMessages((m) => [...m, msg]);
  }

  function sendReply(e) {
    e && e.preventDefault();
    if (!replyText.trim() || !activeThread) return;
    const msg = {
      id: Date.now(),
      text: replyText.trim(),
      from: 'admin',
      thread: activeThread,
      time: new Date().toISOString(),
    };
    emitOrPersist(msg);
    setReplyText('');
  }

  function openThread(threadId) {
    try {
      setActiveThread(threadId);
      activeThreadRef.current = threadId;
      // optimistic local update: mark user messages as handled
      setMessages((m) =>
        m.map((x) => {
          try {
            const target = String(threadId || '').toLowerCase();
            const mkey = String(x.thread || x.from || '').toLowerCase();
            return mkey === target && x.from !== 'admin'
              ? { ...x, handled: true }
              : x;
          } catch {
            return x;
          }
        })
      );
      // persist on server (fire-and-forget)
      (async () => {
        try {
          await fetch(`${API_URL}/messages/mark-handled`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ thread: threadId }),
          });
          // after marking handled, re-fetch messages from server to ensure state
          if (import.meta.env.VITE_USE_API === 'true') {
            try {
              const r = await fetch(`${API_URL}/messages`);
              if (r.ok) {
                const list = await r.json();
                setMessages(list);
              }
            } catch (e) {
              void e;
            }
          }
        } catch (e) {
          void e;
        }
      })();
    } catch (e) {
      void e;
    }
  }

  useEffect(() => {
    activeThreadRef.current = activeThread;
    if (!activeThread) return;
    // optimistic local update
    setMessages((m) =>
      m.map((x) => {
        try {
          const target = String(activeThread || '').toLowerCase();
          const mkey = String(x.thread || x.from || '').toLowerCase();
          return mkey === target && x.from !== 'admin'
            ? { ...x, handled: true }
            : x;
        } catch {
          return x;
        }
      })
    );
    // persist on server (fire-and-forget)
    (async () => {
      try {
        await fetch(`${API_URL}/messages/mark-handled`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ thread: activeThread }),
        });
        // re-fetch messages after marking handled to ensure UI sync
        if (import.meta.env.VITE_USE_API === 'true') {
          try {
            const r = await fetch(`${API_URL}/messages`);
            if (r.ok) {
              const list = await r.json();
              setMessages(list);
            }
          } catch (e) {
            void e;
          }
        }
      } catch {
        // ignore network errors
      }
    })();
  }, [activeThread]);

  // fetch registered users from API (if available) to filter threads
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/users`);
        if (!res.ok) throw new Error('no users');
        const data = await res.json();
        // /users returns [{ username }]
        const list = Array.isArray(data)
          ? data.map((u) => String(u.username || '').trim()).filter(Boolean)
          : [];
        setKnownUsers(list);
        setKnownUsersFetched(true);
      } catch {
        // if API not available, mark fetched so we don't block (keep behaviour)
        setKnownUsersFetched(false);
      }
    })();
  }, []);

  const threads = (function computeThreads(list) {
    const map = new Map();
    list.forEach((m) => {
      const key = m.thread || (m.from !== 'admin' ? m.from : m.to || 'unknown');
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(m);
    });
    const out = [];
    map.forEach((msgs, id) => {
      const sorted = msgs.slice().sort((a, b) => (a.time > b.time ? 1 : -1));
      const userMsgs = sorted.filter((x) => x.from !== 'admin');
      if (!userMsgs.length) return;
      const lastUser = userMsgs[userMsgs.length - 1];
      const firstUser = userMsgs[0];
      const unread = userMsgs.filter((x) => !x.handled).length;
      out.push({
        id,
        lastUserText: lastUser.text,
        lastUserTime: lastUser.time,
        firstUser,
        unread,
        total: sorted.length,
        messages: sorted,
      });
    });
    return out.sort((a, b) => (a.lastUserTime < b.lastUserTime ? 1 : -1));
  })(messages);

  useEffect(() => {
    if (!activeThread && threads && threads.length)
      setActiveThread(threads[0].id);
  }, [threads, activeThread]);

  function markAllHandled() {
    setMessages((m) =>
      m.map((x) => {
        try {
          const target = String(activeThread || '').toLowerCase();
          const mkey = String(x.thread || x.from || '').toLowerCase();
          return mkey === target && x.from !== 'admin'
            ? { ...x, handled: true }
            : x;
        } catch {
          return x;
        }
      })
    );
    (async () => {
      try {
        await fetch(`${API_URL}/messages/mark-handled`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ thread: activeThread }),
        });
      } catch (e) {
        void e;
      }
    })();
  }

  return {
    messages,
    setMessages,
    replyText,
    setReplyText,
    listRef,
    activeThread,
    setActiveThread,
    activeThreadRef,
    knownUsers,
    knownUsersFetched,
    threads,
    sendReply,
    openThread,
    markAllHandled,
  };
}

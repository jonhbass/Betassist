import { useEffect, useRef, useState } from 'react';
import {
  postMessage,
  markThreadHandled,
  fetchMessages,
} from './utils/apiService';
import { computeThreads, markMessagesAsHandled } from './utils/threadHelpers';
import { useSocketMessages } from './hooks/useSocketMessages';
import { useAutoScroll } from './hooks/useAutoScroll';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useKnownUsers } from './hooks/useKnownUsers';

const USE_SOCKET =
  import.meta.env.VITE_USE_SOCKET === 'true' ||
  import.meta.env.VITE_USE_API === 'true';

export default function useAdminSupport() {
  const [messages, setMessages] = useLocalStorage('ADMIN_MESSAGES', []);
  const [replyText, setReplyText] = useState('');
  const [activeThread, setActiveThread] = useState(null);
  const activeThreadRef = useRef(activeThread);
  const listRef = useRef(null);

  const { knownUsers, knownUsersFetched } = useKnownUsers();
  const socketRef = useSocketMessages(setMessages, activeThreadRef);

  useAutoScroll(listRef, [messages, activeThread]);

  function emitOrPersist(msg) {
    if (USE_SOCKET && socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('chat:message', msg);
      return;
    }
    if (import.meta.env.VITE_USE_API === 'true') {
      postMessage(msg);
      return;
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

  async function openThread(threadId) {
    try {
      setActiveThread(threadId);
      activeThreadRef.current = threadId;

      // Optimistic local update
      setMessages((m) => markMessagesAsHandled(m, threadId));

      // Persist on server
      await markThreadHandled(threadId);

      // Re-fetch messages to ensure sync
      if (import.meta.env.VITE_USE_API === 'true') {
        const list = await fetchMessages();
        if (list.length > 0) setMessages(list);
      }
    } catch (e) {
      void e;
    }
  }

  async function markAllHandled() {
    setMessages((m) => markMessagesAsHandled(m, activeThread));
    await markThreadHandled(activeThread);
  }

  useEffect(() => {
    activeThreadRef.current = activeThread;
    if (!activeThread) return;

    (async () => {
      setMessages((m) => markMessagesAsHandled(m, activeThread));
      await markThreadHandled(activeThread);

      if (import.meta.env.VITE_USE_API === 'true') {
        const list = await fetchMessages();
        if (list.length > 0) setMessages(list);
      }
    })();
  }, [activeThread, setMessages]);

  const threads = computeThreads(messages);

  useEffect(() => {
    if (!activeThread && threads && threads.length) {
      setActiveThread(threads[0].id);
    }
  }, [threads, activeThread]);

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

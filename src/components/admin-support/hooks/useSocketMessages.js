import { useEffect, useRef } from 'react';
import {
  ensureSocket,
  on as socketOn,
  off as socketOff,
} from '../../../utils/socket';
import { getServerUrl } from '../../../utils/serverUrl';
import { playNotificationSound } from '../../../utils/notificationSound';

const API_URL = getServerUrl();
const USE_SOCKET = true;

export function useSocketMessages(setMessages, activeThreadRef) {
  const socketRef = useRef(null);

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
            // Tocar som apenas para mensagens de usuários (não de admin)
            if (msg.from !== 'admin') {
              playNotificationSound('message');
            }
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
  }, [setMessages, activeThreadRef]);

  return socketRef;
}

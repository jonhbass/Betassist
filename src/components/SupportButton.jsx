import React, { useEffect, useState } from 'react';
import { getAuthUser } from '../utils/auth';
import SupportChatModal from './SupportChatModal';
import { ensureSocket, on as socketOn, off as socketOff } from '../utils/socket';
import '../css/supportButton.css';

export default function SupportButton() {
  const [unread, setUnread] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  function computeUnread() {
    try {
      const raw = localStorage.getItem('ADMIN_MESSAGES');
      const list = raw ? JSON.parse(raw) : [];
      const user = getAuthUser() || 'Você';
      // unread = admin messages for this user's thread not yet seen by this user
      const count = list.filter(
        (m) =>
          m.from === 'admin' &&
          (m.thread === user || m.to === user) &&
          !(m.seenBy && Array.isArray(m.seenBy) && m.seenBy.includes(user))
      ).length;
      return count;
    } catch (e) {
      void e;
      return 0;
    }
  }

  useEffect(() => {
    setUnread(computeUnread());
    const onStorage = (ev) => {
      if (ev.key === 'ADMIN_MESSAGES') setUnread(computeUnread());
    };
    window.addEventListener('storage', onStorage);
    // also poll occasionally for single-tab changes
    const t = setInterval(() => setUnread(computeUnread()), 2000);
    
    // Escutar eventos do socket para atualizar em tempo real
    let mounted = true;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    
    (async () => {
      try {
        await ensureSocket(API_URL);
        
        const onMessage = () => {
          if (mounted) setUnread(computeUnread());
        };
        
        const onHistory = () => {
          if (mounted) setUnread(computeUnread());
        };
        
        const onMessagesSeen = () => {
          if (mounted) setUnread(computeUnread());
        };
        
        socketOn('chat:message', onMessage);
        socketOn('chat:history', onHistory);
        socketOn('chat:messages-seen', onMessagesSeen);
        
      } catch (e) {
        console.error('Erro ao conectar socket no SupportButton:', e);
      }
    })();
    
    return () => {
      mounted = false;
      window.removeEventListener('storage', onStorage);
      clearInterval(t);
      socketOff('chat:message', computeUnread);
      socketOff('chat:history', computeUnread);
      socketOff('chat:messages-seen', computeUnread);
    };
  }, []);

  const _user = getAuthUser() || 'Você';

  return (
    <>
      {!isOpen && (
        <button
          className="ba-support-fab"
          title="Fale com o suporte"
          onClick={() => setIsOpen(true)}
          aria-label="Falar com suporte"
          style={{
            animation: 'fadeIn 0.3s ease-in-out',
          }}
        >
          <div className="ba-support-icon">💬</div>
          {unread > 0 && <div className="ba-support-badge">{unread}</div>}
        </button>
      )}

      {isOpen && <SupportChatModal onClose={() => setIsOpen(false)} />}
    </>
  );
}

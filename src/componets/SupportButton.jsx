import React, { useEffect, useState } from 'react';
import { getAuthUser } from '../utils/auth';
import SupportChatModal from './SupportChatModal';
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
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(t);
    };
  }, []);

  const user = getAuthUser() || 'Você';

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

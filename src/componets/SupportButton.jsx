import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthUser } from '../utils/auth';
import '../css/supportButton.css';

export default function SupportButton() {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  function computeUnread() {
    try {
      const raw = localStorage.getItem('ADMIN_MESSAGES');
      const list = raw ? JSON.parse(raw) : [];
      const user = getAuthUser() || 'Você';
      // unread = admin messages not yet seen by this user
      const count = list.filter(
        (m) =>
          m.from === 'admin' &&
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
    <button
      className="ba-support-fab"
      title="Fale com o suporte"
      onClick={() => navigate('/support')}
      aria-label={`Falar com suporte — ${user}`}
    >
      <div className="ba-support-icon">💬</div>
      <div className="ba-support-avatar">
        {(user || 'U').slice(0, 1).toUpperCase()}
      </div>
      {unread > 0 && <div className="ba-support-badge">{unread}</div>}
    </button>
  );
}

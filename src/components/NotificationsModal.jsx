import React, { useState, useEffect } from 'react';
import { getAuthUser } from '../utils/auth';
import '../css/NotificationsModal.css';

export default function NotificationsModal({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const currentUser = getAuthUser();

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      loadNotifications();
    } else if (shouldRender) {
      // Iniciar animação de saída
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = () => {
    try {
      const allNotifications = JSON.parse(
        localStorage.getItem('DEPOSIT_NOTIFICATIONS') || '[]'
      );
      // Filtrar apenas notificações do usuário atual
      const userNotifications = allNotifications.filter(
        (notif) => notif.user === currentUser
      );
      // Ordenar por data (mais recentes primeiro)
      userNotifications.sort((a, b) => b.id - a.id);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setNotifications([]);
    }
  };

  const markAsRead = (notifId) => {
    try {
      const allNotifications = JSON.parse(
        localStorage.getItem('DEPOSIT_NOTIFICATIONS') || '[]'
      );
      const updated = allNotifications.map((n) =>
        n.id === notifId ? { ...n, read: true } : n
      );
      localStorage.setItem('DEPOSIT_NOTIFICATIONS', JSON.stringify(updated));
      loadNotifications();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = () => {
    try {
      const allNotifications = JSON.parse(
        localStorage.getItem('DEPOSIT_NOTIFICATIONS') || '[]'
      );
      const updated = allNotifications.map((n) =>
        n.user === currentUser ? { ...n, read: true } : n
      );
      localStorage.setItem('DEPOSIT_NOTIFICATIONS', JSON.stringify(updated));
      loadNotifications();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250);
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`ba-notifications-popup ${isClosing ? 'closing' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="ba-notifications-header">
        <h3>🔔 Notificaciones</h3>
      </div>

      {notifications.length > 0 && (
        <button className="ba-mark-all-read" onClick={markAllAsRead}>
          Marcar todas como leídas
        </button>
      )}

      <div className="ba-notifications-list">
        {notifications.length === 0 ? (
          <div className="ba-notifications-empty">
            <p>Sin notificaciones</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`ba-notification-item ${
                notif.read ? 'read' : 'unread'
              }`}
              onClick={() => !notif.read && markAsRead(notif.id)}
            >
              <div className="ba-notification-header-info">
                <span className="ba-notification-date">{notif.date}</span>
                {!notif.read && (
                  <span className="ba-notification-badge">Nuevo</span>
                )}
              </div>
              <div className="ba-notification-content">
                <p className="ba-notification-title">
                  ✅ Tu solicitud de recarga de $
                  {notif.amount.toLocaleString('es-AR')} fue aprobada!
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

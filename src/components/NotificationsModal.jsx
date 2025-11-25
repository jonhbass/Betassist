import React, { useState, useEffect } from 'react';
import { getAuthUser } from '../utils/auth';
import '../css/NotificationsModal.css';

export default function NotificationsModal({ isOpen }) {
  const [notifications, setNotifications] = useState([]);
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const currentUser = getAuthUser();

  const loadNotifications = React.useCallback(() => {
    try {
      // Carregar notificações de depósito
      const depositNotifications = JSON.parse(
        localStorage.getItem('DEPOSIT_NOTIFICATIONS') || '[]'
      );

      // Carregar notificações de retirada
      const withdrawNotifications = JSON.parse(
        localStorage.getItem('WITHDRAW_NOTIFICATIONS') || '[]'
      );

      // Combinar todas as notificações
      const allNotifications = [
        ...depositNotifications,
        ...withdrawNotifications,
      ];

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
  }, [currentUser]);

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
  }, [isOpen, shouldRender, loadNotifications]);

  const markAsRead = (notifId) => {
    try {
      // Atualizar notificações de depósito
      const depositNotifications = JSON.parse(
        localStorage.getItem('DEPOSIT_NOTIFICATIONS') || '[]'
      );
      const updatedDeposits = depositNotifications.map((n) =>
        n.id === notifId ? { ...n, read: true } : n
      );
      localStorage.setItem(
        'DEPOSIT_NOTIFICATIONS',
        JSON.stringify(updatedDeposits)
      );

      // Atualizar notificações de retirada
      const withdrawNotifications = JSON.parse(
        localStorage.getItem('WITHDRAW_NOTIFICATIONS') || '[]'
      );
      const updatedWithdraws = withdrawNotifications.map((n) =>
        n.id === notifId ? { ...n, read: true } : n
      );
      localStorage.setItem(
        'WITHDRAW_NOTIFICATIONS',
        JSON.stringify(updatedWithdraws)
      );

      loadNotifications();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = () => {
    try {
      // Atualizar notificações de depósito
      const depositNotifications = JSON.parse(
        localStorage.getItem('DEPOSIT_NOTIFICATIONS') || '[]'
      );
      const updatedDeposits = depositNotifications.map((n) =>
        n.user === currentUser ? { ...n, read: true } : n
      );
      localStorage.setItem(
        'DEPOSIT_NOTIFICATIONS',
        JSON.stringify(updatedDeposits)
      );

      // Atualizar notificações de retirada
      const withdrawNotifications = JSON.parse(
        localStorage.getItem('WITHDRAW_NOTIFICATIONS') || '[]'
      );
      const updatedWithdraws = withdrawNotifications.map((n) =>
        n.user === currentUser ? { ...n, read: true } : n
      );
      localStorage.setItem(
        'WITHDRAW_NOTIFICATIONS',
        JSON.stringify(updatedWithdraws)
      );

      loadNotifications();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  // handleClose removido pois não estava sendo usado

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
                {notif.type === 'withdraw-approved' && (
                  <p className="ba-notification-title">
                    💸 Tu solicitud de retiro de $
                    {notif.amount.toLocaleString('es-AR')} fue aprobada!
                  </p>
                )}
                {notif.type === 'approved' && (
                  <p className="ba-notification-title">
                    ✅ Tu solicitud de recarga de $
                    {notif.amount.toLocaleString('es-AR')} fue aprobada!
                  </p>
                )}
                {notif.type === 'withdraw-rejected' && (
                  <p className="ba-notification-title">
                    ❌ Tu solicitud de retiro de $
                    {notif.amount.toLocaleString('es-AR')} fue rechazada.
                    <br />
                    <small>Motivo: {notif.message || 'Sin motivo'}</small>
                  </p>
                )}
                {notif.type === 'deposit-rejected' && (
                  <p className="ba-notification-title">
                    ❌ Tu solicitud de recarga de $
                    {notif.amount.toLocaleString('es-AR')} fue rechazada.
                    <br />
                    <small>Motivo: {notif.message || 'Sin motivo'}</small>
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { getServerUrl } from './serverUrl';
import { ensureSocket } from './socket';
import { playNotificationSound } from './notificationSound';

/**
 * Hook global para notificações sonoras de admin
 * @param {boolean} enabled - Se true, ativa as notificações. Default: true
 */
export function useAdminNotifications(enabled = true) {
  const prevPendingDepositsRef = useRef(0);
  const prevPendingWithdrawsRef = useRef(0);
  const isFirstLoadRef = useRef(true);

  // Polling para depósitos e saques
  useEffect(() => {
    if (!enabled) return;

    const checkPendingRequests = async () => {
      try {
        const serverUrl = getServerUrl();

        // Depósitos pendentes
        let pendingDep = 0;
        try {
          const res = await fetch(`${serverUrl}/deposits`);
          if (res.ok) {
            const deposits = await res.json();
            pendingDep = deposits.filter(
              (d) => d.status === 'Pendiente'
            ).length;
          }
        } catch (e) {
          void e;
        }

        // Saques pendentes
        let pendingWith = 0;
        try {
          const res = await fetch(`${serverUrl}/withdrawals`);
          if (res.ok) {
            const withdraws = await res.json();
            pendingWith = withdraws.filter(
              (w) => w.status === 'Pendiente'
            ).length;
          }
        } catch (e) {
          void e;
        }

        // Tocar sons (apenas após primeiro carregamento)
        if (!isFirstLoadRef.current) {
          if (pendingDep > prevPendingDepositsRef.current) {
            playNotificationSound('deposit');
          } else if (pendingWith > prevPendingWithdrawsRef.current) {
            playNotificationSound('withdraw');
          }
        }

        // Atualizar refs
        prevPendingDepositsRef.current = pendingDep;
        prevPendingWithdrawsRef.current = pendingWith;
        isFirstLoadRef.current = false;
      } catch (error) {
        console.error('Erro ao verificar notificações:', error);
      }
    };

    checkPendingRequests();
    const interval = setInterval(checkPendingRequests, 5000);
    return () => clearInterval(interval);
  }, [enabled]);

  // WebSocket para mensagens de chat
  useEffect(() => {
    if (!enabled) return;

    let socketInstance = null;

    const handleNewMessage = (msg) => {
      // Tocar som apenas para mensagens de usuários (não de admin)
      if (msg.from !== 'admin') {
        playNotificationSound('message');
      }
    };

    ensureSocket().then((s) => {
      if (s) {
        socketInstance = s;
        s.on('chat:message', handleNewMessage);
      }
    });

    return () => {
      if (socketInstance) {
        socketInstance.off('chat:message', handleNewMessage);
      }
    };
  }, [enabled]);
}

export default useAdminNotifications;

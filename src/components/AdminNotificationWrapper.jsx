import { useAdminNotifications } from '../utils/useAdminNotifications';

/**
 * Wrapper para rotas de admin que ativa notificações sonoras globais
 */
export default function AdminNotificationWrapper({ children }) {
  // Ativa os listeners de notificação sonora
  useAdminNotifications();

  return children;
}

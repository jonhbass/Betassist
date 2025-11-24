import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';
import '../css/NotificationsModal.css';
import Sidebar from '../components/Sidebar';
import Chat from '../components/Chat';
import Carrossel from '../components/Carrossel';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import Topbar from '../components/Topbar';
import Toast from '../components/Toast';
import LoadModalContent from '../components/LoadModalContent';
import WithdrawModalContent from '../components/WithdrawModalContent';
import SupportButton from '../components/SupportButton';
import NotificationsModal from '../components/NotificationsModal';
import Tutorial from '../components/Tutorial';
import { getAuthUser, removeAuthUser } from '../utils/auth';
import { getServerUrl } from '../utils/serverUrl';

export default function Dashboard() {
  const [user, setUser] = useState('');

  const navigate = useNavigate();

  // slides are now handled inside the Carrossel component

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState(null);
  const [chatEnabled, setChatEnabled] = useState(() => {
    const stored = localStorage.getItem('chatEnabled');
    return stored === null ? true : stored === 'true';
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [socket, setSocket] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const handleNotifyClick = React.useCallback(() => {
    setShowNotifications((prev) => {
      const next = !prev;
      if (next) {
        setShowHamburgerMenu(false); // Fecha o menu hamburger ao abrir notificações
      }
      return next;
    });
  }, []);

  const handleMenuClick = React.useCallback(() => {
    setShowHamburgerMenu((prev) => {
      const next = !prev;
      if (next) {
        setShowNotifications(false); // Fecha notificações ao abrir menu hamburger
      }
      return next;
    });
  }, []);

  const handleTutorialStart = React.useCallback(() => {
    setShowHamburgerMenu(false); // Fecha o menu hamburger
    setShowTutorial(true);
  }, []);

  function toggleSidebar() {
    setSidebarOpen((s) => !s);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  useEffect(() => {
    // collapse sidebar on small screens by default
    if (window.innerWidth && window.innerWidth < 900) setSidebarOpen(false);
  }, []);

  useEffect(() => {
    const u = getAuthUser();
    const adminUser = sessionStorage.getItem('adminUsername');

    if (u) {
      setUser(u);
    } else if (adminUser) {
      setUser(adminUser);
    } else {
      // Se não tiver usuário nem admin, define um padrão ou redireciona se necessário
      setUser('Visitante');
    }

    // SEMPRE re-verificar status de admin para evitar que usuário normal veja opções de admin
    const adminStatus = sessionStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);

    // Se não for admin, garantir que não há flag de admin
    if (!adminStatus) {
      sessionStorage.removeItem('isAdmin');
    }

    // Verificar se é a primeira vez do usuário (auto-iniciar tutorial)
    const tutorialCompleted = localStorage.getItem('tutorialCompleted');
    if (!tutorialCompleted && !adminStatus) {
      // Aguardar 2 segundos para página carregar completamente
      setTimeout(() => {
        setShowTutorial(true);
      }, 2000);
    }
  }, []);

  // Re-verificar isAdmin sempre que o componente ganhar foco (usuário voltar para a aba)
  useEffect(() => {
    const handleFocus = () => {
      const adminStatus = sessionStorage.getItem('isAdmin') === 'true';
      setIsAdmin(adminStatus);
      console.log('Dashboard focus - isAdmin:', adminStatus);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    // quick debug log to help diagnose blank screen
    console.log('Dashboard mounted', { user: getAuthUser() });
  }, []);

  // Listener para sincronizar estado do chat globalmente via socket
  useEffect(() => {
    const USE_SOCKET =
      import.meta.env.VITE_USE_SOCKET === 'true' ||
      import.meta.env.VITE_USE_API === 'true';

    if (!USE_SOCKET) return;

    // Buscar estado atual do chat do servidor ao carregar
    const fetchChatState = async () => {
      try {
        const serverUrl = getServerUrl();
        const res = await fetch(`${serverUrl}/config`);
        if (res.ok) {
          const config = await res.json();
          const serverChatEnabled = config.chatEnabled !== false;
          console.log(
            '🔄 Estado do chat recebido do servidor:',
            serverChatEnabled
          );
          localStorage.setItem('chatEnabled', String(serverChatEnabled));
          setChatEnabled(serverChatEnabled);
        }
      } catch (error) {
        console.error('Erro ao buscar estado do chat:', error);
      }
    };

    fetchChatState();

    let socketInstance;
    import('socket.io-client').then((mod) => {
      const ioFn = mod.io || mod.default || mod;
      const url = getServerUrl();
      socketInstance = ioFn(url);
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        console.log('Dashboard socket conectado:', socketInstance.id);
      });

      socketInstance.on('chat:state-changed', (data) => {
        console.log('📡 Chat estado alterado globalmente:', data.enabled);
        localStorage.setItem('chatEnabled', String(data.enabled));
        setChatEnabled(data.enabled);
        showToast(
          data.enabled
            ? 'Chat ativado pelo admin'
            : 'Chat desativado pelo admin'
        );
      });
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        setSocket(null);
      }
    };
  }, []);

  // Listen for new notifications
  useEffect(() => {
    const handleNotification = (data) => {
      if (
        data.username &&
        user &&
        data.username.toLowerCase() === user.toLowerCase()
      ) {
        showToast(`✅ ${data.message}`);

        // Save to LocalStorage for NotificationsModal
        const notif = {
          id: data.id,
          user: user,
          amount: data.amount,
          date: data.date,
          read: false,
          type: 'deposit',
          message: data.message,
        };

        try {
          const existing = JSON.parse(
            localStorage.getItem('DEPOSIT_NOTIFICATIONS') || '[]'
          );
          localStorage.setItem(
            'DEPOSIT_NOTIFICATIONS',
            JSON.stringify([notif, ...existing])
          );
        } catch (e) {
          console.error('Error saving notification', e);
        }
      }
    };

    if (socket) {
      socket.on('notification:new', handleNotification);
      return () => socket.off('notification:new', handleNotification);
    }
  }, [user, socket]);

  function handleLogout() {
    removeAuthUser();
    navigate('/login', { replace: true });
  }

  function toggleChat() {
    const newState = !chatEnabled;
    setChatEnabled(newState);
    localStorage.setItem('chatEnabled', String(newState));
    showToast(newState ? 'Chat ativado' : 'Chat desativado');

    // Admin notifica todos os usuários sobre mudança de estado do chat
    if (isAdmin && socket) {
      console.log('Emitindo chat:toggle-global com enabled:', newState);
      socket.emit('chat:toggle-global', { enabled: newState });
    }
  }

  return (
    <div className="ba-dashboard">
      <Topbar
        onToggleSidebar={toggleSidebar}
        onLogout={handleLogout}
        onMessageClick={() => navigate('/support')}
        onNotifyClick={handleNotifyClick}
        onMenuClick={handleMenuClick}
        onTutorialStart={handleTutorialStart}
        showMenu={showHamburgerMenu}
      />
      <main className="ba-main">
        <div className="ba-layout">
          {/* Overlay escuro quando sidebar está aberto no mobile */}
          {sidebarOpen && (
            <div
              className="ba-sidebar-overlay"
              onClick={toggleSidebar}
              aria-label="Fechar menu lateral"
            />
          )}

          <aside className={`ba-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
            <Sidebar
              isOpen={sidebarOpen}
              user={user}
              onToast={showToast}
              onOpenModal={setModal}
              isAdmin={isAdmin}
              onToggleChat={isAdmin ? toggleChat : undefined}
              chatEnabled={chatEnabled}
              onToggleSidebar={toggleSidebar}
            />
          </aside>

          <div className="ba-content">
            <Carrossel />

            <h1 className="ba-welcome">
              ¡Hola, <span>{user}</span>!
            </h1>

            <div className="ba-chat">
              <Chat enabled={chatEnabled} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <Toast message={toast} />

      {modal === 'load' && (
        <Modal title="Carregar fichas" onClose={() => setModal(null)}>
          <LoadModalContent
            onClose={() => setModal(null)}
            onConfirm={() => showToast('Carga solicitada (simulada)')}
          />
        </Modal>
      )}

      {modal === 'withdraw' && (
        <Modal title="Retirar fichas" onClose={() => setModal(null)}>
          <WithdrawModalContent
            onClose={() => setModal(null)}
            onConfirm={() => showToast('Saque solicitado (simulado)')}
          />
        </Modal>
      )}

      <SupportButton />
      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
      <Tutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';
import Sidebar from '../componets/Sidebar';
import Chat from '../componets/Chat';
import Carrossel from '../componets/Carrossel';
import Footer from '../componets/Footer';
import Modal from '../componets/Modal';
import Topbar from '../componets/Topbar';
import Toast from '../componets/Toast';
import LoadModalContent from '../componets/LoadModalContent';
import WithdrawModalContent from '../componets/WithdrawModalContent';
import HistoryModalContent from '../componets/HistoryModalContent';
import SupportButton from '../componets/SupportButton';
import { getAuthUser, removeAuthUser } from '../utils/auth';

export default function Dashboard() {
  const [user, setUser] = useState('tute4279');

  const navigate = useNavigate();

  // slides are now handled inside the Carrossel component

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState(null);

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
    if (u) setUser(u);
  }, []);

  useEffect(() => {
    // quick debug log to help diagnose blank screen
    console.log('Dashboard mounted', { user: getAuthUser() });
  }, []);

  function handleLogout() {
    removeAuthUser();
    navigate('/login', { replace: true });
  }

  return (
    <div className="ba-dashboard">
      <Topbar
        onToggleSidebar={toggleSidebar}
        onLogout={handleLogout}
        onMessageClick={() => navigate('/support')}
        onNotifyClick={() => showToast('Notificações (simulado)')}
      />
      <main className="ba-main">
        <div className="ba-layout">
          <aside className={`ba-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
            <Sidebar
              isOpen={sidebarOpen}
              user={user}
              onToast={showToast}
              onOpenModal={setModal}
            />
          </aside>

          <div className="ba-content">
            <Carrossel />

            <h1 className="ba-welcome">
              ¡Hola, <span>{user}</span>!
            </h1>

            <div className="ba-chat">
              <Chat />
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

      {modal === 'history' && (
        <Modal title="Histórico" onClose={() => setModal(null)}>
          <HistoryModalContent />
        </Modal>
      )}

      <SupportButton />
    </div>
  );
}

import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Dashboard.css';
import '../css/admin.css';
import AdminSupport from '../components/AdminSupport';
import AdminSidebar from '../components/AdminSidebar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { getServerUrl } from '../utils/serverUrl';
import { ensureSocket } from '../utils/socket';
import { playNotificationSound } from '../utils/notificationSound';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState('');
  const [editing, setEditing] = useState(null);
  const [editingPassword, setEditingPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Busca de usuários
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('create');
  const [pendingDeposits, setPendingDeposits] = useState(0);
  const [pendingWithdraws, setPendingWithdraws] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [socket, setSocket] = useState(null);
  const [chatEnabled, setChatEnabled] = useState(() => {
    const stored = localStorage.getItem('chatEnabled');
    return stored === null ? true : stored === 'true';
  });

  // Refs para rastrear contagens anteriores (para sons de notificação)
  const prevPendingDepositsRef = useRef(0);
  const prevPendingWithdrawsRef = useRef(0);
  const prevUnreadMessagesRef = useRef(0);
  const isFirstLoadRef = useRef(true);

  const USE_API = true;

  const showToast = useCallback((msg, ms = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(''), ms);
  }, []);

  useEffect(() => {
    // Colapsar sidebar no mobile por padrão
    if (window.innerWidth && window.innerWidth < 900) setSidebarOpen(false);
  }, []);

  const loadUsers = useCallback(async () => {
    if (USE_API) {
      try {
        const serverUrl = getServerUrl();
        // Usar endpoint admin que retorna status de bloqueio
        const res = await fetch(`${serverUrl}/users/admin/list`);
        const data = await res.json();
        setUsers(data || []);
        return;
      } catch (err) {
        console.error('API loadUsers failed', err);
        showToast('Falha ao conectar ao servidor, usando localStorage');
      }
    }

    try {
      const raw = localStorage.getItem('USERS');
      const parsed = raw ? JSON.parse(raw) : [];
      setUsers(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      void e;
      setUsers([]);
    }
  }, [USE_API, showToast]);

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/admin-login');
      return;
    }
    loadUsers();

    // Verificar se veio do chat com seleção de usuário
    if (location.state?.section === 'support' && location.state?.selectUser) {
      setActiveSection('support');
      // Delay para garantir que AdminSupport monte antes de disparar o evento
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('selectSupportThread', {
            detail: { username: location.state.selectUser },
          })
        );
      }, 300);
      // Limpar state para evitar reprocessamento
      window.history.replaceState({}, document.title);
    }
  }, [navigate, loadUsers, location.state]);

  // Monitorar solicitações pendentes
  useEffect(() => {
    const updatePendingCounts = async () => {
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
          } else {
            const deposits = JSON.parse(
              localStorage.getItem('DEPOSIT_REQUESTS') || '[]'
            );
            pendingDep = deposits.filter(
              (d) => d.status === 'Pendiente'
            ).length;
          }
        } catch (e) {
          void e;
          const deposits = JSON.parse(
            localStorage.getItem('DEPOSIT_REQUESTS') || '[]'
          );
          pendingDep = deposits.filter((d) => d.status === 'Pendiente').length;
        }
        setPendingDeposits(pendingDep);

        // Retiradas pendentes
        let pendingWith = 0;
        try {
          const res = await fetch(`${serverUrl}/withdrawals`);
          if (res.ok) {
            const withdraws = await res.json();
            pendingWith = withdraws.filter(
              (w) => w.status === 'Pendiente'
            ).length;
          } else {
            const withdraws = JSON.parse(
              localStorage.getItem('WITHDRAW_REQUESTS') || '[]'
            );
            pendingWith = withdraws.filter(
              (w) => w.status === 'Pendiente'
            ).length;
          }
        } catch (e) {
          void e;
          const withdraws = JSON.parse(
            localStorage.getItem('WITHDRAW_REQUESTS') || '[]'
          );
          pendingWith = withdraws.filter(
            (w) => w.status === 'Pendiente'
          ).length;
        }
        setPendingWithdraws(pendingWith);

        // Mensagens não lidas do suporte
        let unhandledCount = 0;
        try {
          const res = await fetch(`${serverUrl}/messages`);
          if (res.ok) {
            const msgs = await res.json();
            unhandledCount = msgs.filter(
              (m) => m.from !== 'admin' && !m.handled
            ).length;
          } else {
            const adminMessages = JSON.parse(
              localStorage.getItem('ADMIN_MESSAGES') || '[]'
            );
            unhandledCount = adminMessages.filter(
              (m) => m.from !== 'admin' && !m.handled
            ).length;
          }
        } catch (e) {
          void e;
          const adminMessages = JSON.parse(
            localStorage.getItem('ADMIN_MESSAGES') || '[]'
          );
          unhandledCount = adminMessages.filter(
            (m) => m.from !== 'admin' && !m.handled
          ).length;
        }
        setUnreadMessages(unhandledCount);

        // Tocar sons de notificação (apenas após o primeiro carregamento)
        if (!isFirstLoadRef.current) {
          // Novo depósito pendente
          if (pendingDep > prevPendingDepositsRef.current) {
            playNotificationSound('deposit');
          }
          // Novo saque pendente
          else if (pendingWith > prevPendingWithdrawsRef.current) {
            playNotificationSound('withdraw');
          }
          // Nova mensagem de suporte (som apenas se não estiver na seção de suporte)
          // O som do chat já é tratado pelo WebSocket no useSocketMessages
        }

        // Atualizar refs
        prevPendingDepositsRef.current = pendingDep;
        prevPendingWithdrawsRef.current = pendingWith;
        prevUnreadMessagesRef.current = unhandledCount;
        isFirstLoadRef.current = false;
      } catch (error) {
        console.error('Erro ao atualizar contadores:', error);
      }
    };

    updatePendingCounts();
    const interval = setInterval(updatePendingCounts, 5000);
    return () => clearInterval(interval);
  }, []);

  // Conectar Socket.IO para admin
  useEffect(() => {
    ensureSocket().then((socketInstance) => {
      if (socketInstance) {
        setSocket(socketInstance);
        // Forçar conexão se não estiver conectado
        if (!socketInstance.connected) {
          socketInstance.connect();
        }
        console.log('Admin socket conectado');
      }
    });

    // NÃO desconectar no cleanup - o socket é compartilhado globalmente
    // e outros componentes (como Chat) podem estar usando
  }, []);

  async function saveUsers(list) {
    if (USE_API) {
      try {
        const serverUrl = getServerUrl();
        await fetch(`${serverUrl}/users/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(list),
        });
        setUsers(list);
        return;
      } catch (err) {
        console.error('API saveUsers failed', err);
        showToast('Fallo al guardar en el servidor, usando localStorage');
      }
    }

    localStorage.setItem('USERS', JSON.stringify(list));
    setUsers(list);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!username || !password) {
      showToast('Complete usuario y contraseña');
      return;
    }
    if (
      users.some((u) => u.username.toLowerCase() === username.toLowerCase())
    ) {
      showToast('Usuario ya existe');
      return;
    }

    if (USE_API) {
      try {
        const serverUrl = getServerUrl();
        const res = await fetch(`${serverUrl}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        if (!res.ok) throw new Error('failed');
        showToast('Usuario creado (servidor)');
        setUsername('');
        setPassword('');
        loadUsers();
        return;
      } catch (err) {
        console.error('API create failed', err);
        showToast('Fallo al crear en el servidor');
      }
    }

    const next = [...users, { username, password }];
    saveUsers(next);
    setUsername('');
    setPassword('');
    showToast('Usuario creado');
  }

  async function handleDelete(u) {
    if (!confirm(`¿Eliminar usuario ${u.username}?`)) return;

    if (USE_API) {
      try {
        const serverUrl = getServerUrl();
        const res = await fetch(
          `${serverUrl}/users/${encodeURIComponent(u.username)}`,
          { method: 'DELETE' }
        );
        if (!res.ok) throw new Error('failed');
        showToast('Usuario eliminado (servidor)');
        loadUsers();
        return;
      } catch (err) {
        console.error('API delete failed', err);
        showToast('Fallo al eliminar en el servidor');
      }
    }

    const next = users.filter((x) => x.username !== u.username);
    saveUsers(next);
    showToast('Usuario eliminado');
  }

  async function handleSaveEdit(u) {
    if (!editingPassword) {
      showToast('Ingrese una nueva contraseña');
      return;
    }

    if (USE_API) {
      try {
        const serverUrl = getServerUrl();
        const res = await fetch(
          `${serverUrl}/users/${encodeURIComponent(u.username)}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: editingPassword }),
          }
        );
        if (!res.ok) throw new Error('failed');
        showToast('Contraseña actualizada (servidor)');
        setEditing(null);
        setEditingPassword('');
        loadUsers();
        return;
      } catch (err) {
        console.error('API edit failed', err);
        showToast('Fallo al actualizar en el servidor');
      }
    }

    const next = users.map((x) =>
      x.username === u.username ? { ...x, password: editingPassword } : x
    );
    saveUsers(next);
    setEditing(null);
    setEditingPassword('');
    showToast('Contraseña actualizada');
  }

  // ============================================
  // BLOQUEIO DE CHAT - Impede envio de mensagens
  // ============================================
  async function handleToggleChatBlock(u) {
    const newBlocked = !u.chatBlocked;
    const action = newBlocked ? 'bloquear' : 'desbloquear';

    if (
      !confirm(
        `¿${newBlocked ? 'Bloquear' : 'Desbloquear'} chat del usuario ${
          u.username
        }?`
      )
    )
      return;

    try {
      const serverUrl = getServerUrl();
      const res = await fetch(
        `${serverUrl}/users/${encodeURIComponent(u.username)}/chat-block`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blocked: newBlocked }),
        }
      );
      if (!res.ok) throw new Error('failed');
      showToast(
        `Chat ${newBlocked ? 'bloqueado' : 'desbloqueado'} para ${u.username}`
      );
      loadUsers();
    } catch (err) {
      console.error('Chat block failed', err);
      showToast(`Fallo al ${action} chat`);
    }
  }

  // ============================================
  // BANIMENTO - Bloqueia acesso completo ao sistema
  // ============================================
  async function handleToggleBan(u) {
    const newBanned = !u.banned;
    const action = newBanned ? 'suspender' : 'reactivar';

    if (
      !confirm(
        `¿${newBanned ? 'Suspender' : 'Reactivar'} cuenta del usuario ${
          u.username
        }?`
      )
    )
      return;

    try {
      const serverUrl = getServerUrl();
      const res = await fetch(
        `${serverUrl}/users/${encodeURIComponent(u.username)}/ban`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ banned: newBanned }),
        }
      );
      if (!res.ok) throw new Error('failed');
      showToast(
        `Cuenta ${newBanned ? 'suspendida' : 'reactivada'}: ${u.username}`
      );
      loadUsers();
    } catch (err) {
      console.error('Ban failed', err);
      showToast(`Fallo al ${action} cuenta`);
    }
  }

  function toggleChat() {
    const newState = !chatEnabled;
    console.log(
      '🔄 Admin alterando estado do chat:',
      chatEnabled,
      '→',
      newState
    );
    setChatEnabled(newState);
    localStorage.setItem('chatEnabled', String(newState));
    showToast(newState ? 'Chat ativado' : 'Chat desativado');

    // Admin notifica todos os usuários sobre mudança de estado do chat
    if (socket) {
      console.log('📤 Emitindo chat:toggle-global com enabled:', newState);
      socket.emit('chat:toggle-global', { enabled: newState });
    } else {
      console.warn(
        '⚠️ Socket não está conectado - não foi possível emitir evento'
      );
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('adminUsername');
    navigate('/login');
  }

  function toggleSidebar() {
    setSidebarOpen((s) => !s);
  }

  function handleNavigateToSection(section) {
    setActiveSection(section);
  }

  return (
    <div className="ba-dashboard">
      <Topbar
        onToggleSidebar={toggleSidebar}
        onLogout={handleLogout}
        adminMode={true}
      />

      <main className="ba-main">
        <div className="ba-layout">
          {/* Overlay escuro quando sidebar está aberto no mobile */}
          {sidebarOpen && (
            <div
              className="ba-sidebar-overlay"
              onClick={toggleSidebar}
              aria-label="Cerrar menú lateral"
            />
          )}

          <aside className={`ba-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
            <AdminSidebar
              isOpen={sidebarOpen}
              onNavigateToSection={handleNavigateToSection}
              onToast={showToast}
              onToggleSidebar={toggleSidebar}
              onToggleChat={toggleChat}
              chatEnabled={chatEnabled}
              pendingDeposits={pendingDeposits}
              pendingWithdraws={pendingWithdraws}
              unreadMessages={unreadMessages}
            />
          </aside>

          <div className="ba-content" style={{ padding: '2rem' }}>
            {activeSection === 'create' && (
              <>
                <section
                  className="ba-admin-form"
                  style={{
                    borderLeft: '4px solid #3b82f6',
                    paddingLeft: '1.5rem',
                    marginBottom: '2rem',
                  }}
                >
                  <h3>Crear nuevo usuario</h3>
                  <form onSubmit={handleCreate} className="ba-user-create-form">
                    <div className="ba-form-inline">
                      <div className="ba-form-field">
                        <label className="ba-form-label">Usuario</label>
                        <input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="ba-form-input"
                          placeholder="Nombre de usuario"
                        />
                      </div>
                      <div className="ba-form-field">
                        <label className="ba-form-label">Contraseña</label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="ba-form-input"
                          placeholder="Mínimo 6 caracteres"
                        />
                      </div>
                      <button type="submit" className="ba-form-submit">
                        Crear
                      </button>
                    </div>
                  </form>
                </section>

                <section
                  className="ba-admin-list"
                  style={{
                    borderLeft: '4px solid #3b82f6',
                    paddingLeft: '1.5rem',
                  }}
                >
                  <h3>Usuarios existentes</h3>

                  {/* Campo de busca */}
                  <div className="ba-search-container">
                    <input
                      type="text"
                      placeholder="🔍 Buscar usuario..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="ba-search-input"
                    />
                    {searchTerm && (
                      <button
                        className="ba-search-clear"
                        onClick={() => setSearchTerm('')}
                        title="Limpiar búsqueda"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="ba-users-grid">
                    {users
                      .filter((u) =>
                        u.username
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      )
                      .map((u) => (
                        <div key={u.username} className="ba-user-card">
                          <div className="ba-user-info">
                            <span className="ba-user-name">{u.username}</span>
                          </div>
                          <div className="ba-user-actions-row">
                            {editing === u.username ? (
                              <>
                                <input
                                  placeholder="Nueva contraseña"
                                  value={editingPassword}
                                  onChange={(e) =>
                                    setEditingPassword(e.target.value)
                                  }
                                  className="ba-edit-input"
                                />
                                <button
                                  onClick={() => handleSaveEdit(u)}
                                  className="ba-btn-save"
                                >
                                  Guardar
                                </button>
                                <button
                                  onClick={() => {
                                    setEditing(null);
                                    setEditingPassword('');
                                  }}
                                  className="ba-btn-cancel"
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditing(u.username);
                                    setEditingPassword('');
                                  }}
                                  className="ba-btn-edit"
                                >
                                  Editar contraseña
                                </button>
                                <button
                                  onClick={() => handleToggleChatBlock(u)}
                                  className={`ba-btn-chat-block ${
                                    u.chatBlocked ? 'blocked' : ''
                                  }`}
                                  title={
                                    u.chatBlocked
                                      ? 'Desbloquear chat'
                                      : 'Bloquear chat'
                                  }
                                >
                                  {u.chatBlocked ? '🔊 Chat' : '🔇 Chat'}
                                </button>
                                <button
                                  onClick={() => handleToggleBan(u)}
                                  className={`ba-btn-ban ${
                                    u.banned ? 'banned' : ''
                                  }`}
                                  title={
                                    u.banned
                                      ? 'Reactivar cuenta'
                                      : 'Suspender cuenta'
                                  }
                                >
                                  {u.banned ? '✅ Activo' : '🚫 Suspender'}
                                </button>
                                <button
                                  onClick={() => handleDelete(u)}
                                  className="ba-btn-delete"
                                >
                                  Eliminar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              </>
            )}

            {activeSection === 'support' && (
              <section
                style={{
                  width: '100%',
                  maxWidth: '1200px',
                }}
              >
                <h3>Área de apoyo</h3>
                <AdminSupport />
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {toast && (
        <div className="ba-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

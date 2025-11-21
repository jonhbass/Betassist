import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';
import '../css/admin.css';
import AdminSupport from '../components/AdminSupport';
import AdminSidebar from '../components/AdminSidebar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState('');
  const [editing, setEditing] = useState(null);
  const [editingPassword, setEditingPassword] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('create');
  const [pendingDeposits, setPendingDeposits] = useState(0);
  const [pendingWithdraws, setPendingWithdraws] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const USE_API = import.meta.env.VITE_USE_API === 'true';

  const showToast = useCallback((msg, ms = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(''), ms);
  }, []);

  const loadUsers = useCallback(async () => {
    if (USE_API) {
      try {
        const res = await fetch('http://localhost:4000/users');
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
  }, [navigate, loadUsers]);

  // Monitorar solicitações pendentes
  useEffect(() => {
    const updatePendingCounts = () => {
      try {
        // Depósitos pendentes - contar TODAS as pendentes
        const deposits = JSON.parse(
          localStorage.getItem('DEPOSIT_REQUESTS') || '[]'
        );
        const pendingDep = deposits.filter(
          (d) => d.status === 'Pendiente'
        ).length;
        console.log(
          '📊 Depósitos pendentes:',
          pendingDep,
          'Total:',
          deposits.length
        );
        setPendingDeposits(pendingDep);

        // Retiradas pendentes - contar TODAS as pendentes
        const withdraws = JSON.parse(
          localStorage.getItem('WITHDRAW_REQUESTS') || '[]'
        );
        const pendingWith = withdraws.filter(
          (w) => w.status === 'Pendiente'
        ).length;
        console.log(
          '📊 Retiradas pendentes:',
          pendingWith,
          'Total:',
          withdraws.length
        );
        setPendingWithdraws(pendingWith);

        // Mensagens não lidas do suporte
        const adminMessages = JSON.parse(
          localStorage.getItem('ADMIN_MESSAGES') || '[]'
        );
        // Contar mensagens de usuários que ainda não foram handled
        const unhandledCount = adminMessages.filter(
          (m) => m.from !== 'admin' && !m.handled
        ).length;
        setUnreadMessages(unhandledCount);
        console.log(
          '📊 Estado badges - Dep:',
          pendingDep,
          'Ret:',
          pendingWith,
          'Msg:',
          unhandledCount
        );
      } catch (err) {
        console.error('Erro ao contar pendentes:', err);
      }
    };

    updatePendingCounts();
    const interval = setInterval(updatePendingCounts, 3000);
    return () => clearInterval(interval);
  }, []);

  async function saveUsers(list) {
    if (USE_API) {
      try {
        await fetch('http://localhost:4000/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(list),
        });
        setUsers(list);
        return;
      } catch (err) {
        console.error('API saveUsers failed', err);
        showToast('Falha ao salvar no servidor, usando localStorage');
      }
    }

    localStorage.setItem('USERS', JSON.stringify(list));
    setUsers(list);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!username || !password) {
      showToast('Preencha usuário e senha');
      return;
    }
    if (users.some((u) => u.username === username)) {
      showToast('Usuário já existe');
      return;
    }

    if (USE_API) {
      try {
        const res = await fetch('http://localhost:4000/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        if (!res.ok) throw new Error('failed');
        showToast('Usuário criado (servidor)');
        setUsername('');
        setPassword('');
        loadUsers();
        return;
      } catch (err) {
        console.error('API create failed', err);
        showToast('Falha ao criar no servidor');
      }
    }

    const next = [...users, { username, password }];
    saveUsers(next);
    setUsername('');
    setPassword('');
    showToast('Usuário criado');
  }

  async function handleDelete(u) {
    if (!confirm(`Remover usuário ${u.username}?`)) return;

    if (USE_API) {
      try {
        const res = await fetch(
          `http://localhost:4000/users/${encodeURIComponent(u.username)}`,
          { method: 'DELETE' }
        );
        if (!res.ok) throw new Error('failed');
        showToast('Usuário removido (servidor)');
        loadUsers();
        return;
      } catch (err) {
        console.error('API delete failed', err);
        showToast('Falha ao remover no servidor');
      }
    }

    const next = users.filter((x) => x.username !== u.username);
    saveUsers(next);
    showToast('Usuário removido');
  }

  async function handleSaveEdit(u) {
    if (!editingPassword) {
      showToast('Digite uma nova senha');
      return;
    }

    if (USE_API) {
      try {
        const res = await fetch(
          `http://localhost:4000/users/${encodeURIComponent(u.username)}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: editingPassword }),
          }
        );
        if (!res.ok) throw new Error('failed');
        showToast('Senha atualizada (servidor)');
        setEditing(null);
        setEditingPassword('');
        loadUsers();
        return;
      } catch (err) {
        console.error('API edit failed', err);
        showToast('Falha ao atualizar no servidor');
      }
    }

    const next = users.map((x) =>
      x.username === u.username ? { ...x, password: editingPassword } : x
    );
    saveUsers(next);
    setEditing(null);
    setEditingPassword('');
    showToast('Senha atualizada');
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

  const handleDepositRequests = () => {
    navigate('/admin/deposit-requests');
  };

  const handleWithdrawRequests = () => {
    navigate('/admin/withdraw-requests');
  };

  const handleSupport = () => {
    setActiveSection('support');
  };

  return (
    <div className="ba-dashboard">
      <Topbar
        onToggleSidebar={toggleSidebar}
        onLogout={handleLogout}
        adminMode={true}
      />

      <main className="ba-main">
        <div className="ba-layout">
          <aside className={`ba-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
            <AdminSidebar
              isOpen={sidebarOpen}
              onNavigateToSection={handleNavigateToSection}
              onToast={showToast}
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
                  <h3>Criar novo usuário</h3>
                  <form onSubmit={handleCreate} className="ba-user-create-form">
                    <div className="ba-form-inline">
                      <label className="ba-form-label">Usuário</label>
                      <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="ba-form-input"
                      />
                      <label className="ba-form-label">Senha</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="ba-form-input"
                      />
                      <button type="submit" className="ba-form-submit">
                        Criar
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
                  <h3>Usuários existentes</h3>
                  <div className="ba-users-grid">
                    {users.map((u) => (
                      <div key={u.username} className="ba-user-card">
                        <div className="ba-user-info">
                          <span className="ba-user-name">{u.username}</span>
                        </div>
                        <div className="ba-user-actions-row">
                          {editing === u.username ? (
                            <>
                              <input
                                placeholder="Nova senha"
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
                                Salvar
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
                                Editar senha
                              </button>
                              <button
                                onClick={() => handleDelete(u)}
                                className="ba-btn-delete"
                              >
                                Remover
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
                  borderLeft: '4px solid #3b82f6',
                  paddingLeft: '1.5rem',
                }}
              >
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

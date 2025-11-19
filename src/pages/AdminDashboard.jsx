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

  return (
    <div className="ba-dashboard">
      <Topbar
        onToggleSidebar={toggleSidebar}
        onLogout={handleLogout}
        onMessageClick={() => showToast('Mensagens admin (simulado)')}
        onNotifyClick={() => showToast('Notificações admin (simulado)')}
      />

      <main className="ba-main">
        <div className="ba-layout">
          <aside className={`ba-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
            <AdminSidebar
              isOpen={sidebarOpen}
              onNavigateToSection={handleNavigateToSection}
              onToast={showToast}
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
                  <form onSubmit={handleCreate}>
                    <label>
                      Usuário
                      <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </label>
                    <label>
                      Senha
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </label>
                    <button type="submit">Criar</button>
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
                  <ul>
                    {users.map((u) => (
                      <li key={u.username}>
                        <div
                          style={{
                            display: 'flex',
                            gap: 12,
                            alignItems: 'center',
                          }}
                        >
                          <strong>{u.username}</strong>
                          {editing === u.username ? (
                            <>
                              <input
                                placeholder="Nova senha"
                                value={editingPassword}
                                onChange={(e) =>
                                  setEditingPassword(e.target.value)
                                }
                              />
                              <button onClick={() => handleSaveEdit(u)}>
                                Salvar
                              </button>
                              <button
                                onClick={() => {
                                  setEditing(null);
                                  setEditingPassword('');
                                }}
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
                              >
                                Editar senha
                              </button>
                              <button onClick={() => handleDelete(u)}>
                                Remover
                              </button>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
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

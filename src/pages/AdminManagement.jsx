import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import AdminSidebar from '../components/AdminSidebar';
import Toast from '../components/Toast';
import { removeAuthUser } from '../utils/auth';
import '../css/admin.css';

export default function AdminManagement() {
  const navigate = useNavigate();

  // Admin padrão do sistema (não pode ser excluído)
  const DEFAULT_ADMIN = {
    id: 'default-admin',
    username: 'admin',
    password: 'admin123',
    isDefault: true,
    createdAt: new Date().toISOString(),
  };

  const [admins, setAdmins] = useState(() => {
    try {
      const stored = localStorage.getItem('ADMINS');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Adiciona admin padrão à lista para exibição
  const allAdmins = [DEFAULT_ADMIN, ...admins];
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [toast, setToast] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Verifica se é admin
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function toggleSidebar() {
    setSidebarOpen((prev) => !prev);
  }

  function handleLogout() {
    removeAuthUser();
    navigate('/admin-login', { replace: true });
  }

  function handleCreateAdmin(e) {
    e.preventDefault();

    if (!newAdminUsername.trim() || !newAdminPassword.trim()) {
      showToast('❌ Preencha todos os campos');
      return;
    }

    if (newAdminPassword.length < 6) {
      showToast('❌ A senha deve ter no mínimo 6 caracteres');
      return;
    }

    // Verifica se o username já existe
    if (admins.some((admin) => admin.username === newAdminUsername.trim())) {
      showToast('❌ Este nome de administrador já existe');
      return;
    }

    const newAdmin = {
      id: Date.now(),
      username: newAdminUsername.trim(),
      password: newAdminPassword,
      createdAt: new Date().toISOString(),
    };

    const updatedAdmins = [...admins, newAdmin];
    setAdmins(updatedAdmins);
    localStorage.setItem('ADMINS', JSON.stringify(updatedAdmins));

    setNewAdminUsername('');
    setNewAdminPassword('');
    showToast('✅ Administrador criado com sucesso');
  }

  function handleDeleteAdmin(adminId) {
    // Prevenir exclusão do admin padrão
    if (adminId === 'default-admin') {
      showToast('❌ O administrador padrão não pode ser excluído');
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este administrador?')) return;

    const updatedAdmins = admins.filter((admin) => admin.id !== adminId);
    setAdmins(updatedAdmins);
    localStorage.setItem('ADMINS', JSON.stringify(updatedAdmins));
    showToast('✅ Administrador excluído');
  }

  function formatDate(isoString) {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Data inválida';
    }
  }

  return (
    <div className="ba-dashboard">
      {toast && <Toast message={toast} />}

      <Topbar
        onToggleSidebar={toggleSidebar}
        onLogout={handleLogout}
        simpleMode={true}
      />

      <main className="ba-main">
        <div className="ba-layout">
          <aside className={`ba-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
            <AdminSidebar
              isOpen={sidebarOpen}
              onNavigateToSection={(section) => navigate('/admin')}
              onToast={showToast}
            />
          </aside>

          <div className="ba-content">
            <div className="ba-admin-container">
              <h1 className="ba-admin-title">Gerenciar Administradores</h1>

              {/* Formulário para criar novo admin */}
              <div className="ba-admin-section">
                <h2 className="ba-section-title">Criar Novo Administrador</h2>
                <form className="ba-admin-form" onSubmit={handleCreateAdmin}>
                  <div className="ba-form-row">
                    <div className="ba-form-group">
                      <label htmlFor="admin-username">Nome de usuário</label>
                      <input
                        id="admin-username"
                        type="text"
                        value={newAdminUsername}
                        onChange={(e) => setNewAdminUsername(e.target.value)}
                        placeholder="Digite o nome de usuário"
                        autoComplete="off"
                      />
                    </div>
                    <div className="ba-form-group">
                      <label htmlFor="admin-password">Senha</label>
                      <input
                        id="admin-password"
                        type="password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <button type="submit" className="ba-btn primary">
                    ➕ Criar Administrador
                  </button>
                </form>
              </div>

              {/* Lista de administradores */}
              <div className="ba-admin-section">
                <h2 className="ba-section-title">
                  Administradores Cadastrados ({allAdmins.length})
                </h2>

                <div className="ba-table-wrapper">
                  <table className="ba-table">
                    <thead>
                      <tr>
                        <th>Nome de Usuário</th>
                        <th>Senha</th>
                        <th>Criado em</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allAdmins.map((admin) => (
                        <tr key={admin.id}>
                          <td>
                            <strong>{admin.username}</strong>
                            {admin.isDefault && (
                              <span
                                style={{
                                  marginLeft: '8px',
                                  padding: '2px 8px',
                                  backgroundColor: '#ffc107',
                                  color: '#000',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                }}
                              >
                                PADRÃO
                              </span>
                            )}
                          </td>
                          <td>
                            <code>{'•'.repeat(admin.password.length)}</code>
                          </td>
                          <td>
                            {admin.isDefault
                              ? '—'
                              : formatDate(admin.createdAt)}
                          </td>
                          <td>
                            {admin.isDefault ? (
                              <span style={{ color: '#999', fontSize: '13px' }}>
                                🔒 Protegido
                              </span>
                            ) : (
                              <button
                                className="ba-btn small danger"
                                onClick={() => handleDeleteAdmin(admin.id)}
                                title="Excluir administrador"
                              >
                                🗑️ Excluir
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="ba-info-box">
                <h3>ℹ️ Informações Importantes</h3>
                <ul>
                  <li>
                    Os administradores criados aqui poderão fazer login via{' '}
                    <strong>/admin-login</strong>
                  </li>
                  <li>
                    Cada administrador terá acesso total ao painel
                    administrativo
                  </li>
                  <li>
                    Recomenda-se criar senhas fortes (mínimo 6 caracteres)
                  </li>
                  <li>Guarde as credenciais em local seguro</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

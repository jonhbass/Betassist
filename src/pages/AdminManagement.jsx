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
      showToast('❌ Complete todos los campos');
      return;
    }

    if (newAdminPassword.length < 6) {
      showToast('❌ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Verifica se o username já existe
    if (admins.some((admin) => admin.username === newAdminUsername.trim())) {
      showToast('❌ Este nombre de administrador ya existe');
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
    showToast('✅ Administrador creado con éxito');
  }

  function handleDeleteAdmin(adminId) {
    // Prevenir exclusão do admin padrão
    if (adminId === 'default-admin') {
      showToast('❌ El administrador predeterminado no puede ser eliminado');
      return;
    }

    if (!confirm('¿Está seguro de que desea eliminar este administrador?'))
      return;

    const updatedAdmins = admins.filter((admin) => admin.id !== adminId);
    setAdmins(updatedAdmins);
    localStorage.setItem('ADMINS', JSON.stringify(updatedAdmins));
    showToast('✅ Administrador eliminado');
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
        adminMode={true}
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
              <h1 className="ba-admin-title">Gestionar Administradores</h1>

              {/* Formulário para criar novo admin */}
              <div className="ba-admin-section">
                <h2 className="ba-section-title">Crear nuevo usuario</h2>
                <form
                  className="ba-create-user-form"
                  onSubmit={handleCreateAdmin}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <label
                      style={{
                        color: '#fff',
                        fontWeight: 500,
                        fontSize: '14px',
                      }}
                    >
                      Usuário
                    </label>
                    <input
                      id="admin-username"
                      type="text"
                      value={newAdminUsername}
                      onChange={(e) => setNewAdminUsername(e.target.value)}
                      autoComplete="off"
                      style={{
                        width: '200px',
                        padding: '8px 12px',
                        background: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        color: '#000',
                        fontSize: '14px',
                      }}
                    />
                    <label
                      style={{
                        color: '#fff',
                        fontWeight: 500,
                        fontSize: '14px',
                      }}
                    >
                      Senha
                    </label>
                    <input
                      id="admin-password"
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      autoComplete="new-password"
                      style={{
                        width: '200px',
                        padding: '8px 12px',
                        background: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        color: '#000',
                        fontSize: '14px',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '8px 24px',
                        background: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        color: '#000',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Criar
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista de administradores */}
              <div className="ba-admin-section">
                <h2 className="ba-section-title">Usuarios existentes</h2>

                <div className="ba-users-list">
                  {allAdmins.map((admin) => (
                    <div key={admin.id} className="ba-user-item">
                      <span className="ba-username">
                        {admin.username}
                        {admin.isDefault && (
                          <span className="ba-default-badge">
                            PREDETERMINADO
                          </span>
                        )}
                      </span>
                      <div className="ba-user-actions">
                        <button className="ba-btn-user-action">
                          Editar contraseña
                        </button>
                        {!admin.isDefault && (
                          <button
                            className="ba-btn-user-action ba-btn-remove"
                            onClick={() => handleDeleteAdmin(admin.id)}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ba-info-box">
                <h3>ℹ️ Información Importante</h3>
                <ul>
                  <li>
                    Los administradores creados aquí podrán iniciar sesión vía{' '}
                    <strong>/admin-login</strong>
                  </li>
                  <li>
                    Cada administrador tendrá acceso total al panel
                    administrativo
                  </li>
                  <li>
                    Se recomienda crear contraseñas fuertes (mínimo 6
                    caracteres)
                  </li>
                  <li>Guarde las credenciales en un lugar seguro</li>
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

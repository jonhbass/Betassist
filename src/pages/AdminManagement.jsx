import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import AdminSidebar from '../components/AdminSidebar';
import Toast from '../components/Toast';
import { removeAuthUser } from '../utils/auth';
import { getServerUrl } from '../utils/serverUrl';
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

  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const serverUrl = getServerUrl();
        const res = await fetch(`${serverUrl}/admins`);
        if (res.ok) {
          const data = await res.json();
          setAdmins(Array.isArray(data) ? data : []);
        } else {
          // Fallback
          const stored = localStorage.getItem('ADMINS');
          setAdmins(stored ? JSON.parse(stored) : []);
        }
      } catch (err) {
        console.error('Failed to load admins', err);
        const stored = localStorage.getItem('ADMINS');
        setAdmins(stored ? JSON.parse(stored) : []);
      }
    };
    loadAdmins();
  }, []);

  // Adiciona admin padrão à lista para exibição
  const allAdmins = [DEFAULT_ADMIN, ...admins];
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [toast, setToast] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [editingPassword, setEditingPassword] = useState('');

  useEffect(() => {
    // Colapsar sidebar no mobile por padrão
    if (window.innerWidth && window.innerWidth < 900) setSidebarOpen(false);
  }, []);

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

  async function handleCreateAdmin(e) {
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
    if (
      admins.some(
        (admin) =>
          admin.username.toLowerCase() === newAdminUsername.trim().toLowerCase()
      )
    ) {
      showToast('❌ Este nombre de administrador ya existe');
      return;
    }

    const newAdmin = {
      id: Date.now(),
      username: newAdminUsername.trim(),
      password: newAdminPassword,
      createdAt: new Date().toISOString(),
    };

    // Persist to server
    const serverUrl = getServerUrl();
    try {
      const res = await fetch(`${serverUrl}/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin),
      });
      if (!res.ok) throw new Error('Failed to create admin');
    } catch (err) {
      console.error('Failed to create admin on server', err);
    }

    const updatedAdmins = [...admins, newAdmin];
    setAdmins(updatedAdmins);
    localStorage.setItem('ADMINS', JSON.stringify(updatedAdmins));

    setNewAdminUsername('');
    setNewAdminPassword('');
    showToast('✅ Administrador creado con éxito');
  }

  async function handleDeleteAdmin(adminId) {
    // Prevenir exclusão do admin padrão
    if (adminId === 'default-admin') {
      showToast('❌ El administrador predeterminado no puede ser eliminado');
      return;
    }

    if (!confirm('¿Está seguro de que desea eliminar este administrador?'))
      return;

    // Delete from server
    const serverUrl = getServerUrl();
    try {
      await fetch(`${serverUrl}/admins/${adminId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete admin on server', err);
    }

    const updatedAdmins = admins.filter((admin) => admin.id !== adminId);
    setAdmins(updatedAdmins);
    localStorage.setItem('ADMINS', JSON.stringify(updatedAdmins));
    showToast('✅ Administrador eliminado');
  }

  function handleEditPassword(adminId) {
    setEditingAdminId(adminId);
    setEditingPassword('');
  }

  async function handleSavePassword(admin) {
    if (!editingPassword.trim()) {
      showToast('❌ Ingrese una nueva contraseña');
      return;
    }

    if (editingPassword.length < 6) {
      showToast('❌ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Atualizar senha do admin padrão (apenas em memória)
    if (admin.isDefault) {
      showToast(
        '⚠️ La contraseña del admin predeterminado no se puede cambiar permanentemente'
      );
      setEditingAdminId(null);
      setEditingPassword('');
      return;
    }

    // Update on server
    const serverUrl = getServerUrl();
    try {
      await fetch(`${serverUrl}/admins/${admin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: editingPassword }),
      });
    } catch (err) {
      console.error('Failed to update admin password on server', err);
    }

    // Atualizar senha do admin customizado
    const updatedAdmins = admins.map((a) =>
      a.id === admin.id ? { ...a, password: editingPassword } : a
    );
    setAdmins(updatedAdmins);
    localStorage.setItem('ADMINS', JSON.stringify(updatedAdmins));

    setEditingAdminId(null);
    setEditingPassword('');
    showToast('✅ Contraseña actualizada con éxito');
  }

  function handleCancelEdit() {
    setEditingAdminId(null);
    setEditingPassword('');
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
              onNavigateToSection={() => navigate('/admin')}
              onToast={showToast}
              onToggleSidebar={toggleSidebar}
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
                  <div className="ba-form-inline">
                    <div className="ba-form-field">
                      <label className="ba-form-label">Usuario</label>
                      <input
                        id="admin-username"
                        type="text"
                        value={newAdminUsername}
                        onChange={(e) => setNewAdminUsername(e.target.value)}
                        autoComplete="off"
                        className="ba-form-input"
                        placeholder="Nombre de usuario"
                      />
                    </div>
                    <div className="ba-form-field">
                      <label className="ba-form-label">Contraseña</label>
                      <input
                        id="admin-password"
                        type="password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        autoComplete="new-password"
                        className="ba-form-input"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                    <button type="submit" className="ba-form-submit">
                      Crear
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
                        {editingAdminId === admin.id ? (
                          <>
                            <input
                              type="password"
                              placeholder="Nueva contraseña"
                              value={editingPassword}
                              onChange={(e) =>
                                setEditingPassword(e.target.value)
                              }
                              className="ba-edit-password-input"
                              style={{
                                padding: '8px 12px',
                                borderRadius: '4px',
                                border: '1px solid #444',
                                background: '#1a1a2e',
                                color: '#fff',
                                marginRight: '8px',
                              }}
                            />
                            <button
                              className="ba-btn-user-action"
                              onClick={() => handleSavePassword(admin)}
                              style={{
                                background: '#28a745',
                                marginRight: '8px',
                              }}
                            >
                              Guardar
                            </button>
                            <button
                              className="ba-btn-user-action"
                              onClick={handleCancelEdit}
                              style={{ background: '#6c757d' }}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="ba-btn-user-action"
                              onClick={() => handleEditPassword(admin.id)}
                            >
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
                          </>
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

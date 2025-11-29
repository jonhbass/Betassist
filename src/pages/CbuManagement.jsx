import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import AdminSidebar from '../components/AdminSidebar';
import Toast from '../components/Toast';
import { removeAuthUser } from '../utils/auth';
import { getServerUrl } from '../utils/serverUrl';
import '../css/admin.css';

export default function CbuManagement() {
  const navigate = useNavigate();
  const [cbu, setCbu] = useState('');
  const [toast, setToast] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Colapsar sidebar no mobile por padrão
    if (window.innerWidth && window.innerWidth < 900) setSidebarOpen(false);
  }, []);

  useEffect(() => {
    // Verificar se é admin
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/admin-login');
      return;
    }

    // Carregar CBU do servidor
    const loadCbu = async () => {
      try {
        const serverUrl = getServerUrl();
        const res = await fetch(`${serverUrl}/config`);
        if (res.ok) {
          const data = await res.json();
          if (data.cbu) {
            setCbu(data.cbu);
            return;
          }
        }
        // Fallback
        const storedCbu = localStorage.getItem('DEPOSIT_CBU');
        setCbu(storedCbu || '');
      } catch (err) {
        console.error('Failed to load CBU', err);
        const storedCbu = localStorage.getItem('DEPOSIT_CBU');
        setCbu(storedCbu || '');
      }
    };
    loadCbu();
  }, [navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    removeAuthUser();
    navigate('/admin-login');
  };

  const showToast = (message) => {
    setToast(message);
  };

  const handleSaveCbu = async (e) => {
    e.preventDefault();

    // Validações
    const cleanCbu = cbu.trim().replace(/\s/g, '');

    if (!cleanCbu) {
      showToast('❌ El CBU/Alias no puede estar vacío');
      return;
    }

    if (!/^[a-zA-Z0-9.]+$/.test(cleanCbu)) {
      showToast('❌ El CBU/Alias solo puede contener letras, números y puntos');
      return;
    }

    // Salvar no servidor
    const serverUrl = getServerUrl();
    try {
      await fetch(`${serverUrl}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cbu: cleanCbu }),
      });
    } catch (err) {
      console.error('Failed to save CBU on server', err);
    }

    // Salvar no localStorage
    localStorage.setItem('DEPOSIT_CBU', cleanCbu);
    setCbu(cleanCbu);
    showToast('✅ CBU/Alias actualizado con éxito!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cbu);
    showToast('📋 CBU copiado para a área de transferência');
  };

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
              aria-label="Fechar menu lateral"
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
              <h1 className="ba-admin-title">Gestionar CBU para Depósitos</h1>
              {/* Formulario de edición */}
              <div className="ba-admin-section">
                <h2 className="ba-section-title">Configurar CBU/Alias</h2>

                <form onSubmit={handleSaveCbu} className="ba-admin-form">
                  <div className="ba-form-group">
                    <label htmlFor="cbu-input">CBU o Alias *</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        id="cbu-input"
                        type="text"
                        value={cbu}
                        onChange={(e) => setCbu(e.target.value)}
                        placeholder="Ingrese CBU o Alias"
                        style={{
                          flex: 1,
                          fontFamily: 'monospace',
                          fontSize: '16px',
                        }}
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        className="ba-btn secondary"
                        onClick={handleCopy}
                        title="Copiar CBU/Alias"
                      >
                        📋
                      </button>
                    </div>
                    <small
                      style={{
                        display: 'block',
                        marginTop: '8px',
                        color: '#999',
                      }}
                    >
                      {cbu.length} caracteres ingresados
                    </small>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      justifyContent: 'center',
                    }}
                  >
                    <button type="submit" className="ba-btn primary">
                      💾 Guardar CBU/Alias
                    </button>
                  </div>
                </form>
              </div>

              {/* Preview */}
              <div className="ba-admin-section">
                <h2 className="ba-section-title">Vista previa</h2>
                <p style={{ marginBottom: '15px', color: '#ccc' }}>
                  Así se mostrará en la página de carga:
                </p>

                <div className="ba-cbu-preview-box">
                  <div className="ba-cbu-important-label">¡IMPORTANTE!</div>
                  <p style={{ marginBottom: '15px' }}>
                    Para realizar la carga de fichas debes realizar una
                    transferencia al siguiente CBU:
                  </p>
                  <div className="ba-cbu-number-box">
                    <span className="ba-cbu-icon">📄</span>
                    <span className="ba-cbu-number">
                      {cbu || 'CBU no configurado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informações */}
              <div className="ba-info-box">
                <h3>ℹ️ Información Importante</h3>
                <ul>
                  <li>
                    El número configurado se mostrará a todos los usuarios en la
                    página de carga de fichas
                  </li>
                  <li>Puede configurar cualquier número de cuenta que desee</li>
                  <li>
                    Siempre verifique el número antes de guardar para evitar
                    errores
                  </li>
                  <li>El número debe contener solo dígitos numéricos</li>
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

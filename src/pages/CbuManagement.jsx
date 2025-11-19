import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import AdminSidebar from '../components/AdminSidebar';
import Toast from '../components/Toast';
import { removeAuthUser } from '../utils/auth';
import '../css/admin.css';

const DEFAULT_CBU = '0000133100000000537023';

export default function CbuManagement() {
  const navigate = useNavigate();
  const [cbu, setCbu] = useState('');
  const [toast, setToast] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Verificar se é admin
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/admin-login');
      return;
    }

    // Carregar CBU do localStorage ou usar padrão
    const storedCbu = localStorage.getItem('DEPOSIT_CBU');
    setCbu(storedCbu || DEFAULT_CBU);
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

  const handleSaveCbu = (e) => {
    e.preventDefault();

    // Validações
    const cleanCbu = cbu.trim().replace(/\s/g, '');

    if (!cleanCbu) {
      showToast('❌ O CBU não pode estar vazio');
      return;
    }

    if (!/^\d+$/.test(cleanCbu)) {
      showToast('❌ O CBU deve conter apenas números');
      return;
    }

    if (cleanCbu.length !== 22) {
      showToast('⚠️ CBU padrão tem 22 dígitos, verifique se está correto');
    }

    // Salvar no localStorage
    localStorage.setItem('DEPOSIT_CBU', cleanCbu);
    setCbu(cleanCbu);
    showToast('✅ CBU atualizado com sucesso!');
  };

  const handleReset = () => {
    if (window.confirm('Deseja restaurar o CBU padrão?')) {
      localStorage.setItem('DEPOSIT_CBU', DEFAULT_CBU);
      setCbu(DEFAULT_CBU);
      showToast('🔄 CBU restaurado para o valor padrão');
    }
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
              <h1 className="ba-admin-title">Gerenciar CBU para Depósitos</h1>
              {/* Formulário de edição */}
              <div className="ba-admin-section">
                <h2 className="ba-section-title">Configurar CBU</h2>

                <form onSubmit={handleSaveCbu} className="ba-admin-form">
                  <div className="ba-form-group">
                    <label htmlFor="cbu-input">
                      Número CBU *
                      <span
                        style={{
                          fontSize: '13px',
                          color: '#999',
                          marginLeft: '8px',
                        }}
                      >
                        (22 dígitos)
                      </span>
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        id="cbu-input"
                        type="text"
                        value={cbu}
                        onChange={(e) => setCbu(e.target.value)}
                        placeholder="Digite o CBU (apenas números)"
                        maxLength="22"
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
                        title="Copiar CBU"
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
                      {cbu.length} caracteres digitados
                      {cbu.length === 22 && ' ✓'}
                    </small>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="ba-btn primary">
                      💾 Salvar CBU
                    </button>
                    <button
                      type="button"
                      className="ba-btn secondary"
                      onClick={handleReset}
                    >
                      🔄 Restaurar Padrão
                    </button>
                  </div>
                </form>
              </div>

              {/* Preview */}
              <div className="ba-admin-section">
                <h2 className="ba-section-title">Preview</h2>
                <p style={{ marginBottom: '15px', color: '#ccc' }}>
                  Assim será exibido na página de carga:
                </p>

                <div
                  style={{
                    background: '#1a2332',
                    border: '2px solid #ffc107',
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      color: '#ffc107',
                      fontWeight: 'bold',
                      marginBottom: '10px',
                    }}
                  >
                    ¡IMPORTANTE!
                  </div>
                  <p style={{ marginBottom: '15px' }}>
                    Para realizar la carga de fichas debes realizar una
                    transferencia al siguiente CBU:
                  </p>
                  <div
                    style={{
                      background: '#0f1621',
                      border: '1px solid #ffc107',
                      borderRadius: '5px',
                      padding: '12px',
                      fontFamily: 'monospace',
                      fontSize: '18px',
                      color: '#fff',
                      letterSpacing: '1px',
                    }}
                  >
                    📄 {cbu || 'CBU não configurado'}
                  </div>
                </div>
              </div>

              {/* Informações */}
              <div className="ba-info-box">
                <h3>ℹ️ Informações Importantes</h3>
                <ul>
                  <li>
                    O CBU configurado será exibido para todos os usuários na
                    página de carga de fichas
                  </li>
                  <li>CBU padrão argentino possui 22 dígitos numéricos</li>
                  <li>
                    Sempre verifique o número antes de salvar para evitar erros
                  </li>
                  <li>
                    Use "Restaurar Padrão" para voltar ao CBU original:{' '}
                    {DEFAULT_CBU}
                  </li>
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

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/sidebar.css';

export default function AdminSidebar({
  isOpen = true,
  onNavigateToSection = () => {},
  onToast = () => {},
  pendingDeposits = 0,
  pendingWithdraws = 0,
  unreadMessages = 0,
}) {
  const navigate = useNavigate();

  // Debug - verificar props
  console.log('🔍 AdminSidebar props:', {
    isOpen,
    pendingDeposits,
    pendingWithdraws,
    unreadMessages,
  });

  // DEBUG VISUAL - sempre mostrar os valores
  React.useEffect(() => {
    console.log('🎨 RENDER AdminSidebar - Badges:', {
      deposits: pendingDeposits,
      withdraws: pendingWithdraws,
      messages: unreadMessages,
    });
  }, [pendingDeposits, pendingWithdraws, unreadMessages]);

  function handleCreateUser() {
    onNavigateToSection('create');
  }

  function handleDepositRequests() {
    navigate('/admin/deposit-requests');
  }

  function handleWithdrawRequests() {
    navigate('/admin/withdraw-requests');
  }

  function handleDashboard() {
    navigate('/home');
  }

  function handleSupport() {
    onNavigateToSection('support');
  }

  function handleAdminManagement() {
    navigate('/admin/manage-admins');
  }

  function handleBannerManagement() {
    navigate('/admin/manage-banners');
  }

  function handleCbuManagement() {
    navigate('/admin/manage-cbu');
  }

  return (
    <nav className="ba-sidebar-nav" aria-label="Admin Navigation">
      <ul className="ba-sidebar-list">
        <li>
          <button
            className="ba-action primary"
            onClick={handleDashboard}
            title={!isOpen ? 'Dashboard Principal' : ''}
          >
            <span className="ba-action-icon">🏠</span>
            {isOpen && (
              <span className="ba-action-text">Dashboard Principal</span>
            )}
          </button>
        </li>
        <li>
          <button
            className="ba-action"
            onClick={handleCreateUser}
            title={!isOpen ? 'Gerenciar Usuários' : ''}
          >
            <span className="ba-action-icon">👥</span>
            {isOpen && (
              <span className="ba-action-text">Gerenciar Usuários</span>
            )}
          </button>
        </li>
        <li style={{ position: 'relative' }}>
          <button
            className="ba-action highlight"
            onClick={handleDepositRequests}
            title={!isOpen ? 'Solicitações de Depósito' : ''}
          >
            <span className="ba-action-icon">💰</span>
            {isOpen && (
              <span className="ba-action-text">Solicitações de Depósito</span>
            )}
          </button>
          {/* Badge FORA do botão */}
          {pendingDeposits > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '50%',
                right: isOpen ? '16px' : '8px',
                transform: 'translateY(-50%)',
                background: '#dc3545',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                minWidth: '24px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(220, 53, 69, 0.5)',
                zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              {pendingDeposits}
            </span>
          )}
        </li>
        <li style={{ position: 'relative' }}>
          <button
            className="ba-action highlight"
            onClick={handleWithdrawRequests}
            title={!isOpen ? 'Solicitações de Retirada' : ''}
          >
            <span className="ba-action-icon">💸</span>
            {isOpen && (
              <span className="ba-action-text">Solicitações de Retirada</span>
            )}
          </button>
          {/* Badge FORA do botão */}
          {pendingWithdraws > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '50%',
                right: isOpen ? '16px' : '8px',
                transform: 'translateY(-50%)',
                background: '#dc3545',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                minWidth: '24px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(220, 53, 69, 0.5)',
                zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              {pendingWithdraws}
            </span>
          )}
        </li>
        <li style={{ position: 'relative' }}>
          <button
            className="ba-action"
            onClick={handleSupport}
            title={!isOpen ? 'Suporte' : ''}
          >
            <span className="ba-action-icon">💬</span>
            {isOpen && <span className="ba-action-text">Suporte</span>}
          </button>
          {/* Badge FORA do botão */}
          {unreadMessages > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '50%',
                right: isOpen ? '16px' : '8px',
                transform: 'translateY(-50%)',
                background: '#dc3545',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                minWidth: '24px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(220, 53, 69, 0.5)',
                zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              {unreadMessages}
            </span>
          )}
        </li>
        <li>
          <button
            className="ba-action highlight"
            onClick={handleAdminManagement}
            title={!isOpen ? 'Gerenciar Admins' : ''}
          >
            <span className="ba-action-icon">🔐</span>
            {isOpen && <span className="ba-action-text">Gerenciar Admins</span>}
          </button>
        </li>
        <li>
          <button
            className="ba-action"
            onClick={handleBannerManagement}
            title={!isOpen ? 'Gerenciar Banners' : ''}
          >
            <span className="ba-action-icon">🖼️</span>
            {isOpen && (
              <span className="ba-action-text">Gerenciar Banners</span>
            )}
          </button>
        </li>
        <li>
          <button
            className="ba-action"
            onClick={handleCbuManagement}
            title={!isOpen ? 'Gerenciar CBU' : ''}
          >
            <span className="ba-action-icon">🏦</span>
            {isOpen && <span className="ba-action-text">Gerenciar CBU</span>}
          </button>
        </li>
      </ul>
    </nav>
  );
}

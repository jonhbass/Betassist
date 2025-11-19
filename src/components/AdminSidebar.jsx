import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/sidebar.css';

export default function AdminSidebar({
  isOpen = true,
  onNavigateToSection = () => {},
  onToast = () => {},
}) {
  const navigate = useNavigate();

  function handleCreateUser() {
    onNavigateToSection('create');
  }

  function handleDepositRequests() {
    navigate('/admin/deposit-requests');
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
        <li>
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
        </li>
        <li>
          <button
            className="ba-action"
            onClick={handleSupport}
            title={!isOpen ? 'Suporte' : ''}
          >
            <span className="ba-action-icon">💬</span>
            {isOpen && <span className="ba-action-text">Suporte</span>}
          </button>
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

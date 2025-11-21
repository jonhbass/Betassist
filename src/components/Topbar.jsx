import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../assets/icon.svg';
import { getAuthUser } from '../utils/auth';
import '../css/topbar.css';

export default function Topbar({
  onToggleSidebar,
  onLogout,
  onMessageClick,
  onNotifyClick,
  onMenuClick,
  showMenu = false,
  simpleMode = false,
  adminMode = false,
  pendingDeposits = 0,
  pendingWithdraws = 0,
  unreadMessages = 0,
  onWithdrawClick,
}) {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);
  const [username, setUsername] = useState('');
  const [balance, setBalance] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    // Obter usuário logado
    const user = getAuthUser();
    setUsername(user || 'Usuário');

    // Calcular saldo
    const calculateBalance = () => {
      try {
        const usersData = localStorage.getItem('USERS');
        if (usersData) {
          const users = JSON.parse(usersData);
          const currentUser = users.find((u) => u.username === user);
          if (currentUser && currentUser.balance !== undefined) {
            setBalance(currentUser.balance);
            return;
          }
        }

        // Fallback: calcular apenas com depósitos (não ideal)
        const requests = JSON.parse(
          localStorage.getItem('DEPOSIT_REQUESTS') || '[]'
        );
        const userRequests = requests.filter(
          (req) => req.user === user && req.status === 'Aprobada'
        );
        const total = userRequests.reduce(
          (sum, req) => sum + (req.amount || 0),
          0
        );
        setBalance(total);
      } catch (error) {
        console.error('Erro ao calcular saldo:', error);
        setBalance(0);
      }
    };

    calculateBalance();
    const interval = setInterval(calculateBalance, 3000);
    return () => clearInterval(interval);
  }, []);

  // Contar notificações não lidas
  useEffect(() => {
    const countUnread = () => {
      try {
        const user = getAuthUser();
        const depositNotifications = JSON.parse(
          localStorage.getItem('DEPOSIT_NOTIFICATIONS') || '[]'
        );
        const withdrawNotifications = JSON.parse(
          localStorage.getItem('WITHDRAW_NOTIFICATIONS') || '[]'
        );
        const allNotifications = [
          ...depositNotifications,
          ...withdrawNotifications,
        ];
        const unread = allNotifications.filter(
          (n) => n.user === user && !n.read
        ).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Erro ao contar notificações:', error);
        setUnreadCount(0);
      }
    };

    countUnread();
    const interval = setInterval(countUnread, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Verificar se clicou fora do menu E se não é o botão hamburguer
      const isMenuButton = event.target.closest(
        '.ba-btn.small[aria-label="Toggle menu"]'
      );
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !isMenuButton
      ) {
        closeMenu();
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const toggleMenu = () => {
    if (showMenu && onMenuClick) {
      setIsClosing(true);
      setTimeout(() => {
        onMenuClick();
        setIsClosing(false);
      }, 250);
    } else if (onMenuClick) {
      onMenuClick();
    }
  };

  const closeMenu = () => {
    if (onMenuClick && showMenu) {
      setIsClosing(true);
      setTimeout(() => {
        onMenuClick();
        setIsClosing(false);
      }, 250);
    }
  };

  const handleRetirar = () => {
    closeMenu();
    setTimeout(() => navigate('/withdraw-chips'), 250);
  };

  const handleRecargar = () => {
    closeMenu();
    setTimeout(() => navigate('/load-chips'), 250);
  };

  const handleTutorial = () => {
    closeMenu();
    // Lógica do tutorial
  };

  const handleCerrarSesion = () => {
    closeMenu();
    setTimeout(() => onLogout(), 250);
  };

  // Obter nome do admin
  const adminUsername = adminMode
    ? sessionStorage.getItem('adminUsername') || 'Admin'
    : '';

  return (
    <header className="ba-topbar">
      <div className="ba-top-left">
        <img src={Icon} alt="StarWin Logo" className="header-icon" />
        <div className="ba-logo">
          <span style={{ color: '#1ca3ff' }}>Star</span>
          <span style={{ color: '#ffc107' }}>Win</span>
        </div>
      </div>

      {/* Título centralizado para modo admin */}
      {adminMode && (
        <div className="ba-top-center">
          <h1 className="ba-admin-title">ÁREA ADMINISTRATIVA</h1>
        </div>
      )}

      {/* Modo usuário normal */}
      {!simpleMode && !adminMode && (
        <div className="ba-top-actions">
          <button
            className="ba-btn small"
            onClick={() => onMessageClick && onMessageClick()}
          >
            💬 Mensajes
          </button>
          <button
            className="ba-btn small ba-notify-btn"
            onClick={() => onNotifyClick && onNotifyClick()}
          >
            🔔 Notificações
            {unreadCount > 0 && (
              <span className="ba-notify-badge">{unreadCount}</span>
            )}
          </button>
          <button
            className={`ba-btn small ${showMenu ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      )}

      {/* Modo admin - Info e logout */}
      {adminMode && (
        <div className="ba-top-admin-actions">
          <div className="ba-admin-user-info">
            <span className="ba-admin-icon">👨‍💼</span>
            <span className="ba-admin-username">{adminUsername}</span>
          </div>
          <button
            className="ba-btn ba-admin-logout-btn"
            onClick={onLogout}
            title="Cerrar sesión"
          >
            Salir ↦
          </button>
        </div>
      )}

      {/* Menu Popup */}
      {showMenu && (
        <div
          className={`ba-menu-popup ${isClosing ? 'closing' : ''}`}
          ref={menuRef}
        >
          {/* Info do usuário e saldo */}
          <div className="ba-menu-header">
            <div className="ba-menu-user">
              <span className="ba-menu-icon">👤</span>
              <span className="ba-menu-username">{username}</span>
            </div>
            <div className="ba-menu-balance">
              <span className="ba-menu-icon">🔄</span>
              <span className="ba-menu-balance-value">
                {balance.toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="ba-menu-actions">
            <button
              className="ba-menu-btn ba-menu-btn-primary"
              onClick={handleRetirar}
            >
              Retirar
            </button>
            <button
              className="ba-menu-btn ba-menu-btn-primary"
              onClick={handleRecargar}
            >
              Recargar
            </button>
          </div>

          <button
            className="ba-menu-btn ba-menu-btn-secondary"
            onClick={handleTutorial}
          >
            <span>Iniciar Tutorial</span>
            <span className="ba-menu-btn-icon">▶</span>
          </button>

          <button
            className="ba-menu-btn ba-menu-btn-secondary"
            onClick={handleCerrarSesion}
          >
            <span>Cerrar Sesión</span>
            <span className="ba-menu-btn-icon">↦</span>
          </button>
        </div>
      )}
    </header>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../assets/icon.svg';
import { getAuthUser } from '../utils/auth';
import { getServerUrl } from '../utils/serverUrl';
import { ensureSocket } from '../utils/socket';
import '../css/topbar.css';

export default function Topbar({
  onToggleSidebar,
  onLogout,
  onMessageClick,
  onNotifyClick,
  onMenuClick,
  onTutorialStart,
  showMenu = false,
  simpleMode = false,
  adminMode = false,
}) {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);
  const [username, setUsername] = useState('');
  const [balance, setBalance] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [iconGlowing, setIconGlowing] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const handleIconClick = () => {
    setIconGlowing(!iconGlowing);
  };

  useEffect(() => {
    // Obter usuário logado
    const user = getAuthUser();
    setUsername(user || 'Usuário');

    // Buscar saldo do servidor
    const fetchBalance = async () => {
      if (!user) return;
      try {
        const serverUrl = getServerUrl();
        const res = await fetch(`${serverUrl}/users/${user}`);
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance || 0);
        }
      } catch (error) {
        console.error('Erro ao buscar saldo:', error);
      }
    };

    fetchBalance();

    // Ouvir atualizações em tempo real
    const handleUpdate = (data) => {
      if (
        data.username &&
        user &&
        data.username.toLowerCase() === user.toLowerCase()
      ) {
        if (data.balance !== undefined) {
          setBalance(data.balance);
        }
      }
    };

    ensureSocket().then((socket) => {
      if (socket) {
        socket.on('user:update', handleUpdate);
      }
    });

    return () => {
      ensureSocket().then((socket) => {
        if (socket) {
          socket.off('user:update', handleUpdate);
        }
      });
    };
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

  const closeMenu = React.useCallback(() => {
    if (isClosing) return;
    if (onMenuClick && showMenu) {
      setIsClosing(true);
      setTimeout(() => {
        onMenuClick();
        setIsClosing(false);
      }, 250);
    }
  }, [onMenuClick, showMenu, isClosing]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Verificar se clicou fora do menu E se não é o botão hamburguer
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside); // Adicionar suporte a touch
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showMenu, closeMenu]);

  const toggleMenu = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isClosing) return; // Evita duplo clique durante animação

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
    if (onTutorialStart) {
      onTutorialStart();
    }
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
        {/* Botão hamburger do SIDEBAR - apenas mobile (usuário e admin) */}
        {onToggleSidebar && (
          <button
            className="ba-sidebar-toggle-btn"
            onClick={onToggleSidebar}
            aria-label="Abrir menu lateral"
            title="Abrir menu"
          >
            ☰
          </button>
        )}

        <img
          src={Icon}
          alt="StarWin Logo"
          className={`header-icon ${iconGlowing ? 'glowing' : ''}`}
          onClick={handleIconClick}
          style={{ cursor: 'pointer' }}
        />
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
      )}{' '}
      {/* Modo usuário normal */}
      {!simpleMode && !adminMode && (
        <div className="ba-top-actions">
          <button
            className="ba-btn small ba-message-btn"
            onClick={() => onMessageClick && onMessageClick()}
            aria-label="Mensajes"
          >
            💬 <span className="ba-btn-text">Mensajes</span>
          </button>
          <button
            className="ba-btn small ba-notify-btn"
            onClick={() => onNotifyClick && onNotifyClick()}
            aria-label="Notificações"
          >
            🔔 <span className="ba-btn-text">Notificações</span>
            {unreadCount > 0 && (
              <span className="ba-notify-badge">{unreadCount}</span>
            )}
          </button>
          <button
            ref={menuButtonRef}
            className={`ba-btn small ba-menu-toggle-btn ${
              showMenu ? 'active' : ''
            }`}
            onClick={toggleMenu}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
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
            <div className="ba-menu-balance ba-balance">
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

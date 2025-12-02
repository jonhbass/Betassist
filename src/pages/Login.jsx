import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';
import Icon from '../assets/icon.svg';
import { setAuthUser } from '../utils/auth';
import { clearVisitorId } from '../utils/visitorId';
import SupportButton from '../components/SupportButton';
import SupportChatModal from '../components/SupportChatModal';
import { getServerUrl } from '../utils/serverUrl';

// Force API usage for consistency with AdminDashboard
const USE_API = true;

const DEFAULT_USERS = [
  { username: 'jhon', password: '1234' },
  { username: 'mila', password: 'mila' },
];

function getUsers() {
  try {
    const raw = localStorage.getItem('USERS');
    if (!raw) return DEFAULT_USERS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_USERS;
    return parsed;
  } catch {
    return DEFAULT_USERS;
  }
}

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const users = getUsers();
    const ok = users.some(
      (u) => u.username === username && u.password === password
    );
    if (USE_API) {
      // call server login
      (async () => {
        try {
          const serverUrl = getServerUrl();
          console.log('🔐 Fazendo login na API:', serverUrl);
          const resp = await fetch(`${serverUrl}/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username,
              password,
            }),
          });

          // Verificar se usuário está banido
          if (resp.status === 403) {
            const data = await resp.json();
            setError(data.message || 'Tu cuenta ha sido suspendida.');
            return;
          }

          if (!resp.ok) throw new Error('invalid');
          clearVisitorId();
          sessionStorage.removeItem('isAdmin'); // Garante que usuário normal não tenha flag de admin
          sessionStorage.removeItem('adminUsername');
          setAuthUser(username);
          navigate('/home');
        } catch (err) {
          console.error('login error', err);
          setError('Usuario o contraseña inválidos (servidor)');
        }
      })();
      return;
    }

    if (ok) {
      clearVisitorId(); // Limpa o ID de visitante após login bem-sucedido
      sessionStorage.removeItem('isAdmin'); // Garante que usuário normal não tenha flag de admin
      sessionStorage.removeItem('adminUsername');
      setAuthUser(username);
      navigate('/home');
    } else {
      setError('Usuario o contraseña inválidos');
    }
  }

  return (
    <div className="login-wrap">
      <SupportButton />

      {/* Container que agrupa banner + card de login */}
      <div className="login-container">
        {/* Banner de boas-vindas */}
        <div className="login-welcome-banner">
          <div className="login-welcome-glow"></div>
          <div className="login-welcome-content">
            <h3 className="login-welcome-title">
              <span className="login-welcome-wave">👋</span> ¡Hola!
            </h3>
            <p className="login-welcome-text">
              Estás a un paso de recibir un{' '}
              <span className="login-welcome-highlight">30% extra</span> por tu
              registro.
            </p>
            <p className="login-welcome-cta">
              Pedí tu cuenta en el chat de abajo y empezá a disfrutar.
              <span className="login-welcome-rockets">🚀✨</span>
            </p>
          </div>
        </div>

        <form className="login-card" onSubmit={handleSubmit}>
          {error && <p className="login-error">{error}</p>}
          <div className="login-header">
            <img src={Icon} alt="StarWin Logo" className="header-icon" />
            <h2>
              <span style={{ color: '#1ca3ff' }}>Star</span>
              <span style={{ color: '#ffc107' }}>Win</span>
            </h2>
          </div>

          <label>
            Usuario
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
            />
          </label>

          <button type="submit">Iniciar Sesión</button>
        </form>
      </div>
    </div>
  );
}

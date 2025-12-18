import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';
import Icon from '../assets/icon.svg';
import { setAuthUser } from '../utils/auth';
import { clearVisitorId } from '../utils/visitorId';
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

        {/* Botão WhatsApp */}
        <a
          href="https://wa.me/message/SA4HJMDILG2NC1"
          target="_blank"
          rel="noopener noreferrer"
          className="login-whatsapp-btn"
        >
          <svg
            className="whatsapp-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Starwin WhatsApp
        </a>
      </div>
    </div>
  );
}

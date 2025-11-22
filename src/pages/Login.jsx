import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';
import Icon from '../assets/icon.svg';
import { setAuthUser } from '../utils/auth';
import { getOrCreateVisitorId, clearVisitorId } from '../utils/visitorId';
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
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password
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
          if (!resp.ok) throw new Error('invalid');
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

  const visitorId = getOrCreateVisitorId();

  return (
    <div className="login-wrap">
      <SupportButton />
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
        <div
          style={{
            marginTop: 12,
            textAlign: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/admin-login')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
            }}
          >
            Ingresar como administrador
          </button>
        </div>
      </form>
    </div>
  );
}

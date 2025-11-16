import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';
import Icon from '../assets/icon.svg';
import { setAuthUser } from '../utils/auth';
const USE_API = import.meta.env.VITE_USE_API === 'true';

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
          const resp = await fetch(
            (import.meta.env.VITE_API_URL || 'http://localhost:4000') +
              '/login',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username,
                password,
              }),
            }
          );
          if (!resp.ok) throw new Error('invalid');
          setAuthUser(username);
          navigate('/home');
        } catch (err) {
          console.error('login error', err);
          setError('Usuário ou senha inválidos (servidor)');
        }
      })();
      return;
    }

    if (ok) {
      setAuthUser(username);
      navigate('/home');
    } else {
      setError('Usuário ou senha inválidos');
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        {error && <p className="login-error">{error}</p>}
        <div className="login-header">
          <img src={Icon} alt="BetAssist Logo" className="header-icon" />
          <h2>BetAssist</h2>
        </div>

        <label>
          Usuário
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Digite seu usuário"
          />
        </label>

        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
          />
        </label>

        <button type="submit">Login</button>
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
            Entrar como administrador
          </button>
        </div>
      </form>
    </div>
  );
}

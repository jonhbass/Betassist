import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';
import { getServerUrl } from '../utils/serverUrl';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Admin padrão do sistema (sempre disponível)
  const DEFAULT_ADMIN = {
    username: 'admin',
    password: 'admin123',
  };

  async function handleSubmit(e) {
    e.preventDefault();

    // Validar campos obrigatórios
    if (!username.trim() || !password.trim()) {
      setError('Usuario y contraseña son obligatorios');
      return;
    }

    // Primeiro verifica admin padrão
    if (
      username.trim().toLowerCase() === DEFAULT_ADMIN.username.toLowerCase() &&
      password === DEFAULT_ADMIN.password
    ) {
      sessionStorage.setItem('isAdmin', 'true');
      sessionStorage.setItem('adminUsername', DEFAULT_ADMIN.username);
      navigate('/admin');
      return;
    }

    // Verifica na lista de admins cadastrados (Server + Local)
    try {
      const serverUrl = getServerUrl();
      let admins = [];
      try {
        const res = await fetch(`${serverUrl}/admins`);
        if (res.ok) {
          admins = await res.json();
        }
      } catch (err) {
        console.error('Failed to fetch admins', err);
        // Fallback to local
        const storedAdmins = localStorage.getItem('ADMINS');
        if (storedAdmins) {
          admins = JSON.parse(storedAdmins);
        }
      }

      // Also check local if server returned empty or failed but we didn't catch it
      if (!admins.length) {
        const storedAdmins = localStorage.getItem('ADMINS');
        if (storedAdmins) {
          admins = JSON.parse(storedAdmins);
        }
      }

      const admin = admins.find(
        (a) =>
          a.username.toLowerCase() === username.trim().toLowerCase() &&
          a.password === password
      );

      if (admin) {
        sessionStorage.setItem('isAdmin', 'true');
        sessionStorage.setItem('adminUsername', admin.username);
        navigate('/admin');
        return;
      }
    } catch (err) {
      console.error('Erro ao verificar admins:', err);
    }

    setError('Usuario o contraseña incorrectos');
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        {error && <p className="login-error">{error}</p>}
        <div className="login-header">
          <h2>Administración</h2>
        </div>

        <label>
          Nombre de usuario *
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ingrese su nombre de usuario"
            autoComplete="username"
            required
          />
        </label>

        <label>
          Contraseña *
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingrese su contraseña"
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit">Ingresar como Admin</button>
        <div
          style={{
            marginTop: 12,
            textAlign: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
            }}
          >
            Ingresar como usuario
          </button>
        </div>
      </form>
    </div>
  );
}

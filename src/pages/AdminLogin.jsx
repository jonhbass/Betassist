import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';

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

  function handleSubmit(e) {
    e.preventDefault();

    // Validar campos obrigatórios
    if (!username.trim() || !password.trim()) {
      setError('Usuario y contraseña son obligatorios');
      return;
    }

    // Primeiro verifica admin padrão
    if (
      username.trim() === DEFAULT_ADMIN.username &&
      password === DEFAULT_ADMIN.password
    ) {
      sessionStorage.setItem('isAdmin', 'true');
      sessionStorage.setItem('adminUsername', DEFAULT_ADMIN.username);
      navigate('/admin');
      return;
    }

    // Verifica na lista de admins cadastrados
    try {
      const storedAdmins = localStorage.getItem('ADMINS');
      if (storedAdmins) {
        const admins = JSON.parse(storedAdmins);
        const admin = admins.find(
          (a) => a.username === username.trim() && a.password === password
        );

        if (admin) {
          sessionStorage.setItem('isAdmin', 'true');
          sessionStorage.setItem('adminUsername', admin.username);
          navigate('/admin');
          return;
        }
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
      </form>
    </div>
  );
}

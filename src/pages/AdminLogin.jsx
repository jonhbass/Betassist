import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Read admin password from Vite env var VITE_ADMIN_PASSWORD (recommended)
  // Fallback to 'admin123' if not provided (development convenience)
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

  function handleSubmit(e) {
    e.preventDefault();

    // Primeiro verifica a senha master
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('isAdmin', 'true');
      navigate('/admin');
      return;
    }

    // Se não for a senha master, verifica na lista de admins cadastrados
    try {
      const storedAdmins = localStorage.getItem('ADMINS');
      if (storedAdmins) {
        const admins = JSON.parse(storedAdmins);
        const admin = admins.find(
          (a) => a.username === username && a.password === password
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
    setError('Credenciais de administrador inválidas');
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        {error && <p className="login-error">{error}</p>}
        <div className="login-header">
          <h2>Administração</h2>
        </div>

        <label>
          Nome de usuário (opcional)
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Digite seu nome de usuário"
            autoComplete="username"
          />
        </label>

        <label>
          Senha de administrador
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite a senha de admin"
            autoComplete="current-password"
          />
        </label>

        <button type="submit">Entrar como Admin</button>
      </form>
    </div>
  );
}

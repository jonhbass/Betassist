import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Read admin password from Vite env var VITE_ADMIN_PASSWORD (recommended)
  // Fallback to 'admin123' if not provided (development convenience)
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

  function handleSubmit(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin');
    } else {
      setError('Senha de administrador inválida');
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        {error && <p className="login-error">{error}</p>}
        <div className="login-header">
          <h2>Administração</h2>
        </div>

        <label>
          Senha de administrador
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite a senha de admin"
          />
        </label>

        <button type="submit">Entrar como Admin</button>
      </form>
    </div>
  );
}

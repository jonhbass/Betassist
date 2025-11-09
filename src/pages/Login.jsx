import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../css/Login.css'

const USERS = [
  { username: 'jhonathan', password: 'react' },
  { username: 'tute4279', password: '1234' },
]

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

function handleSubmit(e) {
  e.preventDefault()
  const ok = USERS.some(u => u.username === username && u.password === password)

  if (ok) {
    localStorage.setItem('authUser', username)
    navigate('/home')
    } else {
    setError('Usuário ou senha inválidos')
    }
  }

return (
    
<div className="login-wrap">
    
  <form className="login-card" onSubmit={handleSubmit}>
    {error && <p className="login-error">{error}</p>}
  <div className="login-header">    
  <img src="./src/assets/icon.svg" alt="BetAssist Logo" className="header-icon" />
    <h2>BetAssist</h2>
</div>

<label>
      Usuário
  <input
    value={username}
    onChange={e => setUsername(e.target.value)}
    placeholder="Digite seu usuário"
  />
</label>

<label>
      Senha
  <input
    type="password"
    value={password}
    onChange={e => setPassword(e.target.value)}
    placeholder="Digite sua senha"
  />
</label>

  <button type="submit">Login</button>
  </form>
</div>
  )
}


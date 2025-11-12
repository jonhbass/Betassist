import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import AdminLogin from '../pages/AdminLogin'
import AdminDashboard from '../pages/AdminDashboard'



export function Routers() {
  return (

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
  <Route path="/login" element={<Login />} />
  <Route path="/home" element={<Dashboard />} />
  <Route path="/admin-login" element={<AdminLogin />} />
  <Route path="/admin" element={<AdminDashboard />} />
      </Routes>

  )
}
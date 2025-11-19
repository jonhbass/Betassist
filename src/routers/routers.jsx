import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashboard';
import Support from '../pages/Support';
import LoadChips from '../pages/LoadChips';
import WithdrawChips from '../pages/WithdrawChips';
import RequestsPanel from '../pages/RequestsPanel';

export function Routers() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Dashboard />} />
      <Route path="/load-chips" element={<LoadChips />} />
      <Route path="/withdraw-chips" element={<WithdrawChips />} />
      <Route path="/requests" element={<RequestsPanel />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/support" element={<Support />} />
    </Routes>
  );
}

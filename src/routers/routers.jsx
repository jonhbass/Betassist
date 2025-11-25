import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashboard';
import AdminManagement from '../pages/AdminManagement';
import BannerManagement from '../pages/BannerManagement';
import CbuManagement from '../pages/CbuManagement';
import Support from '../pages/Support';
import LoadChips from '../pages/LoadChips';
import WithdrawChips from '../pages/WithdrawChips';
import RequestsPanel from '../pages/RequestsPanel';
import DepositRequests from '../pages/DepositRequests';
import WithdrawRequests from '../pages/WithdrawRequests';
import { getAuthUser } from '../utils/auth';

function ProtectedRoute({ children }) {
  const hasUser = Boolean(getAuthUser());
  const adminOverride = sessionStorage.getItem('adminUsername');
  if (!hasUser && !adminOverride) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }
  return children;
}

export function Routers() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/load-chips"
        element={
          <ProtectedRoute>
            <LoadChips />
          </ProtectedRoute>
        }
      />
      <Route
        path="/withdraw-chips"
        element={
          <ProtectedRoute>
            <WithdrawChips />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests"
        element={
          <ProtectedRoute>
            <RequestsPanel />
          </ProtectedRoute>
        }
      />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/manage-admins"
        element={
          <AdminRoute>
            <AdminManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/manage-banners"
        element={
          <AdminRoute>
            <BannerManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/manage-cbu"
        element={
          <AdminRoute>
            <CbuManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/deposit-requests"
        element={
          <AdminRoute>
            <DepositRequests />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/withdraw-requests"
        element={
          <AdminRoute>
            <WithdrawRequests />
          </AdminRoute>
        }
      />
      <Route
        path="/support"
        element={
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

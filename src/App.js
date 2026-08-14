import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import OtpVerifyPage       from './pages/OtpVerifyPage';
import ForgotPasswordPage  from './pages/ForgotPasswordPage';
import ResetPasswordPage   from './pages/ResetPasswordPage';
import DashboardPage       from './pages/DashboardPage';
import LoyaltyPage         from './pages/LoyaltyPage';
import PointsHistoryPage   from './pages/PointsHistoryPage';
import InventoryPage       from './pages/InventoryPage';
import PrivateRoute             from './components/common/PrivateRoute';
import ForceChangePasswordPage  from './pages/ForceChangePasswordPage';
import MaterialRequestsPage     from './pages/MaterialRequestsPage';
import CompletionReportsPage    from './pages/CompletionReportsPage';
import AlertsPage               from './pages/AlertsPage';
import MonthlyReportPage        from './pages/MonthlyReportPage';
import StaffFirstLoginPage      from './pages/StaffFirstLoginPage';
import AdminFirstLoginPage      from './pages/AdminFirstLoginPage';
import GoogleAuthSuccess        from './pages/GoogleAuthSuccess';
import StaffDashboard           from './pages/StaffDashboard';

/* ── Stub pages (to be built) ─────────────────────────── */
import BookingsPage        from './pages/BookingsPage';
import NotificationsPage   from './pages/NotificationsPage';
import ProfilePage         from './pages/ProfilePage';
import SettingsPage        from './pages/SettingsPage';
import StaffPage           from './pages/StaffPage';
import AdminPage           from './pages/AdminPage';

const ADMIN_ROLES    = ['super_admin', 'main_admin', 'admin', 'operation_admin', 'customer_support_admin'];
const STAFF_ROLES    = ['staff'];
const CUSTOMER_ROLES = ['customer'];

/* redirect logged-in users to their home based on role */
const PublicOnly = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return children;
  if (user?.mustChangePassword) {
    if (user.role === 'staff')             return <Navigate to="/staff-first-login"  replace />;
    if (ADMIN_ROLES.includes(user?.role))  return <Navigate to="/admin-first-login"  replace />;
    return <Navigate to="/force-change-password" replace />;
  }
  if (ADMIN_ROLES.includes(user?.role))  return <Navigate to="/admin"  replace />;
  if (STAFF_ROLES.includes(user?.role))  return <Navigate to="/staff"  replace />;
  return <Navigate to="/" replace />;
};

const Spinner = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#12121E',
  }}>
    <div style={{
      width: 38, height: 38, borderRadius: '50%',
      border: '3px solid #7C3AED', borderTopColor: 'transparent',
      animation: 'spin 0.8s linear infinite',
    }}/>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  const { loading } = useAuth();
  if (loading) return <Spinner />;

  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public-only ── */}
        <Route path="/login"           element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route path="/register"        element={<PublicOnly><RegisterPage /></PublicOnly>} />
        <Route path="/verify-email"    element={<OtpVerifyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"        element={<ResetPasswordPage />} />
        <Route path="/auth/google/success"   element={<GoogleAuthSuccess />} />

        {/* ── Forced password change — role-specific ── */}
        <Route path="/staff-first-login" element={
          <PrivateRoute allowedRoles={['staff']}>
            <StaffFirstLoginPage />
          </PrivateRoute>
        } />
        <Route path="/admin-first-login" element={
          <PrivateRoute allowedRoles={ADMIN_ROLES}>
            <AdminFirstLoginPage />
          </PrivateRoute>
        } />
        {/* Fallback: legacy route kept for safety */}
        <Route path="/force-change-password" element={
          <PrivateRoute>
            <ForceChangePasswordPage />
          </PrivateRoute>
        } />

        {/* ── Customer routes ── */}
        <Route path="/" element={
          <PrivateRoute allowedRoles={CUSTOMER_ROLES}>
            <DashboardPage />
          </PrivateRoute>
        } />
        <Route path="/loyalty" element={
          <PrivateRoute allowedRoles={CUSTOMER_ROLES}>
            <LoyaltyPage />
          </PrivateRoute>
        } />
        <Route path="/loyalty/history" element={
          <PrivateRoute allowedRoles={CUSTOMER_ROLES}>
            <PointsHistoryPage />
          </PrivateRoute>
        } />
        <Route path="/bookings" element={
          <PrivateRoute allowedRoles={CUSTOMER_ROLES}>
            <BookingsPage />
          </PrivateRoute>
        } />
        <Route path="/notifications" element={
          <PrivateRoute allowedRoles={CUSTOMER_ROLES}>
            <NotificationsPage />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute allowedRoles={CUSTOMER_ROLES}>
            <ProfilePage />
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute allowedRoles={CUSTOMER_ROLES}>
            <SettingsPage />
          </PrivateRoute>
        } />

        {/* ── Staff routes ── */}
        <Route path="/staff" element={
          <PrivateRoute allowedRoles={STAFF_ROLES}>
            <StaffDashboard />
          </PrivateRoute>
        } />

        {/* ── Admin routes ── */}
        <Route path="/admin/*" element={
          <PrivateRoute allowedRoles={ADMIN_ROLES}>
            <AdminPage />
          </PrivateRoute>
        } />

        {/* ── Inventory management suite (staff + admin) ── */}
        <Route path="/inventory" element={
          <PrivateRoute allowedRoles={[...STAFF_ROLES, ...ADMIN_ROLES]}>
            <InventoryPage />
          </PrivateRoute>
        } />
        <Route path="/material-requests" element={
          <PrivateRoute allowedRoles={ADMIN_ROLES}>
            <MaterialRequestsPage />
          </PrivateRoute>
        } />
        <Route path="/completion-reports" element={
          <PrivateRoute allowedRoles={ADMIN_ROLES}>
            <CompletionReportsPage />
          </PrivateRoute>
        } />
        <Route path="/alerts" element={
          <PrivateRoute allowedRoles={[...STAFF_ROLES, ...ADMIN_ROLES]}>
            <AlertsPage />
          </PrivateRoute>
        } />
        <Route path="/reports/monthly" element={
          <PrivateRoute allowedRoles={ADMIN_ROLES}>
            <MonthlyReportPage />
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

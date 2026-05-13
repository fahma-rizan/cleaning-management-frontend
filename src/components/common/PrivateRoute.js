import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_HOME = {
  customer:               '/',
  staff:                  '/staff',
  super_admin:            '/admin',
  main_admin:             '/admin',
  admin:                  '/admin',
  operation_admin:        '/admin',
  customer_support_admin: '/admin',
};

const ADMIN_ROLES = ['super_admin', 'main_admin', 'admin', 'operation_admin', 'customer_support_admin'];

/* Paths that are themselves the first-login destinations — avoid redirect loops */
const FIRST_LOGIN_PATHS = ['/staff-first-login', '/admin-first-login', '/force-change-password'];

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

/* allowedRoles — if omitted any authenticated user passes */
const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.mustChangePassword && !FIRST_LOGIN_PATHS.includes(location.pathname)) {
    if (user.role === 'staff') return <Navigate to="/staff-first-login" replace />;
    if (ADMIN_ROLES.includes(user.role)) return <Navigate to="/admin-first-login" replace />;
    return <Navigate to="/force-change-password" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    const home = ROLE_HOME[user?.role] || '/';
    return <Navigate to={home} replace />;
  }

  return children;
};

export default PrivateRoute;

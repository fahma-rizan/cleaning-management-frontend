import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as authService from '../services/authService';

const ADMIN_ROLES = ['super_admin', 'main_admin', 'admin', 'operation_admin', 'customer_support_admin'];

const getRedirectPath = (role) => {
  if (ADMIN_ROLES.includes(role))  return '/admin';
  if (role === 'staff')            return '/staff';
  return '/';
};

const GoogleAuthSuccess = () => {
  const navigate       = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
    const finalize = async () => {
      const params = new URLSearchParams(window.location.search);
      const token  = params.get('token');

      if (!token) {
        console.warn('[GoogleAuth] No token in URL — redirecting to login');
        navigate('/login?error=google_failed', { replace: true });
        return;
      }

      // Google OAuth users are always treated as "remembered"
      localStorage.setItem('accessToken', token);
      localStorage.setItem('rememberMe', '1');

      try {
        const profile = await authService.getProfile();

        // Log the full response so the structure is visible during debugging
        console.log('[GoogleAuth] Profile response:', profile);
        console.log('[GoogleAuth] Keys:', Object.keys(profile || {}));

        // getProfile() returns res.data.data — extract role defensively in case
        // the API shape differs between backend versions
        const user = profile?.role
          ? profile
          : profile?.data ?? profile?.user ?? profile;

        const role = user?.role;
        console.log('[GoogleAuth] Resolved role:', role);

        if (!role) {
          console.error('[GoogleAuth] role is undefined — check /api/auth/profile response shape');
          navigate('/login?error=google_failed', { replace: true });
          return;
        }

        // updateUser merges into existing context user, or sets it if null
        updateUser(user);

        const dest = getRedirectPath(role);
        console.log('[GoogleAuth] Redirecting to:', dest);
        navigate(dest, { replace: true });
      } catch (err) {
        console.error('[GoogleAuth] Profile fetch failed:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('rememberMe');
        navigate('/login?error=google_failed', { replace: true });
      }
    };

    finalize();
  }, [navigate, updateUser]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#eef0fb', fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%', margin: '0 auto 16px',
          border: '3px solid #7C3AED', borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }}/>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: 15, color: '#6B7280', margin: 0 }}>Signing you in with Google…</p>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import logoImg from '../imports/Gemini_Generated_Image_f8k5uhf8k5uhf8k5.png';
import panelImg from '../imports/3FF9CCBC-5AAC-4661-B40B-B0948D3AEC55.jpeg';


const ADMIN_ROLES = ['super_admin', 'main_admin', 'admin', 'operation_admin', 'customer_support_admin'];

const getHomeByRole = (role) => {
  if (ADMIN_ROLES.includes(role)) return '/admin';
  if (role === 'staff') return '/staff';
  return '/';
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async ({ remember, ...credentials }) => {
    setLoading(true);
    setError('');
    try {
      const result = await login(credentials, remember);
      const { user } = result;

      if (user?.mustChangePassword) {
        if (user.role === 'staff') {
          navigate('/staff-first-login', { replace: true });
        } else {
          navigate('/admin-first-login', { replace: true });
        }
        return;
      }

      const home = getHomeByRole(user?.role);
      navigate(from === '/' ? home : from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F5F5F7',
      padding: 24,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: 920,
        minHeight: 580,
        display: 'flex',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        background: '#ffffff',
      }}>

        {/* ── LEFT: form panel ── */}
        <div style={{
          flex: 1,
          padding: '44px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#ffffff',
        }}>

          {/* logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <img
              src={logoImg}
              alt="Cloud Laundry.lk"
              height={96}
              style={{ objectFit: 'contain' }}
            />
            <span style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#7C3AED',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
            }}>
              CLOUD LAUNDRY.LK
            </span>
          </div>

          {/* heading */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
              Sign in to book and manage your cleaning services
            </p>
          </div>

          <LoginForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            showForgotPassword
            showGoogle
          />
        </div>

        {/* ── RIGHT: photo panel ── */}
        <div style={{
          width: 420,
          flexShrink: 0,
          overflow: 'hidden',
          position: 'relative',
        }}>
          <img
            src={panelImg}
            alt="Cloud Laundry service"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

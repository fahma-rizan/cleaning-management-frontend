'use strict';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import KeyIcon from '@mui/icons-material/Key';
import logoImg from '../imports/Gemini_Generated_Image_f8k5uhf8k5uhf8k5.png';
import * as authService from '../services/authService';

const EmailInput = ({ value, onChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: '#ffffff',
      border: focused ? '1.5px solid #7C3AED' : '1.5px solid #e5e7eb',
      borderRadius: 10, padding: '11px 14px',
      boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
      transition: 'all 0.2s',
    }}>
      <EmailOutlinedIcon sx={{ fontSize: 18, color: focused ? '#7C3AED' : '#9CA3AF', flexShrink: 0 }} />
      <input
        type="email" value={value} onChange={onChange}
        placeholder="Enter your registered email"
        autoComplete="email" required
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontSize: 14, color: '#111827',
        }}
      />
    </div>
  );
};

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo]       = useState('');
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setInfo('');
    try {
      await authService.forgotPassword(email);
      setInfo('OTP sent! Redirecting to reset your password…');
      setTimeout(() => navigate('/reset-password', { state: { email } }), 2000);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#eef0fb',
      padding: '24px 16px', fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Brand header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <img src={logoImg} alt="Cloud Laundry" style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 12, borderRadius: 12, background: '#fff', padding: 6 }} />
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: 1, textTransform: 'uppercase' }}>
          Cloud Laundry.lk
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#6B7280' }}>
          Reset your account password
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 440,
        background: '#ffffff',
        borderRadius: 18,
        boxShadow: '0 4px 32px rgba(100,80,180,0.10)',
        padding: '32px 36px',
      }}>
        {/* Back link */}
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7C3AED', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', marginBottom: 24 }}>
          ← Back to Sign In
        </Link>

        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#7C3AED',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <KeyIcon sx={{ fontSize: 26, color: '#fff' }} />
          </div>
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>Forgot Password?</h2>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#6B7280' }}>
            Enter your registered email and we'll send you a reset code
          </p>
        </div>

        {/* Feedback */}
        {info && (
          <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 9, fontSize: 13, background: '#F0FDF4', border: '1px solid #86efac', color: '#16A34A', textAlign: 'center' }}>
            ✓ {info}
          </div>
        )}
        {error && (
          <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 9, fontSize: 13, background: '#FFF1F2', border: '1px solid #fca5a5', color: '#DC2626', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Email Address
            </label>
            <EmailInput value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '13px 0', border: 'none', borderRadius: 10,
              background: loading ? '#a78bfa' : '#7C3AED',
              color: '#fff', fontWeight: 700, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              marginTop: 4,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#6D28D9'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#7C3AED'; }}
          >
            {loading ? 'Sending…' : 'Send Reset Code'}
          </button>
        </form>
      </div>

      {/* Footer link */}
      <p style={{ marginTop: 20, fontSize: 13, color: '#9CA3AF' }}>
        <Link to="/login" style={{ color: '#9CA3AF', textDecoration: 'none' }}>
          Back to Login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;

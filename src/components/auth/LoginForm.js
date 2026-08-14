import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const EyeIcon = ({ open }) => open ? (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908C16.658 14.233 17.64 11.925 17.64 9.2z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const FieldInput = ({ type, name, value, onChange, placeholder, autoComplete, suffix }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: suffix ? '11px 42px 11px 14px' : '11px 14px',
          background: '#F3F3F5',
          border: focused ? '1.5px solid #7C3AED' : '1.5px solid transparent',
          borderRadius: 8,
          fontSize: 14,
          color: '#111827',
          outline: 'none',
          transition: 'border-color 0.18s, box-shadow 0.18s',
          boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none',
        }}
      />
      {suffix && (
        <button
          type="button"
          onClick={suffix.onClick}
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#9CA3AF',
            display: 'flex',
            alignItems: 'center',
            padding: 0,
          }}
        >
          {suffix.icon}
        </button>
      )}
    </div>
  );
};

const FieldLabel = ({ children }) => (
  <label style={{
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: '#6B7280',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  }}>
    {children}
  </label>
);

const LoginForm = ({ onSubmit, loading, error, showForgotPassword = true, showGoogle = true }) => {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPassword, setShow] = useState(false);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const isRemembered = localStorage.getItem('rememberMe') === '1';
    const savedEmail   = localStorage.getItem('rememberedEmail');
    if (isRemembered && savedEmail) {
      setForm(p => ({ ...p, email: savedEmail }));
      setRemember(true);
    } else {
      // Clear any stale remember-me data so the form always starts empty
      localStorage.removeItem('rememberedEmail');
    }
  }, []);

  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (remember) {
      localStorage.setItem('rememberedEmail', form.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    onSubmit({ ...form, remember });
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {error && (
        <div style={{
          padding: '10px 14px',
          borderRadius: 8,
          fontSize: 13,
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#DC2626',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span>⚠</span> {error}
        </div>
      )}

      <div>
        <FieldLabel>Email Address</FieldLabel>
        <FieldInput
          type="email" name="email" value={form.email} onChange={set}
          placeholder="you@example.com" autoComplete="off"
        />
      </div>

      <div>
        <FieldLabel>Password</FieldLabel>
        <FieldInput
          type={showPassword ? 'text' : 'password'}
          name="password" value={form.password} onChange={set}
          placeholder="Enter your password" autoComplete="current-password"
          suffix={{ onClick: () => setShow(p => !p), icon: <EyeIcon open={showPassword} /> }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
            style={{ accentColor: '#7C3AED', width: 15, height: 15 }}
          />
          <span style={{ fontSize: 13, color: '#6B7280' }}>Remember me</span>
        </label>
        {showForgotPassword && (
          <Link to="/forgot-password" style={{ fontSize: 13, color: '', textDecoration: 'none', fontWeight: 500 }}>
            Forgot password?
          </Link>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '13px 0',
          border: 'none',
          borderRadius: 8,
          background: loading ? 'rgba(124,58,237,0.5)' : '#7C3AED',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 4px 16px rgba(124,58,237,0.35)',
          transition: 'background 0.18s, box-shadow 0.18s',
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#6D28D9'; }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#7C3AED'; }}
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      {showGoogle && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }}/>
            <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }}/>
          </div>

          <button
            type="button"
            onClick={() => { window.location.href = 'http://localhost:5000/api/auth/google'; }}
            style={{
              width: '100%',
              padding: '12px 0',
              border: '1.5px solid #E5E7EB',
              borderRadius: 8,
              background: '#ffffff',
              color: '#374151',
              fontWeight: 500,
              fontSize: 13.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'border-color 0.18s, background 0.18s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#F9FAFB';
              e.currentTarget.style.borderColor = '#D1D5DB';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#E5E7EB';
            }}
          >
            <GoogleIcon /> Continue with Google
          </button>
        </>
      )}

      {showGoogle ? (
        <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', margin: 0 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>
      ) : (
        <p style={{ textAlign: 'center', fontSize: 11.5, color: '#9CA3AF', margin: 0 }}>
          Admin accounts — contact your system administrator if locked out.
        </p>
      )}
    </form>
  );
};

export default LoginForm;

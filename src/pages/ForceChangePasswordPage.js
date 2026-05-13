import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LockIcon   from '@mui/icons-material/Lock';
import { useAuth } from '../context/AuthContext';
import { forceChangePassword } from '../services/authService';

const EyeIcon = ({ open }) => open ? (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const DarkInput = ({ type, value, onChange, placeholder, suffix }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} required
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', boxSizing: 'border-box', padding: suffix ? '11px 42px 11px 14px' : '11px 14px',
          background: focused ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.06)',
          border: focused ? '1px solid rgba(124,58,237,0.7)' : '1px solid rgba(255,255,255,0.1)',
          borderRadius: 9, fontSize: 13.5, color: '#fff', outline: 'none', transition: 'all 0.2s',
          boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.14)' : 'none',
        }}
      />
      {suffix && <button type="button" onClick={suffix.onClick} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0, display: 'flex' }}>{suffix.icon}</button>}
    </div>
  );
};

const validateStrength = (pw) => {
  if (pw.length < 8)               return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(pw))          return 'Must include at least one uppercase letter';
  if (!/[0-9]/.test(pw))          return 'Must include at least one number';
  if (!/[^A-Za-z0-9]/.test(pw))   return 'Must include at least one special character';
  return null;
};

const ForceChangePasswordPage = () => {
  const { updateUser, user } = useAuth();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ newPassword: '', confirm: '' });
  const [show, setShow]           = useState({ new: false, confirm: false });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const strengthErr = validateStrength(passwords.newPassword);
    if (strengthErr) { setError(strengthErr); return; }
    if (passwords.newPassword !== passwords.confirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      await forceChangePassword({ newPassword: passwords.newPassword });
      updateUser({ mustChangePassword: false, isTemporaryPassword: false });
      const home = user?.role === 'staff' ? '/staff' : user?.role ? '/admin' : '/';
      navigate(home, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0533 40%, #0d0d1a 100%)',
      padding: 16, fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 24, border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 25px 80px rgba(0,0,0,0.6)', overflow: 'hidden',
      }}>
        <div style={{ padding: '28px 36px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(124,58,237,0.08))', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, margin: '0 auto 14px', background: 'linear-gradient(135deg, #dc2626, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 18px rgba(239,68,68,0.4)' }}>
            <LockIcon sx={{ fontSize: 26, color: '#fff' }}/>
          </div>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: 20, margin: 0 }}>Password Change Required</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '5px 0 0' }}>
            Welcome, {user?.name?.split(' ')[0]}! For your security, please set a new password before continuing.
          </p>
        </div>

        <div style={{ padding: '28px 36px 32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && <div style={{ padding: '10px 14px', borderRadius: 9, fontSize: 12.5, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', display: 'flex', gap: 8 }}><span>⚠</span> {error}</div>}

            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>New Password</label>
              <DarkInput type={show.new ? 'text' : 'password'} value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} placeholder="Min 8 characters" suffix={{ onClick: () => setShow(s => ({ ...s, new: !s.new })), icon: <EyeIcon open={show.new} /> }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Confirm Password</label>
              <DarkInput type={show.confirm ? 'text' : 'password'} value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} placeholder="Repeat new password" suffix={{ onClick: () => setShow(s => ({ ...s, confirm: !s.confirm })), icon: <EyeIcon open={show.confirm} /> }} />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px 0', border: 'none', borderRadius: 10, marginTop: 4,
              background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7C3AED, #9333ea)',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 24px rgba(124,58,237,0.45)',
            }}>
              {loading ? 'Saving…' : 'Set New Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForceChangePasswordPage;

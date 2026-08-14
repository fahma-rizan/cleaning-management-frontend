import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../context/AuthContext';
import { forceChangePassword } from '../services/authService';

/* ─── Password strength ─────────────────────────────────── */
const strengthCheck = (pw) => {
  const rules = [
    { test: pw.length >= 8,           msg: 'At least 8 characters' },
    { test: /[A-Z]/.test(pw),         msg: 'One uppercase letter' },
    { test: /[0-9]/.test(pw),         msg: 'One number' },
    { test: /[^A-Za-z0-9]/.test(pw),  msg: 'One special character' },
  ];
  const passed = rules.filter(r => r.test).length;
  return { rules, passed, total: rules.length };
};

const StrengthBar = ({ passed, total }) => {
  const colors = ['#EF4444', '#F59E0B', '#8B5CF6', '#7C3AED'];
  const filled = colors[passed - 1] || 'rgba(255,255,255,0.1)';
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 2,
          background: i < passed ? filled : 'rgba(255,255,255,0.1)',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );
};

/* ─── Input ──────────────────────────────────────────────── */
const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const ROLE_LABELS = {
  super_admin:            'Super Administrator',
  main_admin:             'Main Administrator',
  admin:                  'Administrator',
  operation_admin:        'Operations Manager',
  customer_support_admin: 'Customer Support Admin',
};

const DarkInput = ({ type, value, onChange, placeholder, suffix, label }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type} value={value} onChange={onChange}
          placeholder={placeholder} required
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: suffix ? '11px 42px 11px 14px' : '11px 14px',
            background: focused ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.06)',
            border: focused ? '1px solid rgba(124,58,237,0.6)' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: 9, fontSize: 13.5, color: '#fff', outline: 'none',
            transition: 'all 0.2s',
            boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none',
          }}
        />
        {suffix && (
          <button type="button" onClick={suffix.onClick}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0, display: 'flex' }}>
            {suffix.icon}
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── AdminFirstLoginPage ────────────────────────────────── */
const AdminFirstLoginPage = () => {
  const { updateUser, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ tempPassword: '', newPassword: '', confirm: '' });
  const [show, setShow]       = useState({ temp: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const strength  = strengthCheck(form.newPassword);
  const roleLabel = ROLE_LABELS[user?.role] || 'Administrator';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.tempPassword.trim()) {
      setError('Please enter your temporary password.');
      return;
    }
    const weakRule = strength.rules.find(r => !r.test);
    if (weakRule) {
      setError(`Password too weak — ${weakRule.msg.toLowerCase()} required.`);
      return;
    }
    if (form.newPassword === form.tempPassword) {
      setError('New password must differ from your temporary password.');
      return;
    }
    if (form.newPassword !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await forceChangePassword({ newPassword: form.newPassword });
      updateUser({ mustChangePassword: false, isTemporaryPassword: false });
      setSuccess(true);
      setTimeout(() => navigate('/admin', { replace: true }), 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password. Please try again.');
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
        width: '100%', maxWidth: 460,
        background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 24, border: '1px solid rgba(124,58,237,0.2)',
        boxShadow: '0 25px 80px rgba(0,0,0,0.6)', overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '28px 36px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(124,58,237,0.06))',
          textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #7C3AED, #9333ea)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 18px rgba(124,58,237,0.5)',
          }}>
            <AdminPanelSettingsIcon sx={{ fontSize: 28, color: '#fff' }} />
          </div>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: 20, margin: 0 }}>Admin Account Setup</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '6px 0 0' }}>
            Welcome, {user?.name?.split(' ')[0]}. As {roleLabel}, you must set a secure password before accessing the dashboard.
          </p>
        </div>

        {/* Role badge */}
        <div style={{ padding: '14px 36px 0', display: 'flex', justifyContent: 'center' }}>
          <span style={{
            background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
            color: '#c4b5fd', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600,
          }}>
            {roleLabel}
          </span>
        </div>

        {/* Form */}
        <div style={{ padding: '20px 36px 32px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
              <p style={{ color: '#a78bfa', fontWeight: 700, fontSize: 15, margin: 0 }}>Password updated successfully!</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 6 }}>Redirecting to admin dashboard…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: 9, fontSize: 12.5,
                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#fca5a5', display: 'flex', gap: 8, alignItems: 'flex-start',
                }}>
                  <span style={{ flexShrink: 0 }}>⚠</span> {error}
                </div>
              )}

              <DarkInput
                label="Temporary Password"
                type={show.temp ? 'text' : 'password'}
                value={form.tempPassword}
                onChange={e => setForm(p => ({ ...p, tempPassword: e.target.value }))}
                placeholder="Your temporary password"
                suffix={{ onClick: () => setShow(s => ({ ...s, temp: !s.temp })), icon: <EyeIcon open={show.temp} /> }}
              />

              <div>
                <DarkInput
                  label="New Password"
                  type={show.new ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Min 8 chars, uppercase, number, symbol"
                  suffix={{ onClick: () => setShow(s => ({ ...s, new: !s.new })), icon: <EyeIcon open={show.new} /> }}
                />
                {form.newPassword && (
                  <>
                    <StrengthBar passed={strength.passed} total={strength.total} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 8 }}>
                      {strength.rules.map(r => (
                        <span key={r.msg} style={{ fontSize: 11, color: r.test ? '#a78bfa' : 'rgba(255,255,255,0.3)' }}>
                          {r.test ? '✓' : '○'} {r.msg}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <DarkInput
                label="Confirm New Password"
                type={show.confirm ? 'text' : 'password'}
                value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                placeholder="Repeat new password"
                suffix={{ onClick: () => setShow(s => ({ ...s, confirm: !s.confirm })), icon: <EyeIcon open={show.confirm} /> }}
              />

              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '12px 0', border: 'none', borderRadius: 10, marginTop: 4,
                  background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7C3AED, #9333ea)',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 24px rgba(124,58,237,0.45)',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Saving…' : 'Set Password & Access Dashboard'}
              </button>

              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 11.5, margin: 0 }}>
                Admin accounts cannot reset passwords via email. Contact Super Admin if locked out.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFirstLoginPage;

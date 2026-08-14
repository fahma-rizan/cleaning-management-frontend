import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import LockIcon               from '@mui/icons-material/Lock';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import OtpVerifyForm          from '../components/auth/OtpVerifyForm';
import * as authService       from '../services/authService';

const OTP_DURATION = 600;

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

const LightInput = ({ type, value, onChange, placeholder, autoComplete, suffix }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        autoComplete={autoComplete} required
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: suffix ? '11px 42px 11px 14px' : '11px 14px',
          background: '#F3F3F5',
          border: focused ? '1.5px solid #7C3AED' : '1.5px solid transparent',
          borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none',
          transition: 'border-color 0.18s, box-shadow 0.18s',
          boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none',
        }}
      />
      {suffix && (
        <button
          type="button" onClick={suffix.onClick}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#9CA3AF', display: 'flex', alignItems: 'center', padding: 0,
          }}
        >
          {suffix.icon}
        </button>
      )}
    </div>
  );
};

const OTP_ERROR_KEYWORDS = ['otp', 'expired', 'invalid code', 'invalid or expired', 'verification code'];

const isOtpError = (msg) => OTP_ERROR_KEYWORDS.some(kw => msg.toLowerCase().includes(kw));

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email    = location.state?.email || '';

  const [step, setStep]               = useState('otp');
  const [verifiedOtp, setVerifiedOtp] = useState('');
  const [passwords, setPasswords]     = useState({ newPassword: '', confirm: '' });
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [otpError, setOtpError]       = useState('');
  const [passError, setPassError]     = useState('');
  const [timeLeft, setTimeLeft]       = useState(OTP_DURATION);

  useEffect(() => {
    if (!email) { navigate('/forgot-password'); }
  }, [email, navigate]);

  useEffect(() => {
    if (step !== 'otp' || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, step]);

  const expired = timeLeft <= 0 && step === 'otp';

  const handleOtpSubmit = ({ otp }) => {
    setOtpError('');
    setPassError('');
    setVerifiedOtp(otp);
    setStep('password');
  };

  const handleResend = async () => {
    try {
      await authService.forgotPassword(email);
      setOtpError('');
      setTimeLeft(OTP_DURATION);
    } catch {
      setOtpError('Could not resend OTP. Please try again.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) { setPassError('Passwords do not match'); return; }
    if (passwords.newPassword.length < 8) { setPassError('Password must be at least 8 characters'); return; }
    setLoading(true); setPassError('');
    try {
      await authService.resetPassword({ email, otp: verifiedOtp, newPassword: passwords.newPassword });
      setStep('success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. Please try again.';
      if (isOtpError(msg)) {
        setStep('otp');
        setOtpError(msg);
      } else {
        setPassError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#eef0fb',
      padding: '24px 16px', fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Brand header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', margin: '0 auto 14px',
          background: step === 'success'
            ? 'linear-gradient(135deg, #059669, #10b981)'
            : '#7C3AED',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: step === 'success'
            ? '0 4px 18px rgba(16,185,129,0.35)'
            : '0 4px 18px rgba(124,58,237,0.35)',
        }}>
          {step === 'success'
            ? <CheckCircleOutlineIcon sx={{ fontSize: 30, color: '#fff' }} />
            : <LockIcon sx={{ fontSize: 26, color: '#fff' }} />
          }
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: 1, textTransform: 'uppercase' }}>
          Cloud Laundry.lk
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#6B7280' }}>
          {step === 'otp' && 'Enter your verification code'}
          {step === 'password' && 'Choose a new password'}
          {step === 'success' && 'Password updated successfully'}
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

        {step === 'otp' && (
          <>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7C3AED', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', marginBottom: 24 }}>
              ← Back to Sign In
            </Link>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>Enter verification code</h2>
              <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#6B7280' }}>
                Code sent to {email}
              </p>
            </div>
            <OtpVerifyForm
              email={email}
              onSubmit={handleOtpSubmit}
              onResend={handleResend}
              loading={false}
              error={otpError}
              timeLeft={timeLeft}
              expired={expired}
            />
          </>
        )}

        {step === 'password' && (
          <>
            <button
              type="button"
              onClick={() => { setStep('otp'); setPassError(''); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                color: '#7C3AED', fontSize: 13.5, fontWeight: 600,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 24,
              }}
            >
              ← Back to OTP
            </button>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>Set new password</h2>
              <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#6B7280' }}>
                Choose a strong password for your account
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {passError && (
                <div style={{
                  padding: '10px 14px', borderRadius: 9, fontSize: 13,
                  background: '#FEF2F2', border: '1px solid #FECACA',
                  color: '#DC2626', display: 'flex', gap: 8,
                }}>
                  <span>⚠</span> {passError}
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>
                  New Password
                </label>
                <LightInput
                  type={showPass ? 'text' : 'password'}
                  value={passwords.newPassword}
                  onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                  suffix={{ onClick: () => setShowPass(p => !p), icon: <EyeIcon open={showPass} /> }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>
                  Confirm Password
                </label>
                <LightInput
                  type={showConfirm ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  suffix={{ onClick: () => setShowConfirm(p => !p), icon: <EyeIcon open={showConfirm} /> }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px 0', border: 'none', borderRadius: 8, marginTop: 4,
                  background: loading ? 'rgba(124,58,237,0.5)' : '#7C3AED',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(124,58,237,0.35)',
                  transition: 'background 0.18s',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#6D28D9'; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#7C3AED'; }}
              >
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '16px', borderRadius: 12, background: '#F0FDF4', border: '1px solid #86efac' }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#16A34A' }}>
                Password reset successful!
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#6B7280' }}>
                Your password has been updated. You can now sign in with your new password.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%', padding: '13px 0', border: 'none', borderRadius: 8,
                background: '#7C3AED', color: '#fff', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#6D28D9'}
              onMouseLeave={e => e.currentTarget.style.background = '#7C3AED'}
            >
              Go to Sign In
            </button>
          </div>
        )}
      </div>

      {step !== 'success' && (
        <p style={{ marginTop: 20, fontSize: 13, color: '#9CA3AF' }}>
          <Link to="/login" style={{ color: '#9CA3AF', textDecoration: 'none' }}>
            Back to Login
          </Link>
        </p>
      )}
    </div>
  );
};

export default ResetPasswordPage;

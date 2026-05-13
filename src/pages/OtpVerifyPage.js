import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import OtpVerifyForm    from '../components/auth/OtpVerifyForm';
import * as authService from '../services/authService';

const OTP_DURATION = 600;

const OtpVerifyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email    = location.state?.email || '';

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(OTP_DURATION);

  useEffect(() => {
    if (!email) { navigate('/register'); }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const expired = timeLeft <= 0;

  const handleSubmit = async (data) => {
    setLoading(true); setError('');
    try {
      await authService.verifyEmail(data);
      setSuccess('Email verified! Redirecting to sign in…');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.forgotPassword(email);
      setError('');
      setTimeLeft(OTP_DURATION);
      setSuccess('A new code has been sent to your email.');
      setTimeout(() => setSuccess(''), 4000);
    } catch {
      setError('Could not resend OTP. Please try again.');
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
          background: '#7C3AED',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 18px rgba(124,58,237,0.35)',
        }}>
          <MarkEmailReadIcon sx={{ fontSize: 30, color: '#fff' }} />
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: 1, textTransform: 'uppercase' }}>
          Cloud Laundry.lk
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#6B7280' }}>
          Verify your email address
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
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>Check your email</h2>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#6B7280' }}>
            Enter the 6-digit code we sent to verify your account
          </p>
        </div>

        {success && (
          <div style={{
            marginBottom: 16, padding: '10px 14px', borderRadius: 9, fontSize: 13,
            background: '#F0FDF4', border: '1px solid #86efac', color: '#16A34A', textAlign: 'center',
          }}>
            ✓ {success}
          </div>
        )}

        <OtpVerifyForm
          email={email}
          onSubmit={handleSubmit}
          onResend={handleResend}
          loading={loading}
          error={error}
          timeLeft={timeLeft}
          expired={expired}
        />
      </div>

      <p style={{ marginTop: 20, fontSize: 13, color: '#9CA3AF' }}>
        <Link to="/register" style={{ color: '#9CA3AF', textDecoration: 'none' }}>
          ← Back to Register
        </Link>
      </p>
    </div>
  );
};

export default OtpVerifyPage;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import * as authService from '../services/authService';
import logoImg from '../imports/Gemini_Generated_Image_f8k5uhf8k5uhf8k5.png';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const result = await authService.register({ ...data, role: 'customer' });
      navigate('/verify-email', { state: { email: result.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        <img
          src={logoImg}
          alt="Cloud Laundry"
          style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 12, borderRadius: 12, background: '#fff', padding: 6 }}
        />
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: 1, textTransform: 'uppercase' }}>
          Cloud Laundry.lk
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#6B7280' }}>
          Join thousands of customers across Sri Lanka
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 560,
        background: '#ffffff',
        borderRadius: 18,
        boxShadow: '0 4px 32px rgba(100,80,180,0.10)',
        padding: '32px 36px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>Create your account</h2>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#6B7280' }}>
            Fill in your details to get started
          </p>
        </div>

        <RegisterForm onSubmit={handleSubmit} loading={loading} error={error} />
      </div>

      <p style={{ marginTop: 20, fontSize: 11.5, color: '#9CA3AF', textAlign: 'center' }}>
        By creating an account you agree to our{' '}
        <Link to="/terms" style={{ color: '#7C3AED', textDecoration: 'none' }}>Terms of Service</Link>
        {' '}&amp;{' '}
        <Link to="/privacy" style={{ color: '#7C3AED', textDecoration: 'none' }}>Privacy Policy</Link>
      </p>
    </div>
  );
};

export default RegisterPage;

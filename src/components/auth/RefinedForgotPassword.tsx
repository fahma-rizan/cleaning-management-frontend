import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Key, ArrowLeft } from 'lucide-react';
import { BrandHeader, AuthCard, AuthInput, AuthButton, AlertBanner, StaffFooter } from './AuthShared';

export default function RefinedForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (email === 'admin@cloudlaundry.lk') {
        setError('Email not found or password reset is not available for this account type.');
        setIsLoading(false);
      } else {
        navigate('/verify-reset-code');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex flex-col items-center justify-center p-6">
      <BrandHeader subtitle="Reset your account password" />

      <AuthCard className="relative">
        <button 
          onClick={() => navigate('/login')}
          className="absolute left-6 top-6 text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </button>

        <div className="flex flex-col items-center mt-8 mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center mb-4 text-white">
            <Key size={24} />
          </div>
          <h2 className="text-20px font-semibold text-[#111827]">Forgot Password?</h2>
          <p className="text-sm text-[#6B7280] mt-1 text-center">Enter your registered email and we'll send you a reset code</p>
        </div>

        {error && <AlertBanner type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthInput
            label="Email Address"
            type="email"
            placeholder="Enter your registered email"
            leftIcon={<Mail size={18} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <AuthButton type="submit" isLoading={isLoading}>
            Send Reset Code
          </AuthButton>
        </form>
      </AuthCard>

      <StaffFooter />
    </div>
  );
}
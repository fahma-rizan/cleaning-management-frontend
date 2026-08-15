import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { BrandHeader, AuthCard, AuthButton, AlertBanner, StaffFooter } from './AuthShared';

export default function RefinedVerifyResetCode() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.join('').length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    const email = sessionStorage.getItem('resetEmail');
    if (!email) {
      setError('Session expired. Please start again from Forgot Password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp.join('') }),
      });

      const data = await response.json();

      if (data.success) {
        navigate('/reset-password');
      } else {
        setError(data.message || 'Invalid code. Please try again.');
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    const email = sessionStorage.getItem('resetEmail');
    if (!email) return;
    setOtp(['', '', '', '', '', '']);
    setError('');
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      alert('A new verification code has been sent to your email!');
    } catch {
      setError('Cannot connect to server. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex flex-col items-center justify-center p-6">
      <BrandHeader subtitle="Verify your identity" />

      <AuthCard className="relative">
        <button 
          onClick={() => navigate('/forgot-password')}
          className="absolute left-6 top-6 text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex flex-col items-center mt-8 mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center mb-4 text-white">
            <Shield size={24} />
          </div>
          <h2 className="text-20px font-semibold text-[#111827]">Enter Verification Code</h2>
          <p className="text-sm text-[#6B7280] mt-1 text-center">
            We've sent a 6-digit code to jo***@gmail.com
          </p>
        </div>

        {error && <AlertBanner type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2 mb-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-12 rounded-lg border-[1.5px] border-[#E5E7EB] outline-none text-center text-lg font-bold focus:border-[#7C3AED] transition-colors"
              />
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-[#6B7280]">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResendCode}
                className="text-[#7C3AED] hover:text-[#6D28D9] font-medium transition-colors"
              >
                Resend Code
              </button>
            </p>
          </div>

          <AuthButton type="submit" isLoading={isLoading}>
            Verify Code
          </AuthButton>
        </form>
      </AuthCard>

      <StaffFooter />
    </div>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { BrandHeader, AuthCard, AuthButton, AlertBanner, StaffFooter } from './AuthShared';

// Matches the backend's actual OTP expiry window (controllers/authController.js
// sets otpExpiry 10 minutes out) — this is a real countdown, not decoration.
const OTP_LIFETIME_SECONDS = 10 * 60;

export default function RefinedOTPVerify() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(OTP_LIFETIME_SECONDS);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const email = sessionStorage.getItem('pendingEmail') || '';
  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : 'your email';

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const expired = secondsLeft <= 0;

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    if (!email) {
      setError('Session expired. Please register again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await response.json();

      if (data.success) {
        // FIX: this used to store the token and call onLogin here, which
        // auto-logged the customer in immediately after verifying — so by
        // the time they hit the success screen's "Go to Sign In" button,
        // the /login route saw an already-logged-in user and redirected
        // straight to /dashboard instead of showing the sign-in form.
        // Registration should end at sign-in, not skip it, so we no longer
        // authenticate here at all — just send them to the success screen.
        sessionStorage.removeItem('pendingEmail');
        setSuccess('Email verified successfully!');
        setTimeout(() => navigate('/success?type=registration'), 1000);
      } else {
        setError(data.message || 'Invalid code. Please try again.');
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setError('');
    setOtp(['', '', '', '', '', '']);

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        setSecondsLeft(OTP_LIFETIME_SECONDS);
        setSuccess('New OTP sent to your email!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex flex-col items-center justify-center p-6">
      <BrandHeader subtitle="Verify your email address" />

      <AuthCard
        icon={<MailCheck size={24} />}
        title="Check your email"
        subtitle="Enter the 6-digit code we sent to verify your account"
      >
        {success && <AlertBanner type="success" message={success} />}
        {error && <AlertBanner type="error" message={error} />}

        <p className="text-sm text-[#6B7280] text-center -mt-2 mb-6">
          We sent a 6-digit code to <span className="font-semibold text-[#374151]">{maskedEmail}</span>.
        </p>

        <p className={`text-center text-xs font-semibold mb-6 ${expired ? 'text-[#DC2626]' : 'text-[#9CA3AF]'}`}>
          {expired ? 'Code expired' : `Expires in ${mm}:${ss}`}
        </p>

        <div className="flex justify-center gap-2 mb-8">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              disabled={expired}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`
                w-12 h-14 rounded-lg border-[1.5px] outline-none text-center text-xl font-bold transition-all
                ${digit ? 'border-[#7C3AED] bg-purple-50' : 'border-[#E5E7EB] bg-white'}
                focus:border-[#7C3AED] focus:ring-4 focus:ring-purple-500/10
                disabled:opacity-50 disabled:cursor-not-allowed
                ${error ? 'border-[#DC2626]' : ''}
              `}
            />
          ))}
        </div>

        <AuthButton onClick={handleVerify} isLoading={isLoading} disabled={expired}>
          Verify Code
        </AuthButton>

        <div className="text-center mt-6">
          <p className="text-sm text-[#6B7280]">
            Didn't receive it?{' '}
            <button
              onClick={handleResend}
              className="text-[#7C3AED] font-bold hover:underline"
            >
              Resend OTP
            </button>
          </p>
        </div>
      </AuthCard>

      <StaffFooter />
    </div>
  );
}

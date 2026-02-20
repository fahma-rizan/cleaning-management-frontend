import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { BrandHeader, AuthCard, AuthButton, AlertBanner, StaffFooter } from './AuthShared';

export default function RefinedOTPVerify() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(60);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (code === '123456') {
        setSuccess('Email verified successfully!');
        setTimeout(() => navigate('/success?type=registration'), 1000);
      } else {
        setError('Invalid code. Please try again.');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex flex-col items-center justify-center p-6">
      <BrandHeader 
        subtitle="Verify your email to complete registration"
      />

      <AuthCard 
        icon={<Mail size={24} />}
        title="Verify Your Email"
        subtitle="We've sent a 6-digit code to jo***@gmail.com"
      >
        {success && <AlertBanner type="success" message={success} />}
        {error && <AlertBanner type="error" message={error} />}

        <div className="flex justify-center gap-2 mb-8">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputs.current[idx] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`
                w-12 h-14 rounded-lg border-[1.5px] outline-none text-center text-xl font-bold transition-all
                ${digit ? 'border-[#7C3AED] bg-purple-50' : 'border-[#E5E7EB] bg-white'}
                focus:border-[#7C3AED] focus:ring-4 focus:ring-purple-500/10
                ${error ? 'border-[#DC2626] animate-shake' : ''}
              `}
            />
          ))}
        </div>

        <div className="text-center mb-8">
          <p className="text-sm text-[#6B7280]">
            Resend OTP{' '}
            {timer > 0 ? (
              <span className="text-[#6B7280] font-medium">(Resend in 00:{timer.toString().padStart(2, '0')})</span>
            ) : (
              <button 
                onClick={() => setTimer(60)}
                className="text-[#7C3AED] font-bold hover:underline"
              >
                Resend now
              </button>
            )}
          </p>
        </div>

        <AuthButton onClick={handleVerify} isLoading={isLoading}>
          Verify & Continue
        </AuthButton>
      </AuthCard>

      <StaffFooter />
    </div>
  );
}

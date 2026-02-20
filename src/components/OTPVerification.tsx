import { useState, useEffect, KeyboardEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Sparkles, CheckCircle } from 'lucide-react';
import BackButton from './BackButton';
import type { User } from '../types';

interface OTPVerificationProps {
  onVerify: (user: User) => void;
}

export default function OTPVerification({ onVerify }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    // Mock OTP verification - accept any 6 digits for demo
    if (otpValue.length === 6) {
      setSuccess(true);
      
      setTimeout(() => {
        const pendingUserData = localStorage.getItem('pendingUser');
        if (pendingUserData) {
          localStorage.removeItem('pendingUser');
          navigate('/verify-success');
        } else {
          navigate('/verify-success');
        }
      }, 1500);
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleResend = () => {
    setResendTimer(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
    // In real app, would call API to resend OTP
    alert('OTP resent to your email!');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-500 dark:bg-green-600 p-4 rounded-full">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Verification Successful!</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Your account has been verified successfully.</p>
          
          <button
            onClick={() => navigate('/verify-success')}
            className="w-full bg-purple-600 dark:bg-purple-700 text-white py-3 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors font-medium"
          >
            Continue
          </button>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">You will be redirected automatically in a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8">
        <BackButton />
        
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 dark:bg-blue-700 p-3 rounded-full">
            <Mail className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">Verify Your Email</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
          We've sent a 6-digit code to your email. Please enter it below.
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6 text-red-700 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex gap-3 justify-center mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Verify Email
          </button>
        </form>

        <div className="mt-6 text-center">
          {resendTimer > 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              Resend OTP in <span className="text-purple-600 dark:text-purple-400">{resendTimer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              Resend OTP
            </button>
          )}
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 text-center">
          <p>Demo: Enter any 6 digits to verify</p>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, KeyboardEvent, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, CheckCircle, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const resetEmail = localStorage.getItem('resetEmail');

  useEffect(() => {
    // Only check for resetEmail if not on success screen
    if (!success && !resetEmail) {
      navigate('/forgot-password');
    }

    if (!success) {
      const timer = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resetEmail, navigate, success]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`reset-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`reset-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    // Mock OTP verification - accept any 6 digits for demo
    if (otpValue.length === 6) {
      setOtpVerified(true);
      setError('');
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Password validation: 8+ characters, symbol, number, uppercase, lowercase
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, number, and symbol (@$!%*?&)');
      return;
    }

    setLoading(true);

    // Mock password reset - in real app, this would call backend API
    setTimeout(() => {
      setSuccess(true);
      localStorage.removeItem('resetEmail');
    }, 1000);
  };

  const handleResend = () => {
    setResendTimer(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
    // In real app, would call API to resend OTP
    alert('OTP resent to ' + resetEmail);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-500 p-4 rounded-full">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Password Reset Successful!</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Your password has been reset successfully. You can now login with your new password.
          </p>
          
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-8">
            <p className="text-green-700 dark:text-green-300 font-medium text-lg">
              ✓ Password Updated Successfully
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              Click the button below to proceed to login
            </p>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full bg-purple-600 text-white py-4 rounded-lg hover:bg-purple-700 transition-colors font-bold text-lg shadow-lg"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8">
        <Link 
          to="/forgot-password" 
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Link>
        
        <div className="flex justify-center mb-6">
          <div className="bg-purple-600 dark:bg-purple-700 p-3 rounded-full">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">Reset Password</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
          {!otpVerified 
            ? `We've sent a 6-digit code to ${resetEmail}` 
            : 'Enter your new password'}
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6 flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {!otpVerified ? (
          <form onSubmit={handleVerifyOtp}>
            <div className="flex gap-3 justify-center mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`reset-otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Verify Code
            </button>

            <div className="mt-6 text-center">
              {resendTimer > 0 ? (
                <p className="text-gray-600 dark:text-gray-300">
                  Resend code in <span className="text-purple-600 dark:text-purple-400 font-semibold">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  Resend Code
                </button>
              )}
            </div>

            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-sm text-gray-600 dark:text-gray-300 text-center">
              <p>Demo: Enter any 6 digits to verify</p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Must be 8+ characters with uppercase, lowercase, number & symbol
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400 font-medium"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
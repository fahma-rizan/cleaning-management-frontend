import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, Lock } from 'lucide-react';
import type { FormEvent } from 'react';

export default function ForgotPassword() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Default demo email
  const defaultEmail = 'demo@cloudlaundry.lk';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Mock OTP sending - in real app, this would call backend API
    setTimeout(() => {
      // Store email for password reset
      localStorage.setItem('resetEmail', defaultEmail);
      navigate('/reset-password');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Login</span>
        </Link>
        
        <div className="flex justify-center mb-6">
          <div className="bg-purple-600 dark:bg-purple-700 p-3 rounded-full">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">Reset Password</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
          Click the button below to receive a verification code to reset your password.
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6 flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display default email */}
          <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">OTP will be sent to:</p>
                <p className="font-medium text-gray-900 dark:text-white">{defaultEmail}</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400 font-medium"
          >
            {loading ? 'Sending Code...' : 'Send Verification Code'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Remember your password?{' '}
            <Link to="/login" className="text-purple-600 dark:text-purple-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-sm text-gray-600 dark:text-gray-300 text-center">
          <p className="mb-2"><strong>Demo Mode:</strong> Password reset for demo account</p>
          <p className="text-xs">Click "Send Verification Code" to proceed to OTP verification</p>
        </div>
      </div>
    </div>
  );
}
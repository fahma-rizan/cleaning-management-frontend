import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { BrandHeader, AuthCard, AuthInput, AuthButton, AlertBanner, StaffFooter } from './AuthShared';

export default function RefinedResetPassword() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errors: Record<string, string> = {};

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const email = sessionStorage.getItem('resetEmail');
    if (!email) {
      setError('Session expired. Please start again from Forgot Password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: formData.password }),
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.removeItem('resetEmail');
        navigate('/success?type=passwordReset');
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex flex-col items-center justify-center p-6">
      <BrandHeader subtitle="Choose a new password" />

      <AuthCard className="relative">
        <button
          onClick={() => navigate('/verify-reset-code')}
          className="absolute left-6 top-6 text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Back to OTP
        </button>

        <div className="flex flex-col items-center mt-8 mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center mb-4 text-white">
            <Lock size={24} />
          </div>
          <h2 className="text-[20px] font-semibold text-[#111827]">Set new password</h2>
          <p className="text-sm text-[#6B7280] mt-1 text-center">
            Choose a strong password for your account
          </p>
        </div>

        {error && <AlertBanner type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthInput
            label="New Password"
            type={showPass ? "text" : "password"}
            placeholder="Min 8 characters"
            leftIcon={<Lock size={18} />}
            rightIcon={showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            onClickRightIcon={() => setShowPass(!showPass)}
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            error={fieldErrors.password}
            required
          />

          <AuthInput
            label="Confirm Password"
            type={showConfirmPass ? "text" : "password"}
            placeholder="Repeat password"
            leftIcon={<Lock size={18} />}
            rightIcon={showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
            onClickRightIcon={() => setShowConfirmPass(!showConfirmPass)}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            error={fieldErrors.confirmPassword}
            required
          />

          <div className="bg-[#F3F4F6] rounded-lg p-4 border border-[#E5E7EB]">
            <p className="text-xs text-[#6B7280] font-medium mb-2">Password must contain:</p>
            <ul className="space-y-1 text-xs text-[#6B7280]">
              <li className="flex items-center gap-2">
                <span className={`w-1 h-1 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                At least 8 characters
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-1 h-1 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                One uppercase letter
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-1 h-1 rounded-full ${/[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                One number
              </li>
            </ul>
          </div>

          <AuthButton type="submit" isLoading={isLoading}>
            Reset Password
          </AuthButton>
        </form>
      </AuthCard>

      <StaffFooter />
    </div>
  );
}

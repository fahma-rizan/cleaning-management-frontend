import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Lock, Eye, EyeOff, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { BrandHeader, AuthCard, AuthInput, AuthButton, AlertBanner, StaffFooter } from './AuthShared';
import { useApp } from '../../context';

export default function StaffFirstLogin() {
  const navigate = useNavigate();
  const { user, setUser } = useApp();

  const [showTempPass, setShowTempPass]     = useState(false);
  const [showNewPass, setShowNewPass]       = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isLoading, setIsLoading]           = useState(false);
  const [error, setError]                   = useState('');
  const [fieldErrors, setFieldErrors]       = useState<Record<string, string>>({});
  const [readyToNavigate, setReadyToNavigate] = useState(false);

  // Navigate only AFTER setUser has committed (avoids race with route guard)
  useEffect(() => {
    if (readyToNavigate && user && !user.requiresPasswordChange) {
      navigate('/staff', { replace: true });
    }
  }, [user?.requiresPasswordChange, readyToNavigate]);

  const [formData, setFormData] = useState({
    temp:    '',
    newPass: '',
    confirm: '',
  });

  // ── Password strength ──────────────────────────────────────────────────────
  const getPasswordStrength = (password: string) => {
    const checks = {
      length:    password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number:    /[0-9]/.test(password),
      special:   /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    const strength = Object.values(checks).filter(Boolean).length;
    return { strength, checks };
  };

  const passwordStrength = getPasswordStrength(formData.newPass);

  const getStrengthColor = () => {
    if (passwordStrength.strength <= 2) return 'bg-red-500';
    if (passwordStrength.strength <= 3) return 'bg-yellow-500';
    if (passwordStrength.strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength.strength <= 2) return 'Weak';
    if (passwordStrength.strength <= 3) return 'Fair';
    if (passwordStrength.strength <= 4) return 'Good';
    return 'Strong';
  };

  // ── Form submit → calls backend ────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors: Record<string, string> = {};

    if (!formData.temp) {
      errors.temp = 'Temporary password is required';
    }
    if (!formData.newPass) {
      errors.newPass = 'New password is required';
    } else if (formData.newPass.length < 8) {
      errors.newPass = 'Password must be at least 8 characters';
    } else if (passwordStrength.strength < 3) {
      errors.newPass = 'Password is too weak. Please choose a stronger password';
    }
    if (!formData.confirm) {
      errors.confirm = 'Please confirm your new password';
    } else if (formData.newPass !== formData.confirm) {
      errors.confirm = 'Passwords do not match';
    }
    if (formData.temp && formData.newPass && formData.temp === formData.newPass) {
      errors.newPass = 'New password must be different from the temporary password';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/staff-change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:       user?.email,
          tempPassword: formData.temp,
          newPassword:  formData.newPass,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Save new token and updated user to localStorage
        localStorage.setItem('token', data.token);
        const updatedUser = { ...user, requiresPasswordChange: false };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Update context — the useEffect above will navigate once committed
        setUser(updatedUser as typeof user);
        setReadyToNavigate(true);
      } else {
        setError(data.message || 'Failed to change password. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex flex-col items-center justify-center p-6">
      <BrandHeader subtitle="Staff portal — first time setup" />

      <AuthCard className="relative">
        <div className="flex flex-col items-center mt-8 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center mb-4 text-white shadow-lg shadow-purple-200">
            <Key size={28} />
          </div>
          <h2 className="text-[20px] font-semibold text-[#111827]">First Time Login</h2>
          <p className="text-sm text-[#6B7280] mt-1 text-center max-w-sm">
            Welcome! Please set a new password to secure your account
          </p>
        </div>

        <div className="p-4 bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] border border-[#F59E0B] rounded-lg mb-6 flex items-start gap-3">
          <AlertTriangle size={20} className="text-[#92400E] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#92400E] mb-1">Action Required</p>
            <p className="text-xs text-[#92400E]">
              You are logging in for the first time. Please change your temporary password (<strong>staff123</strong>) to continue.
            </p>
          </div>
        </div>

        {error && <AlertBanner type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthInput
            label="Temporary Password"
            type={showTempPass ? 'text' : 'password'}
            placeholder="Enter: staff123"
            leftIcon={<Lock size={18} />}
            rightIcon={showTempPass ? <EyeOff size={18} /> : <Eye size={18} />}
            onClickRightIcon={() => setShowTempPass(!showTempPass)}
            value={formData.temp}
            onChange={(e) => setFormData({ ...formData, temp: e.target.value })}
            error={fieldErrors.temp}
            required
          />

          <div className="h-px bg-[#E5E7EB] w-full my-6" />

          <AuthInput
            label="New Password"
            type={showNewPass ? 'text' : 'password'}
            placeholder="Create a strong password"
            leftIcon={<Lock size={18} />}
            rightIcon={showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
            onClickRightIcon={() => setShowNewPass(!showNewPass)}
            value={formData.newPass}
            onChange={(e) => setFormData({ ...formData, newPass: e.target.value })}
            error={fieldErrors.newPass}
            required
          />

          {/* Password strength bar */}
          {formData.newPass && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#6B7280]">Password Strength</span>
                <span className={`text-xs font-bold ${
                  passwordStrength.strength <= 2 ? 'text-red-500' :
                  passwordStrength.strength <= 3 ? 'text-yellow-500' :
                  passwordStrength.strength <= 4 ? 'text-blue-500' : 'text-green-500'
                }`}>
                  {getStrengthText()}
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <div
                    key={bar}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      bar <= passwordStrength.strength ? getStrengthColor() : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          <AuthInput
            label="Confirm New Password"
            type={showConfirmPass ? 'text' : 'password'}
            placeholder="Re-enter your new password"
            leftIcon={<Lock size={18} />}
            rightIcon={showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
            onClickRightIcon={() => setShowConfirmPass(!showConfirmPass)}
            value={formData.confirm}
            onChange={(e) => setFormData({ ...formData, confirm: e.target.value })}
            error={fieldErrors.confirm}
            required
          />

          {/* Requirements checklist */}
          <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
            <p className="text-xs font-semibold text-[#374151] mb-3">Password Requirements</p>
            <div className="space-y-2">
              {[
                { key: 'length',    label: 'At least 8 characters' },
                { key: 'uppercase', label: 'One uppercase letter (A-Z)' },
                { key: 'lowercase', label: 'One lowercase letter (a-z)' },
                { key: 'number',    label: 'One number (0-9)' },
                { key: 'special',   label: 'One special character (!@#$%^&*)' },
              ].map(({ key, label }) => {
                const met = passwordStrength.checks[key as keyof typeof passwordStrength.checks];
                return (
                  <div key={key} className="flex items-center gap-2">
                    {met ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : (
                      <XCircle size={14} className="text-gray-300" />
                    )}
                    <span className={`text-xs ${met ? 'text-green-600' : 'text-[#6B7280]'}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <AuthButton type="submit" isLoading={isLoading}>
            {isLoading ? 'Saving...' : 'Set New Password & Continue'}
          </AuthButton>
        </form>

        <div className="mt-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> After setting your new password, you'll be taken directly to your staff dashboard.
          </p>
        </div>
      </AuthCard>

      <StaffFooter />
    </div>
  );
}

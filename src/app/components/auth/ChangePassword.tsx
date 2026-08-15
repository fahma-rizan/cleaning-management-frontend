import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { BrandHeader, AuthCard, AuthInput, AuthButton, AlertBanner } from './AuthShared';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      
      // After showing success, redirect to login
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F5F3FF] flex flex-col items-center justify-center p-6">
        <BrandHeader />
        <AuthCard className="text-center">
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 rounded-full bg-[#16A34A] flex items-center justify-center mb-6 shadow-lg shadow-green-100">
              <CheckCircle size={36} className="text-white" />
            </div>

            <h2 className="text-[20px] font-bold text-[#111827] mb-2">
              Password Changed Successfully!
            </h2>

            <p className="text-sm text-[#6B7280] mb-10 max-w-[280px]">
              Your password has been updated. Redirecting to login page...
            </p>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex flex-col items-center justify-center p-6">
      <BrandHeader
        title="Change Password"
        subtitle="Update your account password"
      />

      <AuthCard
        icon={<Lock size={24} />}
        title="Change Password"
        subtitle="Enter your current password and new password"
      >
        {error && <AlertBanner type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthInput
            label="Current Password"
            type={showCurrentPassword ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<Lock size={18} />}
            rightIcon={showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            onClickRightIcon={() => setShowCurrentPassword(!showCurrentPassword)}
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
          />

          <AuthInput
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<Lock size={18} />}
            rightIcon={showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            onClickRightIcon={() => setShowNewPassword(!showNewPassword)}
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          />

          <AuthInput
            label="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<Lock size={18} />}
            rightIcon={showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            onClickRightIcon={() => setShowConfirmPassword(!showConfirmPassword)}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />

          <AuthButton type="submit" isLoading={isLoading}>
            Change Password
          </AuthButton>
        </form>

        <div className="mt-8 text-center text-sm text-[#6B7280]">
          <button
            onClick={() => navigate(-1)}
            className="text-[#7C3AED] font-semibold hover:underline"
          >
            Back to Settings
          </button>
        </div>
      </AuthCard>
    </div>
  );
}

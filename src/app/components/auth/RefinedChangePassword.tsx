import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { BrandHeader, AuthCard, AuthInput, AuthButton, AlertBanner, StaffFooter } from './AuthShared';
import { isValidPassword, PASSWORD_RULE } from '../../lib/validation';

export default function RefinedChangePassword() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.current || !formData.newPass) {
      setError('Please fill in all fields.');
      return;
    }
    if (!isValidPassword(formData.newPass)) {
      setError(PASSWORD_RULE);
      return;
    }
    if (formData.newPass !== formData.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword: formData.current, newPassword: formData.newPass }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Password updated successfully!');
        setTimeout(() => navigate('/success?type=passwordChanged'), 1000);
      } else {
        setError(data.message || 'Failed to change password.');
      }
    } catch (err) {
      console.error('Change password error:', err);
      setError('Cannot connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex flex-col items-center justify-center p-6">
      <BrandHeader />

      <AuthCard 
        icon={<Lock size={24} />}
        title="Change Password"
        subtitle="Update your account password"
      >
        {success && <AlertBanner type="success" message={success} />}
        {error && <AlertBanner type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthInput
            label="Current Password"
            type={showPass ? "text" : "password"}
            placeholder="Enter current password"
            leftIcon={<Lock size={18} />}
            autoComplete="current-password"
            value={formData.current}
            onChange={(e) => setFormData({...formData, current: e.target.value})}
          />

          <AuthInput
            label="New Password"
            type={showPass ? "text" : "password"}
            placeholder="Enter new password"
            leftIcon={<Lock size={18} />}
            rightIcon={showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            onClickRightIcon={() => setShowPass(!showPass)}
            autoComplete="new-password"
            value={formData.newPass}
            onChange={(e) => setFormData({...formData, newPass: e.target.value})}
          />

          <AuthInput
            label="Confirm New Password"
            type={showPass ? "text" : "password"}
            placeholder="Confirm new password"
            leftIcon={<Lock size={18} />}
            value={formData.confirm}
            onChange={(e) => setFormData({...formData, confirm: e.target.value})}
          />

          <div className="space-y-3 pt-2">
            <AuthButton type="submit" isLoading={isLoading}>
              Update Password
            </AuthButton>
            <AuthButton variant="secondary" onClick={() => navigate(-1)} type="button">
              Cancel
            </AuthButton>
          </div>
        </form>
      </AuthCard>

      <StaffFooter />
    </div>
  );
}

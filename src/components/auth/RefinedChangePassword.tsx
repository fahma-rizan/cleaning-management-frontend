import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { BrandHeader, AuthCard, AuthInput, AuthButton, AlertBanner, StaffFooter } from './AuthShared';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.current !== 'password123') {
      setError('Current password is incorrect.');
      return;
    }
    if (formData.newPass !== formData.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccess('Password updated successfully!');
      setTimeout(() => navigate('/success?type=passwordChanged'), 1000);
    }, 1500);
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

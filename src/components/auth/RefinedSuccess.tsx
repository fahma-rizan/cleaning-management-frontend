import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { BrandHeader, AuthCard, AuthButton, StaffFooter } from './AuthShared';
import { useApp } from '../../context';

export default function RefinedSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const { user, setUser } = useApp();

  // Clear requiresPasswordChange flag when staff completes password setup
  useEffect(() => {
    if (type === 'passwordSet' && user && user.requiresPasswordChange) {
      const updatedUser = { ...user, requiresPasswordChange: false };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }, [type, user, setUser]);

  const titles: Record<string, string> = {
    registration: "Account Created Successfully!",
    passwordReset: "Password Reset Successfully!",
    passwordChanged: "Password Changed Successfully!",
    passwordSet: "Password Set Successfully!"
  };

  const messages: Record<string, string> = {
    registration: "You will be redirected to the sign in page shortly.",
    passwordReset: "You can now sign in with your new password.",
    passwordChanged: "Your password has been updated successfully.",
    passwordSet: "You can now access your staff dashboard."
  };

  const getRedirectPath = () => {
    if (type === 'passwordSet') return '/staff';
    return '/login';
  };

  const getButtonText = () => {
    if (type === 'passwordSet') return 'Go to Dashboard';
    return 'Go to Sign In';
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex flex-col items-center justify-center p-6">
      <BrandHeader />

      <AuthCard className="text-center">
        <div className="flex flex-col items-center py-4">
          <div className="w-16 h-16 rounded-full bg-[#16A34A] flex items-center justify-center mb-6 shadow-lg shadow-green-100">
            <CheckCircle2 size={36} className="text-white" />
          </div>
          
          <h2 className="text-[20px] font-bold text-[#111827] mb-2">
            {titles[type || 'registration'] || "Success!"}
          </h2>
          
          <p className="text-sm text-[#6B7280] mb-10 max-w-[280px]">
            {messages[type || 'registration'] || "You will be redirected to the sign in page shortly."}
          </p>

          <AuthButton onClick={() => navigate(getRedirectPath(), { replace: true })}>
            {getButtonText()}
          </AuthButton>
        </div>
      </AuthCard>

      <StaffFooter />
    </div>
  );
}
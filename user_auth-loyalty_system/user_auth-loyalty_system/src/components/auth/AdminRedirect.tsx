import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { BrandHeader, AuthCard, AuthButton, StaffFooter } from './AuthShared';

export default function AdminRedirect() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('Admin User');
  const [role, setRole] = useState('Main Admin');

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/admin');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  const roleStyles: Record<string, string> = {
    'Main Admin': 'bg-[#7C3AED] text-white',
    'CS Admin': 'bg-[#2563EB] text-white',
    'Operation Admin': 'bg-[#4F46E5] text-white'
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex flex-col items-center justify-center p-6">
      <BrandHeader />

      <AuthCard className="text-center">
        <div className="flex flex-col items-center py-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center mb-6 text-white shadow-lg shadow-purple-100">
            <ShieldAlert size={24} />
          </div>

          <h2 className="text-[20px] font-semibold text-[#111827] mb-3">
            Welcome back, {adminName}
          </h2>

          <div className={`px-4 py-1.5 rounded-full text-xs font-bold mb-4 ${roleStyles[role] || 'bg-purple-600 text-white'}`}>
            {role}
          </div>

          <p className="text-sm text-[#6B7280] mb-8">
            Redirecting you to your dashboard...
          </p>

          <div className="flex gap-1.5 mb-10">
            <div className="w-2 h-2 rounded-full bg-[#7C3AED] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-[#7C3AED] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-[#7C3AED] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>

          <AuthButton variant="secondary" onClick={() => navigate('/admin')}>
            Go to Dashboard
          </AuthButton>
        </div>
      </AuthCard>

      <StaffFooter />
    </div>
  );
}

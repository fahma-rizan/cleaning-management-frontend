import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { BrandHeader, AuthCard, AuthInput, AuthButton, AlertBanner, StaffFooter } from './AuthShared';

// Google Icon SVG Component
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z" fill="#4285F4"/>
    <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
    <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.82955 3.96409 7.28955V4.95819H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
    <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.28955C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
  </svg>
);

export default function RefinedLogin({ onLogin, theme, onToggleTheme }: { onLogin?: (u: any) => void, theme?: string, onToggleTheme?: () => void }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Demo logic
    setTimeout(() => {
      const email = formData.email.toLowerCase();
      const user = { name: '', email: formData.email, role: '' };
      
      if (email === 'admin@cloudlaundry.lk' && formData.password === 'admin123') {
        user.name = 'Admin User';
        user.role = 'admin';
        if (onLogin) onLogin(user);
        navigate('/admin-redirect');
      } else if (email === 'staff@cloudlaundry.lk' && formData.password === 'staff123') {
        user.name = 'Staff User';
        user.role = 'staff';
        user.requiresPasswordChange = true;
        if (onLogin) onLogin(user);
        navigate('/staff-first-login');
      } else if (formData.password === 'password123') {
        user.name = 'Demo Customer';
        user.role = 'customer';
        if (onLogin) onLogin(user);
        navigate('/dashboard');
      } else {
        setError('Incorrect email or password. Please try again.');
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleGoogleSignIn = () => {
    // Google OAuth sign in simulation
    setIsLoading(true);
    setTimeout(() => {
      // Check if user exists (for demo, simulate user found)
      const existingGoogleUser = true;
      
      if (existingGoogleUser) {
        // User exists - log them in directly
        const user = {
          name: 'John Doe',
          email: 'john.doe@gmail.com',
          role: 'customer'
        };
        if (onLogin) onLogin(user);
        setIsLoading(false);
        navigate('/dashboard');
      } else {
        // New Google user - redirect to complete profile
        setIsLoading(false);
        const googleUser = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@gmail.com'
        };
        navigate('/complete-profile', { state: { googleUser } });
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex flex-col items-center justify-center p-6">
      <BrandHeader subtitle="Sign in to your account" />

      <AuthCard className="relative">
        <button 
          onClick={() => navigate('/')}
          className="absolute left-6 top-6 text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex flex-col items-center mt-4 mb-8">
          <h2 className="text-[22px] font-bold text-[#111827]">CLOUD LAUNDRY.LK</h2>
          <p className="text-sm text-[#6B7280] mt-1">Sign in to your account</p>
        </div>

        {error && <AlertBanner type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthInput
            label="Email"
            type="email"
            placeholder="your@email.com"
            leftIcon={<Mail size={18} />}
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />

          <div className="space-y-1">
            <AuthInput
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              leftIcon={<Lock size={18} />}
              rightIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              onClickRightIcon={() => setShowPassword(!showPassword)}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className={`text-[13px] text-[#7C3AED] font-semibold hover:underline ${error ? 'font-bold scale-105' : ''} transition-all`}
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <AuthButton type="submit" isLoading={isLoading}>
            Sign In
          </AuthButton>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E7EB]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-4 bg-white text-[#9CA3AF] font-bold tracking-widest">OR</span>
          </div>
        </div>

        <AuthButton variant="ghost" onClick={handleGoogleSignIn}>
          <GoogleIcon />
          Continue with Google
        </AuthButton>

        <div className="mt-8 text-center text-sm text-[#6B7280]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#7C3AED] font-semibold hover:underline">
            Sign Up
          </Link>
        </div>
      </AuthCard>

    </div>
  );
}
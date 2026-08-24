import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { BrandHeader, AuthCard, AuthInput, AuthButton, AlertBanner, StaffFooter } from './AuthShared';
import { isValidEmail, isValidPhone, isValidPassword, PASSWORD_RULE } from '../../lib/validation';

// Google Icon SVG Component
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z" fill="#4285F4"/>
    <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
    <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.82955 3.96409 7.28955V4.95819H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
    <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.28955C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
  </svg>
);

export default function RefinedRegister() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    const trimmedName = formData.fullName.trim().replace(/\s+/g, ' ');
    if (!trimmedName) {
      errors.fullName = "This field is required";
    } else if (!trimmedName.includes(' ')) {
      // Backend requires firstName AND lastName separately — a single word
      // can't be split, so catch this here instead of a confusing 400 later.
      errors.fullName = "Please enter your first and last name";
    }
    if (!formData.email) {
      errors.email = "This field is required";
    } else if (!isValidEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.phone) {
      errors.phone = "This field is required";
    } else if (!isValidPhone(formData.phone)) {
      errors.phone = "Enter a valid Sri Lankan phone number (e.g. 0771234567)";
    }
    if (!formData.password) {
      errors.password = "This field is required";
    } else if (!isValidPassword(formData.password)) {
      errors.password = PASSWORD_RULE;
    }
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setError('');

    // Backend still expects firstName/lastName separately — split the single
    // "Full Name" field the same way the rest of the form is presented visually.
    const trimmed = formData.fullName.trim().replace(/\s+/g, ' ');
    const spaceIdx = trimmed.indexOf(' ');
    const firstName = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
    const lastName = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx + 1);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Save email so OTP verify page knows which account to verify
        sessionStorage.setItem('pendingEmail', formData.email);
        navigate('/otp-verify');
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    // Google OAuth - to be implemented later
    setError('Google Sign-Up coming soon. Please use email and password.');
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex flex-col items-center justify-center p-6">
      <BrandHeader
        title="CLOUD LAUNDRY.LK"
        subtitle="Join thousands of customers across Sri Lanka"
      />

      <AuthCard
        title="Create your account"
        subtitle="Fill in your details to get started"
        className="max-w-[480px]"
      >
        {error && <AlertBanner type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AuthInput
              label="Full Name"
              placeholder="Jane Doe"
              leftIcon={<User size={18} />}
              name="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              error={fieldErrors.fullName}
            />

            <AuthInput
              label="Phone Number"
              placeholder="0771234567"
              leftIcon={<Phone size={18} />}
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={fieldErrors.phone}
            />
          </div>

          <AuthInput
            label="Email Address"
            placeholder="you@example.com"
            leftIcon={<Mail size={18} />}
            name="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={fieldErrors.email}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <AuthInput
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 characters"
                leftIcon={<Lock size={18} />}
                rightIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                onClickRightIcon={() => setShowPassword(!showPassword)}
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={fieldErrors.password}
              />
              {!fieldErrors.password && (
                <p className="text-xs text-[#9CA3AF] mt-1 ml-0.5">{PASSWORD_RULE}</p>
              )}
            </div>

            <AuthInput
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repeat password"
              leftIcon={<Lock size={18} />}
              rightIcon={showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              onClickRightIcon={() => setShowConfirmPassword(!showConfirmPassword)}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={fieldErrors.confirmPassword}
            />
          </div>

          <AuthButton type="submit" isLoading={isLoading}>
            Create Account
          </AuthButton>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <span className="text-xs font-medium text-[#9CA3AF]">OR</span>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
        </div>

        <AuthButton type="button" variant="ghost" onClick={handleGoogleSignUp} className="gap-3">
          <GoogleIcon />
          Sign up with Google
        </AuthButton>

        <div className="mt-6 text-center text-sm text-[#6B7280]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#7C3AED] font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </AuthCard>

      <p className="max-w-[480px] text-center text-xs text-[#9CA3AF] mt-6 px-6">
        By creating an account you agree to our{' '}
        <span className="text-[#7C3AED] font-medium cursor-pointer hover:underline">Terms of Service</span>
        {' '}&amp;{' '}
        <span className="text-[#7C3AED] font-medium cursor-pointer hover:underline">Privacy Policy</span>
      </p>

      <StaffFooter />
    </div>
  );
}

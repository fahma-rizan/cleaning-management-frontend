import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, Lock, CheckCircle2, CheckSquare, Square, Sparkles } from 'lucide-react';
import { AuthInput, AuthButton, AlertBanner } from './AuthShared';
import logo from 'figma:asset/d0e24839a24076173960597a25c12b48f3330fdf.png';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get Google user data from navigation state
  const googleUser = location.state?.googleUser || {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@gmail.com'
  };

  const [formData, setFormData] = useState({
    phone: '',
    agree: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const validatePhone = () => {
    if (!formData.phone) {
      setPhoneError('Phone number is required');
      return false;
    }
    // Basic validation for Sri Lankan phone numbers
    const phoneRegex = /^(\+94|0)?7[0-9]{8}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      setPhoneError('Please enter a valid Sri Lankan phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePhone()) return;

    if (!formData.agree) {
      setError('Please agree to the Terms & Conditions to continue');
      return;
    }

    setIsLoading(true);

    // Simulate profile completion
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to OTP verification or dashboard
      navigate('/otp-verify', {
        state: {
          email: googleUser.email,
          name: `${googleUser.firstName} ${googleUser.lastName}`,
          phone: formData.phone,
          fromGoogle: true
        }
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F0EEFF] flex flex-col items-center justify-center p-6">
      {/* Logo Header */}
      <div className="mb-8 flex flex-col items-center">
        <img 
          src={logo} 
          alt="Cloud Laundry Logo" 
          className="w-24 h-24 object-contain mb-4"
        />
        <h1 className="text-2xl font-bold text-[#111827] mb-2">One Last Step!</h1>
        <p className="text-sm text-[#6B7280]">Complete your profile to start booking</p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg p-8">
        {/* Google Account Badge */}
        <div className="mb-6 flex items-center gap-2 bg-[#F0EEFF] rounded-xl p-3 border border-[#E9D5FF]">
          <CheckCircle2 size={18} className="text-[#6B4EFF] flex-shrink-0" />
          <span className="text-sm text-[#6B7280]">
            Signed in as <span className="font-semibold text-[#111827]">{googleUser.email}</span>
          </span>
        </div>

        {error && <AlertBanner type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Pre-filled First Name (disabled) */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#374151] ml-0.5">
              First Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={googleUser.firstName}
                disabled
                className="w-full h-12 pl-4 pr-4 border-2 border-[#E5E7EB] rounded-xl bg-[#F9FAFB] text-[#9CA3AF] font-medium cursor-not-allowed"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                <Lock size={16} />
              </div>
            </div>
          </div>

          {/* Pre-filled Last Name (disabled) */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#374151] ml-0.5">
              Last Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={googleUser.lastName}
                disabled
                className="w-full h-12 pl-4 pr-4 border-2 border-[#E5E7EB] rounded-xl bg-[#F9FAFB] text-[#9CA3AF] font-medium cursor-not-allowed"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                <Lock size={16} />
              </div>
            </div>
          </div>

          {/* Pre-filled Email (disabled) */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#374151] ml-0.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={googleUser.email}
                disabled
                className="w-full h-12 pl-4 pr-4 border-2 border-[#E5E7EB] rounded-xl bg-[#F9FAFB] text-[#9CA3AF] font-medium cursor-not-allowed"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                <Lock size={16} />
              </div>
            </div>
          </div>

          {/* Editable Phone Number */}
          <AuthInput
            label="Phone Number"
            placeholder="+94 7X XXX XXXX"
            leftIcon={<Phone size={18} />}
            name="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            onBlur={validatePhone}
            error={phoneError}
          />

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-center gap-2 py-1">
            <button 
              type="button" 
              onClick={() => setFormData({...formData, agree: !formData.agree})}
              className="text-[#6B4EFF]"
            >
              {formData.agree ? (
                <CheckSquare size={20} className="text-[#6B4EFF]" fill="currentColor" />
              ) : (
                <Square size={20} className="text-[#6B4EFF]" />
              )}
            </button>
            <label className="text-sm text-[#6B7280]">
              I agree to the{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  // Open terms modal or navigate to terms page
                  alert('Terms & Conditions will be shown here');
                }}
                className="text-[#6B4EFF] font-semibold hover:underline"
              >
                Terms & Conditions
              </button>
            </label>
          </div>

          {/* Submit Button */}
          <AuthButton type="submit" isLoading={isLoading}>
            Complete Registration
          </AuthButton>
        </form>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#9CA3AF] flex items-center justify-center gap-1.5">
            <Lock size={12} />
            Your Google account has been securely linked
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-[#9CA3AF]">
          © 2024 Cloud Laundry.LK — University of Moratuwa
        </p>
      </div>
    </div>
  );
}
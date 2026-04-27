import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulation
    setTimeout(() => {
      setIsLoading(false);
      navigate('/otp-verify');
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="w-16 h-16 rounded-full bg-[#8B2FC9] flex items-center justify-center mb-6 shadow-lg shadow-purple-200">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">Join CLOUD LAUNDRY.LK</h1>
        <p className="text-gray-500 max-w-md">Book professional cleaning services for your home or office</p>
      </div>

      {/* Main Registration Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] bg-white rounded-[16px] shadow-[0px_2px_8px_rgba(0,0,0,0.1)] p-8 md:p-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8B2FC9] to-[#2196F3] flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Customer Registration</h2>
          <p className="text-sm text-gray-500 mt-1">Create an account to book cleaning services</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 ml-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#8B2FC9]/20 focus:border-[#8B2FC9] outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 ml-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#8B2FC9]/20 focus:border-[#8B2FC9] outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 ml-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="+94 7X XXX XXXX"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#8B2FC9]/20 focus:border-[#8B2FC9] outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#8B2FC9]/20 focus:border-[#8B2FC9] outline-none transition-all placeholder:text-gray-400"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 ml-1">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#8B2FC9]/20 focus:border-[#8B2FC9] outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-2 px-1 py-2">
            <input 
              type="checkbox" 
              id="agreeToTerms" 
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="w-4 h-4 accent-[#8B2FC9] rounded cursor-pointer" 
              required
            />
            <label htmlFor="agreeToTerms" className="text-xs text-gray-500 cursor-pointer">
              I agree to the <span className="text-blue-500 hover:underline">Terms & Conditions</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-[#8B2FC9] to-[#2196F3] text-white font-bold rounded-xl shadow-lg shadow-purple-100 hover:shadow-purple-200 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 mt-4"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Footer Section */}
      <div className="w-full max-w-[400px] mt-12">
        <div className="h-px bg-gray-200 w-full mb-6" />
        <div className="flex justify-center">
          <Link 
            to="/register/staff" 
            className="text-xs font-medium text-[#666666] hover:text-[#8B2FC9] transition-colors tracking-wide"
          >
            Staff Registration
          </Link>
        </div>
      </div>
    </div>
  );
}
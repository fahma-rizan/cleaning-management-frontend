import React from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from 'figma:asset/d0e24839a24076173960597a25c12b48f3330fdf.png';

interface BrandHeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({ 
  title = "CLOUD LAUNDRY.LK", 
  subtitle, 
  showLogo = true 
}) => {
  return (
    <div className="flex flex-col items-center mb-6 text-center">
      {showLogo && (
        <img 
          src={logo} 
          alt="Cloud Laundry Logo" 
          className="w-24 h-24 object-contain mb-4"
        />
      )}
      <h1 className="text-[26px] font-bold text-[#111827] tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-[#6B7280] mt-1">{subtitle}</p>}
    </div>
  );
};

interface AuthCardProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ 
  children, 
  icon, 
  title, 
  subtitle,
  className = ""
}) => {
  return (
    <div className={`w-full max-w-[420px] bg-white rounded-[16px] p-8 shadow-[0px_8px_32px_rgba(124,58,237,0.08)] mx-auto ${className}`}>
      {(icon || title || subtitle) && (
        <div className="flex flex-col items-center mb-8 text-center">
          {icon && (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center mb-4 text-white">
              {icon}
            </div>
          )}
          {title && <h2 className="text-[20px] font-semibold text-[#111827]">{title}</h2>}
          {subtitle && <p className="text-sm text-[#6B7280] mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClickRightIcon?: () => void;
  error?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({ 
  label, 
  leftIcon, 
  rightIcon, 
  onClickRightIcon,
  error, 
  className = "",
  ...props 
}) => {
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-sm font-medium text-[#374151] ml-0.5">{label}</label>
      <div className="relative group">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#7C3AED] transition-colors">
            {leftIcon}
          </div>
        )}
        <input
          className={`
            w-full h-12 rounded-lg border-[1.5px] outline-none transition-all text-[15px]
            ${leftIcon ? 'pl-11' : 'pl-4'}
            ${rightIcon ? 'pr-11' : 'pr-4'}
            ${error ? 'border-[#DC2626]' : 'border-[#E5E7EB] focus:border-[#7C3AED]'}
            bg-white text-[#111827] placeholder:text-[#9CA3AF]
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div 
            onClick={onClickRightIcon}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors cursor-pointer"
          >
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-[#DC2626] ml-0.5">{error}</p>}
    </div>
  );
};

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'secondary';
  isLoading?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading,
  className = "",
  ...props 
}) => {
  const baseStyles = "w-full h-12 rounded-lg font-semibold text-[15px] transition-all flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white shadow-md hover:shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100",
    ghost: "bg-white border-[1.5px] border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50",
    secondary: "bg-white border-[1.5px] border-[#7C3AED] text-[#7C3AED] hover:bg-purple-50"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : children}
    </button>
  );
};

export const AlertBanner: React.FC<{ type: 'error' | 'success' | 'warning' | 'info', message: string }> = ({ type, message }) => {
  const styles = {
    error: "bg-red-50 border-red-100 text-[#DC2626]",
    success: "bg-green-50 border-green-100 text-[#16A34A]",
    warning: "bg-amber-50 border-amber-100 text-[#D97706]",
    info: "bg-blue-50 border-blue-100 text-[#2563EB]"
  };
  return (
    <div className={`p-4 border rounded-xl mb-6 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${styles[type]}`}>
      {message}
    </div>
  );
};

export const StaffFooter = () => (
  <div className="mt-12 mb-6">
    <Link to="/login" className="text-xs text-[#9CA3AF] hover:text-[#7C3AED] transition-colors font-medium">
      Back to Login
    </Link>
  </div>
);
import React from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  image: string;
  title: string;
  subtitle: string;
  reverse?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  image, 
  title, 
  subtitle, 
  reverse = false 
}) => {
  return (
    <div className="min-h-screen w-full bg-[#F9FAFB] flex flex-col md:flex-row font-sans">
      {/* Form Side */}
      <div className={`w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-20 ${reverse ? 'md:order-2' : ''}`}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[500px]"
        >
          {children}
        </motion.div>
      </div>

      {/* Image Side */}
      <div className={`hidden md:flex md:w-1/2 bg-purple-600 relative overflow-hidden items-center justify-center p-12 lg:p-24 ${reverse ? 'md:order-1' : ''}`}>
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-300 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full h-[60%] rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/40 relative mb-12"
          >
            <ImageWithFallback 
              src={image} 
              alt="Cloud Laundry Illustration" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent" />
          </motion.div>

          <div className="text-center max-w-md">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">{title}</h2>
            <p className="text-purple-100 text-lg leading-relaxed">{subtitle}</p>
          </div>

          <div className="mt-12 flex items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-purple-200">Secure</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-purple-200">Fast</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-purple-200">Reliable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

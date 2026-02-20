import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldAlert,
  KeyRound,
} from "lucide-react";
import { motion } from "motion/react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      if (
        formData.email === "admin@cloudlaundry.lk" &&
        formData.password === "admin123"
      ) {
        const adminUser = {
          name: "Super Admin",
          email: formData.email,
          role: "admin",
        };
        localStorage.setItem("user", JSON.stringify(adminUser));
        window.location.href = "/#/admin";
      } else {
        setError("Invalid administrative credentials. Access denied.");
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen w-full bg-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl shadow-black/50">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20 ring-8 ring-white/[0.05]">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
              Admin Portal
            </h1>
            <p className="text-blue-100/60 font-medium">
              Restricted Access • Authorized Personnel Only
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm font-semibold flex gap-3 items-center"
            >
              <ShieldAlert className="w-5 h-5 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">
                Secure Email
              </label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@cloudlaundry.lk"
                  className="w-full pl-14 pr-4 py-4.5 bg-white/[0.05] border border-white/10 rounded-[22px] text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  size="sm"
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Reset Key?
                </Link>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-14 py-4.5 bg-white/[0.05] border border-white/10 rounded-[22px] text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-white text-slate-900 font-black uppercase tracking-widest rounded-[22px] shadow-2xl shadow-white/10 hover:bg-blue-50 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-3 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <>
                  <span>Admin Secure Login</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  SSL Encrypted
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Vault Protected
                </span>
              </div>
            </div>
            <p className="text-[10px] text-white/20 font-medium text-center max-w-[280px]">
              Access to this system is monitored and logged. Unauthorized access
              attempts will be investigated.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 group"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

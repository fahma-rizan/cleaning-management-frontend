import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, AlertCircle, Sparkles, Eye, EyeOff } from "lucide-react";
import type { FormEvent, ChangeEvent } from "react";
import BackButton from "./BackButton";
import type { User } from "../types";

interface LoginProps {
  onLogin: (user: User) => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export default function Login({ onLogin, theme, onToggleTheme }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Mock authentication - in real app, this would call backend API
    setTimeout(() => {
      if (email === "admin@cloudlaundry.lk" && password === "admin123") {
        const adminUser: User = {
          id: "admin-1",
          name: "Admin User",
          email: email,
          role: "admin",
          adminRole: "Admin",
          verified: true,
        };
        onLogin(adminUser);
        navigate("/admin");
      } else if (email === "ops@cloudlaundry.lk" && password === "ops123") {
        const adminUser: User = {
          id: "admin-2",
          name: "Operations Manager",
          email: email,
          role: "admin",
          adminRole: "Operations Manager",
          verified: true,
        };
        onLogin(adminUser);
        navigate("/admin");
      } else if (
        email === "support@cloudlaundry.lk" &&
        password === "support123"
      ) {
        const adminUser: User = {
          id: "admin-3",
          name: "Customer Support",
          email: email,
          role: "admin",
          adminRole: "Customer Support",
          verified: true,
        };
        onLogin(adminUser);
        navigate("/admin");
      } else if (email === "staff@cloudlaundry.lk" && password === "staff123") {
        const staffUser: User = {
          id: "staff-1",
          name: "Staff Member",
          email: email,
          role: "staff",
          verified: true,
        };
        onLogin(staffUser);
        navigate("/staff");
      } else if (email && password === "password123") {
        const demoUser: User = {
          id: "user-" + Date.now(),
          name: email.split("@")[0],
          email: email,
          role: "staff",
          verified: true,
        };
        onLogin(demoUser);
        navigate("/staff");
      } else {
        setError("Invalid email or password");
      }
      setLoading(false);
    }, 1000);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    // Mock Google OAuth - in real app, this would redirect to Google OAuth
    setTimeout(() => {
      const googleUser: User = {
        id: "google-" + Date.now(),
        name: "Google User",
        email: "user@gmail.com",
        role: "staff",
        verified: true,
      };
      onLogin(googleUser);
      navigate("/staff");
    }, 1500);
  };

  const handlePasswordToggle = (e: ChangeEvent<HTMLInputElement>) => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8">
        <BackButton />

        <div className="flex justify-center mb-6">
          <div className="bg-purple-600 dark:bg-purple-700 p-3 rounded-full">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl text-center mb-2 font-bold dark:text-white">
          CLOUD LAUNDRY.LK
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
          Sign in to your account
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6 flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="text-right mt-2">
              <Link
                to="/forgot-password"
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 transition-colors disabled:bg-purple-400"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              OR
            </span>
          </div>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="font-medium">
            {loading ? "Signing in..." : "Continue with Google"}
          </span>
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-600 dark:text-gray-300">
          <p className="mb-2 font-semibold">Demo credentials:</p>
          <p className="mb-1">
            <strong>Admin:</strong> admin@cloudlaundry.lk / admin123
          </p>
          <p className="mb-1">
            <strong>Operations:</strong> ops@cloudlaundry.lk / ops123
          </p>
          <p className="mb-1">
            <strong>Support:</strong> support@cloudlaundry.lk / support123
          </p>
          <p className="mb-1">
            <strong>Staff:</strong> staff@cloudlaundry.lk / staff123
          </p>
          
        </div>
      </div>
    </div>
  );
}

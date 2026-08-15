import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import type { FormEvent } from "react";
import type { User } from "../types";

interface LoginProps {
  onLogin: (user: User) => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
          adminRole: "Super Admin",
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
        const customerUser: User = {
          id: "user-" + Date.now(),
          name: email.split("@")[0],
          email: email,
          role: "customer",
          verified: true,
          loyaltyPoints: 150,
          badge: "Silver",
        };
        onLogin(customerUser);
        navigate("/dashboard");
      } else {
        setError("Invalid email or password");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ height: "982px", width: "1512px" }}
    >
      {/* Left Panel - Login Form */}
      <div
        className="w-1/2 bg-white flex flex-col p-12"
        style={{ paddingLeft: "80px", paddingRight: "80px" }}
      >
        {/* Logo */}
        <div className="mb-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-900">
              CLOUD LAUNDRY.LK
            </span>
          </div>
        </div>

        {/* Login Form Container */}
        <div
          className="flex-1 flex flex-col justify-center"
          style={{ maxWidth: "400px" }}
        >
          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back
            </h1>
            <p className="text-gray-500 text-sm">Please enter your details</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 text-sm"
                placeholder=""
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 text-sm"
                placeholder=""
                required
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border-2 border-gray-300 rounded accent-purple-600"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Remember for 30 days
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Forgot password
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400 font-medium text-sm"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            {/* Sign in with Google */}
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  const googleUser: User = {
                    id: "google-" + Date.now(),
                    name: "Google User",
                    email: "user@gmail.com",
                    role: "customer",
                    verified: true,
                    loyaltyPoints: 0,
                    badge: "Silver",
                  };
                  onLogin(googleUser);
                  navigate("/dashboard");
                }, 1500);
              }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium text-sm"
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
              <span>{loading ? "Signing in..." : "Sign in with Google"}</span>
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials - Bottom */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p className="mb-2 font-semibold">Demo credentials:</p>
          <p className="mb-1">
            <strong>Admin:</strong> admin@cloudlaundry.lk / admin123
          </p>
          <p className="mb-1">
            <strong>Staff:</strong> staff@cloudlaundry.lk / staff123
          </p>
          <p>
            <strong>Customer:</strong> any email / password123
          </p>
        </div>
      </div>

      {/* Right Panel - Illustration */}
      <div className="w-1/2 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center p-12 relative overflow-hidden">
        {/* Background Decorative Icons */}
        <div className="absolute inset-0 opacity-20">
          {/* Globe Icon */}
          <div className="absolute top-32 left-20">
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
              <path
                strokeWidth="1.5"
                d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
              />
            </svg>
          </div>

          {/* Envelope Icon */}
          <div className="absolute top-64 left-32">
            <svg
              className="w-20 h-20 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Chat Bubble */}
          <div className="absolute top-20 right-32">
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>

          {/* Laptop Icon */}
          <div className="absolute top-40 right-20">
            <svg
              className="w-20 h-20 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Shopping Bag */}
          <div className="absolute bottom-32 left-24">
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>

          {/* Sparkles/Stars */}
          <div className="absolute top-48 left-48">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.6-6.3 4.6 2.3-7.4-6-4.6h7.6z" />
            </svg>
          </div>

          <div className="absolute bottom-48 right-40">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>

          <div className="absolute top-72 right-52">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
        </div>

        {/* Main Illustration Container */}
        <div className="relative z-10 max-w-md">
          {/* Monitor/Screen Frame */}
          <div
            className="bg-white rounded-3xl shadow-2xl p-8"
            style={{ transform: "perspective(1000px) rotateY(-5deg)" }}
          >
            <div
              className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl p-6 flex items-center justify-center"
              style={{ minHeight: "400px" }}
            >
              {/* Laundry Icon/Illustration */}
              <div className="text-center">
                <div className="inline-block bg-white rounded-full p-8 shadow-lg mb-4">
                  <svg
                    className="w-32 h-32 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-purple-900 mb-2">
                  Clean & Fresh
                </h3>
                <p className="text-purple-700 text-sm">
                  Your trusted laundry partner
                </p>
              </div>
            </div>
          </div>

          {/* Floating Check Icon */}
          <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-4 shadow-xl">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

// Google Icon SVG Component
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
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
);

export default function RefinedLogin({
  onLogin,
  theme,
  onToggleTheme,
}: {
  onLogin?: (u: any) => void;
  theme?: string;
  onToggleTheme?: () => void;
}) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user
        localStorage.setItem("token", data.token);
        if (onLogin) onLogin(data.user);

        // Navigate based on role. Both staff and admin accounts can be
        // created by an admin with an auto-generated temp password
        // (requiresPasswordChange) — route either one through the same
        // first-login flow before letting them into their dashboard.
        if (data.user.role === "admin") {
          navigate(data.user.requiresPasswordChange ? "/staff-first-login" : "/admin");
        } else if (data.user.role === "staff") {
          navigate(data.user.requiresPasswordChange ? "/staff-first-login" : "/staff");
        } else {
          navigate("/dashboard");
        }
      } else {
        // If customer hasn't verified email yet, go to OTP page
        if (data.requiresVerification) {
          sessionStorage.setItem("pendingEmail", data.email);
          navigate("/otp-verify");
        } else {
          setError(data.message || "Incorrect email or password. Please try again.");
        }
        setIsLoading(false);
      }
    } catch (err) {
      setError("Cannot connect to server. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Google OAuth - to be implemented later
    setError("Google Sign-In coming soon. Please use email and password.");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50"
      style={{ height: "982px", width: "1512px" }}
    >
      {/* Container with margin */}
      <div
        className="flex bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ width: "1300px", height: "750px" }}
      >
        {/* Left Panel - Login Form */}
        <div className="w-1/2 bg-white flex flex-col justify-center px-12 py-8">
          <div className="max-w-md mx-auto w-full">
            {/* Logo */}
            <div className="mb-8 flex items-center gap-3">
              <img
                src="/src/imports/Gemini_Generated_Image_f8k5uhf8k5uhf8k5-2.png"
                alt="Cloud Laundry Logo"
                className="w-48 h-auto object-contain"
              />
              <h1
                className="text-xl font-bold whitespace-nowrap"
                style={{ color: "#8B5CF6" }}
              >
                CLOUD LAUNDRY.LK
              </h1>
            </div>

            {/* Form Header */}
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Welcome back
              </h2>
              <p className="text-sm text-gray-500">
                Sign in to book and manage your cleaning services
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3 flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-2.5 pr-12 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 text-sm"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 border-2 rounded ${rememberMe ? "bg-white border-purple-500" : "bg-white border-gray-400"} flex items-center justify-center`}
                    >
                      {rememberMe && (
                        <svg
                          className="w-3 h-3 text-purple-500"
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
                      )}
                    </div>
                  </div>
                  <span className="ml-2 text-sm text-gray-700">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-purple-500 hover:text-purple-600 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-500 text-white py-2.5 rounded-lg hover:bg-purple-600 transition-colors disabled:bg-purple-400 font-medium text-sm mt-4"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>

              {/* OR Divider */}
              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* Sign in with Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium text-sm"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-5 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-purple-500 hover:text-purple-600 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - T-shirt Image */}
        <div className="w-1/2 bg-gray-100">
          <img
            src="/src/imports/3FF9CCBC-5AAC-4661-B40B-B0948D3AEC55-1.jpeg"
            alt="Cloud Laundry Service"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

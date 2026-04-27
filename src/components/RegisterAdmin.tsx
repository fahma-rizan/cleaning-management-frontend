import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  Shield,
  Key,
  Home,
  MapPin,
} from "lucide-react";
import type { FormEvent, ChangeEvent } from "react";
import BackButton from "./BackButton";

export default function RegisterAdmin() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    accessCode: "",
    password: "",
    confirmPassword: "",
    adminRole: "Admin" as "Admin" | "Operations Manager" | "Customer Support",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Mock access code for demo purposes
  const VALID_ACCESS_CODE = "ADMIN2024";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Password validation: 8+ characters, symbol, number, uppercase, lowercase
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol (@$!%*?&)",
      );
      return;
    }

    if (formData.accessCode !== VALID_ACCESS_CODE) {
      setError(
        "Invalid access code. Please contact management for the correct code.",
      );
      return;
    }

    setLoading(true);

    // Mock registration - in real app, this would call backend API
    setTimeout(() => {
      const { accessCode, ...restData } = formData;
      localStorage.setItem(
        "pendingUser",
        JSON.stringify({
          ...restData,
          name: `${formData.firstName} ${formData.lastName}`,
          role: "admin",
        }),
      );
      navigate("/otp-verify");
    }, 1000);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl p-8 my-8">
        <BackButton to="/login" />

        <div className="flex justify-center mb-6">
          <div className="bg-purple-600 p-3 rounded-full">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl text-center mb-2 dark:text-white">
          Admin Registration
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
          Full system access and management
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6 flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                Restricted Registration
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Admin registration requires a special access code from
                management. This code is confidential and should only be shared
                with authorized personnel.
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
                <strong>Demo Access Code:</strong> ADMIN2024
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                First Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                Last Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                Access Code *
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="accessCode"
                  value={formData.accessCode}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Street Address *
            </label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                City *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                Postal Code *
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Desired Role *
            </label>
            <select
              name="adminRole"
              value={formData.adminRole}
              onChange={(e) =>
                setFormData({ ...formData, adminRole: e.target.value as any })
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            >
              <option value="Admin">Admin (Full Access)</option>
              <option value="Operations Manager">Operations Manager</option>
              <option value="Customer Support">Customer Support</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                Confirm *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400 mt-6"
          >
            {loading ? "Creating Account..." : "Create Admin Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "sonner";
import type { User } from "./types";
import { AppContext, useApp } from "./context";

// Components
import HomePage from "./components/HomePage"; //landing page
import RoleSelection from "./components/RoleSelection";
import RegisterAdmin from "./components/RegisterAdmin";
import RefinedRegister from "./components/auth/RefinedRegister";
import RefinedOTPVerify from "./components/auth/RefinedOTPVerify"; 
import RefinedLogin from "./components/auth/RefinedLogin";
import RefinedForgotPassword from "./components/auth/RefinedForgotPassword";
import RefinedVerifyResetCode from "./components/auth/RefinedVerifyResetCode";
import RefinedResetPassword from "./components/auth/RefinedResetPassword";
import StaffFirstLogin from "./components/auth/StaffFirstLogin";
import RefinedChangePassword from "./components/auth/RefinedChangePassword";
import ChangePassword from "./components/auth/ChangePassword";
import RefinedSuccess from "./components/auth/RefinedSuccess";
import StaffApplication from "./components/auth/StaffApplication"; 
import Services from "./components/Services";
import ServiceDetails from "./components/ServiceDetails";
import Booking from "./components/Booking"; //booking page
import CustomerDashboard from "./components/CustomerDashboard"; // customer dashboard page
import AdminDashboard from "./components/AdminDashboard";
import StaffDashboard from "./components/StaffDashboard"; //staffdashboard page
import PaymentPage from "./components/PaymentPage";
import PaymentGatewayPage from "./components/PaymentGatewayPage";
import PaymentSuccessPage from "./components/PaymentSuccessPage";
import Reviews from "./components/Reviews";
import TrackingPage from "./components/TrackingPage";
import Invoice from "./components/Invoice";
import UserProfile from "./components/UserProfile";
import ProfileModal from "./components/ProfileModal";
import SecuritySettings from "./components/SecuritySettings";
import LoyaltyPage from "./components/LoyaltyPage";
import VerificationSuccess from "./components/VerificationSuccess";
import StaffPerformance from "./components/StaffPerformance"; //staff performance page
import GPSTracking from "./components/GPSTracking"; //gps tracking page
import CompleteServiceForm from "./components/staff/CompleteServiceForm"; //staff complete service form page
import SubmissionSuccess from "./components/staff/SubmissionSuccess"; //staff submission success page
import CompleteProfile from "./components/auth/CompleteProfile";
import ComplaintForm from "./components/ComplaintForm";
import InventoryListPage from "./components/admin/InventoryListPage";
import InventoryManagementPage from "./components/admin/InventoryManagementPage";
import AddEditInventoryItem from "./components/admin/AddEditInventoryItem";
import LowStockAlertsPage from "./components/admin/LowStockAlertsPage";
import RestockPage from "./components/admin/RestockPage";
import InventoryReportsPage from "./components/admin/InventoryReportsPage";
import BillingApp from "./BillingApp";

function AppLayout() {
  const { user, showProfileModal, setShowProfileModal, theme, handleLogout } =
    useApp();

  return (
    <>
      {user && (
        <ProfileModal
          user={user}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          theme={theme}
        />
      )}
      <Outlet />
    </>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "light";
  });

  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        theme,
        setTheme,
        handleLogout,
        showProfileModal,
        setShowProfileModal,
      }}
    >
      <Toaster richColors position="top-right" />

      <Router>
        <Routes>
          <Route element={<AppLayout />}>
            <Route
              index
              element={
                <HomePage
                  user={user}
                  onLogout={handleLogout}
                  theme={theme}
                  onToggleTheme={() =>
                    setTheme(theme === "light" ? "dark" : "light")
                  }
                  onProfileClick={() => setShowProfileModal(true)}
                />
              }
            />
            <Route
              path="login"
              element={
                user ? (
                  <Navigate
                    to={
                      user.role === "admin"
                        ? "/admin"
                        : user.role === "staff"
                          ? "/staff"
                          : "/dashboard"
                    }
                    replace
                  />
                ) : (
                  <RefinedLogin
                    onLogin={handleLogin}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                  />
                )
              }
            />
            
            <Route path="register" element={<RefinedRegister />} />
            <Route path="role-selection" element={<RoleSelection />} />
            <Route path="register/customer" element={<RefinedRegister />} />
            <Route path="register/staff" element={<StaffApplication />} />
            <Route path="register/admin" element={<RegisterAdmin />} />
            <Route path="complete-profile" element={<CompleteProfile />} />
            <Route path="otp-verify" element={<RefinedOTPVerify onLogin={handleLogin} />} />
            <Route path="forgot-password" element={<RefinedForgotPassword />} />
            <Route
              path="verify-reset-code"
              element={<RefinedVerifyResetCode />}
            />
            <Route path="reset-password" element={<RefinedResetPassword />} />
            <Route
              path="staff-first-login"
              element={
                user && user.role === "staff" ? (
                  <StaffFirstLogin />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="change-password" element={<RefinedChangePassword />} />
            <Route path="success" element={<RefinedSuccess />} />
            <Route path="verify-success" element={<VerificationSuccess />} />
            <Route
              path="services"
              element={
                <Services
                  user={user}
                  onLogout={handleLogout}
                  theme={theme}
                  onToggleTheme={() =>
                    setTheme(theme === "light" ? "dark" : "light")
                  }
                  onProfileClick={() => setShowProfileModal(true)}
                />
              }
            />
            <Route
              path="services/:id"
              element={
                <ServiceDetails
                  user={user}
                  onLogout={handleLogout}
                  theme={theme}
                  onToggleTheme={() =>
                    setTheme(theme === "light" ? "dark" : "light")
                  }
                />
              }
            />
            <Route
              path="booking/:serviceId"
              element={
                user ? (
                  <Booking
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    onProfileClick={() => setShowProfileModal(true)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="payment"
              element={
                user ? (
                  <PaymentPage
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    onProfileClick={() => setShowProfileModal(true)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="payment-gateway"
              element={
                user ? (
                  <PaymentGatewayPage
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    onProfileClick={() => setShowProfileModal(true)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="payment-success"
              element={
                user ? (
                  <PaymentSuccessPage
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    onProfileClick={() => setShowProfileModal(true)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="tracking/:bookingId"
              element={
                user ? (
                  <TrackingPage
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    onProfileClick={() => setShowProfileModal(true)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="reviews/:serviceId"
              element={
                <Reviews
                  user={user}
                  onLogout={handleLogout}
                  theme={theme}
                  onToggleTheme={() =>
                    setTheme(theme === "light" ? "dark" : "light")
                  }
                  onProfileClick={() => setShowProfileModal(true)}
                />
              }
            />
            <Route
              path="complaint/:bookingId"
              element={
                user && user.role === "customer" ? (
                  <ComplaintForm
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="dashboard"
              element={
                user && user.role === "customer" ? (
                  <CustomerDashboard
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="admin"
              element={
                user && user.role === "admin" ? (
                  <AdminDashboard
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    onProfileClick={() => setShowProfileModal(true)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="admin/inventory"
              element={
                user && user.role === "admin" ? (
                  <InventoryManagementPage
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    onProfileClick={() => setShowProfileModal(true)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="admin/inventory/add"
              element={
                user && user.role === "admin" ? (
                  <AddEditInventoryItem
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    onProfileClick={() => setShowProfileModal(true)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="admin/inventory/edit/:id"
              element={
                user && user.role === "admin" ? (
                  <AddEditInventoryItem
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    onProfileClick={() => setShowProfileModal(true)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="admin/inventory/low-stock"
              element={
                user && user.role === "admin" ? (
                  <LowStockAlertsPage
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    onProfileClick={() => setShowProfileModal(true)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="admin/inventory/restock/:id?"
              element={
                user && user.role === "admin" ? (
                  <RestockPage
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    onProfileClick={() => setShowProfileModal(true)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="admin/inventory/reports"
              element={
                user && user.role === "admin" ? (
                  <InventoryReportsPage
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    onProfileClick={() => setShowProfileModal(true)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="staff"
              element={
                user &&
                user.role === "staff" &&
                !user.requiresPasswordChange ? (
                  <StaffDashboard
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    onProfileClick={() => setShowProfileModal(true)}
                  />
                ) : user &&
                  user.role === "staff" &&
                  user.requiresPasswordChange ? (
                  <Navigate to="/staff-first-login" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="performance"
              element={
                user &&
                user.role === "staff" &&
                !user.requiresPasswordChange ? (
                  <StaffPerformance
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    onProfileClick={() => setShowProfileModal(true)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="gps-tracking"
              element={
                user &&
                user.role === "staff" &&
                !user.requiresPasswordChange ? (
                  <GPSTracking
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    onProfileClick={() => setShowProfileModal(true)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="staff/complete-service/:bookingId?"
              element={
                user &&
                user.role === "staff" &&
                !user.requiresPasswordChange ? (
                  <CompleteServiceForm />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="staff/submission-success"
              element={
                user &&
                user.role === "staff" &&
                !user.requiresPasswordChange ? (
                  <SubmissionSuccess />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="invoice/:bookingId"
              element={
                user ? (
                  <Invoice
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    onProfileClick={() => setShowProfileModal(true)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="profile"
              element={
                user ? (
                  <UserProfile
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    onProfileClick={() => setShowProfileModal(true)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="security"
              element={
                user ? (
                  <SecuritySettings
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    onProfileClick={() => setShowProfileModal(true)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="loyalty"
              element={
                user ? (
                  <LoyaltyPage
                    user={user}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    onProfileClick={() => setShowProfileModal(true)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            {/* These two used to render separate, static/mock loyalty pages —
                both are now superseded by the real, API-wired /loyalty page. */}
            <Route
              path="loyalty-points"
              element={<Navigate to="/loyalty" replace />}
            />
            <Route
              path="loyalty-summary"
              element={<Navigate to="/loyalty" replace />}
            />
          </Route>
          {/* Payment/invoice/notifications sub-app, merged in from
              payment-invoice-notifications. Kept isolated with its own
              AuthProvider since it duplicates several component names
              already used above (PaymentPage, Invoice, StaffDashboard, ...). */}
          <Route path="billing/*" element={<BillingApp />} />
        </Routes>
      </Router>
    </AppContext.Provider>
  );
}

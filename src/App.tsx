import { useState, useEffect } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import type { User } from './types';
import { AppContext, useApp } from './context';

// ─── MY COMPONENTS (User Auth) ───────────────────────────
import RefinedLogin from './components/auth/RefinedLogin';
import RefinedRegister from './components/auth/RefinedRegister';
import RefinedOTPVerify from './components/auth/RefinedOTPVerify';
import RefinedForgotPassword from './components/auth/RefinedForgotPassword';
import RefinedVerifyResetCode from './components/auth/RefinedVerifyResetCode';
import RefinedResetPassword from './components/auth/RefinedResetPassword';
import RefinedSuccess from './components/auth/RefinedSuccess';
import RefinedChangePassword from './components/auth/RefinedChangePassword';
import CompleteProfile from './components/auth/CompleteProfile';
import VerificationSuccess from './components/VerificationSuccess';

// ─── MY COMPONENTS (Customer Dashboard) ──────────────────
import CustomerDashboard from './components/CustomerDashboard';

// ─── MY COMPONENTS (Loyalty Points) ──────────────────────
import LoyaltyPage from './components/LoyaltyPage';
import LoyaltyPointsSummary from './components/LoyaltyPointsSummary';
import LoyaltyPointsSystem from './components/loyalty/LoyaltyPointsSystem';

// ─── MY COMPONENTS (Profile & Settings) ──────────────────
import UserProfile from './components/UserProfile';
import SecuritySettings from './components/SecuritySettings';
import ProfileModal from './components/ProfileModal';

// ─── MY COMPONENTS (Staff & Admin Auth) ───────────────────
import StaffFirstLogin from './components/auth/StaffFirstLogin';
import AdminRedirect from './components/auth/AdminRedirect';

// ─── SHARED COMPONENTS ────────────────────────────────────
import RoleSelection from './components/RoleSelection';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    try { return stored ? JSON.parse(stored) : null; }
    catch { return null; }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <AppContext.Provider value={{
      user, setUser, theme, setTheme,
      handleLogout, showProfileModal, setShowProfileModal
    }}>
      <Router>
        <Routes>
          {/* ── HOME — redirect straight to login ── */}
          <Route index element={<Navigate to="/login" replace />} />

          {/* ── USER AUTHENTICATION ── */}
          <Route path="login" element={
            user
              ? <Navigate to="/dashboard" replace />
              : <RefinedLogin onLogin={handleLogin} theme={theme} onToggleTheme={toggleTheme} />
          } />
          <Route path="register" element={<RefinedRegister />} />
          <Route path="role-selection" element={<RoleSelection />} />
          <Route path="register/customer" element={<RefinedRegister />} />
          <Route path="otp-verify" element={<RefinedOTPVerify />} />
          <Route path="forgot-password" element={<RefinedForgotPassword />} />
          <Route path="verify-reset-code" element={<RefinedVerifyResetCode />} />
          <Route path="reset-password" element={<RefinedResetPassword />} />
          <Route path="change-password" element={<RefinedChangePassword />} />
          <Route path="complete-profile" element={<CompleteProfile />} />
          <Route path="success" element={<RefinedSuccess />} />
          <Route path="verify-success" element={<VerificationSuccess />} />

          {/* ── STAFF FIRST LOGIN ── */}
          <Route path="staff-first-login" element={
            user && user.role === 'staff'
              ? <StaffFirstLogin />
              : <Navigate to="/login" replace />
          } />

          {/* ── ADMIN REDIRECT ── */}
          <Route path="admin-redirect" element={
            user && user.role === 'admin'
              ? <AdminRedirect />
              : <Navigate to="/login" replace />
          } />

          {/* ── CUSTOMER DASHBOARD ── */}
          <Route path="dashboard" element={
            user && user.role === 'customer'
              ? <CustomerDashboard user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
              : <Navigate to="/login" replace />
          } />

          {/* ── LOYALTY POINTS SYSTEM ── */}
          <Route path="loyalty" element={
            user
              ? <LoyaltyPage user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} onProfileClick={() => setShowProfileModal(true)} />
              : <Navigate to="/login" replace />
          } />
          <Route path="loyalty-points" element={
            user && user.role === 'customer'
              ? <LoyaltyPointsSystem onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
              : <Navigate to="/login" replace />
          } />
          <Route path="loyalty-summary" element={
            user && user.role === 'customer'
              ? <LoyaltyPointsSummary user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
              : <Navigate to="/login" replace />
          } />

          {/* ── USER PROFILE & SETTINGS ── */}
          <Route path="profile" element={
            user
              ? <UserProfile user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} onProfileClick={() => setShowProfileModal(true)} />
              : <Navigate to="/login" replace />
          } />
          <Route path="security" element={
            user
              ? <SecuritySettings user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} onProfileClick={() => setShowProfileModal(true)} />
              : <Navigate to="/login" replace />
          } />

          {/* ── CATCH ALL ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppContext.Provider>
  );
}

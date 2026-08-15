import { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Key, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Trash2,
  BellRing,
  History
} from 'lucide-react';
import type { User } from '../types';
import Header from './Header';
import BackButton from './BackButton';

interface SecuritySettingsProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

export default function SecuritySettings({ user, onLogout, theme, onToggleTheme, onProfileClick }: SecuritySettingsProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });

  const toggle2FA = () => {
    setTwoFactor(!twoFactor);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFE] dark:bg-gray-900 transition-colors">
      <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} onProfileClick={onProfileClick} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <BackButton />
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-600" />
              Security & Privacy
            </h1>
          </div>

          <div className="space-y-6">
            {/* Change Password */}
            <section className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <Lock className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold dark:text-white">Change Password</h2>
              </div>
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest">New Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                      placeholder="••••••••"
                    />
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <button className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all mt-4">
                  Update Password
                </button>
              </div>
            </section>

            {/* Two-Factor Authentication */}
            <section className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold dark:text-white">Two-Factor Authentication (2FA)</h2>
                    <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account.</p>
                  </div>
                </div>
                <button 
                  onClick={toggle2FA}
                  className={`relative w-14 h-8 rounded-full transition-all ${twoFactor ? 'bg-purple-600' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${twoFactor ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              {twoFactor && (
                <div className="p-6 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800 mt-4 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                      <Key className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold dark:text-white">Verify Phone Number</h4>
                      <p className="text-sm text-gray-500">A 6-digit code will be sent to your phone for login.</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Account Activity */}
            <section className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <History className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold dark:text-white">Recent Login Activity</h2>
              </div>
              <div className="space-y-4">
                {[
                  { device: 'MacBook Pro (Chrome)', location: 'Colombo, Sri Lanka', time: 'Active now', icon: Smartphone },
                  { device: 'iPhone 13 (Safari)', location: 'Kandy, Sri Lanka', time: 'Feb 10, 2026', icon: Smartphone },
                  { device: 'Windows Desktop (Edge)', location: 'Colombo, Sri Lanka', time: 'Feb 05, 2026', icon: Smartphone },
                ].map((login, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
                        <Smartphone className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-bold text-sm dark:text-white">{login.device}</p>
                        <p className="text-xs text-gray-500">{login.location} • {login.time}</p>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-purple-600 hover:underline">Log out</button>
                  </div>
                ))}
              </div>
            </section>

            {/* Notification Settings */}
            <section className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <BellRing className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold dark:text-white">Notification Preferences</h2>
              </div>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4">
                    <div className="capitalize font-bold text-sm dark:text-white">{key} Notifications</div>
                    <button 
                      onClick={() => setNotifications({...notifications, [key]: !value})}
                      className={`relative w-12 h-6 rounded-full transition-all ${value ? 'bg-purple-600' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${value ? 'left-6.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Danger Zone */}
            <section className="bg-red-50 dark:bg-red-900/10 rounded-3xl p-8 border border-red-100 dark:border-red-900/30 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="font-bold dark:text-white">Delete Account</h4>
                  <p className="text-sm text-gray-500">Permanently remove your account and all associated data.</p>
                </div>
                <button className="flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 dark:shadow-none">
                  <Trash2 className="w-5 h-5" />
                  Delete Account
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-gray-100 dark:border-gray-800 py-12 bg-white dark:bg-gray-900 text-center text-gray-400 text-sm">
        &copy; 2026 CLOUD LAUNDRY.LK - Privacy First
      </footer>
    </div>
  );
}

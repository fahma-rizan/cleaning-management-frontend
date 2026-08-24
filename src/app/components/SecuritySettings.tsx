import { useState } from 'react';
import { toast } from 'sonner';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Trash2,
  BellRing,
} from 'lucide-react';
import type { User } from '../types';
import Header from './Header';
import BackButton from './BackButton';
import { fetchWithAuth } from '../utils/api';
import { getPasswordChecks, isValidPassword, PASSWORD_RULE } from '../lib/validation';

interface SecuritySettingsProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

export default function SecuritySettings({ user, onLogout, theme, onToggleTheme, onProfileClick }: SecuritySettingsProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });

  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  const handleUpdatePassword = async () => {
    if (!passwordForm.current) {
      toast.error('Enter your current password.');
      return;
    }
    if (!isValidPassword(passwordForm.newPass)) {
      toast.error(PASSWORD_RULE);
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast.error('New passwords do not match.');
      return;
    }
    setChangingPassword(true);
    try {
      const data = await fetchWithAuth('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.newPass,
        }),
      });
      if (data.success) {
        toast.success('Password changed successfully.');
        setPasswordForm({ current: '', newPass: '', confirm: '' });
      } else {
        toast.error(data.message || 'Failed to change password.');
      }
    } catch {
      toast.error('Failed to change password. Please check your connection and try again.');
    }
    setChangingPassword(false);
  };

  const newPasswordChecks = getPasswordChecks(passwordForm.newPass);

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
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
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
                      value={passwordForm.newPass}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Confirm New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                    placeholder="••••••••"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  />
                </div>

                {passwordForm.newPass && (
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                    {[
                      [newPasswordChecks.length, 'At least 8 characters'],
                      [newPasswordChecks.uppercase, 'One uppercase letter'],
                      [newPasswordChecks.lowercase, 'One lowercase letter'],
                      [newPasswordChecks.number, 'One number'],
                      [newPasswordChecks.special, 'One special character'],
                    ].map(([met, label]) => (
                      <li key={label as string} className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${met ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        <span className={met ? 'text-green-600 dark:text-green-400' : ''}>{label}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  onClick={handleUpdatePassword}
                  disabled={changingPassword}
                  className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all mt-4 disabled:opacity-50"
                >
                  {changingPassword ? 'Updating…' : 'Update Password'}
                </button>
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

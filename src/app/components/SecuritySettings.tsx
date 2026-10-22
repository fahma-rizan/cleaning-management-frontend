import { useState } from 'react';
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

interface SecuritySettingsProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

// Backend validation (validators/authValidators.js) is authoritative — this
// regex is UX-only.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function SecuritySettings({ user, onLogout, theme, onToggleTheme, onProfileClick }: SecuritySettingsProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', next: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!passwordData.current || !passwordData.next) {
      setMessage({ type: 'error', text: 'Please fill in both fields.' });
      return;
    }
    if (!PASSWORD_REGEX.test(passwordData.next)) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters with uppercase, lowercase, number, and special character.' });
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword: passwordData.current, newPassword: passwordData.next }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setPasswordData({ current: '', next: '' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update password.' });
      }
    } catch (err) {
      console.error('Change password error:', err);
      setMessage({ type: 'error', text: 'Cannot connect to server. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();

      if (data.success) {
        // Clear the session outright — the account is anonymized/deactivated
        // server-side now, so this token would 401 on the next call anyway.
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberedCredentials');
        onLogout();
      } else {
        setDeleteError(data.message || 'Failed to delete account.');
        setIsDeleting(false);
      }
    } catch (err) {
      console.error('Delete account error:', err);
      setDeleteError('Cannot connect to server. Please try again.');
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmText('');
    setDeleteError('');
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

              {message && (
                <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
                  message.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
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
                      autoComplete="new-password"
                      value={passwordData.next}
                      onChange={(e) => setPasswordData({ ...passwordData, next: e.target.value })}
                      className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">Min 8 characters, with uppercase, lowercase, a number and a special character.</p>
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all mt-4 disabled:opacity-50"
                >
                  {isSaving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
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
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 dark:shadow-none"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Account
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-600">Delete Account</h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              This permanently deactivates your account and removes your personal
              information. You won't be able to log back in, and this can't be undone.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Your past bookings and payment history are kept for our business
              records, but are no longer tied to your name or contact details.
            </p>

            {deleteError && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                {deleteError}
              </div>
            )}

            <label className="text-xs font-black uppercase text-gray-400 tracking-widest">
              Type DELETE to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full mt-2 mb-6 px-5 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 dark:text-white"
              placeholder="DELETE"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-5 h-5" />
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-20 border-t border-gray-100 dark:border-gray-800 py-12 bg-white dark:bg-gray-900 text-center text-gray-400 text-sm">
        &copy; 2026 CLOUD LAUNDRY.LK - Privacy First
      </footer>
    </div>
  );
}

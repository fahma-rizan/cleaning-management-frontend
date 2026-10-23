import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, Mail, Phone, Lock, Camera, Save, ArrowLeft, Shield, Bell, Globe, Eye, EyeOff } from 'lucide-react';
import Header from './Header';
import { useApp } from '../context';
import type { User } from '../types';

interface UserProfileProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function UserProfile({ user, onLogout, theme, onToggleTheme }: UserProfileProps) {
  const { setUser } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'settings'>('profile');
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    profilePicture: localStorage.getItem(`profilePic_${user.id}`) || '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    bookingUpdates: true,
    promotions: false,
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileData({ ...profileData, profilePicture: result });
        localStorage.setItem(`profilePic_${user.id}`, result);
        setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        // Email is deliberately not sent — changing it needs re-verification,
        // which this form doesn't do (see authController.updateProfile).
        body: JSON.stringify({ name: profileData.name, phone: profileData.phone }),
      });
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile.' });
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setMessage({ type: 'error', text: 'Cannot connect to server. Please try again.' });
    } finally {
      setIsSavingProfile(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Backend validation (validators/authValidators.js) is authoritative — this
  // regex is UX-only, so a real password change can't be faked past it.
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!PASSWORD_REGEX.test(passwordData.newPassword)) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.',
      });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to change password.' });
      }
    } catch (err) {
      console.error('Change password error:', err);
      setMessage({ type: 'error', text: 'Cannot connect to server. Please try again.' });
    } finally {
      setIsChangingPassword(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleNotificationUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notificationSettings));
    setMessage({ type: 'success', text: 'Notification settings updated!' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
      
      <div className="container mx-auto px-4 py-8">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-8 dark:text-white">My Profile</h1>

          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' 
                : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-4 px-4 font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Profile Information
              </div>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`pb-4 px-4 font-medium transition-colors ${
                activeTab === 'security'
                  ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 px-4 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </div>
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                    {profileData.profilePicture ? (
                      <img src={profileData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <label 
                    htmlFor="profile-picture" 
                    className="absolute bottom-0 right-0 bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-800 text-white p-2 rounded-full cursor-pointer transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    <input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Click the camera icon to change picture</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>
              </div>

              {/* Email — read-only: changing it would need re-verification, which
                  this form doesn't do (see authController.updateProfile). */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    value={profileData.email}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-100 dark:text-gray-400 text-gray-500 rounded-lg cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">Contact support to change your email address.</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-purple-900 dark:text-purple-300 mb-2">Password Requirements</h3>
                <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                  <li>• Minimum 8 characters</li>
                  <li>• At least one uppercase letter</li>
                  <li>• At least one lowercase letter</li>
                  <li>• At least one number</li>
                  <li>• At least one special character (@$!%*?&)</li>
                </ul>
              </div>

              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full pl-10 pr-11 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    tabIndex={-1}
                  >
                    {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showPassword.next ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full pl-10 pr-11 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, next: !showPassword.next })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    tabIndex={-1}
                  >
                    {showPassword.next ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-11 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    tabIndex={-1}
                  >
                    {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
              >
                <Lock className="w-5 h-5" />
                {isChangingPassword ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <form onSubmit={handleNotificationUpdate} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
                
                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* SMS Notifications */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">SMS Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates via SMS</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive browser notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Booking Updates */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Booking Updates</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get notified about booking status changes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.bookingUpdates}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, bookingUpdates: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Promotions */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Promotions & Offers</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive promotional emails and offers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.promotions}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, promotions: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Save className="w-5 h-5" />
                Save Settings
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

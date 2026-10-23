import { useState, useEffect } from 'react';
import { X, Camera, Save, User as UserProfileIcon } from 'lucide-react';
import { useApp } from '../context';
import type { User } from '../types';

interface ProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export default function ProfileModal({ user, isOpen, onClose, theme = 'light' }: ProfileModalProps) {
  const { setUser } = useApp();
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    profilePicture: localStorage.getItem('userProfilePicture') || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Re-sync when the modal is reopened for a possibly-updated user, or for a
  // different user (e.g. after logging in as someone else in the same tab).
  useEffect(() => {
    if (isOpen) {
      setProfileData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
      }));
      setMessage(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileData({ ...profileData, profilePicture: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    localStorage.setItem('userProfilePicture', profileData.profilePicture);
    setIsSaving(true);
    setMessage(null);
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
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone,
          address: profileData.address,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        onClose();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile.' });
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setMessage({ type: 'error', text: 'Cannot connect to server. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
          <h2 className="text-3xl text-purple-600 dark:text-purple-400 font-bold">My Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full bg-purple-100 dark:bg-purple-900/30 overflow-hidden mb-4 border-4 border-purple-600 dark:border-purple-500">
              {profileData.profilePicture ? (
                <img
                  src={profileData.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserProfileIcon className="w-20 h-20 text-purple-600 dark:text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>
            <label className="flex items-center gap-2 px-6 py-3 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors cursor-pointer font-medium">
              <Camera className="w-5 h-5" />
              <span>Change Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Profile Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                value={profileData.email}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-100 dark:text-gray-400 text-gray-500 rounded-lg cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-400">Contact support to change your email address.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="+94 XX XXX XXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Address
              </label>
              <textarea
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Enter your address"
              />
            </div>
          </div>

          {/* Account Info - Only show for customers with loyalty points */}
          {user.role === 'customer' && user.loyaltyPoints !== undefined && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-medium mb-3 text-purple-900 dark:text-purple-300">Account Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Loyalty Points</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{user.loyaltyPoints}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Member Status</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{user.badge || 'Bronze'}</p>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 dark:bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

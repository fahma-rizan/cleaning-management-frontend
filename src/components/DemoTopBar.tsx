import NotificationCenter from './NotificationCenter';
import type { User } from '../types';
import logoImage from '../assets/logo.png';

interface DemoTopBarProps {
  user: User;
}

export default function DemoTopBar({ user }: DemoTopBarProps) {
  return (
    <div className="w-full bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3">
        <img
          src={logoImage}
          alt="Cloud Laundry.lk Logo"
          className="w-9 h-9 object-contain bg-white rounded-lg p-0.5 border border-purple-100 shadow-xs"
        />
        <span className="font-bold text-gray-900 text-lg tracking-tight">Cloud Laundry.lk</span>
      </div>

      {/* Right side — user + bell */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 hidden md:block">
          {user.name}
        </span>
        {/* Notification Bell */}
        <NotificationCenter userId={user.id} />
      </div>
    </div>
  );
}

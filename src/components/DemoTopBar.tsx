import NotificationCenter from './NotificationCenter';
import type { User } from '../types';

interface DemoTopBarProps {
  user: User;
}

export default function DemoTopBar({ user }: DemoTopBarProps) {
  return (
    <div className="w-full bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Logo / Brand */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">CL</span>
        </div>
        <span className="font-bold text-gray-900">Cloud Laundry.lk</span>
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

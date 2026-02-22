import { Link } from 'react-router-dom';
import { LogOut, User as UserIcon, LayoutDashboard, Sun, Moon } from 'lucide-react';
import type { User } from '../types';
import NotificationCenter from './NotificationCenter';
import logo from '../assets/d0e24839a24076173960597a25c12b48f3330fdf.png';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

export default function Header({ user, onLogout, theme = 'light', onToggleTheme, onProfileClick }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm transition-colors">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Cloud Laundry Logo" className="w-12 h-12 object-contain" />
            <span className="text-xl font-bold dark:text-white">CLOUD LAUNDRY.LK</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/services"
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Services
            </Link>

            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-500" />
                )}
              </button>
            )}

            {user ? (
              <>
                <NotificationCenter userId={user.id} theme={theme} />
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onProfileClick}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
                  >
                    <UserIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm dark:text-gray-200">{user.name}</span>
                    {user.badge && (
                      <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded">
                        {user.badge}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 transition-colors font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

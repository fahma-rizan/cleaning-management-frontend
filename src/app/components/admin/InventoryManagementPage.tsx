import { Package } from 'lucide-react';
import type { User } from '../../types';
import Header from '../Header';
import BackButton from '../BackButton';
import InventoryManagement from './InventoryManagement';

interface InventoryManagementPageProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

export default function InventoryManagementPage({ user, onLogout, theme, onToggleTheme, onProfileClick }: InventoryManagementPageProps) {
  return (
    <div className="min-h-screen bg-[#FDFCFE] dark:bg-gray-900 transition-colors">
      <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} onProfileClick={onProfileClick} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <BackButton />
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-purple-600" />
              Inventory Management
            </h1>
          </div>

          <InventoryManagement />
        </div>
      </main>
    </div>
  );
}

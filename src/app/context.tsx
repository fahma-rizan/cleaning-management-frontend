import { createContext, useContext } from 'react';
import type { User } from './types';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  handleLogout: () => void;
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppContext.Provider');
  }
  return context;
}

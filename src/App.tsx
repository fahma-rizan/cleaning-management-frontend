import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import type { User } from './types';
import { AppContext } from './context';
import InventoryManagementLayout from './components/InventoryManagementLayout';

const DEMO_ADMIN: User = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@cloudlaundry.lk',
  role: 'admin',
  verified: true,
};

export default function App() {
  const [user] = useState<User>(DEMO_ADMIN);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
    localStorage.setItem('user', JSON.stringify(DEMO_ADMIN));
  }, [theme]);

  return (
    <AppContext.Provider value={{
      user,
      setUser: () => {},
      theme,
      setTheme,
      handleLogout: () => window.location.reload(),
      showProfileModal,
      setShowProfileModal,
    }}>
      <Router>
        <Routes>
          <Route path="/*" element={<InventoryManagementLayout />} />
        </Routes>
      </Router>
    </AppContext.Provider>
  );
}

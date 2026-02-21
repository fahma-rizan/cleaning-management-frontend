import { useState } from 'react';
import AdminSidebar from './components/AdminSidebar';

// Mock admin user
const mockUser = {
  name: 'Admin User',
  email: 'admin@cloudlaundry.lk',
  adminRole: 'System Administrator',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    alert('Logged out');
  };

  return (
    <div className="flex min-h-screen bg-[#FDFCFE]">

      {/* ── Sidebar ── */}
      <AdminSidebar
        user={mockUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      {/* ── Main content placeholder ── */}
      <main className="flex-1 ml-64 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-2">
            Active Tab
          </p>
          <p className="text-purple-600 text-3xl font-black capitalize">
            {activeTab.replace('-', ' ')}
          </p>
        </div>
      </main>

    </div>
  );
}

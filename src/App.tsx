import { useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import AdminTopBar from './components/AdminTopBar';

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

  const handleBack = () => {
    // In a real app this would navigate(-1) via react-router
    // Here we just reset to overview as a demo
    setActiveTab('overview');
  };

  return (
    <div className="flex min-h-screen bg-[#FDFCFE]">

      {/* ── Left: Sidebar ── */}
      <AdminSidebar
        user={mockUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      {/* ── Right: Main area (Top bar + content) ── */}
      <main className="flex-1 lg:ml-64 min-h-screen bg-[#FDFCFE]">

        {/* Top bar — sticky at the top of main */}
        <AdminTopBar
          activeTab={activeTab}
          onBack={handleBack}
        />

        {/* Page content placeholder */}
        <div className="p-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">
              Active Tab
            </p>
            <p className="text-purple-600 text-3xl font-black capitalize">
              {activeTab.replace(/-/g, ' ')}
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}

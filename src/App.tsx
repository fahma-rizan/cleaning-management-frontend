import AdminDashboard from './components/AdminDashboard';
import type { User } from './types';

// Mock admin user — matches the User type from types.ts
const mockUser: User = {
  id:        'admin-001',
  name:      'Admin User',
  email:     'admin@cloudlaundry.lk',
  adminRole: 'Main Admin',
  verified:  true,
};

export default function App() {
  const handleLogout = () => {
    alert('Logged out');
  };

  return (
    <AdminDashboard
      user={mockUser}
      onLogout={handleLogout}
    />
  );
}

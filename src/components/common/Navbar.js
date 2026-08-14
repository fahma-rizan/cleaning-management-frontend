import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Dropdown, Avatar } from 'antd';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { to: '/',          label: 'Dashboard' },
  { to: '/loyalty',   label: 'My Points' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: 'profile',
      label: (
        <span className="flex items-center gap-2 py-1">
          <PersonIcon fontSize="small" />
          <span>{user?.name}</span>
        </span>
      ),
      disabled: true,
    },
    { type: 'divider' },
    ...(user?.role === 'admin' || user?.role === 'staff'
      ? [{ key: 'inventory', label: <Link to="/inventory">Inventory</Link> }]
      : []),
    {
      key: 'logout',
      label: (
        <span className="flex items-center gap-2 text-red-500">
          <LogoutIcon fontSize="small" />
          Logout
        </span>
      ),
      onClick: handleLogout,
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-lg no-underline">
          <LocalLaundryServiceIcon />
          <span>Cloud Laundry.lk</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium no-underline transition-colors ${
                location.pathname === to
                  ? 'text-primary'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {label}
            </Link>
          ))}
          {(user?.role === 'admin' || user?.role === 'staff') && (
            <Link
              to="/inventory"
              className={`text-sm font-medium no-underline transition-colors flex items-center gap-1 ${
                location.pathname === '/inventory'
                  ? 'text-primary'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <InventoryIcon fontSize="small" />
              Inventory
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user?.loyaltyPoints !== undefined && (
            <span className="hidden sm:flex items-center gap-1 text-sm text-secondary bg-input px-3 py-1.5 rounded-full">
              <StarIcon fontSize="small" className="text-yellow-500" />
              {user.loyaltyPoints.toLocaleString()} pts
            </span>
          )}
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Avatar
              className="cursor-pointer bg-primary"
              style={{ backgroundColor: '#7C3AED' }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </Dropdown>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { label: 'Inventory',           path: '/inventory' },
  { label: 'Material Requests',   path: '/material-requests' },
  { label: 'Completion Reports',  path: '/completion-reports' },
  { label: 'Alerts',              path: '/alerts' },
  { label: 'Monthly Report',      path: '/reports/monthly' },
];

const StaffTopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      position: 'sticky', top: 0, zIndex: 50,
      backdropFilter: 'blur(12px)',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Top row: brand + user */}
      <div style={{
        height: 56, padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(147,51,234,0.2))',
            border: '1px solid rgba(124,58,237,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Inventory2Icon sx={{ fontSize: 16, color: '#c4b5fd' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>Inventory Management</div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>Cloud Laundry.lk</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>
            {user?.name}
            <span style={{ color: 'rgba(255,255,255,0.25)', margin: '0 5px' }}>·</span>
            {user?.role?.replace(/_/g, ' ')}
          </span>
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.5)', fontSize: 12.5, cursor: 'pointer',
            }}
          >
            <LogoutIcon sx={{ fontSize: 14 }} /> Sign out
          </button>
        </div>
      </div>

      {/* Nav tabs row */}
      <div style={{
        padding: '0 24px',
        display: 'flex', alignItems: 'center', gap: 2,
        overflowX: 'auto',
      }}>
        {NAV_LINKS.map(link => {
          const active = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderBottom: active ? '2px solid #7C3AED' : '2px solid transparent',
                background: active ? 'rgba(124,58,237,0.12)' : 'transparent',
                color: active ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                fontSize: 13, fontWeight: active ? 600 : 400,
                cursor: 'pointer',
                borderRadius: '6px 6px 0 0',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {link.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StaffTopBar;

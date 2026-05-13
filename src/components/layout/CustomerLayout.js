import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTier } from '../../constants/loyalty';
import GridViewRoundedIcon      from '@mui/icons-material/GridViewRounded';
import CalendarMonthIcon        from '@mui/icons-material/CalendarMonth';
import EmojiEventsIcon          from '@mui/icons-material/EmojiEvents';
import NotificationsNoneIcon    from '@mui/icons-material/NotificationsNone';
import PersonOutlineIcon        from '@mui/icons-material/PersonOutline';
import TuneIcon                 from '@mui/icons-material/Tune';
import LogoutIcon               from '@mui/icons-material/Logout';

const NAV_ITEMS = [
  { to: '/',              label: 'Overview',        Icon: GridViewRoundedIcon,   end: true  },
  { to: '/bookings',      label: 'My Bookings',     Icon: CalendarMonthIcon,     end: false },
  { to: '/loyalty',       label: 'Loyalty Points',  Icon: EmojiEventsIcon,       end: false },
  { to: '/notifications', label: 'Notifications',   Icon: NotificationsNoneIcon, end: false },
  { to: '/profile',       label: 'My Profile',      Icon: PersonOutlineIcon,     end: false },
  { to: '/settings',      label: 'Settings',        Icon: TuneIcon,              end: false },
];

const TIER_PALETTE = {
  Bronze:   { color: '#D97706', label: 'Bronze Member'   },
  Silver:   { color: '#7C3AED', label: 'Silver Member'   },
  Gold:     { color: '#F59E0B', label: 'Gold Member'     },
  Platinum: { color: '#06B6D4', label: 'Platinum Member' },
};

const LogoMark = () => (
  <svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 4C24 4 24 2 26 2C28 2 29.5 3.5 29.5 5.5C29.5 7.5 28 9 26 9.5L24 10.5"
      stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <ellipse cx="14" cy="29" rx="9" ry="9" fill="#fff"/>
    <ellipse cx="24" cy="24" rx="13" ry="13" fill="#fff"/>
    <ellipse cx="34" cy="29" rx="8" ry="8" fill="#fff"/>
    <rect x="5" y="31" width="38" height="10" rx="3" fill="#fff"/>
    <circle cx="35" cy="34" r="5.5" fill="#7C3AED"/>
    <circle cx="35" cy="34" r="2.5" fill="#fff" opacity="0.5"/>
  </svg>
);

const NavItem = ({ to, label, Icon, end }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
        borderRadius: 10, marginBottom: 3, textDecoration: 'none',
        transition: 'all 0.15s ease',
        background: isActive
          ? 'rgba(124,58,237,0.18)'
          : hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
        color: isActive ? '#c4b5fd' : hovered ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.42)',
        fontWeight: isActive ? 600 : 400,
        fontSize: 13.5,
        borderLeft: isActive ? '3px solid #7C3AED' : '3px solid transparent',
      })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon sx={{ fontSize: 18 }} />
      <span>{label}</span>
    </NavLink>
  );
};

const CustomerLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const tier     = getTier(user?.lifetimePoints || 0);
  const tierMeta = TIER_PALETTE[tier.name] || TIER_PALETTE.Bronze;

  const initials = user?.name
    ? user.name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleLogout = async () => {
    try { await logout(); } finally { navigate('/login', { replace: true }); }
  };

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      {/* ═══════════════════ SIDEBAR ═══════════════════ */}
      <aside style={{
        width: 238, flexShrink: 0,
        background: '#1A1C2E',
        display: 'flex', flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        position: 'relative', overflow: 'hidden', zIndex: 10,
      }}>
        {/* glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at -20% 80%, rgba(124,58,237,0.14) 0%, transparent 60%)',
        }}/>

        {/* Brand header */}
        <div style={{ padding: '26px 18px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
            }}>
              <LogoMark />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: 1.2, lineHeight: 1.1, textTransform: 'uppercase' }}>
                Cloud Laundry.lk
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9.5, letterSpacing: 1.8, textTransform: 'uppercase', marginTop: 3 }}>
                Customer Panel
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => <NavItem key={item.to} {...item} />)}
        </nav>

        {/* User footer */}
        <div style={{ padding: '14px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 6px 12px' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 12,
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                color: '#e2e2f0', fontWeight: 600, fontSize: 13,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.name || 'Customer'}
              </div>
              <div style={{ color: tierMeta.color, fontSize: 10, fontWeight: 600, letterSpacing: 0.9, textTransform: 'uppercase', marginTop: 1 }}>
                {tierMeta.label}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '9px 12px', display: 'flex', alignItems: 'center',
              gap: 8, border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: 9, color: '#f87171', fontSize: 12.5, fontWeight: 500,
              cursor: 'pointer', background: 'rgba(239,68,68,0.07)', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}
          >
            <LogoutIcon sx={{ fontSize: 16 }} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ═══════════════════ MAIN AREA ═══════════════════ */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
};

export default CustomerLayout;

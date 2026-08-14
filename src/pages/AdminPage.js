import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardIcon            from '@mui/icons-material/Dashboard';
import Inventory2Icon           from '@mui/icons-material/Inventory2';
import GroupIcon                from '@mui/icons-material/Group';
import ManageAccountsIcon       from '@mui/icons-material/ManageAccounts';
import CreditCardIcon           from '@mui/icons-material/CreditCard';
import StarIcon                 from '@mui/icons-material/Star';
import ErrorOutlineIcon         from '@mui/icons-material/ErrorOutline';
import ArticleIcon              from '@mui/icons-material/Article';
import SettingsIcon             from '@mui/icons-material/Settings';
import LocationOnIcon           from '@mui/icons-material/LocationOn';
import NotificationsIcon        from '@mui/icons-material/Notifications';
import LogoutIcon               from '@mui/icons-material/Logout';
import VerifiedUserIcon         from '@mui/icons-material/VerifiedUser';

import InventoryPage          from './InventoryPage';
import MaterialRequestsPage   from './MaterialRequestsPage';
import CompletionReportsPage  from './CompletionReportsPage';
import AlertsPage             from './AlertsPage';
import MonthlyReportPage      from './MonthlyReportPage';

/* ─── Constants ─────────────────────────────────────────── */
const SIDEBAR_W     = 240;
const SIDEBAR_BG    = '#1e1534';
const SIDEBAR_HOVER = 'rgba(124,58,237,0.15)';
const ACCENT        = '#7C3AED';
const DARK_BG       = '#0F1117';

const NAV_ITEMS = [
  { id: 'overview',   label: 'Overview',         Icon: DashboardIcon },
  { id: 'bookings',   label: 'Bookings',          Icon: CreditCardIcon },
  { id: 'inventory',  label: 'Inventory',         Icon: Inventory2Icon },
  { id: 'staff',      label: 'Staff',             Icon: GroupIcon },
  { id: 'admins',     label: 'Admin Management',  Icon: ManageAccountsIcon },
  { id: 'customers',  label: 'Customers',         Icon: GroupIcon },
  { id: 'loyalty',    label: 'Loyalty',           Icon: StarIcon },
  { id: 'reports',    label: 'Reports',           Icon: ArticleIcon },
  { id: 'alerts',     label: 'Alerts',            Icon: ErrorOutlineIcon },
  { id: 'locations',  label: 'Locations',         Icon: LocationOnIcon },
  { id: 'settings',   label: 'Settings',          Icon: SettingsIcon },
];

const INV_TABS = ['Inventory', 'Material Requests', 'Completion Reports', 'Alerts', 'Monthly Report'];

/* ─── Tiny SVG charts ────────────────────────────────────── */
const REVENUE_PTS = [
  [0, 80], [40, 60], [80, 70], [120, 45],
  [160, 55], [200, 30], [240, 50], [280, 20], [320, 35],
];

const toPath = (pts, h = 100) =>
  pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${h - y}`).join(' ');

const RevenueChart = () => {
  const h = 100, w = 320;
  const linePts = REVENUE_PTS;
  const areaClose = ` L${linePts[linePts.length - 1][0]},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 120 }}>
      <defs>
        <linearGradient id="rv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={ACCENT} stopOpacity="0.35" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={toPath(linePts, h) + areaClose} fill="url(#rv)" />
      <path d={toPath(linePts, h)} fill="none" stroke={ACCENT} strokeWidth="2" />
      {linePts.map(([x, y]) => (
        <circle key={x} cx={x} cy={h - y} r="3" fill={ACCENT} />
      ))}
    </svg>
  );
};

const DonutChart = ({ segments }) => {
  const r = 40, cx = 50, cy = 50;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 100 100" style={{ width: 120, height: 120 }}>
      {segments.map(({ pct, color, label }) => {
        const dash = (pct / 100) * circ;
        const el = (
          <circle
            key={label}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 50 50)"
          />
        );
        offset += dash;
        return el;
      })}
      <circle cx={cx} cy={cy} r="28" fill="#f8fafc" />
    </svg>
  );
};

/* ─── Stat card ──────────────────────────────────────────── */
const StatCard = ({ label, value, sub, color = ACCENT }) => (
  <div style={{
    background: '#ffffff', borderRadius: 12, padding: '20px 24px',
    flex: 1, minWidth: 140,
    border: '1px solid #e5e7eb',
    borderLeft: `4px solid ${color}`,
  }}>
    <p style={{ color: '#6B7280', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
    <p style={{ color: '#111827', fontSize: 26, fontWeight: 700, margin: 0 }}>{value}</p>
    {sub && <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>{sub}</p>}
  </div>
);

/* ─── Coming Soon placeholder ────────────────────────────── */
const ComingSoon = ({ name }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', flex: 1, gap: 12, color: '#6B7280',
  }}>
    <VerifiedUserIcon style={{ fontSize: 56, color: '#D1D5DB' }} />
    <p style={{ fontSize: 20, fontWeight: 600, color: '#374151', margin: 0 }}>{name}</p>
    <p style={{ fontSize: 14, margin: 0 }}>This section is under construction.</p>
  </div>
);

/* ─── Overview content ───────────────────────────────────── */
const DONUT_SEGS = [
  { pct: 53, color: '#10B981', label: 'Complete' },
  { pct: 19, color: ACCENT,    label: 'Pending' },
  { pct: 8,  color: '#EF4444', label: 'Cancelled' },
  { pct: 20, color: '#F59E0B', label: 'Other' },
];

const RECENT = [
  { id: '#BK-0041', customer: 'Sahan Perera',  service: 'Deep Clean', date: '2026-04-29', status: 'Pending',   amount: 'LKR 4,500' },
  { id: '#BK-0040', customer: 'Nimali Dias',    service: 'Laundry',    date: '2026-04-29', status: 'Complete',  amount: 'LKR 1,800' },
  { id: '#BK-0039', customer: 'Kasun Silva',    service: 'Ironing',    date: '2026-04-28', status: 'Complete',  amount: 'LKR 950'   },
  { id: '#BK-0038', customer: 'Priya Fernando', service: 'Deep Clean', date: '2026-04-28', status: 'Cancelled', amount: 'LKR 4,500' },
];

const STATUS_COLOR = { Complete: '#10B981', Pending: '#F59E0B', Cancelled: '#EF4444' };

const OverviewContent = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

    {/* Stat cards */}
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <StatCard label="Today's Orders" value="42"          color={ACCENT}    />
      <StatCard label="Completed"      value="28"          color="#10B981"   />
      <StatCard label="Cancelled"      value="4"           color="#EF4444"   />
      <StatCard label="Pending"        value="10"          color="#F59E0B"   />
      <StatCard label="Revenue"        value="LKR 125,000" color="#2563EB" sub="April 2026" />
    </div>

    {/* Charts row */}
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>

      {/* Revenue area chart */}
      <div style={{ background: '#ffffff', borderRadius: 12, padding: 20, flex: 2, minWidth: 260, border: '1px solid #e5e7eb' }}>
        <p style={{ color: '#111827', fontWeight: 600, marginBottom: 12 }}>Revenue — Last 9 Days</p>
        <RevenueChart />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun','Mon','Tue'].map(d => (
            <span key={d} style={{ color: '#9CA3AF', fontSize: 11 }}>{d}</span>
          ))}
        </div>
      </div>

      {/* Donut chart */}
      <div style={{ background: '#ffffff', borderRadius: 12, padding: 20, flex: 1, minWidth: 200, border: '1px solid #e5e7eb' }}>
        <p style={{ color: '#111827', fontWeight: 600, marginBottom: 12 }}>Booking Status</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <DonutChart segments={DONUT_SEGS} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DONUT_SEGS.map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                <span style={{ color: '#6B7280', fontSize: 13 }}>{s.label} {s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Recent bookings table */}
    <div style={{ background: '#ffffff', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb' }}>
      <p style={{ color: '#111827', fontWeight: 600, marginBottom: 14 }}>Recent Bookings</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Booking ID','Customer','Service','Date','Status','Amount'].map(h => (
              <th key={h} style={{ color: '#6B7280', fontSize: 12, textAlign: 'left', paddingBottom: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RECENT.map((r, i) => (
            <tr key={r.id} style={{ borderTop: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px 0', color: ACCENT,    fontSize: 13 }}>{r.id}</td>
              <td style={{ padding: '12px 0', color: '#374151', fontSize: 13 }}>{r.customer}</td>
              <td style={{ padding: '12px 0', color: '#6B7280', fontSize: 13 }}>{r.service}</td>
              <td style={{ padding: '12px 0', color: '#6B7280', fontSize: 13 }}>{r.date}</td>
              <td style={{ padding: '12px 0' }}>
                <span style={{
                  background: `${STATUS_COLOR[r.status]}22`,
                  color: STATUS_COLOR[r.status],
                  borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600,
                }}>
                  {r.status}
                </span>
              </td>
              <td style={{ padding: '12px 0', color: '#374151', fontSize: 13 }}>{r.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/* ─── AdminPage ──────────────────────────────────────────── */
const AdminPage = () => {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const [activeNav,    setActiveNav]    = useState('overview');
  const [activeInvTab, setActiveInvTab] = useState('Inventory');

  const handleLogout = async () => {
    try { await logout(); } finally { navigate('/login', { replace: true }); }
  };

  const isInventory = activeNav === 'inventory';
  const contentBg   = '#f8fafc';

  /* ── render main area ── */
  const renderMain = () => {
    if (activeNav === 'overview') return <OverviewContent />;

    if (isInventory) {
      if (activeInvTab === 'Inventory')           return <InventoryPage isEmbedded />;
      if (activeInvTab === 'Material Requests')   return <MaterialRequestsPage isEmbedded />;
      if (activeInvTab === 'Completion Reports')  return <CompletionReportsPage isEmbedded />;
      if (activeInvTab === 'Alerts')              return <AlertsPage isEmbedded />;
      if (activeInvTab === 'Monthly Report')      return <MonthlyReportPage isEmbedded />;
      return <InventoryPage isEmbedded />;
    }

    const item = NAV_ITEMS.find(n => n.id === activeNav);
    return <ComingSoon name={item?.label ?? activeNav} />;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter','Segoe UI',sans-serif", background: contentBg }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: SIDEBAR_W, flexShrink: 0, background: SIDEBAR_BG,
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh',
        overflowY: 'auto', zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <VerifiedUserIcon style={{ fontSize: 18, color: '#fff' }} />
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: 0 }}>Cloud Laundry</p>
              <p style={{ color: '#94A3B8', fontSize: 11, margin: 0 }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = activeNav === id;
            return (
              <button
                key={id}
                onClick={() => { setActiveNav(id); if (id === 'inventory') setActiveInvTab('Inventory'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', padding: '10px 20px', border: 'none',
                  background: active ? SIDEBAR_HOVER : 'transparent',
                  borderLeft: active ? `3px solid ${ACCENT}` : '3px solid transparent',
                  color: active ? '#fff' : '#94A3B8',
                  cursor: 'pointer', textAlign: 'left', fontSize: 14,
                  transition: 'all 0.15s',
                }}
              >
                <Icon style={{ fontSize: 20 }} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '12px 0' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', padding: '10px 20px', border: 'none',
              background: 'transparent', color: '#f87171',
              cursor: 'pointer', fontSize: 14,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogoutIcon style={{ fontSize: 20 }} />
            Log Out
          </button>
        </div>
      </aside>

      {/* ── Main column ── */}
      <div style={{ marginLeft: SIDEBAR_W, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 28px', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', position: 'relative' }}>
              <NotificationsIcon style={{ fontSize: 22 }} />
              <span style={{
                position: 'absolute', top: -2, right: -2,
                width: 8, height: 8, borderRadius: '50%', background: '#EF4444',
              }} />
            </button>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}>A</div>
          </div>
        </header>

        {/* Inventory sub-nav */}
        {isInventory && (
          <div style={{
            background: ACCENT,
            padding: '0 28px',
            display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto',
            height: 48, flexShrink: 0,
          }}>
            {INV_TABS.map(tab => {
              const active = activeInvTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveInvTab(tab)}
                  style={{
                    padding: '0 18px', height: 36,
                    border: 'none',
                    background: active ? '#ffffff' : 'transparent',
                    color: active ? ACCENT : '#ffffff',
                    borderRadius: 6,
                    cursor: 'pointer', fontSize: 13.5, fontWeight: active ? 700 : 500,
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        )}

        {/* Page content */}
        <main style={{
          flex: 1,
          padding: isInventory ? 0 : 28,
          background: contentBg,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {renderMain()}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;

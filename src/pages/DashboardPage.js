import React from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarMonthIcon       from '@mui/icons-material/CalendarMonth';
import EmojiEventsIcon         from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon         from '@mui/icons-material/CheckCircle';
import AccessTimeIcon          from '@mui/icons-material/AccessTime';
import ArrowForwardIosIcon     from '@mui/icons-material/ArrowForwardIos';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import CustomerLayout          from '../components/layout/CustomerLayout';
import { useAuth }             from '../context/AuthContext';
import { getTier, getNextTier } from '../constants/loyalty';

const TIER_ICONS = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎' };

/* ── Stat card ───────────────────────────────────────────── */
const StatCard = ({ label, value, sub, icon: Icon, iconColor, accent, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: '#ffffff',
      border: '1px solid rgba(0,0,0,0.06)',
      borderRadius: 14, padding: '18px 20px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${accent || '#7C3AED'}18`; e.currentTarget.style.borderColor = `${accent || '#7C3AED'}30`; }}}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase' }}>
        {label}
      </span>
      <div style={{
        width: 32, height: 32, borderRadius: 9,
        background: `${iconColor || '#7C3AED'}12`,
        border: `1px solid ${iconColor || '#7C3AED'}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon sx={{ fontSize: 16, color: iconColor || '#7C3AED' }}/>
      </div>
    </div>
    <div style={{ color: '#111827', fontWeight: 800, fontSize: 26, lineHeight: 1, marginBottom: 4 }}>
      {value}
    </div>
    {sub && (
      <div style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>{sub}</div>
    )}
    {onClick && (
      <ArrowForwardIosIcon sx={{
        position: 'absolute', right: 14, bottom: 16,
        fontSize: 10, color: 'rgba(0,0,0,0.15)',
      }}/>
    )}
  </div>
);

/* ── Activity row ────────────────────────────────────────── */
const SERVICE_LABELS = {
  wash_and_fold:    'Wash & Fold',
  dry_cleaning:     'Dry Cleaning',
  ironing:          'Ironing',
  wash_and_iron:    'Wash & Iron',
  express_service:  'Express Service',
  stain_removal:    'Stain Removal',
  curtain_cleaning: 'Curtain Cleaning',
  shoe_cleaning:    'Shoe Cleaning',
};

const ActivityRow = ({ booking }) => {
  const statusMap = {
    confirmed:   { color: '#10B981', label: 'Confirmed' },
    in_progress: { color: '#F59E0B', label: 'In Progress' },
    completed:   { color: '#06B6D4', label: 'Completed' },
    pending:     { color: '#7C3AED', label: 'Pending' },
    cancelled:   { color: '#EF4444', label: 'Cancelled' },
  };
  const s = statusMap[booking.status] || { color: '#6B7280', label: booking.status };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '12px 0',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: 'rgba(124,58,237,0.08)',
        border: '1px solid rgba(124,58,237,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <LocalLaundryServiceIcon sx={{ fontSize: 16, color: '#7C3AED' }}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: '#111827', fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {SERVICE_LABELS[booking.serviceType] || 'Laundry Service'}
        </div>
        <div style={{ color: '#9CA3AF', fontSize: 11.5, marginTop: 2 }}>
          {booking.bookingRef ? `#${booking.bookingRef}` : ''} · {booking.scheduledDate
            ? new Date(booking.scheduledDate).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—'}
        </div>
      </div>
      <span style={{
        padding: '3px 10px', borderRadius: 20,
        background: `${s.color}12`,
        border: `1px solid ${s.color}30`,
        color: s.color, fontSize: 11, fontWeight: 600,
      }}>
        {s.label}
      </span>
    </div>
  );
};

/* ── Main DashboardPage ──────────────────────────────────── */
const DashboardPage = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const balance  = user?.currentBalance  || 0;
  const lifePts  = user?.lifetimePoints  || 0;
  const tier     = getTier(lifePts);
  const nextTier = getNextTier(tier.name);
  const progress = nextTier
    ? Math.min(100, ((lifePts - tier.min) / (nextTier.min - tier.min)) * 100)
    : 100;

  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <CustomerLayout>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: '#f8fafc', overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: '24px 32px 18px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          flexShrink: 0,
          background: '#ffffff',
        }}>
          <h1 style={{ color: '#111827', fontWeight: 800, fontSize: 22, margin: 0, lineHeight: 1.2 }}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{ color: '#6B7280', fontSize: 13, margin: '4px 0 0' }}>
            Here's your account overview for today
          </p>
        </div>

        {/* ── Scrollable content ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            <StatCard
              label="Total Bookings"
              value={user?.totalBookings ?? 0}
              sub="All time"
              icon={CalendarMonthIcon}
              iconColor="#7C3AED"
              accent="#7C3AED"
              onClick={() => navigate('/bookings')}
            />
            <StatCard
              label="Active Services"
              value={user?.activeServices ?? 0}
              sub="Currently in progress"
              icon={AccessTimeIcon}
              iconColor="#F59E0B"
              accent="#F59E0B"
              onClick={() => navigate('/bookings')}
            />
            <StatCard
              label="Loyalty Balance"
              value={balance.toLocaleString()}
              sub={`${TIER_ICONS[tier.name]} ${tier.name} Member`}
              icon={EmojiEventsIcon}
              iconColor={tier.color}
              accent={tier.color}
              onClick={() => navigate('/loyalty')}
            />
            <StatCard
              label="Bookings Completed"
              value={user?.completedBookings ?? 0}
              sub="Successfully delivered"
              icon={CheckCircleIcon}
              iconColor="#10B981"
              accent="#10B981"
              onClick={() => navigate('/bookings')}
            />
          </div>

          {/* main content row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>

            {/* Ongoing activity */}
            <div style={{
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 14, padding: '20px 22px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ color: '#111827', fontWeight: 700, fontSize: 15 }}>Ongoing Activity</div>
                <button
                  onClick={() => navigate('/bookings')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#7C3AED', fontSize: 12.5, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: 0,
                  }}
                >
                  View all <ArrowForwardIosIcon sx={{ fontSize: 9 }}/>
                </button>
              </div>

              {user?.recentBookings?.length > 0 ? (
                (user.recentBookings).slice(0, 5).map((b, i) => (
                  <ActivityRow key={b._id || i} booking={b} />
                ))
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', padding: '36px 0', gap: 10,
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: 'rgba(124,58,237,0.08)',
                    border: '1px solid rgba(124,58,237,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>🧺</div>
                  <div style={{ color: '#111827', fontWeight: 600, fontSize: 14 }}>No upcoming bookings</div>
                  <div style={{ color: '#9CA3AF', fontSize: 12.5, textAlign: 'center', maxWidth: 220 }}>
                    Book your first service and start earning loyalty points
                  </div>
                  <button
                    onClick={() => navigate('/bookings')}
                    style={{
                      marginTop: 4, padding: '10px 20px',
                      background: 'linear-gradient(135deg, #7C3AED, #9333ea)',
                      border: 'none', borderRadius: 9,
                      color: '#fff', fontWeight: 700, fontSize: 13,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
                    }}
                  >
                    Book a Service
                  </button>
                </div>
              )}
            </div>

            {/* Loyalty mini card */}
            <div style={{
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 14, padding: '20px 18px',
              display: 'flex', flexDirection: 'column', gap: 14,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ color: '#111827', fontWeight: 700, fontSize: 15 }}>Loyalty Status</div>
                <span style={{ fontSize: 20 }}>{TIER_ICONS[tier.name]}</span>
              </div>

              {/* tier block */}
              <div style={{
                borderRadius: 10, padding: '12px 14px',
                background: `${tier.color}0d`,
                border: `1px solid ${tier.color}25`,
              }}>
                <div style={{ color: tier.color, fontWeight: 800, fontSize: 18 }}>{tier.name}</div>
                <div style={{ color: '#6B7280', fontSize: 11.5, marginTop: 2 }}>
                  {balance.toLocaleString()} pts · {lifePts.toLocaleString()} lifetime
                </div>
              </div>

              {/* progress */}
              {nextTier ? (
                <>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>Progress to {nextTier.name}</span>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>{Math.round(progress)}%</span>
                    </div>
                    <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        background: tier.gradient,
                        width: `${progress}%`,
                        transition: 'width 0.6s ease',
                      }}/>
                    </div>
                    <div style={{ color: '#9CA3AF', fontSize: 11, marginTop: 5 }}>
                      {(nextTier.min - lifePts).toLocaleString()} lifetime pts to {nextTier.name}
                    </div>
                  </div>

                  <div style={{
                    padding: '9px 12px', borderRadius: 9,
                    background: `${nextTier.color}0a`,
                    border: `1px solid ${nextTier.color}20`,
                  }}>
                    <div style={{ color: nextTier.color, fontWeight: 600, fontSize: 12 }}>
                      Unlock at {nextTier.name}: {nextTier.badge}
                    </div>
                    <div style={{ color: '#9CA3AF', fontSize: 10.5, marginTop: 2 }}>
                      One-time upgrade reward
                    </div>
                  </div>
                </>
              ) : (
                <div style={{
                  padding: '12px 14px', borderRadius: 10, textAlign: 'center',
                  background: 'rgba(6,182,212,0.07)',
                  border: '1px solid rgba(6,182,212,0.2)',
                }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>🎉</div>
                  <div style={{ color: '#06B6D4', fontWeight: 700, fontSize: 13 }}>Maximum Tier Reached!</div>
                  <div style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>You're a Platinum member</div>
                </div>
              )}

              <button
                onClick={() => navigate('/loyalty')}
                style={{
                  width: '100%', padding: '10px 0',
                  border: '1px solid rgba(124,58,237,0.25)',
                  borderRadius: 9,
                  background: 'rgba(124,58,237,0.06)',
                  color: '#7C3AED', fontWeight: 600, fontSize: 13,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,58,237,0.06)'}
              >
                View Full Loyalty Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
      `}</style>
    </CustomerLayout>
  );
};

export default DashboardPage;

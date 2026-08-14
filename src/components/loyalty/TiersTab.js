import React from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LockOutlinedIcon       from '@mui/icons-material/LockOutlined';
import StarOutlineIcon        from '@mui/icons-material/StarOutline';
import { TIERS, getNextTier } from '../../constants/loyalty';

const TIER_ICONS = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎' };

const TIER_PERKS = {
  Bronze:   ['1 pt per Rs. 100 spent', 'Basic customer support', 'Order tracking'],
  Silver:   ['1.5 pts per Rs. 100 spent', '5% one-time upgrade discount', 'Priority customer support', 'Order tracking'],
  Gold:     ['2 pts per Rs. 100 spent', '10% one-time upgrade discount', 'Dedicated support agent', 'Express processing', 'Order tracking'],
  Platinum: ['3 pts per Rs. 100 spent', '15% one-time upgrade discount', 'VIP support line', 'Free express processing', 'Exclusive offers', 'Birthday bonus points'],
};

const TierCard = ({ tier, status }) => {
  const perks    = TIER_PERKS[tier.name] || [];
  const isLocked = status === 'locked';
  const isCurrent = status === 'current';
  const isNext   = status === 'next';

  const statusConfig = {
    starting: { label: 'Starting Tier', bg: 'rgba(217,119,6,0.06)',   border: 'rgba(217,119,6,0.2)',    text: '#D97706' },
    current:  { label: 'Current Tier',  bg: 'rgba(124,58,237,0.06)',  border: `${tier.color}35`,        text: tier.color },
    next:     { label: 'Next Tier',     bg: '#f8fafc',                border: `${tier.color}25`,        text: tier.color },
    locked:   { label: 'Locked',        bg: '#fafafa',                border: 'rgba(0,0,0,0.06)',       text: '#9CA3AF' },
  }[status];

  return (
    <div style={{
      background: statusConfig.bg,
      border: `1px solid ${statusConfig.border}`,
      borderRadius: 14,
      padding: '20px 18px',
      position: 'relative',
      overflow: 'hidden',
      flex: 1,
      opacity: isLocked ? 0.6 : 1,
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: isCurrent ? `0 4px 16px ${tier.color}18` : '0 1px 3px rgba(0,0,0,0.04)',
    }}
      onMouseEnter={e => { if (!isLocked) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${tier.color}18`; }}}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isCurrent ? `0 4px 16px ${tier.color}18` : '0 1px 3px rgba(0,0,0,0.04)'; }}
    >
      {/* status badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 10px', borderRadius: 20,
        background: `${statusConfig.text}12`,
        border: `1px solid ${statusConfig.text}35`,
        marginBottom: 12,
      }}>
        {isCurrent  && <CheckCircleOutlineIcon sx={{ fontSize: 11, color: statusConfig.text }}/>}
        {isLocked   && <LockOutlinedIcon       sx={{ fontSize: 11, color: statusConfig.text }}/>}
        {isNext     && <StarOutlineIcon         sx={{ fontSize: 11, color: statusConfig.text }}/>}
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: statusConfig.text }}>
          {statusConfig.label}
        </span>
      </div>

      {/* icon + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 26 }}>{TIER_ICONS[tier.name]}</span>
        <div>
          <div style={{ color: isLocked ? '#9CA3AF' : '#111827', fontWeight: 800, fontSize: 17 }}>
            {tier.name}
          </div>
          <div style={{ color: '#9CA3AF', fontSize: 11 }}>
            {tier.min === 0 ? '0' : tier.min.toLocaleString()} – {tier.max === Infinity ? '∞' : tier.max.toLocaleString()} pts
          </div>
        </div>
      </div>

      {/* gradient bar accent */}
      <div style={{
        height: 3, borderRadius: 2,
        background: isLocked ? '#e5e7eb' : tier.gradient,
        marginBottom: 14, marginTop: 4,
      }}/>

      {/* badge discount */}
      {tier.badge && (
        <div style={{
          padding: '8px 12px', borderRadius: 9, marginBottom: 12,
          background: `${tier.color}0a`,
          border: `1px solid ${tier.color}22`,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 15 }}>🏷️</span>
          <div>
            <div style={{ color: isLocked ? '#9CA3AF' : tier.color, fontWeight: 700, fontSize: 12.5 }}>
              {tier.badge} Upgrade Reward
            </div>
            <div style={{ color: '#9CA3AF', fontSize: 11, marginTop: 1 }}>
              One-time discount on reaching this tier
            </div>
          </div>
        </div>
      )}

      {/* perks list */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {perks.map((perk, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
              background: isLocked ? '#D1D5DB' : tier.color,
            }}/>
            <span style={{ fontSize: 12.5, color: isLocked ? '#9CA3AF' : '#6B7280', lineHeight: 1.4 }}>
              {perk}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ── Main TiersTab ────────────────────────────────────────── */
const TiersTab = ({ lifetimePoints = 0, points = 0, currentTierName }) => {
  const pts      = lifetimePoints || points;
  const nextTier = getNextTier(currentTierName);

  const getStatus = (tier) => {
    if (tier.name === currentTierName) {
      return currentTierName === 'Bronze' && pts < 100 && tier.name === 'Bronze' ? 'starting' : 'current';
    }
    const idx    = TIERS.findIndex(t => t.name === tier.name);
    const curIdx = TIERS.findIndex(t => t.name === currentTierName);
    if (idx === curIdx + 1) return 'next';
    if (idx > curIdx) return 'locked';
    return 'current';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* progress summary */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 12, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7C3AED, #9333ea)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
        }}>
          {TIER_ICONS[currentTierName]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#111827', fontWeight: 700, fontSize: 14 }}>
            You are currently on <span style={{ color: TIERS.find(t => t.name === currentTierName)?.color }}>{currentTierName} Tier</span>
            {' '}with {pts.toLocaleString()} lifetime points
          </div>
          {nextTier && (
            <div style={{ color: '#6B7280', fontSize: 12.5, marginTop: 2 }}>
              {(nextTier.min - pts).toLocaleString()} more points to reach {nextTier.name} and unlock your {nextTier.badge} reward
            </div>
          )}
          {!nextTier && (
            <div style={{ color: '#06B6D4', fontSize: 12.5, fontWeight: 600, marginTop: 2 }}>
              🎉 You have reached the highest tier — Platinum!
            </div>
          )}
        </div>
      </div>

      {/* tier cards row */}
      <div style={{ display: 'flex', gap: 12 }}>
        {TIERS.map(tier => (
          <TierCard key={tier.name} tier={tier} status={getStatus(tier)} />
        ))}
      </div>

      {/* how tiers work note */}
      <div style={{
        background: 'rgba(124,58,237,0.05)',
        border: '1px solid rgba(124,58,237,0.15)',
        borderRadius: 10, padding: '14px 18px',
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
        <div style={{ color: '#6B7280', fontSize: 12.5, lineHeight: 1.6 }}>
          Tier upgrades are permanent — you never drop a tier. Badge discounts are one-time rewards issued automatically when you cross the threshold
          and expire after 90 days. They apply to your next confirmed booking.
        </div>
      </div>
    </div>
  );
};

export default TiersTab;

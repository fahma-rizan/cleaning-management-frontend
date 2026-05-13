import React from 'react';
import { getTier } from '../../constants/loyalty';

const ICONS = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎' };

const SIZES = {
  sm: { container: 20, icon: 14, font: 10, gap: 4, padding: '2px 8px', radius: 20 },
  md: { container: 26, icon: 18, font: 12, gap: 6, padding: '4px 12px', radius: 20 },
  lg: { container: 36, icon: 24, font: 15, gap: 8, padding: '6px 16px', radius: 24 },
};

const TierBadge = ({ tierName, lifetimePoints, size = 'md', showLabel = true }) => {
  const tier  = tierName ? { name: tierName, color: getTier(0).color, ...getTier(lifetimePoints || 0) } : getTier(lifetimePoints || 0);
  const resolved = tierName ? (getTier(99999) /* find by name */ && { name: tierName, color: getTierColor(tierName), gradient: getTierGradient(tierName) }) : tier;
  const s     = SIZES[size] || SIZES.md;
  const name  = tierName || tier.name;
  const color = getTierColor(name);
  const isPlatinum = name === 'Platinum';

  return (
    <div style={{
      display:        'inline-flex',
      alignItems:     'center',
      gap:            s.gap,
      padding:        s.padding,
      borderRadius:   s.radius,
      background:     `${color}18`,
      border:         `1px solid ${color}44`,
      position:       'relative',
      overflow:       'hidden',
    }}>
      {isPlatinum && (
        <div style={{
          position:   'absolute',
          inset:      0,
          background: `linear-gradient(90deg, transparent 0%, ${color}28 50%, transparent 100%)`,
          animation:  'shimmer 2.4s ease-in-out infinite',
        }}/>
      )}
      <span style={{ fontSize: s.icon, position: 'relative' }}>{ICONS[name] || '🥉'}</span>
      {showLabel && (
        <span style={{
          fontSize:      s.font,
          fontWeight:    700,
          color,
          letterSpacing: 0.5,
          position:      'relative',
        }}>
          {name}
        </span>
      )}
      <style>{`@keyframes shimmer { 0%,100%{transform:translateX(-100%)} 50%{transform:translateX(100%)} }`}</style>
    </div>
  );
};

function getTierColor(name) {
  return { Bronze: '#D97706', Silver: '#7C3AED', Gold: '#F59E0B', Platinum: '#06B6D4' }[name] || '#D97706';
}

export default TierBadge;

import React from 'react';
import { getTier, getNextTier } from '../../constants/loyalty';

const TierProgressBar = ({ lifetimePoints = 0, showLabels = true }) => {
  const tier     = getTier(lifetimePoints);
  const nextTier = getNextTier(tier.name);

  const progress = nextTier
    ? Math.min(100, ((lifetimePoints - tier.min) / (nextTier.min - tier.min)) * 100)
    : 100;

  const ptsToNext = nextTier ? nextTier.min - lifetimePoints : 0;

  return (
    <div style={{ width: '100%' }}>
      {showLabels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: tier.color, fontWeight: 700, textTransform: 'uppercase' }}>
            {tier.name}
          </span>
          {nextTier ? (
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>
              {ptsToNext.toLocaleString()} pts to {nextTier.name}
            </span>
          ) : (
            <span style={{ fontSize: 11, color: '#06B6D4', fontWeight: 600 }}>Max tier reached</span>
          )}
          {nextTier && (
            <span style={{ fontSize: 11, color: nextTier.color, fontWeight: 700, textTransform: 'uppercase' }}>
              {nextTier.name}
            </span>
          )}
        </div>
      )}

      <div style={{
        height: 8, borderRadius: 4,
        background: '#f3f4f6',
        overflow: 'hidden',
      }}>
        <div style={{
          height:     '100%',
          borderRadius: 4,
          width:      `${progress}%`,
          background: tier.gradient,
          transition: 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow:  `0 0 6px ${tier.color}44`,
        }}/>
      </div>

      {showLabels && (
        <div style={{ textAlign: 'right', marginTop: 5, fontSize: 10.5, color: '#9CA3AF' }}>
          {Math.round(progress)}% to {nextTier?.name || 'Platinum'}
        </div>
      )}
    </div>
  );
};

export default TierProgressBar;

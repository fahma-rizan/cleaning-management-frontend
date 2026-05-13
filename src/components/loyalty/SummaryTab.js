import React from 'react';
import { useNavigate } from 'react-router-dom';
import TrendingUpIcon   from '@mui/icons-material/TrendingUp';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import MonetizationOnIcon   from '@mui/icons-material/MonetizationOn';
import { getTier, getNextTier } from '../../constants/loyalty';

/* ── Circular SVG progress ring ───────────────────────── */
const RingProgress = ({ points, progress, tier }) => {
  const R  = 72;
  const C  = 2 * Math.PI * R;
  const offset = C - (progress / 100) * C;
  const gradId = `ring-${tier.name}`;

  return (
    <div style={{ position: 'relative', width: 190, height: 190 }}>
      <svg width="190" height="190" viewBox="0 0 190 190">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={tier.color} stopOpacity="0.6"/>
            <stop offset="100%" stopColor={tier.color}/>
          </linearGradient>
        </defs>
        {/* track */}
        <circle cx="95" cy="95" r={R} fill="none"
          stroke="rgba(255,255,255,0.07)" strokeWidth="11"/>
        {/* fill */}
        <circle cx="95" cy="95" r={R} fill="none"
          stroke={`url(#${gradId})`} strokeWidth="11"
          strokeDasharray={C} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 95 95)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {/* center labels */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
          Current Tier
        </span>
        <span style={{ fontSize: 30, fontWeight: 800, color: '#fff', lineHeight: 1.1, marginTop: 4 }}>
          {points.toLocaleString()}
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
          Points
        </span>
      </div>
    </div>
  );
};

/* ── Mini stat card (right column) ───────────────────── */
const MiniCard = ({ label, icon: Icon, iconColor, children }) => (
  <div style={{
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12, padding: '14px 16px',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <Icon sx={{ fontSize: 14, color: iconColor || 'rgba(255,255,255,0.4)' }}/>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
    {children}
  </div>
);

/* ── How rewards work card ────────────────────────────── */
const RewardCard = ({ icon, title, desc }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12, padding: '16px',
    flex: 1,
  }}>
    <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
    <div style={{ color: '#e2e2f0', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{title}</div>
    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12.5, lineHeight: 1.6 }}>{desc}</div>
  </div>
);

/* ── Main Summary tab ─────────────────────────────────── */
const SummaryTab = ({ summary }) => {
  const navigate = useNavigate();

  if (!summary) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #7C3AED', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}/>
      </div>
    );
  }

  const { points = 0, earnedThisMonth = 0, pointsToNextTier = 0, discountExpiry } = summary;
  const tier      = getTier(points);
  const nextTier  = getNextTier(tier.name);
  const progress  = nextTier
    ? Math.min(100, ((points - tier.min) / (nextTier.min - tier.min)) * 100)
    : 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Top section: ring + right stats ─── */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '28px 28px',
        display: 'flex', gap: 24,
      }}>
        {/* Left: ring + tier info + progress bar */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <RingProgress points={points} progress={progress} tier={tier}/>

          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 22 }}>
              {tier.name} Level
            </div>
            {nextTier && (
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12.5, marginTop: 4 }}>
                Reach {nextTier.name} to unlock a one-time {(nextTier.discount * 100).toFixed(0)}% OFF on your next booking
              </div>
            )}
          </div>

          {nextTier && (
            <div style={{ width: '100%', maxWidth: 340 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: tier.color, fontWeight: 600, textTransform: 'uppercase' }}>
                  {tier.name}
                </span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                  {pointsToNextTier.toLocaleString()} PTS TO {nextTier.name.toUpperCase()} — {Math.round(progress)}% Completed
                </span>
                <span style={{ fontSize: 11, color: nextTier.color, fontWeight: 600, textTransform: 'uppercase' }}>
                  {nextTier.name}
                </span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  background: tier.gradient,
                  width: `${progress}%`,
                  transition: 'width 0.6s ease',
                }}/>
              </div>
            </div>
          )}
        </div>

        {/* Right: stat cards */}
        <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Earned this month */}
          <MiniCard label="Earned This Month" icon={TrendingUpIcon} iconColor="#10B981">
            <div style={{ color: '#10B981', fontWeight: 700, fontSize: 22 }}>
              +{earnedThisMonth.toLocaleString()} pts
            </div>
          </MiniCard>

          {/* Points to next badge */}
          <MiniCard label="Points to Next Badge" icon={MonetizationOnIcon} iconColor={nextTier?.color || '#F59E0B'}>
            {nextTier ? (
              <>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 22 }}>
                  {pointsToNextTier.toLocaleString()} pts
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>
                  to reach {nextTier.name} Tier
                </div>
              </>
            ) : (
              <div style={{ color: '#06B6D4', fontWeight: 600, fontSize: 14 }}>
                🎉 Max Tier Reached
              </div>
            )}
          </MiniCard>

          {/* Badge discount */}
          {tier.badge && (
            <MiniCard label="Badge Discount" icon={WorkspacePremiumIcon} iconColor={tier.color}>
              <div style={{ color: '#10B981', fontWeight: 700, fontSize: 18 }}>
                {tier.badge} Ready
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11.5, marginTop: 3, lineHeight: 1.5 }}>
                {tier.name} tier reward{discountExpiry ? ` · Expires ${new Date(discountExpiry).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}<br/>
                Applies on your next booking automatically
              </div>
            </MiniCard>
          )}

          {/* Redeem button */}
          <button
            onClick={() => navigate('/loyalty?tab=history')}
            style={{
              padding: '12px 0', border: 'none', borderRadius: 10,
              background: 'linear-gradient(135deg, #7C3AED, #9333ea)',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(124,58,237,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            Redeem Points →
          </button>
        </div>
      </div>

      {/* ── How rewards work ─── */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '20px 24px',
      }}>
        <div style={{ color: '#e2e2f0', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
          How Your Rewards Work
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12.5, marginBottom: 16 }}>
          Reach a new tier to unlock your one-time badge discount. Combine it with points redemption for maximum savings!
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <RewardCard
            icon="🏆"
            title="Badge Upgrade Discount"
            desc="One-time discount when you reach Silver (3%), Gold (5%) or Platinum (7%). Valid 90 days from upgrade date."
          />
          <RewardCard
            icon="🪙"
            title="Points Redemption"
            desc="10 pts = Rs. 10 off. Minimum 50 points to redeem. Maximum 50% of total booking value."
          />
        </div>
      </div>
    </div>
  );
};

export default SummaryTab;

// Tier thresholds are based on LIFETIME points (never reset)
export const TIERS = [
  {
    name:      'Bronze',
    min:       0,
    max:       99,
    discount:  0,
    earningRate: 1.0,   // points per 100 Rs
    badge:     null,
    color:     '#D97706',
    colorSoft: '#FEF3C7',
    border:    '#D97706',
    gradient:  'linear-gradient(135deg, #92400E, #D97706)',
  },
  {
    name:      'Silver',
    min:       100,
    max:       299,
    discount:  0.05,
    earningRate: 1.5,
    badge:     '5% OFF',
    color:     '#7C3AED',
    colorSoft: '#EDE9FE',
    border:    '#7C3AED',
    gradient:  'linear-gradient(135deg, #4C1D95, #7C3AED)',
  },
  {
    name:      'Gold',
    min:       300,
    max:       699,
    discount:  0.10,
    earningRate: 2.0,
    badge:     '10% OFF',
    color:     '#F59E0B',
    colorSoft: '#FEF3C7',
    border:    '#F59E0B',
    gradient:  'linear-gradient(135deg, #B45309, #F59E0B)',
  },
  {
    name:      'Platinum',
    min:       700,
    max:       Infinity,
    discount:  0.15,
    earningRate: 3.0,
    badge:     '15% OFF',
    color:     '#06B6D4',
    colorSoft: '#ECFEFF',
    border:    '#06B6D4',
    gradient:  'linear-gradient(135deg, #0E7490, #06B6D4)',
  },
];

// Takes LIFETIME points to determine tier
export const getTier = (lifetimePoints = 0) =>
  [...TIERS].reverse().find(t => lifetimePoints >= t.min) || TIERS[0];

export const getNextTier = (currentTierName) => {
  const idx = TIERS.findIndex(t => t.name === currentTierName);
  return idx >= 0 && idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
};

export const TIER_META = Object.fromEntries(
  TIERS.map(t => [t.name, { icon: tierIcon(t.name), color: t.color, bg: t.colorSoft, border: t.border }])
);

function tierIcon(name) {
  return { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎' }[name] || '🥉';
}

export const TRANSACTION_LABELS = {
  earned:   { label: 'Earned',   color: '#10B981' },
  redeemed: { label: 'Redeemed', color: '#F59E0B' },
  reversed: { label: 'Reversed', color: '#EF4444' },
  expired:  { label: 'Expired',  color: '#6B7280' },
  bonus:    { label: 'Bonus',    color: '#A78BFA' },
};

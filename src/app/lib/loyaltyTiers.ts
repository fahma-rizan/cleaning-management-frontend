// Loyalty tier definitions — kept in sync with backend/controllers/loyaltyController.js.
// Tiers are based on LIFETIME points (never reset); the redeemable balance is separate
// and resets every Dec 31.

export interface LoyaltyTier {
  name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  min: number;
  max: number;
  discount: number; // fraction, e.g. 0.10 = 10%
  earningRate: number; // points earned per Rs. 100 spent
  color: string;
  bg: string;
  ring: string;
  gradient: string;
}

export const LOYALTY_TIERS: LoyaltyTier[] = [
  { name: 'Bronze',   min: 0,   max: 99,       discount: 0,    earningRate: 1.0, color: 'text-amber-700',  bg: 'bg-amber-100',  ring: 'ring-amber-300',  gradient: 'from-amber-500 to-amber-700' },
  { name: 'Silver',   min: 100, max: 299,      discount: 0.05, earningRate: 1.5, color: 'text-slate-600',  bg: 'bg-slate-100',  ring: 'ring-slate-300',  gradient: 'from-slate-400 to-slate-600' },
  { name: 'Gold',     min: 300, max: 699,      discount: 0.10, earningRate: 2.0, color: 'text-yellow-600', bg: 'bg-yellow-100', ring: 'ring-yellow-300', gradient: 'from-yellow-400 to-yellow-600' },
  { name: 'Platinum', min: 700, max: Infinity, discount: 0.15, earningRate: 3.0, color: 'text-purple-600', bg: 'bg-purple-100', ring: 'ring-purple-300', gradient: 'from-purple-500 to-purple-700' },
];

export const getTierByName = (name?: string): LoyaltyTier => {
  const n = (name || 'bronze').toLowerCase();
  return LOYALTY_TIERS.find(t => t.name.toLowerCase() === n) || LOYALTY_TIERS[0];
};

export const getTierByLifetimePoints = (points = 0): LoyaltyTier =>
  [...LOYALTY_TIERS].reverse().find(t => points >= t.min) || LOYALTY_TIERS[0];

export const getNextTier = (name?: string): LoyaltyTier | null => {
  const idx = LOYALTY_TIERS.findIndex(t => t.name.toLowerCase() === (name || 'bronze').toLowerCase());
  return idx >= 0 && idx < LOYALTY_TIERS.length - 1 ? LOYALTY_TIERS[idx + 1] : null;
};

export const TRANSACTION_META: Record<string, { label: string; color: string }> = {
  earned:   { label: 'Earned',       color: 'text-green-600 bg-green-100' },
  redeemed: { label: 'Redeemed',     color: 'text-red-600 bg-red-100' },
  reversed: { label: 'Reversed',     color: 'text-orange-600 bg-orange-100' },
  expired:  { label: 'Expired',      color: 'text-gray-500 bg-gray-100' },
  bonus:    { label: 'Tier Bonus',   color: 'text-purple-600 bg-purple-100' },
};

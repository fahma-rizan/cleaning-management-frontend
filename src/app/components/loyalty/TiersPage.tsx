import { Check, X } from 'lucide-react';

interface TiersPageProps {
  currentTier: string;
}

interface Tier {
  id: string;
  name: string;
  range: string;
  icon: string;
  color: string;
  borderColor: string;
  bgColor: string;
  badge?: string;
  badgeColor?: string;
  benefits: string[];
  buttonText: string;
  buttonStyle: string;
  isActive?: boolean;
  isNext?: boolean;
  isLocked?: boolean;
}

export default function TiersPage({ currentTier }: TiersPageProps) {
  const tiers: Tier[] = [
    {
      id: 'bronze',
      name: 'BRONZE',
      range: '0 – 999 PTS',
      icon: '🥉',
      color: 'text-[#b45309]',
      borderColor: 'border-[#b45309]/30',
      bgColor: 'bg-[#b45309]/5',
      badge: 'STARTING TIER',
      badgeColor: 'bg-[#94a3b8]/20 text-[#94a3b8]',
      benefits: [
        'Earning Rate: 1 pt per Rs. 10',
        'Badge Discount: None',
        'Points Redemption: ✅'
      ],
      buttonText: 'Starting Tier',
      buttonStyle: 'bg-[#94a3b8]/20 text-[#94a3b8] cursor-not-allowed',
      isActive: currentTier === 'bronze'
    },
    {
      id: 'silver',
      name: 'SILVER',
      range: '1,000 – 2,499 PTS',
      icon: '🥈',
      color: 'text-[#94a3b8]',
      borderColor: 'border-[#7c3aed]',
      bgColor: 'bg-[#7c3aed]/5',
      badge: 'CURRENT TIER',
      badgeColor: 'bg-[#7c3aed] text-white',
      benefits: [
        'Earning Rate: 1 pt per Rs. 10',
        '🎁 One-Time Badge Discount: 3% OFF',
        'Discount valid: 90 days after upgrade',
        'One use only',
        'Points Redemption: ✅'
      ],
      buttonText: 'Active',
      buttonStyle: 'bg-[#7c3aed] text-white',
      isActive: currentTier === 'silver'
    },
    {
      id: 'gold',
      name: 'GOLD',
      range: '2,500 – 4,999 PTS',
      icon: '🏅',
      color: 'text-[#f59e0b]',
      borderColor: 'border-[#f59e0b]',
      bgColor: 'bg-[#f59e0b]/5',
      badge: 'NEXT TIER',
      badgeColor: 'bg-[#f59e0b] text-white',
      benefits: [
        'Earning Rate: 1 pt per Rs. 10',
        '🎁 One-Time Badge Discount: 5% OFF',
        'Discount valid: 90 days after upgrade',
        'One use only',
        'Points Redemption: ✅'
      ],
      buttonText: 'Unlock Now',
      buttonStyle: 'bg-transparent border-2 border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b]/10',
      isNext: currentTier === 'silver'
    },
    {
      id: 'platinum',
      name: 'PLATINUM',
      range: '5,000+ PTS',
      icon: '💎',
      color: 'text-[#e2e8f0]',
      borderColor: 'border-white/20',
      bgColor: 'bg-white/5',
      badge: 'LOCKED',
      badgeColor: 'bg-[#94a3b8]/20 text-[#94a3b8]',
      benefits: [
        'Earning Rate: 1 pt per Rs. 10',
        '🎁 One-Time Badge Discount: 7% OFF',
        'Discount valid: 90 days after upgrade',
        'One use only',
        'Points Redemption: ✅'
      ],
      buttonText: 'Unlock Now',
      buttonStyle: 'bg-[#94a3b8]/20 text-[#94a3b8] cursor-not-allowed',
      isLocked: true
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Membership Tiers</h2>
        <p className="text-[#94a3b8]">
          Earn more, save more. Reach a new tier to unlock your one-time badge discount.
        </p>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`relative bg-[#1a1a2e] rounded-xl border-2 p-6 transition-all ${
              tier.isActive
                ? `${tier.borderColor} shadow-lg shadow-[#7c3aed]/20`
                : tier.isNext
                ? `${tier.borderColor} shadow-lg shadow-[#f59e0b]/20`
                : tier.borderColor
            } ${tier.isLocked ? 'opacity-60' : ''}`}
          >
            {/* Badge */}
            {tier.badge && (
              <div className="absolute top-4 right-4">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${tier.badgeColor}`}
                >
                  {tier.badge}
                </span>
              </div>
            )}

            {/* Icon */}
            <div className="text-4xl mb-4">{tier.icon}</div>

            {/* Tier Name */}
            <h3 className={`text-xl font-bold mb-2 ${tier.color}`}>
              {tier.name}
            </h3>

            {/* Range */}
            <p className="text-sm text-[#94a3b8] mb-6">{tier.range}</p>

            {/* Benefits */}
            <div className="space-y-3 mb-6">
              {tier.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-[#94a3b8] text-sm">•</span>
                  <p className="text-sm text-white leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>

            {/* Button */}
            <button
              className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${tier.buttonStyle}`}
              disabled={tier.isActive || tier.isLocked}
            >
              {tier.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
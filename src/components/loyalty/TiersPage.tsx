import { Check } from 'lucide-react';

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
      id: 'bronze', name: 'BRONZE', range: '0 – 999 PTS', icon: '🥉',
      color: 'text-amber-700', borderColor: 'border-amber-200', bgColor: 'bg-amber-50',
      badge: 'STARTING TIER', badgeColor: 'bg-gray-100 text-gray-500',
      benefits: ['Earning Rate: 1 pt per Rs. 10', 'Badge Discount: None', 'Points Redemption: ✅'],
      buttonText: 'Starting Tier', buttonStyle: 'bg-gray-100 text-gray-400 cursor-not-allowed',
      isActive: currentTier === 'bronze'
    },
    {
      id: 'silver', name: 'SILVER', range: '1,000 – 2,499 PTS', icon: '🥈',
      color: 'text-slate-600', borderColor: 'border-purple-400', bgColor: 'bg-purple-50',
      badge: 'CURRENT TIER', badgeColor: 'bg-purple-600 text-white',
      benefits: ['Earning Rate: 1 pt per Rs. 10', '🎁 One-Time Badge Discount: 3% OFF', 'Discount valid: 90 days after upgrade', 'One use only', 'Points Redemption: ✅'],
      buttonText: 'Active', buttonStyle: 'bg-purple-600 text-white',
      isActive: currentTier === 'silver'
    },
    {
      id: 'gold', name: 'GOLD', range: '2,500 – 4,999 PTS', icon: '🏅',
      color: 'text-amber-600', borderColor: 'border-amber-400', bgColor: 'bg-amber-50',
      badge: 'NEXT TIER', badgeColor: 'bg-amber-400 text-white',
      benefits: ['Earning Rate: 1 pt per Rs. 10', '🎁 One-Time Badge Discount: 5% OFF', 'Discount valid: 90 days after upgrade', 'One use only', 'Points Redemption: ✅'],
      buttonText: 'Unlock Now', buttonStyle: 'bg-transparent border-2 border-amber-400 text-amber-600 hover:bg-amber-50',
      isNext: currentTier === 'silver'
    },
    {
      id: 'platinum', name: 'PLATINUM', range: '5,000+ PTS', icon: '💎',
      color: 'text-slate-700', borderColor: 'border-gray-200', bgColor: 'bg-gray-50',
      badge: 'LOCKED', badgeColor: 'bg-gray-100 text-gray-400',
      benefits: ['Earning Rate: 1 pt per Rs. 10', '🎁 One-Time Badge Discount: 7% OFF', 'Discount valid: 90 days after upgrade', 'One use only', 'Points Redemption: ✅'],
      buttonText: 'Unlock Now', buttonStyle: 'bg-gray-100 text-gray-400 cursor-not-allowed',
      isLocked: true
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Membership Tiers</h2>
        <p className="text-gray-500">Earn more, save more. Reach a new tier to unlock your one-time badge discount.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => (
          <div key={tier.id}
            className={`relative bg-white rounded-xl border-2 p-6 transition-all shadow-sm ${
              tier.isActive ? `${tier.borderColor} shadow-md` :
              tier.isNext ? `${tier.borderColor} shadow-md` : tier.borderColor
            } ${tier.isLocked ? 'opacity-60' : ''}`}
          >
            {tier.badge && (
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${tier.badgeColor}`}>
                  {tier.badge}
                </span>
              </div>
            )}
            <div className="text-4xl mb-4">{tier.icon}</div>
            <h3 className={`text-xl font-bold mb-2 ${tier.color}`}>{tier.name}</h3>
            <p className="text-sm text-gray-400 mb-6">{tier.range}</p>
            <div className="space-y-3 mb-6">
              {tier.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-gray-400 text-sm">•</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
            <button className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${tier.buttonStyle}`}
              disabled={tier.isActive || tier.isLocked}>
              {tier.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

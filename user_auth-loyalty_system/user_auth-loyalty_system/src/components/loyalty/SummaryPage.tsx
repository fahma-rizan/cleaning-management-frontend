import { TrendingUp, Target, Tag, ArrowRight } from 'lucide-react';

interface SummaryPageProps {
  userData: {
    currentPoints: number;
    currentTier: string;
    pointsToNextTier: number;
    earnedThisMonth: number;
    badgeDiscount?: {
      available: boolean;
      percentage: number;
      expiryDate: string;
      daysRemaining: number;
      totalDays: number;
    };
  };
  onRedeemClick: () => void;
}

export default function SummaryPage({ userData, onRedeemClick }: SummaryPageProps) {
  const progressPercentage = ((2500 - userData.pointsToNextTier) / 2500) * 100;
  const discountProgressPercentage = userData.badgeDiscount
    ? (userData.badgeDiscount.daysRemaining / userData.badgeDiscount.totalDays) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                <circle cx="96" cy="96" r="88" stroke="url(#gradientLight)" strokeWidth="8" fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - progressPercentage / 100)}`}
                  strokeLinecap="round" className="transition-all duration-1000" />
                <defs>
                  <linearGradient id="gradientLight" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1">Current Tier</p>
                <p className="text-3xl font-bold text-gray-900">{userData.currentPoints.toLocaleString()}</p>
                <p className="text-sm text-gray-500">POINTS</p>
              </div>
            </div>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2 text-gray-900 capitalize">{userData.currentTier} Level</h2>
            <p className="text-gray-500 text-sm">Reach Gold to unlock a one-time 5% OFF on your next booking</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-gray-500 uppercase">Silver</span>
              <span className="text-gray-700">{userData.pointsToNextTier} POINTS TO GOLD – {progressPercentage.toFixed(0)}% Completed</span>
              <span className="text-amber-500 uppercase">Gold</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#7c3aed] to-[#f59e0b] rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 rounded-lg"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Earned This Month</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600">+{userData.earnedThisMonth} pts</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 rounded-lg"><Target className="w-5 h-5 text-purple-600" /></div>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Points to Next Badge</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{userData.pointsToNextTier} pts</p>
            <p className="text-xs text-gray-400 mt-1">to reach Gold Tier</p>
          </div>

          {userData.badgeDiscount && userData.badgeDiscount.available && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-50 rounded-lg"><Tag className="w-5 h-5 text-amber-500" /></div>
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Badge Discount</p>
              </div>
              <p className="text-2xl font-bold text-amber-500 mb-1">{userData.badgeDiscount.percentage}% OFF Ready</p>
              <p className="text-xs text-gray-400 mb-3">Gold tier reward · Expires {userData.badgeDiscount.expiryDate}</p>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${discountProgressPercentage}%` }}></div>
              </div>
              <p className="text-[10px] text-gray-400">{userData.badgeDiscount.daysRemaining} of {userData.badgeDiscount.totalDays} days remaining</p>
            </div>
          )}

          <button onClick={onRedeemClick} className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2">
            Redeem Points <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900">How Your Rewards Work</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">Reach a new tier to unlock your one-time badge discount. Combine it with points redemption for maximum savings!</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0"><span className="text-xl">🏅</span></div>
            <div>
              <h4 className="font-semibold mb-1 text-gray-900">Badge Upgrade Discount</h4>
              <p className="text-sm text-gray-500 leading-relaxed">One-time discount when you reach Silver (3%), Gold (5%) or Platinum (7%)</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0"><span className="text-xl">💰</span></div>
            <div>
              <h4 className="font-semibold mb-1 text-gray-900">Points Redemption</h4>
              <p className="text-sm text-gray-500 leading-relaxed">10 pts = Rs. 10 off. Min 50 pts. Max 50% of booking value.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

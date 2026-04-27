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
    ? (userData.badgeDiscount.daysRemaining / userData.badgeDiscount.totalDays) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Left Card - Progress Ring */}
        <div className="lg:col-span-2 bg-[#1a1a2e] rounded-xl border border-white/8 p-8">
          {/* Circular Progress - Centered */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <svg className="w-48 h-48 transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#2d2d44"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - progressPercentage / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-wide mb-1">
                  Current Tier
                </p>
                <p className="text-3xl font-bold text-white">{userData.currentPoints.toLocaleString()}</p>
                <p className="text-sm text-[#94a3b8]">POINTS</p>
              </div>
            </div>
          </div>

          {/* Tier Info - Below Circle */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2 capitalize">{userData.currentTier} Level</h2>
            <p className="text-[#94a3b8] text-sm">
              Reach Gold to unlock a one-time 5% OFF on your next booking
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-[#94a3b8] uppercase">Silver</span>
              <span className="text-white">
                {userData.pointsToNextTier} POINTS TO GOLD – {progressPercentage.toFixed(0)}% Completed
              </span>
              <span className="text-[#f59e0b] uppercase">Gold</span>
            </div>
            <div className="h-2 bg-[#2d2d44] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7c3aed] to-[#f59e0b] rounded-full transition-all duration-1000"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right Side Stat Cards */}
        <div className="space-y-4">
          {/* Earned This Month */}
          <div className="bg-[#1a1a2e] rounded-xl border border-white/8 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#10b981]/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#10b981]" />
              </div>
              <p className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-wide">
                Earned This Month
              </p>
            </div>
            <p className="text-2xl font-bold text-[#10b981]">+{userData.earnedThisMonth} pts</p>
          </div>

          {/* Points to Next Badge */}
          <div className="bg-[#1a1a2e] rounded-xl border border-white/8 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#7c3aed]/10 rounded-lg">
                <Target className="w-5 h-5 text-[#7c3aed]" />
              </div>
              <p className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-wide">
                Points to Next Badge
              </p>
            </div>
            <p className="text-2xl font-bold text-white">{userData.pointsToNextTier} pts</p>
            <p className="text-xs text-[#94a3b8] mt-1">to reach Gold Tier</p>
          </div>

          {/* Badge Discount Status */}
          {userData.badgeDiscount && userData.badgeDiscount.available && (
            <div className="bg-[#1a1a2e] rounded-xl border border-white/8 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#f59e0b]/10 rounded-lg">
                  <Tag className="w-5 h-5 text-[#f59e0b]" />
                </div>
                <p className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-wide">
                  Badge Discount
                </p>
              </div>
              <p className="text-2xl font-bold text-[#f59e0b] mb-1">
                {userData.badgeDiscount.percentage}% OFF Ready
              </p>
              <p className="text-xs text-[#94a3b8] mb-3">
                Gold tier reward · Expires {userData.badgeDiscount.expiryDate}
              </p>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="h-1.5 bg-[#2d2d44] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#10b981] rounded-full transition-all"
                    style={{ width: `${discountProgressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-[#94a3b8]">
                  {userData.badgeDiscount.daysRemaining} of {userData.badgeDiscount.totalDays} days remaining
                </p>
              </div>

              <p className="text-[10px] text-[#94a3b8] mt-3 leading-relaxed">
                Applies on your next booking automatically
              </p>
            </div>
          )}

          {/* Redeem Points Button */}
          <button
            onClick={onRedeemClick}
            className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            Redeem Points
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Info Card */}
      <div className="bg-[#1a1a2e] rounded-xl border border-white/8 p-6">
        <h3 className="text-lg font-bold mb-4">How Your Rewards Work</h3>
        <p className="text-sm text-[#94a3b8] mb-6 leading-relaxed">
          Reach a new tier to unlock your one-time badge discount. Combine it with points redemption for maximum savings!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Badge Upgrade Discount */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-[#f59e0b]/10 rounded-lg flex items-center justify-center">
                <span className="text-xl">🏅</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Badge Upgrade Discount</h4>
              <p className="text-sm text-[#94a3b8] leading-relaxed">
                One-time discount when you reach Silver (3%), Gold (5%) or Platinum (7%)
              </p>
            </div>
          </div>

          {/* Points Redemption */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-[#7c3aed]/10 rounded-lg flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Points Redemption</h4>
              <p className="text-sm text-[#94a3b8] leading-relaxed">
                10 pts = Rs. 10 off. Min 50 pts. Max 50% of booking value.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
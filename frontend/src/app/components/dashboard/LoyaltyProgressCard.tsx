import { Award } from 'lucide-react';

interface LoyaltyProgressCardProps {
  currentPoints: number;
  currentBadge: string;
}

export default function LoyaltyProgressCard({ currentPoints, currentBadge }: LoyaltyProgressCardProps) {
  // Badge progression system
  const badgeSystem = {
    Bronze: { next: 'Silver', pointsNeeded: 100, color: 'from-orange-400 to-orange-500' },
    Silver: { next: 'Gold', pointsNeeded: 300, color: 'from-gray-400 to-gray-500' },
    Gold: { next: 'Platinum', pointsNeeded: 500, color: 'from-yellow-400 to-yellow-500' },
    Platinum: { next: 'Diamond', pointsNeeded: 1000, color: 'from-purple-400 to-purple-500' },
  };

  const currentBadgeInfo = badgeSystem[currentBadge as keyof typeof badgeSystem];
  const progressPercentage = currentBadgeInfo 
    ? (currentPoints / currentBadgeInfo.pointsNeeded) * 100 
    : 100;
  const pointsToNext = currentBadgeInfo 
    ? currentBadgeInfo.pointsNeeded - currentPoints 
    : 0;

  return (
    <div className={`bg-gradient-to-r ${currentBadgeInfo?.color || 'from-yellow-400 to-orange-400'} rounded-xl p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl mb-2">Loyalty Rewards Program</h2>
          <p className="text-white/90 mb-1">
            You have <span className="text-3xl font-bold">{currentPoints}</span> points
          </p>
        </div>
        <Award className="w-20 h-20 opacity-50" />
      </div>

      {/* Badge Status */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
          Current: <span className="font-bold">{currentBadge}</span>
        </div>
        {currentBadgeInfo && (
          <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
            Next: <span className="font-bold">{currentBadgeInfo.next}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {currentBadgeInfo && (
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progress to {currentBadgeInfo.next}</span>
            <span className="font-bold">{pointsToNext} points to go</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <p className="text-sm text-white/80 mt-2">
            {currentPoints} / {currentBadgeInfo.pointsNeeded} points
          </p>
        </div>
      )}

      {!currentBadgeInfo && (
        <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm text-center">
          🎉 You've reached the highest tier! Enjoy exclusive benefits!
        </div>
      )}
    </div>
  );
}

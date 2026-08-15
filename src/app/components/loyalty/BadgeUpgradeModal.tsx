import { Sparkles, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BadgeUpgradeModalProps {
  tier: 'silver' | 'gold' | 'platinum';
  onClose: () => void;
}

export default function BadgeUpgradeModal({ tier, onClose }: BadgeUpgradeModalProps) {
  const tierData = {
    silver: {
      name: 'SILVER',
      discount: 3,
      icon: '🥈',
      color: 'text-[#94a3b8]',
      borderColor: 'border-[#94a3b8]',
      bgGradient: 'from-[#94a3b8]/20 to-[#7c3aed]/20',
      points: '1,000'
    },
    gold: {
      name: 'GOLD',
      discount: 5,
      icon: '🏅',
      color: 'text-[#f59e0b]',
      borderColor: 'border-[#f59e0b]',
      bgGradient: 'from-[#f59e0b]/20 to-[#7c3aed]/20',
      points: '2,500'
    },
    platinum: {
      name: 'PLATINUM',
      discount: 7,
      icon: '💎',
      color: 'text-[#e2e8f0]',
      borderColor: 'border-[#e2e8f0]',
      bgGradient: 'from-[#e2e8f0]/20 to-[#7c3aed]/20',
      points: '5,000'
    }
  };

  const currentTier = tierData[tier];
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 90);
  const formattedExpiry = expiryDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div
        className={`relative bg-[#1a1a2e] rounded-2xl border-2 ${currentTier.borderColor} w-full max-w-md shadow-2xl ${
          tier === 'gold' ? 'shadow-[#f59e0b]/20' : ''
        }`}
      >
        {/* Decorative Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${currentTier.bgGradient} opacity-10 rounded-2xl`}
        ></div>

        <div className="relative p-10">
          {/* Confetti/Sparkle Animation */}
          <div className="absolute top-0 left-0 right-0 flex justify-center -mt-4">
            <Sparkles className="w-8 h-8 text-[#7c3aed] animate-pulse" />
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="text-6xl animate-bounce">{currentTier.icon}</div>
          </div>

          {/* Title */}
          <div className="text-center mb-2">
            <h2 className="text-3xl font-bold mb-2">🎉 Congratulations!</h2>
            <p className={`text-xl font-bold ${currentTier.color}`}>
              You've reached {currentTier.name} Tier!
            </p>
          </div>

          {/* Points Milestone */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide bg-[#7c3aed]/20 text-[#7c3aed]">
              {currentTier.points} Points Achieved
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-white/8 my-6"></div>

          {/* Discount Box */}
          <div
            className={`bg-gradient-to-br ${currentTier.bgGradient} border-2 ${currentTier.borderColor} rounded-xl p-6 mb-6`}
          >
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${currentTier.color}`}>
              YOUR ONE-TIME BADGE DISCOUNT
            </p>

            <div className="text-center mb-4">
              <p className={`text-6xl font-bold ${currentTier.color} mb-2`}>
                {currentTier.discount}% OFF
              </p>
              <p className="text-sm text-white">On your very next booking</p>
            </div>

            {/* Validity */}
            <div className="flex items-center justify-center gap-2 text-sm text-[#94a3b8] mb-3">
              <Calendar className="w-4 h-4" />
              <span>Valid for 90 days · One use only</span>
            </div>

            {/* Expiry */}
            <div className="text-center">
              <p className="text-xs text-[#f97316]">
                Discount expires: {formattedExpiry}
              </p>
            </div>
          </div>

          {/* Combination Note */}
          <div className="space-y-2 mb-6 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
              <p className="text-[#94a3b8]">
                Can be combined with points redemption
              </p>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
              <p className="text-[#94a3b8]">Cannot combine with promo codes</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Link
              to="/services"
              className={`w-full bg-gradient-to-r ${
                tier === 'gold'
                  ? 'from-[#f59e0b] to-[#d97706]'
                  : tier === 'platinum'
                  ? 'from-[#e2e8f0] to-[#cbd5e1]'
                  : 'from-[#94a3b8] to-[#64748b]'
              } ${
                tier === 'platinum' ? 'text-[#0f0f1a]' : 'text-white'
              } font-bold py-4 rounded-lg transition-all hover:opacity-90 text-center block`}
            >
              Book Now & Use My Discount
            </Link>
            <button
              onClick={onClose}
              className="w-full bg-transparent border-2 border-white/8 text-white font-bold py-4 rounded-lg hover:bg-white/5 transition-all"
            >
              Save for Later
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs text-[#94a3b8] mt-6 leading-relaxed">
            Your discount has been activated and is ready to use on your next
            booking.
          </p>
        </div>
      </div>
    </div>
  );
}

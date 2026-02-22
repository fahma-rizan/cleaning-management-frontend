import { useState } from 'react';
import { Coins, X, Info, CheckCircle, XCircle } from 'lucide-react';

interface RedemptionPageProps {
  availablePoints: number;
  onClose: () => void;
}

export default function RedemptionPage({
  availablePoints,
  onClose
}: RedemptionPageProps) {
  const [bookingValue, setBookingValue] = useState<string>('');
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);

  const bookingValueNum = parseFloat(bookingValue) || 0;
  const maxRedeemable = Math.min(
    availablePoints,
    Math.floor((bookingValueNum * 0.5) / 10) * 10 // Max 50% of booking value, in multiples of 10
  );
  const discountValue = pointsToRedeem * 1; // 10 pts = Rs. 10, so 1pt = Rs. 1
  const remainingPoints = availablePoints - pointsToRedeem;
  const finalBookingValue = bookingValueNum - discountValue;

  const isValidBooking = bookingValueNum >= 500;
  const isValidPoints = pointsToRedeem >= 50 && pointsToRedeem <= maxRedeemable;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPointsToRedeem(parseInt(e.target.value));
  };

  const handlePointsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    if (value <= maxRedeemable) {
      setPointsToRedeem(value);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a2e] border-b border-white/8 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold">Redeem Your Points</h2>
            <p className="text-sm text-[#94a3b8] mt-1">
              Turn your points into instant savings on your next booking
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-[#94a3b8]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Available Points Card */}
          <div className="bg-[#0f0f1a] rounded-xl border border-white/8 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#f59e0b]/10 rounded-xl">
                <Coins className="w-8 h-8 text-[#f59e0b]" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {availablePoints.toLocaleString()} Available Points
                </p>
                <p className="text-sm text-[#94a3b8] mt-1">
                  Maximum redemption value: Rs. {availablePoints.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#94a3b8] uppercase font-medium mb-1">
                Conversion Rate
              </p>
              <p className="text-lg font-bold">10 pts = Rs. 10</p>
            </div>
          </div>

          {/* Redemption Calculator */}
          <div className="bg-[#0f0f1a] rounded-xl border border-white/8 p-6 space-y-6">
            <h3 className="text-lg font-bold">Calculate Your Savings</h3>

            {/* Step 1 - Booking Value */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Step 1: Enter your booking value (Rs.)
              </label>
              <input
                type="number"
                value={bookingValue}
                onChange={(e) => setBookingValue(e.target.value)}
                placeholder="e.g., 2000"
                min="500"
                className="w-full bg-[#1a1a2e] border border-white/8 rounded-lg px-4 py-3 text-white placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
              />
              <p className="text-xs text-[#94a3b8] mt-2">
                ℹ️ Minimum booking value: Rs. 500
              </p>
            </div>

            {/* Step 2 - Points to Redeem */}
            {isValidBooking && (
              <div>
                <label className="block text-sm font-bold text-white mb-3">
                  Step 2: Points to redeem
                </label>

                {/* Slider */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max={maxRedeemable}
                      step="10"
                      value={pointsToRedeem}
                      onChange={handleSliderChange}
                      className="flex-1 h-2 bg-[#2d2d44] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7c3aed] [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <input
                      type="number"
                      value={pointsToRedeem}
                      onChange={handlePointsInputChange}
                      min="0"
                      max={maxRedeemable}
                      step="10"
                      className="w-24 bg-[#1a1a2e] border border-white/8 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#94a3b8]">
                    <span>Min: 50 pts</span>
                    <span>Max: {maxRedeemable} pts</span>
                  </div>

                  <p className="text-xs text-[#94a3b8]">
                    ℹ️ Cannot exceed 50% of booking value
                  </p>
                </div>
              </div>
            )}

            {/* Step 3 - Live Summary */}
            {isValidBooking && pointsToRedeem > 0 && (
              <div className="bg-[#1a1a2e] rounded-xl border border-[#7c3aed] p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#94a3b8]">Points to Redeem:</span>
                  <span className="font-semibold">{pointsToRedeem} pts</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#94a3b8]">Discount Value:</span>
                  <span className="font-semibold text-[#10b981]">
                    Rs. {discountValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#94a3b8]">Remaining Points:</span>
                  <span className="font-semibold">{remainingPoints} pts</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#94a3b8]">50% Booking Limit:</span>
                  <span className="font-semibold">
                    Rs. {(bookingValueNum * 0.5).toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-white/8 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#94a3b8]">Final Booking Value:</span>
                    <span className="text-2xl font-bold">
                      Rs. {finalBookingValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Combination Note */}
          <div className="bg-[#7c3aed]/10 border border-[#7c3aed] rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#7c3aed] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-white leading-relaxed">
              You can combine points redemption <strong>WITH</strong> your badge
              discount for maximum savings!
            </p>
          </div>

          {/* Rules Info Box */}
          <div className="bg-[#0f0f1a] rounded-xl border border-white/8 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-5 h-5 text-[#7c3aed]" />
              <h4 className="font-bold">Redemption Rules</h4>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#94a3b8]">
                  Minimum redemption: 50 points (Rs. 50)
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#94a3b8]">
                  Minimum booking value: Rs. 500
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#94a3b8]">
                  Maximum: 50% of booking value
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#94a3b8]">
                  Can combine with badge upgrade discount
                </p>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#94a3b8]">
                  Cannot combine with promo codes
                </p>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#94a3b8]">
                  Cannot transfer points to others
                </p>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#94a3b8]">
                  Cannot convert points to cash
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              disabled={!isValidPoints}
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply to Booking
            </button>
            <button
              onClick={onClose}
              className="text-center text-sm text-[#94a3b8] hover:text-white transition-colors"
            >
              Cancel – Keep my points
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Calendar, Gift, Medal, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EarnPointsPage() {
  const methods = [
    {
      id: 'booking', icon: <Calendar className="w-8 h-8" />,
      iconBg: 'bg-purple-50', iconColor: 'text-purple-600',
      title: 'Book Services',
      badge: '1 PT PER RS. 10', badgeColor: 'bg-purple-100 text-purple-700',
      description: 'Earn points automatically on every successful payment. Points added instantly after booking is confirmed.',
      cta: 'Book Now', ctaLink: '/services', ctaColor: 'text-purple-600'
    },
    {
      id: 'redeem', icon: <Gift className="w-8 h-8" />,
      iconBg: 'bg-amber-50', iconColor: 'text-amber-500',
      title: 'Redeem Your Points',
      badge: '10 PTS = RS. 10', badgeColor: 'bg-amber-100 text-amber-600',
      description: 'Use your points as a discount on any booking. Minimum 50 points required. Maximum 50% of total booking value.',
      cta: 'Redeem Now', ctaLink: '#', ctaColor: 'text-amber-500'
    },
    {
      id: 'badge', icon: <Medal className="w-8 h-8" />,
      iconBg: 'bg-gray-100', iconColor: 'text-gray-500',
      title: 'Earn Badge Discounts',
      badge: 'ONE-TIME DISCOUNT', badgeColor: 'bg-gray-100 text-gray-500',
      description: 'Upgrade to Silver, Gold or Platinum to unlock a one-time discount: 3%, 5% or 7% OFF your next booking. Valid 90 days from upgrade date.',
      cta: 'View Tiers', ctaLink: '#', ctaColor: 'text-gray-500'
    },
    {
      id: 'refund', icon: <Clock className="w-8 h-8" />,
      iconBg: 'bg-orange-50', iconColor: 'text-orange-500',
      title: 'Points Refund Policy',
      badge: '24-HOUR RULE', badgeColor: 'bg-orange-100 text-orange-600',
      description: 'Points are automatically refunded if you cancel your booking within 24 hours of successful payment.',
      cta: 'Learn More', ctaLink: '#', ctaColor: 'text-orange-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Ways to Earn</h2>
        <p className="text-gray-500">Every rupee you spend brings you closer to your next badge discount.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {methods.map((method) => (
          <div key={method.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:border-purple-200 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${method.iconBg}`}>
                <div className={method.iconColor}>{method.icon}</div>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${method.badgeColor}`}>
                {method.badge}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">{method.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">{method.description}</p>
            {method.id === 'booking' ? (
              <Link to={method.ctaLink} className={`inline-flex items-center gap-2 font-semibold text-sm hover:underline ${method.ctaColor}`}>
                {method.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button className={`inline-flex items-center gap-2 font-semibold text-sm hover:underline ${method.ctaColor}`}>
                {method.cta} <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Banner */}
      <div className="relative bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] rounded-xl p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2 text-white">Start Earning Today!</h3>
            <p className="text-white/90">Book your first service and earn points instantly. 1 point for every Rs. 10 spent.</p>
          </div>
          <Link to="/services" className="bg-white text-purple-700 px-8 py-4 rounded-lg font-bold text-sm hover:bg-white/90 transition-all shadow-lg whitespace-nowrap">
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}

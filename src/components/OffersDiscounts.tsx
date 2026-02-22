import { Tag, TrendingDown, Clock, Gift, Zap } from 'lucide-react';

interface Offer {
  id: number;
  title: string;
  description: string;
  discount: string;
  code: string;
  validUntil: string;
  type: 'seasonal' | 'loyalty' | 'first-time' | 'limited';
  minAmount?: number;
}

export default function OffersDiscounts() {
  const offers: Offer[] = [
    { id: 1, title: '20% Off First Booking', description: 'New customers get 20% off on their first cleaning service', discount: '20%', code: 'WELCOME20', validUntil: '2025-03-31', type: 'first-time' },
    { id: 2, title: 'Deep Clean Special', description: 'Save 15% on deep cleaning services this month', discount: '15%', code: 'DEEPCLEAN15', validUntil: '2025-02-28', type: 'seasonal' },
    { id: 3, title: 'Loyalty Rewards', description: 'Silver members get 10% off all services', discount: '10%', code: 'SILVER10', validUntil: 'Ongoing', type: 'loyalty' },
    { id: 4, title: 'Flash Sale - Today Only', description: 'Book any service today and get instant 25% discount', discount: '25%', code: 'FLASH25', validUntil: 'Today', type: 'limited', minAmount: 3000 },
    { id: 5, title: 'Weekend Special', description: 'Saturday & Sunday bookings - Save LKR 1,000', discount: 'LKR 1,000', code: 'WEEKEND', validUntil: '2025-12-31', type: 'seasonal', minAmount: 5000 },
  ];

  const getOfferIcon = (type: string) => {
    if (type === 'seasonal') return <Clock className="w-6 h-6" />;
    if (type === 'loyalty') return <Gift className="w-6 h-6" />;
    if (type === 'first-time') return <TrendingDown className="w-6 h-6" />;
    if (type === 'limited') return <Zap className="w-6 h-6" />;
    return <Tag className="w-6 h-6" />;
  };

  const getOfferColor = (type: string) => {
    if (type === 'seasonal') return 'from-blue-500 to-cyan-500';
    if (type === 'loyalty') return 'from-purple-500 to-pink-500';
    if (type === 'first-time') return 'from-green-500 to-emerald-500';
    if (type === 'limited') return 'from-orange-500 to-red-500';
    return 'from-gray-500 to-slate-500';
  };

  const copyCode = (code: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = code;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      alert(`Code "${code}" copied to clipboard!`);
    } catch {
      alert(`Copy this code: ${code}`);
    }
    document.body.removeChild(textarea);
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Tag className="w-8 h-8 text-purple-600" />
              <h2 className="text-3xl">Special Offers & Discounts</h2>
            </div>
            <p className="text-gray-600 text-lg">Save more on your cleaning services</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className={`bg-gradient-to-r ${getOfferColor(offer.type)} p-6 text-white relative overflow-hidden`}>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      {getOfferIcon(offer.type)}
                      <span className="text-sm uppercase tracking-wide opacity-90">{offer.type.replace('-', ' ')}</span>
                    </div>
                    <div className="text-4xl mb-1">{offer.discount} OFF</div>
                    <div className="text-white/90">{offer.title}</div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 mb-4">{offer.description}</p>
                  {offer.minAmount && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm">
                      <span className="text-yellow-800">Minimum booking: LKR {offer.minAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="bg-gray-100 rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-600 mb-2">Promo Code</div>
                    <div className="flex items-center justify-between">
                      <code className="text-xl tracking-wider">{offer.code}</code>
                      <button onClick={() => copyCode(offer.code)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">Copy</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Valid until:</span>
                    <span className={`font-medium ${offer.validUntil === 'Today' ? 'text-red-600' : 'text-gray-900'}`}>{offer.validUntil}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <h3 className="text-2xl mb-4">How to Use Promo Codes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { num: 1, title: 'Select Service', desc: 'Choose your preferred cleaning service and package', color: 'bg-blue-600' },
                { num: 2, title: 'Enter Code', desc: 'Apply the promo code at checkout', color: 'bg-blue-600' },
                { num: 3, title: 'Save Money', desc: 'Enjoy instant discounts on your booking', color: 'bg-purple-600' },
              ].map((step) => (
                <div key={step.num} className="flex gap-4">
                  <div className={`${step.color} text-white w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>{step.num}</div>
                  <div>
                    <h4 className="text-lg mb-1">{step.title}</h4>
                    <p className="text-gray-600 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

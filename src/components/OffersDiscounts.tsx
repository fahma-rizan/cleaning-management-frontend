import { useState, useEffect } from 'react';
import { Tag, TrendingDown, Clock, Gift, Zap } from 'lucide-react';
import { api } from '../services/api.service';

interface Offer {
  _id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  code: string;
  validUntil: string;
  badge: string;
  badgeColor: string;
  minOrderAmount?: number;
}

export default function OffersDiscounts() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await api.get('/offers');
        setOffers(data.offers);
      } catch (err) {
        console.error('Failed to load offers', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const getOfferIcon = (badge: string) => {
    if (badge === 'New') return <TrendingDown className="w-6 h-6" />;
    if (badge === 'Hot') return <Zap className="w-6 h-6" />;
    if (badge === 'Limited') return <Clock className="w-6 h-6" />;
    return <Gift className="w-6 h-6" />;
  };

  const getOfferColor = (badgeColor: string) => {
    if (badgeColor === 'green') return 'from-green-500 to-emerald-500';
    if (badgeColor === 'red') return 'from-orange-500 to-red-500';
    if (badgeColor === 'orange') return 'from-orange-400 to-orange-600';
    return 'from-purple-500 to-pink-500';
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
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch {
      alert(`Copy this code: ${code}`);
    }
    document.body.removeChild(textarea);
  };

  const formatDiscount = (offer: Offer) => {
    if (offer.discountType === 'percentage') return `${offer.discountValue}%`;
    return `LKR ${offer.discountValue.toLocaleString()}`;
  };

  const formatValidUntil = (date: string) => {
    return new Date(date).toLocaleDateString('en-LK', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-50 py-12">
        <div className="text-center text-gray-500">Loading offers...</div>
      </div>
    );
  }

  if (offers.length === 0) return null;

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
              <div key={offer._id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className={`bg-gradient-to-r ${getOfferColor(offer.badgeColor)} p-6 text-white relative overflow-hidden`}>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      {getOfferIcon(offer.badge)}
                      <span className="text-sm uppercase tracking-wide opacity-90">{offer.badge}</span>
                    </div>
                    <div className="text-4xl mb-1">{formatDiscount(offer)} OFF</div>
                    <div className="text-white/90">{offer.title}</div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 mb-4">{offer.description}</p>
                  {offer.minOrderAmount && offer.minOrderAmount > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm">
                      <span className="text-yellow-800">
                        Minimum booking: LKR {offer.minOrderAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="bg-gray-100 rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-600 mb-2">Promo Code</div>
                    <div className="flex items-center justify-between">
                      <code className="text-xl tracking-wider">{offer.code}</code>
                      <button
                        onClick={() => copyCode(offer.code)}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                          copiedCode === offer.code
                            ? 'bg-green-600 text-white'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {copiedCode === offer.code ? '✅ Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Valid until:</span>
                    <span className="font-medium text-gray-900">
                      {formatValidUntil(offer.validUntil)}
                    </span>
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
                { num: 2, title: 'Enter Code', desc: 'Apply the promo code during booking', color: 'bg-blue-600' },
                { num: 3, title: 'Save Money', desc: 'Enjoy instant discounts on your booking', color: 'bg-blue-600' },
              ].map((step) => (
                <div key={step.num} className="flex gap-4">
                  <div className={`${step.color} text-white w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                    {step.num}
                  </div>
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
import { useState } from 'react';
import { 
  Award, 
  History, 
  Gift, 
  ChevronRight, 
  Star, 
  TrendingUp, 
  Users, 
  Copy, 
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Shield
} from 'lucide-react';
import LoyaltyDashboard from './LoyaltyDashboard';
import type { User } from '../types';
import Header from './Header';
import BackButton from './BackButton';

interface LoyaltyPageProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

export default function LoyaltyPage({ user, onLogout, theme, onToggleTheme, onProfileClick }: LoyaltyPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'rewards' | 'tiers' | 'referral'>('overview');
  const [copied, setCopied] = useState(false);

  const pointsHistory = [
    { id: 1, action: 'Booking Completed (BK-1001)', points: +150, date: '2025-02-12', status: 'earned' },
    { id: 2, action: 'Reward Redeemed (LKR 500 Discount)', points: -500, date: '2025-02-10', status: 'redeemed' },
    { id: 3, action: 'Referral Bonus (Friend: John)', points: +200, date: '2025-02-05', status: 'earned' },
    { id: 4, action: 'Review Bonus', points: +50, date: '2025-02-01', status: 'earned' },
    { id: 5, action: 'Booking Completed (BK-0985)', points: +120, date: '2025-01-25', status: 'earned' },
  ];

  const rewards = [
    { id: 1, title: 'LKR 500 Discount', points: 500, description: 'Get LKR 500 off on your next booking', category: 'discount' },
    { id: 2, title: 'Free Laundry (up to 3kg)', points: 1200, description: 'One free standard laundry service', category: 'service' },
    { id: 3, title: 'LKR 1000 Cash Voucher', points: 1000, description: 'Cash voucher for any cleaning service', category: 'voucher' },
    { id: 4, title: 'Deep Cleaning Upgrade', points: 2000, description: 'Upgrade standard cleaning to deep cleaning', category: 'upgrade' },
    { id: 5, title: 'Free Sofa Cleaning', points: 1500, description: 'Professional cleaning for a 3-seater sofa', category: 'service' },
  ];

  const tiers = [
    { 
      name: 'Silver', 
      minPoints: 0, 
      color: 'text-gray-400', 
      bgColor: 'bg-gray-100', 
      benefits: ['1x Points on all bookings', 'Standard support', 'Monthly newsletter'] 
    },
    { 
      name: 'Gold', 
      minPoints: 1000, 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100', 
      benefits: ['1.5x Points on all bookings', 'Priority support', 'Early access to offers', '10% birthday discount'] 
    },
    { 
      name: 'Platinum', 
      minPoints: 5000, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100', 
      benefits: ['2x Points on all bookings', 'Dedicated account manager', 'Free express delivery', '20% birthday discount', 'Surprise monthly gifts'] 
    },
  ];

  const copyReferralCode = () => {
    navigator.clipboard.writeText('CLOUD-JOIN-2025');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderOverview = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <LoyaltyDashboard 
        points={user.loyaltyPoints || 0} 
        tier={user.badge as any || 'Silver'} 
        name={user.name} 
      />
    </div>
  );

  const renderHistory = () => (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-purple-100 dark:border-purple-900/30 shadow-sm animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <History className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold dark:text-white">Points History</h2>
      </div>
      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-100 dark:border-gray-700">
              <th className="pb-4 text-xs font-black uppercase text-gray-400 tracking-widest">Description</th>
              <th className="pb-4 text-xs font-black uppercase text-gray-400 tracking-widest">Date</th>
              <th className="pb-4 text-xs font-black uppercase text-gray-400 tracking-widest">Status</th>
              <th className="pb-4 text-right text-xs font-black uppercase text-gray-400 tracking-widest">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {pointsHistory.map(item => (
              <tr key={item.id} className="hover:bg-purple-50/30 dark:hover:bg-purple-900/5 transition-colors">
                <td className="py-4 font-semibold text-sm dark:text-gray-200">{item.action}</td>
                <td className="py-4 text-sm text-gray-500">{item.date}</td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    item.status === 'earned' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className={`py-4 text-right font-bold ${item.status === 'earned' ? 'text-green-600' : 'text-red-500'}`}>
                  {item.points > 0 ? '+' : ''}{item.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRewards = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Rewards Catalog</h2>
          <p className="opacity-90 max-w-md">Redeem your hard-earned points for exclusive discounts and free services.</p>
          <div className="mt-6 flex items-center gap-2">
            <span className="text-sm font-medium opacity-80">Your balance:</span>
            <span className="text-2xl font-black">{user.loyaltyPoints || 0} Points</span>
          </div>
        </div>
        <Gift className="absolute -right-8 -bottom-8 w-64 h-64 text-white opacity-10 rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map(reward => (
          <div key={reward.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-purple-100 dark:border-purple-900/30 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              reward.category === 'discount' ? 'bg-green-100 text-green-600' :
              reward.category === 'service' ? 'bg-blue-100 text-blue-600' :
              'bg-purple-100 text-purple-600'
            }`}>
              {reward.category === 'discount' ? <TrendingUp className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
            </div>
            <h3 className="text-lg font-bold mb-2 dark:text-white">{reward.title}</h3>
            <p className="text-sm text-gray-500 mb-6 flex-1">{reward.description}</p>
            <div className="flex items-center justify-between mt-auto">
              <span className="font-bold text-purple-600 dark:text-purple-400">{reward.points} pts</span>
              <button 
                disabled={(user.loyaltyPoints || 0) < reward.points}
                className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-purple-700 transition-all disabled:bg-gray-200 disabled:text-gray-400"
              >
                Redeem Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTiers = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold dark:text-white mb-4">Membership Tiers</h2>
        <p className="text-gray-600 dark:text-gray-400">Higher tiers unlock better rewards, faster point earning, and premium benefits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier, idx) => (
          <div 
            key={tier.name} 
            className={`relative rounded-3xl p-8 border-2 transition-all ${
              user.badge === tier.name 
                ? 'border-purple-600 bg-purple-50/30 dark:bg-purple-900/10 shadow-xl scale-105' 
                : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800'
            }`}
          >
            {user.badge === tier.name && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                Your Current Tier
              </div>
            )}
            
            <div className={`w-16 h-16 rounded-2xl ${tier.bgColor} flex items-center justify-center mb-6`}>
              <Award className={`w-8 h-8 ${tier.color}`} />
            </div>
            
            <h3 className="text-2xl font-black mb-1 dark:text-white">{tier.name}</h3>
            <p className="text-sm text-gray-500 mb-8">{tier.minPoints}+ points required</p>
            
            <div className="space-y-4">
              <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Benefits</p>
              {tier.benefits.map((benefit, bIdx) => (
                <div key={bIdx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-8">
        <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
          <Clock className="w-12 h-12 text-purple-600" />
        </div>
        <div>
          <h4 className="text-xl font-bold dark:text-white mb-2">How to level up?</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Every LKR 100 spent earns you 1 point. Your points accumulate over time and automatically promote you to the next tier once you reach the threshold. Platinum status offers the best value for frequent users!
          </p>
        </div>
      </div>
    </div>
  );

  const renderReferral = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-10 text-center text-white relative overflow-hidden">
        <div className="relative z-10">
          <Users className="w-16 h-16 mx-auto mb-6 text-purple-200" />
          <h2 className="text-4xl font-black mb-4">Refer a Friend, Earn Points!</h2>
          <p className="text-xl opacity-90 mb-8">Get 200 points for every friend who joins and books their first service.</p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
            <p className="text-xs font-black uppercase text-purple-200 tracking-widest mb-3">Your Referral Code</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-white rounded-xl px-6 py-4 text-purple-900 font-black text-xl tracking-wider select-all">
                CLOUD-JOIN-2025
              </div>
              <button 
                onClick={copyReferralCode}
                className="bg-purple-400 hover:bg-purple-300 text-white px-6 rounded-xl transition-all active:scale-95"
              >
                {copied ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-2xl" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-3xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Copy, title: '1. Share Code', desc: 'Send your unique code to friends and family.' },
          { icon: Users, title: '2. They Join', desc: 'Friend signs up using your referral code.' },
          { icon: Gift, title: '3. Both Earn', desc: 'You get 200 pts and they get LKR 250 off!' },
        ].map((step, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4 text-purple-600 dark:text-purple-400">
              <step.icon className="w-7 h-7" />
            </div>
            <h4 className="font-bold mb-2 dark:text-white">{step.title}</h4>
            <p className="text-sm text-gray-500">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFE] dark:bg-gray-900 transition-colors">
      <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} onProfileClick={onProfileClick} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <BackButton />
              <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <Award className="w-8 h-8 text-purple-600" />
                Loyalty Program
              </h1>
            </div>
            <div className="hidden md:flex bg-white dark:bg-gray-800 p-1 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-sm">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'history', name: 'Points' },
                { id: 'rewards', name: 'Rewards' },
                { id: 'tiers', name: 'Tiers' },
                { id: 'referral', name: 'Referral' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'text-gray-500 hover:text-purple-600 dark:text-gray-400'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="md:hidden mb-8 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'history', name: 'Points' },
                { id: 'rewards', name: 'Rewards' },
                { id: 'tiers', name: 'Tiers' },
                { id: 'referral', name: 'Referral' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'bg-white dark:bg-gray-800 text-gray-500 border border-purple-50'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[600px]">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'history' && renderHistory()}
            {activeTab === 'rewards' && renderRewards()}
            {activeTab === 'tiers' && renderTiers()}
            {activeTab === 'referral' && renderReferral()}
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-gray-100 dark:border-gray-800 py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">&copy; 2026 CLOUD LAUNDRY.LK - Loyalty Program</p>
        </div>
      </footer>
    </div>
  );
}

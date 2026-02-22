import { useState } from 'react';
import { Link } from 'react-router';
import { 
  Award, 
  Bell, 
  Calendar, 
  ChartLine,
  Gift, 
  LayoutDashboard, 
  LogOut, 
  Search, 
  Settings, 
  Star, 
  TrendingUp, 
  Trophy, 
  User as UserIcon, 
  X,
  ArrowLeft,
  AlertCircle,
  Zap,
  Users,
  ChevronRight
} from 'lucide-react';
import type { User } from '../types';
import logo from 'figma:asset/d0e24839a24076173960597a25c12b48f3330fdf.png';

interface LoyaltyPointsSummaryProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function LoyaltyPointsSummary({ user, onLogout }: LoyaltyPointsSummaryProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'history' | 'tiers' | 'earn'>('summary');
  const [showAlert, setShowAlert] = useState(true);

  // Mock data
  const currentPoints = 1250;
  const currentTier = 'Silver';
  const tierProgress = 70; // percentage to next tier
  const pointsToNextTier = 250;
  const earnedThisMonth = 340;
  const nextRewardIn = 150;
  const activeDiscounts = 3;
  const currentDiscount = 10; // percentage
  const nextTierDiscount = 15; // percentage
  const expiringPoints = 500;
  const expiringDate = 'March 15, 2026';
  const daysRemaining = 15;

  const sidebarItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'bookings', name: 'My Bookings', icon: Calendar, path: '/dashboard' },
    { id: 'loyalty', name: 'Loyalty Points', icon: Trophy, path: '/loyalty-summary', active: true },
    { id: 'notifications', name: 'Notifications', icon: Bell, path: '/dashboard' },
    { id: 'profile', name: 'My Profile', icon: UserIcon, path: '/profile' },
    { id: 'settings', name: 'Settings', icon: Settings, path: '/security' },
  ];

  const tabs = [
    { id: 'summary', name: 'Summary' },
    { id: 'history', name: 'History' },
    { id: 'tiers', name: 'Tiers' },
    { id: 'earn', name: 'Earn Points' },
  ];

  const pointsHistory = [
    { id: 1, description: 'Laundry Service (BK-1023)', date: '2026-02-15', status: 'earned', points: 150 },
    { id: 2, description: 'Dry Cleaning (BK-1022)', date: '2026-02-10', status: 'earned', points: 100 },
    { id: 3, description: 'Reward Redemption', date: '2026-02-08', status: 'redeemed', points: -300 },
    { id: 4, description: 'Referral Bonus - John D.', date: '2026-02-05', status: 'earned', points: 200 },
    { id: 5, description: 'Weekend Bonus', date: '2026-02-03', status: 'earned', points: 90 },
  ];

  const tiersList = [
    { name: 'Silver', minPoints: 0, discount: 10, color: 'gray', benefits: ['1x points', '10% discount', 'Standard support'] },
    { name: 'Gold', minPoints: 1500, discount: 15, color: 'yellow', benefits: ['1.5x points', '15% discount', 'Priority support', 'Free express delivery'] },
    { name: 'Platinum', minPoints: 5000, discount: 20, color: 'purple', benefits: ['2x points', '20% discount', 'Dedicated manager', 'Premium perks'] },
  ];

  // Calculate circle progress (SVG)
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (tierProgress / 100) * circumference;

  const renderSummaryTab = () => (
    <div className="grid grid-cols-3 gap-6">
      {/* Left Column - Large Points Card */}
      <div className="col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-8">
          {/* Circular Progress */}
          <div className="relative flex-shrink-0">
            <svg width="280" height="280" viewBox="0 0 280 280" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="140"
                cy="140"
                r={radius}
                stroke="#E5E7EB"
                strokeWidth="16"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="140"
                cy="140"
                r={radius}
                stroke="url(#gradient)"
                strokeWidth="16"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#A78BFA" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl mb-2">🏆</div>
              <div className="text-5xl font-black text-gray-900">{currentPoints.toLocaleString()}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">POINTS</div>
            </div>
          </div>

          {/* Badge and Progress Info */}
          <div className="flex-1 w-full">
            <div className="mb-6">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">CURRENT TIER</div>
              <h2 className="text-4xl font-black text-gray-900 mb-3">{currentTier} Level</h2>
              <p className="text-gray-600 leading-relaxed">
                You are currently in the {currentTier} tier. Reach Gold to unlock a {nextTierDiscount}% discount on all premium services.
              </p>
            </div>

            {/* Current Discount Badge */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 mb-6 border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🎁</div>
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">CURRENT DISCOUNT</div>
                  <div className="text-3xl font-black text-purple-600">{currentDiscount}% OFF</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{pointsToNextTier} POINTS TO GOLD</div>
                <div className="text-sm font-black text-purple-600">{tierProgress}% Completed</div>
              </div>
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-1000"
                  style={{ width: `${tierProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-bold text-gray-400 uppercase">SILVER</span>
                <span className="text-xs font-bold text-yellow-600 uppercase">GOLD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Stats Cards */}
      <div className="space-y-4">
        {/* Earned This Month */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-2xl">
              📈
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">EARNED THIS MONTH</div>
              <div className="text-3xl font-black text-gray-900">+{earnedThisMonth} pts</div>
            </div>
          </div>
        </div>

        {/* Next Reward In */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center text-2xl">
              🎁
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">NEXT REWARD IN</div>
              <div className="text-3xl font-black text-gray-900">{nextRewardIn} pts</div>
            </div>
          </div>
        </div>

        {/* Active Discounts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-2xl">
              ⚡
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">ACTIVE DISCOUNTS</div>
              <div className="text-3xl font-black text-gray-900">0{activeDiscounts}</div>
            </div>
          </div>
        </div>

        {/* Redeem Button */}
        <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl px-6 py-4 font-bold text-base hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2">
          Redeem Rewards
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Level Up Strategy Card */}
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-black mb-3">Level Up Strategy</h3>
          <p className="text-sm text-purple-100 mb-5 leading-relaxed">
            You are just <strong>2 bookings</strong> away from reaching the <strong>Gold Tier</strong>. Complete them this month to maintain your {nextTierDiscount}% discount for the rest of the year!
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-yellow-900" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm mb-1">Express Points</div>
                <div className="text-xs text-purple-200">Earn double points on weekend bookings</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-900" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm mb-1">Invite Friends</div>
                <div className="text-xs text-purple-200">Unlock a +100pts bonus instantly</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-black text-gray-900 mb-6">Points History</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Description</th>
              <th className="pb-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
              <th className="pb-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="pb-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pointsHistory.map((item) => (
              <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                <td className="py-4 font-semibold text-sm text-gray-900">{item.description}</td>
                <td className="py-4 text-sm text-gray-500">{item.date}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    item.status === 'earned' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className={`py-4 text-right font-black text-base ${
                  item.status === 'earned' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.points > 0 ? '+' : ''}{item.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTiersTab = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 mb-3">Membership Tiers</h2>
        <p className="text-gray-600">Unlock better discounts and benefits as you level up</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiersList.map((tier) => {
          const isCurrentTier = tier.name === currentTier;
          return (
            <div 
              key={tier.name}
              className={`relative bg-white rounded-2xl p-8 border-2 transition-all ${
                isCurrentTier 
                  ? 'border-purple-600 shadow-xl scale-105' 
                  : 'border-gray-100 shadow-sm'
              }`}
            >
              {isCurrentTier && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                  Your Current Tier
                </div>
              )}
              
              <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center text-3xl ${
                tier.color === 'gray' ? 'bg-gray-100' :
                tier.color === 'yellow' ? 'bg-yellow-100' :
                'bg-purple-100'
              }`}>
                <Award className={`w-8 h-8 ${
                  tier.color === 'gray' ? 'text-gray-500' :
                  tier.color === 'yellow' ? 'text-yellow-600' :
                  'text-purple-600'
                }`} />
              </div>

              <h3 className="text-2xl font-black text-gray-900 mb-2">{tier.name}</h3>
              <p className="text-sm text-gray-500 mb-6">{tier.minPoints}+ points required</p>

              <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Discount</div>
                <div className="text-3xl font-black text-purple-600">{tier.discount}% OFF</div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Benefits</div>
                {tier.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderEarnPointsTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-black mb-3">How to Earn Points</h2>
        <p className="text-purple-100 text-lg">Multiple ways to earn loyalty points and unlock amazing rewards!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { icon: '🧺', title: 'Complete Bookings', points: '100-200', desc: 'Earn points for every completed service' },
          { icon: '👥', title: 'Refer Friends', points: '200', desc: 'Get bonus points when friends join' },
          { icon: '⭐', title: 'Write Reviews', points: '50', desc: 'Share your experience and earn' },
          { icon: '🎉', title: 'Weekend Bookings', points: '2x', desc: 'Double points on Saturday & Sunday' },
          { icon: '🎂', title: 'Birthday Bonus', points: '500', desc: 'Special birthday points gift' },
          { icon: '💳', title: 'First Booking', points: '300', desc: 'Welcome bonus for new customers' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center text-3xl flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-gray-900 mb-1">{item.title}</h3>
                <div className="text-2xl font-black text-purple-600 mb-2">+{item.points} pts</div>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F5F5F7]">
      {/* Sidebar */}
      <aside className="w-60 bg-gradient-to-b from-[#2D1B69] to-[#1A0F3E] text-white flex flex-col fixed h-screen overflow-y-auto z-50 shadow-2xl">
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center p-2">
              <img src={logo} alt="Cloud Laundry" className="w-full h-full object-contain brightness-0 invert" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight">CLOUD LAUNDRY.LK</h1>
              <p className="text-[10px] text-purple-300 font-bold uppercase tracking-widest">CUSTOMER PANEL</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-6 px-4 space-y-1">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = item.active;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-purple-600 text-white border-l-4 border-purple-300' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold border-2 border-white/20">
              D
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Demo Customer</p>
              <p className="text-xs text-purple-300 font-medium">Member</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-60">
        {/* Header Bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all font-bold text-sm">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <h1 className="text-3xl font-black text-gray-900">Loyalty Points</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search bookings..." 
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-64"
                />
              </div>
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-all relative">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-all">
                <Star className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        {showAlert && (
          <div className="mx-8 mt-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl p-6 relative">
            <button 
              onClick={() => setShowAlert(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-400 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-xl font-black text-amber-900 mb-1">{expiringPoints} Points Expiring Soon!</h3>
                    <p className="text-sm text-amber-800">
                      Your points from February 2025 will expire on <strong>{expiringDate}</strong>. Use them before they're gone!
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                    {daysRemaining} DAYS REMAINING
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-bold text-sm hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30">
                    Book Service Now
                  </button>
                  <button className="px-5 py-2 border-2 border-orange-400 text-orange-700 rounded-lg font-bold text-sm hover:bg-orange-50 transition-all">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-8 mt-6">
          <div className="flex gap-2 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 font-bold text-sm transition-all relative ${
                  activeTab === tab.id 
                    ? 'text-gray-900 bg-gray-900 text-white rounded-t-lg' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-8 py-6">
          {activeTab === 'summary' && renderSummaryTab()}
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'tiers' && renderTiersTab()}
          {activeTab === 'earn' && renderEarnPointsTab()}
        </div>
      </main>
    </div>
  );
}
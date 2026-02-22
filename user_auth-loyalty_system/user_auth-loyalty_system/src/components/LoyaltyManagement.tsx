import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Calendar, 
  Search, 
  ChevronDown, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Star, 
  Users, 
  Gift, 
  CheckSquare, 
  Trophy, 
  ArrowRight,
  Shield,
  Zap,
  Sparkles,
  Bell,
  X,
  Smartphone,
  Info,
  TrendingUp,
  User as UserProfileIcon
} from 'lucide-react';
import { Button } from './ui/button';

interface LoyaltyManagementProps {
  user: any;
}

export default function LoyaltyManagement({ user }: LoyaltyManagementProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'history' | 'tiers' | 'earn'>('overview');
  const [showTierUpModal, setShowTierUpModal] = useState(false);
  const [showExpiringAlert, setShowExpiringAlert] = useState(true);

  // Mock data for transaction history
  const transactions = [
    { id: 'BK-1005', service: 'House Deep Cleaning', date: '2026-02-10', points: +150, status: 'confirmed' },
    { id: 'BK-1002', service: 'Sofa Cleaning', date: '2026-02-05', points: +80, status: 'confirmed' },
    { id: 'RE-502', service: 'Reward Redemption', date: '2026-02-01', points: -500, status: 'confirmed' },
    { id: 'BK-0988', service: 'Carpet Cleaning', date: '2026-01-28', points: +120, status: 'pending' },
    { id: 'BK-0950', service: 'General Cleaning', date: '2026-01-15', points: +100, status: 'reversed' },
  ];

  const tiers = [
    { 
      id: 'bronze', 
      name: 'Bronze', 
      points: '0-499 pts', 
      color: 'from-orange-400 to-orange-700', 
      benefits: ['1x Points Multiplier', 'Standard Email Support', 'Basic Newsletter'] 
    },
    { 
      id: 'silver', 
      name: 'Silver', 
      points: '500-1499 pts', 
      color: 'from-slate-300 to-slate-500', 
      benefits: ['1.2x Points Multiplier', 'Priority Email Support', '10% Automatic Discount', 'Birthday Special'] 
    },
    { 
      id: 'gold', 
      name: 'Gold', 
      points: '1500-4999 pts', 
      color: 'from-yellow-300 to-yellow-600', 
      benefits: ['1.5x Points Multiplier', 'Priority Call Support', '15% Automatic Discount', 'Free Express Service (2/yr)'] 
    },
    { 
      id: 'platinum', 
      name: 'Platinum', 
      points: '5000+ pts', 
      color: 'from-purple-400 to-purple-800', 
      benefits: ['2x Points Multiplier', 'Dedicated Manager', '20% Automatic Discount', 'Unlimited Free Express'] 
    },
  ];

  const earningWays = [
    { icon: Calendar, title: 'Book Services', points: '50-150 points', desc: 'Per booking based on service value.', color: 'bg-blue-50 text-blue-600' },
    { icon: Star, title: 'Write Reviews', points: '+25 points', desc: 'Share your feedback and photos.', color: 'bg-amber-50 text-amber-600' },
    { icon: Users, title: 'Refer Friends', points: '+100 points', desc: 'Per friend who completes a booking.', color: 'bg-green-50 text-green-600' },
    { icon: Gift, title: 'First Booking', points: '1.5x multiplier', desc: 'Welcome bonus for your first service.', color: 'bg-pink-50 text-pink-600' },
    { icon: CheckSquare, title: 'Complete Profile', points: '+50 points', desc: 'One-time bonus for full details.', color: 'bg-indigo-50 text-indigo-600' },
    { icon: Trophy, title: 'Monthly Challenges', points: 'Up to 300 pts', desc: 'Complete special recurring tasks.', color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Expiring Alert */}
      <AnimatePresence>
        {showExpiringAlert && (
          <motion.div 
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-[24px] p-6 relative overflow-hidden"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-200">
                <Clock className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-amber-900">500 Points Expiring Soon!</h3>
                  <button onClick={() => setShowExpiringAlert(false)} className="text-amber-500 hover:text-amber-700">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-amber-700 font-medium text-sm mt-1">
                  Your points from February 2025 will expire on March 15, 2026. Use them before they're gone!
                </p>
                <div className="flex items-center gap-4 mt-6">
                  <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
                    <span className="text-xs font-black text-amber-600 uppercase">15 days remaining</span>
                  </div>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-10 px-6 font-bold text-sm shadow-md">
                    Book Service Now
                  </Button>
                  <button className="text-amber-600 font-bold text-sm hover:underline ml-2">Learn More</button>
                </div>
              </div>
            </div>
            {/* Background design */}
            <div className="absolute -right-8 -bottom-8 opacity-5">
              <Clock size={160} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Tabs */}
      <div className="flex bg-white dark:bg-gray-800 p-1 rounded-[24px] shadow-sm border border-slate-100 dark:border-gray-700 w-fit">
        {[
          { id: 'overview', label: 'Summary' },
          { id: 'history', label: 'History' },
          { id: 'tiers', label: 'Tiers' },
          { id: 'earn', label: 'Earn Points' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-8 py-3 rounded-[20px] text-sm font-black transition-all ${
              activeSubTab === tab.id 
                ? 'bg-[#1e1534] text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'overview' && (
        <div className="space-y-8">
          {/* Main Progress & Stats (Mobile Summary Aesthetic) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-[40px] p-10 shadow-sm border border-slate-100 dark:border-gray-700 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center gap-12">
                {/* Progress Ring */}
                <div className="relative w-64 h-64 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      className="text-slate-100 dark:text-gray-700"
                    />
                    <motion.circle
                      cx="128"
                      cy="128"
                      r="120"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 120}
                      initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
                      animate={{ strokeDashoffset: (2 * Math.PI * 120) * (1 - 0.7) }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="text-purple-600"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <Award className="w-8 h-8 text-purple-600 mb-1" />
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">1,250</span>
                    <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Points</span>
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-slate-100 dark:bg-gray-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">Current Tier</span>
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white">{user.badge || 'Silver'} Level</h2>
                    </div>
                    <p className="text-slate-500 font-medium">You are currently in the Silver tier. Reach Gold to unlock a 15% flat discount on all premium services.</p>
                  </div>

                  {/* Horizontal Progress Bar */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest">250 points to Gold</div>
                      <div className="text-sm font-black text-purple-600">70% Completed</div>
                    </div>
                    <div className="relative h-4 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '70%' }}
                        transition={{ duration: 1.2 }}
                        className="h-full bg-gradient-to-r from-slate-400 via-yellow-400 to-yellow-500 relative"
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </motion.div>
                      {/* Milestone Markers */}
                      {[0, 25, 50, 75, 100].map(m => (
                        <div key={m} className="absolute top-1/2 -translate-y-1/2 w-1 h-1 bg-white/40 rounded-full" style={{ left: `${m}%` }} />
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                      <span>Silver</span>
                      <span>Gold</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {[
                { label: 'Earned This Month', value: '+340 pts', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
                { label: 'Next Reward In', value: '150 pts', icon: Gift, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10' },
                { label: 'Active Coupons', value: '03', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-slate-100 dark:border-gray-700 flex items-center gap-4">
                  <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
              <Button 
                onClick={() => setShowTierUpModal(true)}
                className="w-full h-16 bg-[#1e1534] hover:bg-[#2a1d4a] text-white rounded-[24px] font-black text-lg shadow-xl shadow-purple-900/10 flex items-center justify-center gap-3"
              >
                Redeem Rewards <ArrowRight size={20} />
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-[#1e1534] rounded-[32px] p-10 text-white relative overflow-hidden max-w-3xl">
               <h3 className="text-2xl font-black mb-4">Level Up Strategy</h3>
               <p className="text-indigo-200 font-medium leading-relaxed mb-8">
                 You are just 2 bookings away from reaching the <span className="text-yellow-400 font-bold underline">Gold Tier</span>. 
                 Complete them this month to maintain your 15% discount for the rest of the year!
               </p>
               <div className="space-y-4">
                 <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/5">
                   <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-indigo-900">
                     <Zap className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="font-black">Express Points</p>
                     <p className="text-xs text-indigo-300">Earn double points on weekend bookings.</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/5">
                   <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-indigo-900">
                     <Users className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="font-black">Invite Friends</p>
                     <p className="text-xs text-indigo-300">Unlock a 100pt bonus instantly.</p>
                   </div>
                 </div>
               </div>
               <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          </div>
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden">
          {/* Filter Bar */}
          <div className="p-8 border-b border-slate-100 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
                  <button className="pl-11 pr-5 py-3 bg-slate-50 dark:bg-gray-900 rounded-2xl text-sm font-bold text-slate-600 dark:text-gray-300 border border-transparent hover:border-purple-200 transition-all flex items-center gap-2">
                    Date Range <ChevronDown size={14} />
                  </button>
                </div>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search Booking ID..." 
                    className="pl-11 pr-5 py-3 bg-slate-50 dark:bg-gray-900 rounded-2xl text-sm font-bold text-slate-600 dark:text-gray-300 border border-transparent focus:border-purple-200 focus:ring-0 outline-none w-64"
                  />
                </div>
                <div className="relative group">
                  <button className="px-5 py-3 bg-slate-50 dark:bg-gray-900 rounded-2xl text-sm font-bold text-slate-600 dark:text-gray-300 border border-transparent hover:border-purple-200 transition-all flex items-center gap-2">
                    Transaction Type <ChevronDown size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-3 bg-slate-50 dark:bg-gray-900 rounded-xl text-slate-500 hover:text-purple-600 border border-transparent hover:border-purple-100 transition-all">
                  <Download className="w-5 h-5" />
                </button>
                <Button className="bg-[#1e1534] text-white rounded-xl h-12 px-6 font-black text-sm">Export Data</Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Booking ID</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Service Type</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Points</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                {transactions.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-slate-600 dark:text-gray-300">{t.date}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-slate-900 dark:text-white">{t.id}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-medium text-slate-500 dark:text-gray-400">{t.service}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-sm font-black ${t.points > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {t.points > 0 ? `+${t.points}` : t.points} pts
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {t.status === 'confirmed' ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                          <CheckCircle2 size={10} /> Confirmed
                        </div>
                      ) : t.status === 'pending' ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                          <Clock size={10} /> Pending
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                          <AlertCircle size={10} /> Reversed
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-8 border-t border-slate-100 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-slate-400 font-medium">Showing 1-5 of 12 transactions</p>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-purple-600 disabled:opacity-30" disabled>
                <ChevronLeft size={18} />
              </button>
              <button className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm">1</button>
              <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-500 hover:text-purple-600 transition-colors">2</button>
              <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-500 hover:text-purple-600 transition-colors">3</button>
              <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-purple-600">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'tiers' && (
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white">Membership Tiers</h2>
            <p className="text-slate-500 font-medium">Earn more, save more. Higher tiers unlock exclusive benefits and premium service multipliers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => {
              const isCurrent = (user.badge || 'Silver').toLowerCase() === tier.id;
              const isNext = tier.id === 'gold'; // Simulated next tier

              return (
                <div 
                  key={tier.id}
                  className={`relative bg-white dark:bg-gray-800 rounded-[32px] p-8 border-2 transition-all duration-300 flex flex-col ${
                    isCurrent 
                      ? 'border-purple-600 shadow-2xl scale-105 z-10' 
                      : isNext 
                        ? 'border-yellow-400 shadow-xl z-0 overflow-hidden' 
                        : 'border-slate-100 dark:border-gray-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                      Current Tier
                    </div>
                  )}
                  {isNext && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                      Next Reward
                    </div>
                  )}

                  {/* Icon/Badge */}
                  <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${tier.color} p-5 shadow-inner mb-6 flex items-center justify-center`}>
                    <Award className="w-full h-full text-white" />
                  </div>

                  <h3 className="text-center text-2xl font-black text-slate-900 dark:text-white">{tier.name}</h3>
                  <p className="text-center text-sm font-black text-slate-400 uppercase tracking-widest mb-8">{tier.points}</p>

                  <div className="flex-1 space-y-4">
                    {tier.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isCurrent ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                          <CheckCircle2 size={12} />
                        </div>
                        <span className="text-sm font-medium text-slate-600 dark:text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <Button className={`mt-8 w-full rounded-2xl h-12 font-black text-sm ${isCurrent ? 'bg-purple-600' : 'bg-slate-100 dark:bg-gray-700 text-slate-400 hover:text-slate-600'}`}>
                    {isCurrent ? 'Active Perks' : 'Unlock Now'}
                  </Button>
                  
                  {isNext && <div className="absolute inset-0 bg-yellow-400/5 pointer-events-none" />}
                </div>
              );
            })}
          </div>

          <div className="bg-[#1e1534] rounded-[40px] p-12 text-white relative overflow-hidden">
             <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                <div className="flex-1 space-y-6">
                  <h3 className="text-3xl font-black">Compare Features</h3>
                  <p className="text-purple-300 font-medium leading-relaxed">View a detailed breakdown of point multipliers and exclusive access rights for each level.</p>
                  <Button className="bg-white text-[#1e1534] hover:bg-purple-50 rounded-2xl h-14 px-10 font-black text-lg">Download Tier PDF</Button>
                </div>
                <div className="flex flex-col gap-4 w-full md:w-auto">
                  {['Free Express Shipping', 'Priority Support', 'Exclusive Challenges'].map(f => (
                    <div key={f} className="flex items-center justify-between gap-20 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="font-bold text-purple-200">{f}</span>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`w-3 h-3 rounded-full ${i <= 2 ? 'bg-purple-400' : 'bg-white/10'}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
             </div>
             <Shield className="absolute -left-20 -bottom-20 w-80 h-80 opacity-5 rotate-12" />
          </div>
        </div>
      )}

      {activeSubTab === 'earn' && (
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white">Ways to Earn</h2>
            <p className="text-slate-500 font-medium">Build your points balance quickly by completing simple tasks and participating in community activities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {earningWays.map((way, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -8 }}
                className="bg-white dark:bg-gray-800 rounded-[32px] p-8 border border-slate-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className={`w-16 h-16 ${way.color} rounded-[24px] flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                  <way.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{way.title}</h3>
                <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-gray-300 mb-4">
                  {way.points}
                </div>
                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">{way.desc}</p>
                <button className="flex items-center gap-2 text-sm font-black text-[#1e1534] dark:text-purple-400 hover:underline">
                  Learn More <ArrowRight size={16} />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-[40px] p-12 text-white relative overflow-hidden">
             <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div>
                  <h3 className="text-3xl font-black mb-2">Weekend Points Booster!</h3>
                  <p className="text-purple-100 font-medium opacity-90">Book any service this Saturday or Sunday and earn 2x bonus points automatically.</p>
                </div>
                <Button className="bg-white text-purple-700 hover:bg-purple-50 rounded-2xl h-14 px-12 font-black text-lg shadow-xl shrink-0">Book Now</Button>
             </div>
             <div className="absolute top-0 right-0 p-10 opacity-10">
               <Zap size={200} />
             </div>
          </div>
        </div>
      )}

      {/* Tier Up Modal */}
      <AnimatePresence>
        {showTierUpModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTierUpModal(false)}
              className="absolute inset-0 bg-[#1e1534]/90 backdrop-blur-lg"
            />
            
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 100 }}
              className="relative bg-white rounded-[48px] p-10 md:p-16 max-w-2xl w-full text-center overflow-hidden shadow-2xl"
            >
              {/* Confetti Animation Placeholder */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -20, opacity: 0, x: Math.random() * 600 - 300 }}
                    animate={{ y: 800, opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2 }}
                    className={`absolute w-3 h-3 rounded-full ${['bg-yellow-400', 'bg-purple-500', 'bg-blue-400', 'bg-pink-400'][i % 4]}`}
                    style={{ left: `${Math.random() * 100}%` }}
                  />
                ))}
              </div>

              {/* Shine effect background */}
              <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-tr from-yellow-400/20 via-transparent to-purple-500/20 animate-spin-slow opacity-30" />

              <div className="relative z-10 space-y-8">
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12, delay: 0.2 }}
                  className="w-48 h-48 mx-auto bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 rounded-[48px] p-10 shadow-[0_30px_60px_rgba(234,179,8,0.4)] flex items-center justify-center relative group"
                >
                  <Award className="w-full h-full text-white drop-shadow-lg" />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-white rounded-[48px]"
                  />
                </motion.div>

                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-black text-[#1e1534] leading-tight">
                    Congratulations!<br />
                    <span className="text-yellow-500">You've Reached Gold Tier!</span>
                  </h2>
                  <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">
                    Welcome to the elite circle. You've unlocked our most premium benefits and priority perks.
                  </p>
                </div>

                {/* Newly Unlocked Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  {[
                    '15% Flat Discount On All Services',
                    '24/7 Priority VIP Concierge',
                    '2 Free Express Cleanings Yearly',
                    'Double Referral Points Bonus'
                  ].map((b, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                      <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                        <CheckCircle2 size={14} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{b}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Welcome Coupon */}
                <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-1 rounded-3xl">
                  <div className="bg-white p-6 rounded-[22px] flex items-center justify-between border-2 border-dashed border-amber-200">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600">
                        <Gift size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">New Tier Bonus</p>
                        <p className="text-lg font-black text-[#1e1534]">Welcome to Gold Reward</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400">Code: GOLD2026</p>
                      <p className="text-xl font-black text-amber-500">LKR 1,500 OFF</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <Button className="flex-1 h-16 bg-[#1e1534] hover:bg-[#2a1d4a] text-white rounded-2xl font-black text-lg shadow-xl">Explore Benefits</Button>
                  <Button variant="outline" onClick={() => setShowTierUpModal(false)} className="flex-1 h-16 border-slate-200 text-slate-500 rounded-2xl font-black text-lg">Continue</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
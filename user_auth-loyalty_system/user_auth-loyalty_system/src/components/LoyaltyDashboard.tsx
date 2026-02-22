import React from 'react';
import { motion } from 'motion/react';
import { 
  Award, 
  Star, 
  Gift, 
  ChevronRight, 
  Zap, 
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Tag,
  ArrowRight
} from 'lucide-react';
import { Button } from './ui/button';

interface LoyaltyDashboardProps {
  points?: number;
  tier?: 'Silver' | 'Gold' | 'Platinum';
  name?: string;
}

export default function LoyaltyDashboard({ 
  points = 1250, 
  tier = 'Silver',
  name = 'Customer'
}: LoyaltyDashboardProps) {
  
  // Confetti/Stars animation variants
  const starVariants = {
    animate: (i: number) => ({
      y: [0, -20, 0],
      x: [0, i % 2 === 0 ? 10 : -10, 0],
      scale: [1, 1.2, 1],
      opacity: [0.3, 1, 0.3],
      transition: {
        duration: 2 + (i % 3),
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.2
      }
    })
  };

  const rewards = [
    {
      id: 1,
      title: 'Free Express Delivery',
      code: 'EXPRESS25',
      expiry: 'Ends in 3 days',
      points: 450,
      icon: Zap,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 2,
      title: 'LKR 750 Off Deep Clean',
      code: 'DEEP750',
      expiry: 'Ends in 12 days',
      points: 800,
      icon: Sparkles,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 3,
      title: 'Free Sofa Steam Clean',
      code: 'SOFAGIFT',
      expiry: 'Platinum Special',
      points: 1200,
      icon: Gift,
      color: 'from-amber-500 to-orange-600'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
        <div className="relative flex flex-col items-center justify-center py-12 px-6 bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          {/* Decorative Stars/Confetti */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={starVariants}
              animate="animate"
              className="absolute pointer-events-none text-amber-400"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            >
              <Star size={Math.random() * 12 + 8} fill="currentColor" />
            </motion.div>
          ))}

          {/* Badge Section */}
          <div className="relative mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="relative z-10 w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(148,163,184,0.3)] border-4 border-white"
            >
              <Award className="w-16 h-16 md:w-20 md:h-20 text-slate-500" />
              
              {/* Subtle Glow Effect */}
              <div className="absolute inset-0 rounded-full bg-slate-300 opacity-20 blur-2xl animate-pulse" />
            </motion.div>
            
            {/* Rank Tag */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-lg"
            >
              {tier} Tier
            </motion.div>
          </div>

          <div className="text-center space-y-2 mt-4">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Welcome back, {name}!</h1>
            <p className="text-slate-500 font-medium">You're doing great! Keep booking to unlock premium perks.</p>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Points Balance Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[32px] shadow-[0_15px_35px_rgba(0,0,0,0.03)] border border-slate-50 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              <TrendingUp className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Balance</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums">
                  {points.toLocaleString()}
                </span>
                <span className="text-lg font-bold text-slate-400 uppercase tracking-tight">points</span>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-11 px-6 font-bold text-sm shadow-lg shadow-purple-100">
                  Earn More
                </Button>
                <button className="text-slate-400 hover:text-slate-600 font-bold text-sm flex items-center gap-1 transition-colors">
                  History <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Tier Benefits Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-slate-800 to-slate-950 p-8 rounded-[32px] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Benefits</span>
              </div>
              <h3 className="text-2xl font-black text-white mb-2">10% Automatic Discount</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                Applied automatically to all services. No promo code needed at checkout!
              </p>
              <div className="mt-auto">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center">
                        <Star size={12} className="text-amber-400" fill="currentColor" />
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-300">+4 more active perks</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Progress Section */}
        <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-[0_15px_45px_rgba(0,0,0,0.03)] border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">Tier Progress</h3>
              <p className="text-slate-400 font-medium">You're making incredible progress towards Gold status!</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-slate-800 uppercase tracking-widest">
                250 points to Gold tier
              </div>
              <div className="text-xs text-slate-400 font-bold mt-1">
                70% Challenge Completed
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "70%" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-slate-400 via-amber-400 to-amber-500 rounded-full shadow-inner relative"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
              {/* Shine effect */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent" />
            </motion.div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 p-6 bg-amber-50 rounded-3xl border border-amber-100/50">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <Award className="text-amber-500 w-6 h-6" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-amber-900 font-bold text-lg">Complete 2 more bookings to reach Gold!</p>
              <p className="text-amber-700/70 text-sm font-medium">Next booking earns you an extra 50 bonus points!</p>
            </div>
            <Button className="md:ml-auto bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl px-6 h-12 shadow-lg shadow-amber-200 border-none transition-all active:scale-95">
              Book Now
            </Button>
          </div>
        </div>

        {/* Available Rewards Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Available Rewards</h2>
            </div>
            <button className="text-sm font-bold text-purple-600 hover:underline">View All</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <motion.div 
                key={reward.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-[32px] p-1 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden group"
              >
                <div className={`bg-gradient-to-br ${reward.color} p-6 rounded-[28px] text-white relative overflow-hidden h-full flex flex-col`}>
                  {/* Background decoration */}
                  <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                    <reward.icon size={120} />
                  </div>
                  
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                      Limited Time
                    </div>
                    <Tag size={16} className="opacity-60" />
                  </div>

                  <h4 className="text-xl font-black mb-1 relative z-10 leading-tight">{reward.title}</h4>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-6 relative z-10">{reward.expiry}</p>

                  <div className="mt-auto space-y-4 relative z-10">
                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">Required</span>
                        <span className="font-black text-lg">{reward.points} pts</span>
                      </div>
                      <button className="w-10 h-10 bg-white text-slate-900 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors shadow-lg">
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer help */}
        <div className="text-center">
          <p className="text-slate-400 text-sm font-medium">
            Have questions about your rewards? <a href="#" className="text-purple-600 font-bold hover:underline">Chat with support</a>
          </p>
        </div>
    </div>
  );
}

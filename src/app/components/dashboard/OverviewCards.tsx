import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  CheckCircle2, 
  Award, 
  Clock, 
  Plus, 
  ClipboardList, 
  CreditCard, 
  MessageSquare,
  MapPin,
  Star,
  Sparkles,
  ChevronRight,
  TrendingUp,
  DollarSign,
  History,
  Check,
  Tag,
  ArrowRight,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../utils/api';
import { getTierByName, getNextTier } from '../../lib/loyaltyTiers';

// --- Header & Stats ---
interface DashboardHeaderProps {
  name: string;
  totalBookings: number;
  activeServices: number;
  nextAppointment: string;
  loyaltyPoints?: number;
  loyaltyTier?: string;
}

export const DashboardHeader = ({ name, totalBookings, activeServices, nextAppointment, loyaltyPoints = 0, loyaltyTier = 'Bronze' }: DashboardHeaderProps) => {
  const tierLabel = loyaltyTier.charAt(0).toUpperCase() + loyaltyTier.slice(1).toLowerCase();
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const firstName = name.split(' ')[0];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xl border-4 border-white dark:border-gray-800 shadow-sm overflow-hidden">
           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt="avatar" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Welcome back, {firstName}!
          </h1>
          <p className="text-gray-500 font-medium">{date}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings',    value: String(totalBookings),  icon: Calendar,     color: 'blue' },
          { label: 'Active Services',   value: String(activeServices), icon: CheckCircle2, color: 'emerald' },
          { label: 'Loyalty Points',    value: loyaltyPoints.toLocaleString(), icon: Award, color: 'purple', badge: true },
          { label: 'Next Appointment',  value: nextAppointment,        icon: Clock,        color: 'amber' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-800 p-5 rounded-[20px] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3 group hover:shadow-md transition-all"
          >
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 flex items-center justify-center text-${stat.color}-600 dark:text-${stat.color}-400`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</span>
                {stat.badge && (
                  <div className="px-1.5 py-0.5 bg-slate-100 dark:bg-gray-700 rounded-md text-[8px] font-black text-slate-500 uppercase tracking-tighter">{tierLabel}</div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- Left Column ---
export const UpcomingBookingCard = ({ booking, onReschedule, onCancel }: any) => {
  if (!booking) return null;

  const serviceName = booking.serviceType || booking.serviceName || booking.serviceCategory || 'Cleaning Service';

  // Format date: "2026-04-28" → "April 28, 2026"
  const formattedDate = booking.date
    ? new Date(booking.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—';

  // Primary staff name
  const staffName =
    (booking.assignedTeam && booking.assignedTeam.length > 0)
      ? booking.assignedTeam[0].staffName
      : booking.assignedStaffName || null;

  // Status badge color
  const statusColors: Record<string, string> = {
    confirmed:     'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
    pending:           'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
    'in-progress':     'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
  };
  const statusLabel = booking.status?.replace(/-/g, ' ') || 'pending';
  const statusClass = statusColors[booking.status] || 'bg-gray-100 text-gray-600';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Upcoming Booking
        </h3>
        <span className="text-xs text-gray-400 font-medium">#{booking.bookingId}</span>
      </div>

      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-1 gap-2">
              <h4 className="text-xl font-black text-gray-900 dark:text-white leading-tight">{serviceName}</h4>
              <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shrink-0 ${statusClass}`}>
                {statusLabel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
              <Calendar size={14} className="text-blue-500" />
              {formattedDate} at {booking.time}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {staffName ? (
              <>
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-sm overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staffName}`} alt={staffName} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Staff</p>
                  <p className="text-xs font-bold dark:text-white">{staffName}</p>
                  {booking.assignedTeam && booking.assignedTeam.length > 1 && (
                    <p className="text-[10px] text-gray-400">+{booking.assignedTeam.length - 1} more</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Clock size={16} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Staff</p>
                  <p className="text-xs font-bold text-gray-400">To be assigned</p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 dark:bg-gray-700/50 rounded-xl flex items-center justify-center text-slate-400">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Time Slot</p>
              <p className="text-xs font-bold dark:text-white">{booking.time || '—'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {booking.address && (
            <div className="flex items-start gap-3 text-sm">
              <MapPin size={18} className="text-red-400 shrink-0 mt-0.5" />
              <span className="text-gray-600 dark:text-gray-400 font-medium">{booking.address}</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20">
            <Sparkles size={16} className="text-blue-600 animate-pulse" />
            <span className="text-xs font-bold text-blue-900 dark:text-blue-300">You'll earn 100 loyalty points from this service</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onReschedule(booking)} className="flex-1 h-12 rounded-xl border-gray-200 text-gray-700 font-black text-sm">Reschedule</Button>
          <Button variant="outline" onClick={() => onCancel(booking)} className="flex-1 h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-black text-sm">Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export const QuickActions = () => (
  <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6">Quick Actions</h3>
    <div className="grid grid-cols-2 gap-4">
      {[
        { label: 'Book New Service', icon: Plus, color: 'bg-blue-600', text: 'text-white' },
        { label: 'View All Bookings', icon: ClipboardList, color: 'bg-slate-50 dark:bg-gray-700', text: 'text-gray-900 dark:text-white' },
        { label: 'Payment History', icon: CreditCard, color: 'bg-slate-50 dark:bg-gray-700', text: 'text-gray-900 dark:text-white' },
        { label: 'Contact Support', icon: MessageSquare, color: 'bg-slate-50 dark:bg-gray-700', text: 'text-gray-900 dark:text-white' },
      ].map((action, i) => (
        <button 
          key={i}
          className={`p-6 rounded-[24px] ${action.color} ${action.text} flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm`}
        >
          <action.icon size={28} />
          <span className="text-xs font-black text-center leading-tight uppercase tracking-wider">{action.label}</span>
        </button>
      ))}
    </div>
  </div>
);

// --- Center Column ---
export const ActivityFeed = () => (
  <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-lg font-black text-gray-900 dark:text-white">Recent Activity</h3>
      <button className="text-xs font-bold text-blue-600 hover:underline">View All →</button>
    </div>
    <div className="relative space-y-8">
      {/* Timeline Line */}
      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-700" />
      
      {[
        { icon: Check, color: 'bg-emerald-500', title: 'Service completed - Deep Cleaning #1234', time: '2 hours ago', link: '#1234' },
        { icon: DollarSign, color: 'bg-blue-500', title: 'Payment received - LKR 15,000.00', time: '4 hours ago' },
        { icon: Star, color: 'bg-amber-500', title: 'Earned 100 loyalty points', time: 'Yesterday' },
        { icon: MessageSquare, color: 'bg-purple-500', title: 'Review submitted for booking #1230', time: '1 day ago', link: '#1230' },
        { icon: Calendar, color: 'bg-slate-400', title: 'Booking created - Basic Cleaning', time: '2 days ago' },
      ].map((item, i) => (
        <div key={i} className="relative flex items-start gap-5 group cursor-default">
          <div className={`z-10 w-10 h-10 ${item.color} rounded-full flex items-center justify-center text-white border-4 border-white dark:border-gray-800 shadow-sm group-hover:scale-110 transition-transform`}>
            <item.icon size={16} fill="currentColor" />
          </div>
          <div className="flex-1 -mt-0.5">
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
              {item.title}
              {item.link && <span className="text-blue-600 ml-1 cursor-pointer">#{item.link}</span>}
            </p>
            <span className="text-[11px] font-black uppercase text-gray-400 tracking-widest">{item.time}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ServiceHistory = () => (
  <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-black text-gray-900 dark:text-white">Service History</h3>
      <button className="text-xs font-bold text-blue-600 hover:underline">View All History →</button>
    </div>
    <div className="space-y-4">
      {[
        { name: 'Deep Cleaning', date: 'Feb 10, 2026', staff: 'Maria R.', icon: Calendar, color: 'blue' },
        { name: 'Floor Polishing', date: 'Jan 28, 2026', staff: 'John D.', icon: Star, color: 'amber' },
        { name: 'General Cleaning', date: 'Jan 15, 2026', staff: 'Maria R.', icon: ClipboardList, color: 'emerald' },
      ].map((item, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-gray-900/40 hover:bg-slate-100 dark:hover:bg-gray-900/60 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-${item.color}-50 dark:bg-${item.color}-900/20 flex items-center justify-center text-${item.color}-600`}>
              <item.icon size={18} />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 dark:text-white">{item.name}</p>
              <p className="text-[10px] font-bold text-gray-500">{item.date} • {item.staff}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <span className="hidden md:inline-flex px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase rounded-md">Completed</span>
             <button className="p-2 text-gray-400 hover:text-blue-600"><History size={16} /></button>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
       <p className="text-[11px] font-bold text-gray-400 text-center">24 total services completed since Jan 2024</p>
    </div>
  </div>
);

// --- Right Column ---
export const LoyaltyPointsCard = () => {
  const [account, setAccount] = useState<{ currentBalance: number; lifetimePoints: number; currentTier: string } | null>(null);

  useEffect(() => {
    fetchWithAuth('/loyalty/account')
      .then(res => { if (res && !res.error) setAccount(res); })
      .catch(() => {});
  }, []);

  const tier = getTierByName(account?.currentTier);
  const nextTier = getNextTier(account?.currentTier);
  const lifetimePoints = account?.lifetimePoints ?? 0;
  const progress = nextTier ? Math.min(100, Math.round(((lifetimePoints - tier.min) / (nextTier.min - tier.min)) * 100)) : 100;
  const pointsToNext = nextTier ? Math.max(0, nextTier.min - lifetimePoints) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="shrink-0">
          <div className="relative">
            <div className={`w-20 h-20 bg-gradient-to-br ${tier.gradient} rounded-3xl flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-700`}>
              <Award className="w-10 h-10 text-white drop-shadow-md" />
            </div>
            <div className="absolute inset-0 bg-slate-400/20 blur-xl rounded-full scale-150 animate-pulse" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{tier.name} Member</h4>
          <div className="flex items-baseline justify-center md:justify-start gap-1 mb-4">
            <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{(account?.currentBalance ?? 0).toLocaleString()}</span>
            <span className="text-sm font-bold text-gray-400">points balance</span>
          </div>

          <div className="space-y-3">
            <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden max-w-md">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1 }}
                className={`h-full bg-gradient-to-r ${tier.gradient} rounded-full`}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400 max-w-md">
              <span className="text-blue-600">{nextTier ? `${pointsToNext} pts to ${nextTier.name.toLowerCase()}` : 'Top tier reached'}</span>
              <span>{progress}% Progress</span>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <Link to="/loyalty" className="px-6 py-3 bg-blue-50 dark:bg-blue-900/10 text-blue-600 rounded-xl font-black text-xs hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2 group">
            View Details <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export const PromoBanner = () => (
  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[24px] p-6 text-white relative overflow-hidden group shadow-lg">
    <div className="relative z-10">
      <div className="inline-flex px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-widest border border-white/10 mb-3">Limited Offer</div>
      <h4 className="text-2xl font-black leading-tight mb-2">20% OFF<br />Deep Cleaning</h4>
      <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider mb-6">Valid until March 1st</p>
      <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-black text-sm shadow-xl active:scale-95 transition-transform">Claim Now</button>
    </div>
    <Tag className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
  </div>
);

export const PaymentSummary = () => (
  <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-center gap-3 mb-6">
       <div className="w-10 h-10 bg-slate-50 dark:bg-gray-700 rounded-xl flex items-center justify-center text-slate-400">
         <CreditCard size={20} />
       </div>
       <h3 className="text-lg font-black text-gray-900 dark:text-white">Payment</h3>
    </div>
    
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-gray-500">Outstanding Balance</span>
        <span className="text-lg font-black text-gray-900 dark:text-white">LKR 0.00</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-gray-500">Next Payment Due</span>
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">N/A</span>
      </div>
      <div className="pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[10px] font-black border-2 border-white dark:border-gray-800">VISA</div>
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-[10px] font-black border-2 border-white dark:border-gray-800">MC</div>
        </div>
        <button className="text-[10px] font-black uppercase text-blue-600 hover:underline">Manage Cards</button>
      </div>
    </div>
  </div>
);

// --- Empty States ---
export const EmptyBookingState = () => (
  <div className="bg-white dark:bg-gray-800 rounded-[24px] p-12 shadow-sm border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
    <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full flex items-center justify-center">
       <ClipboardList className="w-12 h-12 text-blue-200" />
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">No upcoming bookings</h3>
      <p className="text-gray-500 font-medium max-w-xs mx-auto text-sm leading-relaxed">You don't have any scheduled cleaning services at the moment.</p>
    </div>
  </div>
);

export const EmptyState = ({ icon: Icon, title, message, actionLabel, actionLink }: any) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white dark:bg-gray-800 rounded-[24px] border border-gray-100 dark:border-gray-700 shadow-sm">
    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center text-gray-400 mb-4">
      <Icon size={32} />
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-500 max-w-xs mb-6">{message}</p>
    {actionLabel && (
      <Link 
        to={actionLink}
        className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 dark:shadow-none"
      >
        {actionLabel}
      </Link>
    )}
  </div>
);
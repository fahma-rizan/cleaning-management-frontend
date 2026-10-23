import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  History,
  Gift,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Quote,
  ArrowRight,
} from 'lucide-react';
import type { User } from '../types';
import Header from './Header';
import BackButton from './BackButton';
import { fetchWithAuth } from '../utils/api';
import { LOYALTY_TIERS, getTierByName, getNextTier, TRANSACTION_META } from '../lib/loyaltyTiers';

interface LoyaltyPageProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

interface Account {
  currentBalance: number;
  lifetimePoints: number;
  loyaltyDebt: number;
  currentTier: string;
  discountPercent: number;
  discountAvailable: boolean;
  tierPerksGranted: Record<string, boolean>;
  tierPerksUsed: Record<string, boolean>;
  earnedThisMonth: number;
}

interface Transaction {
  _id: string;
  type: 'earned' | 'redeemed' | 'reversed' | 'expired' | 'bonus';
  points: number;
  reason: string;
  bookingId?: string;
  createdAt: string;
}

export default function LoyaltyPage({ user, onLogout, theme, onToggleTheme, onProfileClick }: LoyaltyPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'tiers'>('overview');
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | Transaction['type']>('all');
  const [search, setSearch] = useState('');
  const [reserving, setReserving] = useState(false);
  const [reserveMessage, setReserveMessage] = useState('');

  const loadAll = async () => {
    try {
      const [acc, hist] = await Promise.all([
        fetchWithAuth('/loyalty/account'),
        fetchWithAuth('/loyalty/history'),
      ]);
      if (acc && !acc.error) setAccount(acc);
      if (hist?.transactions) setTransactions(hist.transactions);
    } catch (err) {
      setError('Failed to load loyalty data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReserveDiscount = async () => {
    setReserving(true);
    setReserveMessage('');
    try {
      const data = await fetchWithAuth('/loyalty/tier-discount/apply', { method: 'POST', body: JSON.stringify({}) });
      if (data?.applied) {
        setReserveMessage(`✅ ${data.percent}% ${data.tier} tier discount reserved — it'll be applied at your next booking.`);
        await loadAll();
      } else {
        setReserveMessage(`❌ ${data?.message || 'Could not reserve the discount.'}`);
      }
    } catch (err) {
      setReserveMessage('❌ Failed to reserve the discount. Please try again.');
    } finally {
      setReserving(false);
    }
  };

  const tier = getTierByName(account?.currentTier);
  const nextTier = getNextTier(account?.currentTier);
  const lifetimePoints = account?.lifetimePoints ?? user.lifetimePoints ?? 0;
  const balance = account?.currentBalance ?? user.loyaltyPoints ?? 0;

  const progressToNext = nextTier
    ? Math.min(100, Math.round(((lifetimePoints - tier.min) / (nextTier.min - tier.min)) * 100))
    : 100;
  const pointsToNext = nextTier ? Math.max(0, nextTier.min - lifetimePoints) : 0;

  const filteredHistory = transactions.filter(t => {
    if (historyFilter !== 'all' && t.type !== historyFilter) return false;
    if (search && !t.reason.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Award },
    { id: 'history', name: 'History', icon: History },
    { id: 'tiers', name: 'Tiers', icon: Star },
  ] as const;

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Status hero */}
      <div className={`relative overflow-hidden rounded-3xl p-8 text-white bg-gradient-to-br ${tier.gradient}`}>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest opacity-90">{tier.name} Member</span>
          </div>
          <h2 className="text-4xl font-black mb-1">{user.name}</h2>
          <p className="opacity-90 mb-6">
            {lifetimePoints.toLocaleString()} lifetime points &middot; {tier.discount > 0 ? `${Math.round(tier.discount * 100)}% tier discount` : 'no discount yet'}
          </p>

          {nextTier ? (
            <div className="max-w-lg">
              <div className="flex justify-between text-xs font-bold mb-2 opacity-90">
                <span>{tier.name}</span>
                <span>{pointsToNext.toLocaleString()} pts to {nextTier.name}</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${progressToNext}%` }} />
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold">
              <Sparkles className="w-4 h-4" /> You've reached the top tier!
            </div>
          )}
        </div>
        <Award className="absolute -right-8 -bottom-8 w-64 h-64 opacity-10 rotate-12" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-purple-100 dark:border-purple-900/30 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Redeemable Balance</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{balance.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">resets Dec 31 each year</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-purple-100 dark:border-purple-900/30 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Lifetime Points</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{lifetimePoints.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">determines your tier permanently</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-purple-100 dark:border-purple-900/30 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Earned This Month</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{(account?.earnedThisMonth ?? 0).toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">points from paid bookings</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-purple-100 dark:border-purple-900/30 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Earning Rate</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{tier.earningRate}x</p>
          <p className="text-xs text-gray-400 mt-1">points per Rs. 100 spent</p>
        </div>
      </div>

      {!!account?.loyaltyDebt && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-amber-800 dark:text-amber-300">{account.loyaltyDebt.toLocaleString()} pts loyalty debt outstanding</p>
            <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
              A previously-redeemed booking was cancelled — future earned points repay this before adding to your balance, and redemption is paused until it's cleared.
            </p>
          </div>
        </div>
      )}

      {account?.discountAvailable && (
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl w-fit">
            <Gift className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-green-800 dark:text-green-300">A {account.discountPercent}% one-time {tier.name} tier discount is available</p>
            <p className="text-sm text-green-700/80 dark:text-green-400/80">Reserve it now and it'll be applied to your next booking's total.</p>
            {reserveMessage && <p className="text-sm mt-2 font-semibold text-green-800 dark:text-green-300">{reserveMessage}</p>}
          </div>
          <button
            type="button"
            onClick={handleReserveDiscount}
            disabled={reserving}
            className="shrink-0 px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold text-sm transition-colors"
          >
            {reserving ? 'Reserving…' : 'Reserve Discount'}
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-purple-100 dark:border-purple-900/30 shadow-sm">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">How redeeming works</h3>
        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Every Rs. 100 spent earns {tier.earningRate} point{tier.earningRate === 1 ? '' : 's'} at your current tier.</li>
          <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> You must have more than 100 points to redeem, and always keep at least 100 in your balance — up to 500 points per booking. 1 point = Rs. 1 discount.</li>
          <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Each tier unlocks a one-time bonus discount the first time you reach it.</li>
        </ul>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 text-center shadow-sm">
        <Quote className="w-8 h-8 text-purple-300 mx-auto mb-3" />
        <p className="text-lg sm:text-xl font-semibold text-white max-w-xl mx-auto leading-relaxed">
          "Every booking brings you closer to your next reward."
        </p>
        <button
          type="button"
          onClick={() => navigate('/services')}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-purple-700 font-bold text-sm hover:bg-purple-50 transition-colors shadow-lg"
        >
          Book a New Service
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-purple-100 dark:border-purple-900/30 shadow-sm animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold dark:text-white">Points History</h2>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search history..."
              className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm w-48"
            />
          </div>
          <select
            value={historyFilter}
            onChange={e => setHistoryFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm font-semibold"
          >
            <option value="all">All types</option>
            <option value="earned">Earned</option>
            <option value="redeemed">Redeemed</option>
            <option value="bonus">Tier Bonus</option>
            <option value="reversed">Reversed</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-100 dark:border-gray-700">
              <th className="pb-4 text-xs font-black uppercase text-gray-400 tracking-widest">Description</th>
              <th className="pb-4 text-xs font-black uppercase text-gray-400 tracking-widest">Date</th>
              <th className="pb-4 text-xs font-black uppercase text-gray-400 tracking-widest">Type</th>
              <th className="pb-4 text-right text-xs font-black uppercase text-gray-400 tracking-widest">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {filteredHistory.length === 0 && (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">No transactions yet</td></tr>
            )}
            {filteredHistory.map(t => {
              const meta = TRANSACTION_META[t.type] || TRANSACTION_META.earned;
              return (
                <tr key={t._id} className="hover:bg-purple-50/30 dark:hover:bg-purple-900/5 transition-colors">
                  <td className="py-4 font-semibold text-sm dark:text-gray-200">{t.reason}</td>
                  <td className="py-4 text-sm text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${meta.color}`}>{meta.label}</span>
                  </td>
                  <td className={`py-4 text-right font-bold ${t.points > 0 ? 'text-green-600' : t.points < 0 ? 'text-red-500' : 'text-purple-600'}`}>
                    {t.points > 0 ? '+' : ''}{t.points || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTiers = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold dark:text-white mb-4">Membership Tiers</h2>
        <p className="text-gray-600 dark:text-gray-400">Tiers are based on lifetime points and never downgrade. Higher tiers earn points faster and unlock bigger one-time discounts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {LOYALTY_TIERS.map(t => {
          const isCurrent = t.name.toLowerCase() === tier.name.toLowerCase();
          const isLocked = lifetimePoints < t.min;
          return (
            <div
              key={t.name}
              className={`relative rounded-3xl p-6 border-2 transition-all ${
                isCurrent
                  ? 'border-purple-600 bg-purple-50/30 dark:bg-purple-900/10 shadow-xl scale-105'
                  : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800'
              } ${isLocked ? 'opacity-70' : ''}`}
            >
              {isCurrent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg whitespace-nowrap">
                  Your Current Tier
                </div>
              )}

              <div className={`w-14 h-14 rounded-2xl ${t.bg} flex items-center justify-center mb-5`}>
                <Award className={`w-7 h-7 ${t.color}`} />
              </div>

              <h3 className="text-xl font-black mb-1 dark:text-white">{t.name}</h3>
              <p className="text-xs text-gray-500 mb-6">
                {t.max === Infinity ? `${t.min}+ lifetime pts` : `${t.min}–${t.max} lifetime pts`}
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{t.earningRate}x points per Rs. 100 spent</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {t.discount > 0 ? `${Math.round(t.discount * 100)}% one-time tier discount` : 'Entry tier — build up your points'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-8">
        <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
          <Clock className="w-12 h-12 text-purple-600" />
        </div>
        <div>
          <h4 className="text-xl font-bold dark:text-white mb-2">How to level up?</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Your lifetime points accumulate with every paid booking and never reset — once you reach a tier's threshold you keep it for good.
            Platinum members earn 3x points and enjoy a 15% one-time discount reward.
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFE] dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading loyalty account...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFE] dark:bg-gray-900 transition-colors">
      <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} onProfileClick={onProfileClick} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <BackButton />
              <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <Award className="w-8 h-8 text-purple-600" />
                Loyalty Program
              </h1>
            </div>
            <div className="flex bg-white dark:bg-gray-800 p-1 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-sm overflow-x-auto">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === t.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-500 hover:text-purple-600 dark:text-gray-400'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">{error}</div>
          )}

          <div className="min-h-[600px]">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'history' && renderHistory()}
            {activeTab === 'tiers' && renderTiers()}
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

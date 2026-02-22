import { useState } from 'react';
import { Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  bookingId: string;
  serviceType: string;
  points: string;
  pointsValue: number;
  status: 'confirmed' | 'pending' | 'refunded' | 'upgraded' | 'used';
  subtext?: string;
}

export default function HistoryPage() {
  const [dateRange, setDateRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactionType, setTransactionType] = useState('all');

  const transactions: Transaction[] = [
    { id: '1', date: '2026-02-10', bookingId: 'BK-1005', serviceType: 'House Deep Cleaning', points: '+150 pts', pointsValue: 150, status: 'confirmed' },
    { id: '2', date: '2026-02-05', bookingId: 'BK-1002', serviceType: 'Sofa Cleaning', points: '+80 pts', pointsValue: 80, status: 'confirmed' },
    { id: '3', date: '2026-02-01', bookingId: 'RE-582', serviceType: 'Points Redemption', points: '-500 pts', pointsValue: -500, status: 'confirmed' },
    { id: '4', date: '2026-01-28', bookingId: 'BK-0988', serviceType: 'Carpet Cleaning', points: '+120 pts', pointsValue: 120, status: 'pending' },
    { id: '5', date: '2026-01-15', bookingId: 'BK-0950', serviceType: 'General Cleaning', points: '+100 pts', pointsValue: 100, status: 'refunded', subtext: 'Points refunded – cancelled within 24 hours' },
    { id: '6', date: '2026-01-10', bookingId: 'BG-001', serviceType: 'Gold Badge Upgrade', points: '🏅 Badge Earned', pointsValue: 0, status: 'upgraded' },
    { id: '7', date: '2026-01-11', bookingId: 'BD-001', serviceType: 'Badge Discount Applied', points: '5% Discount Used', pointsValue: 0, status: 'used' }
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-orange-100 text-orange-600';
      case 'refunded': return 'bg-red-100 text-red-600';
      case 'upgraded': return 'bg-purple-100 text-purple-700';
      case 'used': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Date Range</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Search by Booking ID</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="BK-1005"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Transaction Type</label>
            <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400">
              <option value="all">All Transactions</option>
              <option value="earned">Points Earned</option>
              <option value="redeemed">Points Redeemed</option>
              <option value="badges">Badge Upgrades</option>
              <option value="discount">Badge Discount Used</option>
              <option value="refunded">Points Refunded</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Booking ID</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Service Type</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Points</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, index) => (
                <tr key={t.id} className={`border-b border-gray-50 hover:bg-purple-50/30 transition-colors ${index === transactions.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-6 py-4 text-sm text-gray-700">{t.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{t.bookingId}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-800">{t.serviceType}</p>
                    {t.subtext && <p className="text-xs text-gray-400 mt-1">{t.subtext}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-semibold ${t.pointsValue > 0 ? 'text-emerald-600' : t.pointsValue < 0 ? 'text-red-500' : 'text-gray-700'}`}>
                      {t.points}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${getStatusStyles(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <p className="text-sm text-gray-500">Showing 1-{transactions.length} of {transactions.length} transactions</p>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 text-gray-400" /></button>
            <button className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm font-semibold">1</button>
            <button className="px-3 py-1 hover:bg-gray-200 text-gray-500 rounded-lg text-sm font-semibold transition-colors">2</button>
            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-gray-400" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

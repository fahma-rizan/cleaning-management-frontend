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
  const [currentPage, setCurrentPage] = useState(1);

  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2026-02-10',
      bookingId: 'BK-1005',
      serviceType: 'House Deep Cleaning',
      points: '+150 pts',
      pointsValue: 150,
      status: 'confirmed'
    },
    {
      id: '2',
      date: '2026-02-05',
      bookingId: 'BK-1002',
      serviceType: 'Sofa Cleaning',
      points: '+80 pts',
      pointsValue: 80,
      status: 'confirmed'
    },
    {
      id: '3',
      date: '2026-02-01',
      bookingId: 'RE-582',
      serviceType: 'Points Redemption',
      points: '-500 pts',
      pointsValue: -500,
      status: 'confirmed'
    },
    {
      id: '4',
      date: '2026-01-28',
      bookingId: 'BK-0988',
      serviceType: 'Carpet Cleaning',
      points: '+120 pts',
      pointsValue: 120,
      status: 'pending'
    },
    {
      id: '5',
      date: '2026-01-15',
      bookingId: 'BK-0950',
      serviceType: 'General Cleaning',
      points: '+100 pts',
      pointsValue: 100,
      status: 'refunded',
      subtext: 'Points refunded – cancelled within 24 hours'
    },
    {
      id: '6',
      date: '2026-01-10',
      bookingId: 'BG-001',
      serviceType: 'Gold Badge Upgrade',
      points: '🏅 Badge Earned',
      pointsValue: 0,
      status: 'upgraded'
    },
    {
      id: '7',
      date: '2026-01-11',
      bookingId: 'BD-001',
      serviceType: 'Badge Discount Applied',
      points: '5% Discount Used',
      pointsValue: 0,
      status: 'used'
    }
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-[#10b981]/20 text-[#10b981]';
      case 'pending':
        return 'bg-[#f97316]/20 text-[#f97316]';
      case 'refunded':
        return 'bg-[#ef4444]/20 text-[#ef4444]';
      case 'upgraded':
        return 'bg-[#7c3aed]/20 text-[#7c3aed]';
      case 'used':
        return 'bg-[#94a3b8]/20 text-[#94a3b8]';
      default:
        return 'bg-[#94a3b8]/20 text-[#94a3b8]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-[#1a1a2e] rounded-xl border border-white/8 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] uppercase tracking-wide mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-[#0f0f1a] border border-white/8 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* Search by Booking ID */}
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] uppercase tracking-wide mb-2">
              Search by Booking ID
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="BK-1005"
                className="w-full bg-[#0f0f1a] border border-white/8 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
              />
            </div>
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] uppercase tracking-wide mb-2">
              Transaction Type
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full bg-[#0f0f1a] border border-white/8 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
            >
              <option value="all">All Transactions</option>
              <option value="earned">Points Earned</option>
              <option value="redeemed">Points Redeemed</option>
              <option value="badges">Badge Upgrades</option>
              <option value="discount">Badge Discount Used</option>
              <option value="refunded">Points Refunded</option>
            </select>
          </div>

          {/* Export Button */}
          <div className="flex items-end">
            <button className="w-full bg-[#0f0f1a] hover:bg-[#7c3aed]/10 border border-white/8 hover:border-[#7c3aed] rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-[#1a1a2e] rounded-xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8 bg-[#0f0f1a]">
                <th className="text-left px-6 py-4 text-xs font-bold text-[#94a3b8] uppercase tracking-wide">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-[#94a3b8] uppercase tracking-wide">
                  Booking ID
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-[#94a3b8] uppercase tracking-wide">
                  Service Type
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-[#94a3b8] uppercase tracking-wide">
                  Points
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-[#94a3b8] uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={`border-b border-white/8 hover:bg-white/5 transition-colors ${
                    index === transactions.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <td className="px-6 py-4 text-sm text-white">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-white">
                    {transaction.bookingId}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-white">{transaction.serviceType}</p>
                      {transaction.subtext && (
                        <p className="text-xs text-[#94a3b8] mt-1">{transaction.subtext}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-semibold ${
                        transaction.pointsValue > 0
                          ? 'text-[#10b981]'
                          : transaction.pointsValue < 0
                          ? 'text-[#ef4444]'
                          : 'text-white'
                      }`}
                    >
                      {transaction.points}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${getStatusStyles(
                        transaction.status
                      )}`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-white/8 flex items-center justify-between">
          <p className="text-sm text-[#94a3b8]">
            Showing 1-{transactions.length} of {transactions.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4 text-[#94a3b8]" />
            </button>
            <button className="px-3 py-1 bg-[#7c3aed] text-white rounded-lg text-sm font-semibold">
              1
            </button>
            <button className="px-3 py-1 hover:bg-white/5 text-[#94a3b8] rounded-lg text-sm font-semibold transition-colors">
              2
            </button>
            <button className="px-3 py-1 hover:bg-white/5 text-[#94a3b8] rounded-lg text-sm font-semibold transition-colors">
              3
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4 text-[#94a3b8]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

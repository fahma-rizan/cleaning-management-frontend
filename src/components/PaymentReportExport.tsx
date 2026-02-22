import { useState, useMemo } from 'react';
import { Download, FileText, Filter, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import type { User } from '../types';

interface PaymentReportExportProps {
  user: User;
}

interface BookingRecord {
  bookingId: string;
  serviceType: string;
  date: string;
  paymentMethod: string;
  paymentMethodName: string;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  bookingDate: string;
}

export default function PaymentReportExport({ user }: PaymentReportExportProps) {
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [exporting, setExporting] = useState(false);

  // Load bookings from localStorage
  const allBookings: BookingRecord[] = useMemo(() => {
    return JSON.parse(localStorage.getItem('userBookings') || '[]');
  }, []);

  // Apply filters
  const filtered = useMemo(() => {
    return allBookings.filter(b => {
      const matchMethod = filterMethod === 'all' || b.paymentMethod === filterMethod;
      const matchStatus = filterStatus === 'all' || b.status === filterStatus;
      const bookingDate = new Date(b.bookingDate || b.date);
      const matchFrom = !fromDate || bookingDate >= new Date(fromDate);
      const matchTo = !toDate || bookingDate <= new Date(toDate + 'T23:59:59');
      return matchMethod && matchStatus && matchFrom && matchTo;
    });
  }, [allBookings, filterMethod, filterStatus, fromDate, toDate]);

  // Stats
  const totalCollected = filtered.reduce((s, b) => s + (b.paidAmount || 0), 0);
  const totalPending = filtered.reduce((s, b) => s + (b.balanceAmount || 0), 0);
  const totalRevenue = totalCollected + totalPending;

  const statusLabel: Record<string, string> = {
    'confirmed-paid': 'Paid',
    'confirmed-partial': 'Partial',
    'confirmed-unpaid': 'COD / Unpaid',
  };

  const methodLabel: Record<string, string> = {
    'full-online': 'Online (Full)',
    'advance-balance': 'Advance',
    'cod': 'Cash on Delivery',
    'pay-after-completion': 'Pay After Completion',
  };

  // Export to CSV (Excel-compatible)
  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const headers = ['Booking ID', 'Service', 'Date', 'Payment Method', 'Paid Amount (Rs)', 'Balance Amount (Rs)', 'Status'];
      const rows = filtered.map(b => [
        b.bookingId,
        b.serviceType,
        b.date,
        b.paymentMethodName || methodLabel[b.paymentMethod] || b.paymentMethod,
        b.paidAmount || 0,
        b.balanceAmount || 0,
        statusLabel[b.status] || b.status,
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payment_Report_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Report</h1>
          <p className="text-gray-500 mt-1">Filter, review and export payment records</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Total Revenue</span>
              <div className="bg-purple-100 p-2 rounded-lg"><DollarSign className="w-4 h-4 text-purple-600" /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">Rs. {totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{filtered.length} bookings</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Collected</span>
              <div className="bg-green-100 p-2 rounded-lg"><TrendingUp className="w-4 h-4 text-green-600" /></div>
            </div>
            <p className="text-2xl font-bold text-green-600">Rs. {totalCollected.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">Received payments</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Pending</span>
              <div className="bg-orange-100 p-2 rounded-lg"><TrendingDown className="w-4 h-4 text-orange-600" /></div>
            </div>
            <p className="text-2xl font-bold text-orange-600">Rs. {totalPending.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">Balance due</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-700">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Payment Method</label>
              <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                <option value="all">All Methods</option>
                <option value="full-online">Online (Full)</option>
                <option value="advance-balance">Advance</option>
                <option value="cod">Cash on Delivery</option>
                <option value="pay-after-completion">Pay After Completion</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                <option value="all">All Statuses</option>
                <option value="confirmed-paid">Paid</option>
                <option value="confirmed-partial">Partial</option>
                <option value="confirmed-unpaid">Unpaid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">From Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={() => { setFilterMethod('all'); setFilterStatus('all'); setFromDate(''); setToDate(''); }}
              className="text-sm text-purple-600 hover:underline">Clear Filters</button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-gray-700">Records</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{filtered.length}</span>
            </div>
            <button onClick={handleExport} disabled={exporting || filtered.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                exporting || filtered.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}>
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export to Excel'}
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No payment records found</p>
              <p className="text-sm mt-1">Try adjusting your filters or make a booking first</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-6 py-3 text-left">Booking ID</th>
                    <th className="px-6 py-3 text-left">Service</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Method</th>
                    <th className="px-6 py-3 text-right">Paid</th>
                    <th className="px-6 py-3 text-right">Balance</th>
                    <th className="px-6 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((b, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-600">{b.bookingId}</td>
                      <td className="px-6 py-4 text-gray-800">{b.serviceType}</td>
                      <td className="px-6 py-4 text-gray-500">{b.date}</td>
                      <td className="px-6 py-4 text-gray-600">{b.paymentMethodName || methodLabel[b.paymentMethod] || b.paymentMethod}</td>
                      <td className="px-6 py-4 text-right font-semibold text-green-600">Rs. {(b.paidAmount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-semibold text-orange-500">
                        {(b.balanceAmount || 0) > 0 ? `Rs. ${b.balanceAmount.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          b.status === 'confirmed-paid' ? 'bg-green-100 text-green-700' :
                          b.status === 'confirmed-partial' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {statusLabel[b.status] || b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-purple-50 font-semibold text-sm">
                    <td className="px-6 py-4" colSpan={4}>Total ({filtered.length} records)</td>
                    <td className="px-6 py-4 text-right text-green-600">Rs. {totalCollected.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-orange-500">Rs. {totalPending.toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

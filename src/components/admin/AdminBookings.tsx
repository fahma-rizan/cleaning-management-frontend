import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, XCircle, Search, ClipboardList } from 'lucide-react';
import type { User } from '../../types';
import DemoTopBar from '../DemoTopBar';
import { tokenStorage, authApi } from '../../utils/auth';
import AdminSidebar from './AdminSidebar';

const API_BASE_URL = 'http://localhost:4000/api';

interface AdminBookingsProps {
  user: User;
}

// Mirrors the actual backend Booking schema (models/Booking.js) — lowercase
// status values, and the 4 real payment-method identifiers used throughout
// the app. (The separate `Booking` type in src/types.ts is stale — it still
// uses 'processing' instead of 'in-progress' and doesn't have these fields
// at all, so it isn't reused here.)
interface BookingRecord {
  _id: string;
  bookingId?: string;
  customerName?: string;
  customerEmail?: string;
  serviceName: string;
  serviceType?: string;
  date?: string;
  time?: string;
  address?: string;
  price: number;
  paidAmount: number;
  balanceAmount: number;
  paymentMethod?: 'full-online' | 'advance-balance' | 'cod' | 'pay-after-completion';
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  createdAt?: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending:      'Pending',
  confirmed:    'Confirmed',
  'in-progress':'In Progress',
  completed:    'Completed',
  cancelled:    'Cancelled',
};

const STATUS_BADGE: Record<string, string> = {
  pending:      'bg-amber-100 text-amber-700',
  confirmed:    'bg-blue-100 text-blue-700',
  'in-progress':'bg-purple-100 text-purple-700',
  completed:    'bg-green-100 text-green-700',
  cancelled:    'bg-gray-200 text-gray-600',
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  'full-online':          'Online (Full)',
  'advance-balance':      'Advance + Balance',
  cod:                    'Cash on Delivery',
  'pay-after-completion': 'Pay After Completion',
};

export default function AdminBookings({ user }: AdminBookingsProps) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const [statusFilter, setStatusFilter]   = useState('all');
  const [methodFilter, setMethodFilter]   = useState('all');
  const [search, setSearch]               = useState('');
  // NEW — admin-cancel action. Tracks which row's cancel request is in
  // flight so we can disable just that row's button.
  const [cancellingId, setCancellingId]   = useState<string | null>(null);

  const handleLogout = async () => {
    await authApi.logout();
    // NOTE: no /login route exists in this snapshot — falls back to '/'
    // (redirects to the financial dashboard). Point at your real login
    // route once one exists.
    navigate('/');
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const tokens = tokenStorage.getTokens();
      const authHeader = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
      const response = await fetch(`${API_BASE_URL}/bookings`, { headers: authHeader });
      if (!response.ok) throw new Error('Failed to load bookings.');
      const data = await response.json();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong loading bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // NEW — admin cancels a booking directly. Triggers the backend's
  // refund-if-paid logic (routes/booking.js POST /:id/admin-cancel) —
  // paid bookings get a PENDING Refund created automatically (reviewable
  // in the Financial Dashboard's Refunds & Credit Notes tab), unpaid ones
  // just get cancelled with no refund.
  const handleAdminCancel = async (booking: BookingRecord) => {
    if (!window.confirm(`Cancel booking ${booking.bookingId || booking._id}? A refund will be triggered automatically if it was paid.`)) {
      return;
    }
    setCancellingId(booking._id);
    try {
      const tokens = tokenStorage.getTokens();
      const authHeader = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
      const response = await fetch(`${API_BASE_URL}/bookings/${booking._id}/admin-cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ reason: 'Cancelled by admin' }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.msg || 'Failed to cancel booking.');
      }
      const { msg } = await response.json();
      setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, status: 'cancelled' } : b));
      alert(msg || 'Booking cancelled.');
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchesMethod = methodFilter === 'all' || b.paymentMethod === methodFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch = !q ||
        b.bookingId?.toLowerCase().includes(q) ||
        b.customerName?.toLowerCase().includes(q) ||
        b.customerEmail?.toLowerCase().includes(q) ||
        b.serviceName?.toLowerCase().includes(q);
      return matchesStatus && matchesMethod && matchesSearch;
    });
  }, [bookings, statusFilter, methodFilter, search]);

  const content = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-purple-300 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 font-medium">Loading bookings...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 font-semibold mb-2">Couldn't load bookings</p>
            <p className="text-gray-600 mb-6">{error}</p>
            <button onClick={fetchBookings} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
            <p className="text-gray-600 mt-1">Every booking in the system — {filtered.length} shown</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                <option value="all">All Statuses</option>
                {Object.keys(STATUS_LABEL).map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Payment Method</label>
              <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                <option value="all">All Methods</option>
                {Object.keys(PAYMENT_METHOD_LABEL).map((m) => (
                  <option key={m} value={m}>{PAYMENT_METHOD_LABEL[m]}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Booking ID, customer name, email, or service"
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No bookings match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-3">Booking ID</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3">Service</th>
                    <th className="text-left px-4 py-3">Date / Time</th>
                    <th className="text-left px-4 py-3">Payment Method</th>
                    <th className="text-right px-4 py-3">Price</th>
                    <th className="text-right px-4 py-3">Balance</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{b.bookingId || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{b.customerName || '—'}</div>
                        <div className="text-xs text-gray-400">{b.customerEmail || ''}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{b.serviceName}</td>
                      <td className="px-4 py-3 text-gray-500">{b.date} {b.time}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {b.paymentMethod ? PAYMENT_METHOD_LABEL[b.paymentMethod] || b.paymentMethod : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">Rs. {(b.price || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-orange-600">Rs. {(b.balanceAmount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${STATUS_BADGE[b.status] || 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_LABEL[b.status] || b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {/* NEW — direct admin cancel + auto refund-trigger.
                            Hidden once already cancelled/completed, same as
                            the backend's own guard. */}
                        {b.status !== 'cancelled' && b.status !== 'completed' && (
                          <button
                            onClick={() => handleAdminCancel(b)}
                            disabled={cancellingId === b._id}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {cancellingId === b._id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar user={user} onLogout={handleLogout} />
      <div className="ml-64">
        <DemoTopBar user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {content()}
          </div>
        </div>
      </div>
    </div>
  );
}

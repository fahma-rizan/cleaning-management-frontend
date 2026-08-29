import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, XCircle, ClipboardList, MessageSquareWarning, Ban } from 'lucide-react';
import type { User } from '../types';
import DemoTopBar from './DemoTopBar';
import { tokenStorage } from '../utils/auth';

const API_BASE_URL = 'http://localhost:4000/api';

interface CustomerBookingsProps {
  user: User;
}

// NEW FILE — minimal customer-facing "My Bookings" page. Doesn't exist
// anywhere in this folder today (the real, richer version lives only on
// the teammate's development2 branch as src/app/components/Booking.tsx +
// BookingCard/OngoingBookingCard/UpcomingBookingsList — per instruction,
// not pulled in here). This is just enough to give completed bookings a
// "Request price adjustment / Report a problem" entry point, since that's
// the only thing actually being asked for right now.
//
// Mirrors AdminBookings.tsx's BookingRecord shape (the real backend
// Booking schema — lowercase status, real payment-method identifiers) —
// NOT the stale `Booking` interface in src/types.ts.
interface BookingRecord {
  _id: string;
  bookingId?: string;
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
  pending:       'Pending',
  confirmed:     'Confirmed',
  'in-progress': 'In Progress',
  completed:     'Completed',
  cancelled:     'Cancelled',
};

const STATUS_BADGE: Record<string, string> = {
  pending:       'bg-amber-100 text-amber-700',
  confirmed:     'bg-blue-100 text-blue-700',
  'in-progress': 'bg-purple-100 text-purple-700',
  completed:     'bg-green-100 text-green-700',
  cancelled:     'bg-gray-200 text-gray-600',
};

export default function CustomerBookings({ user }: CustomerBookingsProps) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const tokens = tokenStorage.getTokens();
      const authHeader = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
      // routes/booking.js's GET / now scopes this to the logged-in
      // customer's own bookings when req.user.role === 'customer' — no
      // separate endpoint needed.
      const response = await fetch(`${API_BASE_URL}/bookings`, { headers: authHeader });
      if (!response.ok) throw new Error('Failed to load your bookings.');
      const data = await response.json();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong loading your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const sorted = useMemo(
    () => [...bookings].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')),
    [bookings]
  );

  const content = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-purple-300 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 font-medium">Loading your bookings...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 font-semibold mb-2">Couldn't load your bookings</p>
            <p className="text-gray-600 mb-6">{error}</p>
            <button onClick={fetchBookings} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (sorted.length === 0) {
      return (
        <div className="py-16 text-center text-gray-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>You don't have any bookings yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {sorted.map((b) => (
          <div key={b._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-gray-900">{b.serviceName}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_BADGE[b.status] || 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABEL[b.status] || b.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">{b.date} {b.time}</p>
              <p className="text-xs text-gray-400 font-mono mt-1">{b.bookingId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-lg font-bold text-gray-900">Rs. {(b.price || 0).toLocaleString()}</p>
              {b.balanceAmount > 0 && (
                <p className="text-xs text-orange-600">Balance due: Rs. {b.balanceAmount.toLocaleString()}</p>
              )}
            </div>
            {b.status === 'completed' && (
              <div className="w-full flex justify-end">
                {/* Relocated here per instruction — previously price-reduction
                    requests could only be started from a flat "pick any
                    invoice" list (PriceReductionWorkflow's own selector).
                    This links straight into that same page/flow, pre-selecting
                    this booking via ?bookingId=. FIX: passes the human-
                    readable bookingId string (e.g. "BK-..."), not _id.
                    Invoice.bookingId IS an ObjectId ref in the schema, but
                    getAllInvoices (controllers/invoiceController.js)
                    populates it and overwrites the field with the Booking's
                    own readable `bookingId` string before this ever reaches
                    the frontend — so that's what PriceReductionWorkflow's
                    fetched list actually carries, and what has to match here. */}
                <button
                  onClick={() => navigate(`/price-reduction?bookingId=${encodeURIComponent(b.bookingId || '')}`)}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <MessageSquareWarning className="w-4 h-4" />
                  Request price adjustment / Report a problem
                </button>
              </div>
            )}
            {/* NEW (A.7) — the only way to reach cancellation used to be a
                dead link nobody could get to. /booking/cancel now works
                (see CancelPage.tsx); only offered while the service hasn't
                started yet — matches assessCancellation()'s hard block on
                the backend, so this button never leads to a guaranteed
                rejection. Uses _id since that's what /api/bookings/:id/cancel
                and GET /api/bookings/:id both accept. */}
            {(b.status === 'pending' || b.status === 'confirmed') && (
              <div className="w-full flex justify-end">
                <button
                  onClick={() => navigate(`/booking/cancel?bookingId=${encodeURIComponent(b._id)}`)}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Ban className="w-4 h-4" />
                  Cancel Booking
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoTopBar user={user} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Bookings</h1>
        <p className="text-gray-500 mb-6">{sorted.length} booking{sorted.length === 1 ? '' : 's'}</p>
        {content()}
      </div>
    </div>
  );
}

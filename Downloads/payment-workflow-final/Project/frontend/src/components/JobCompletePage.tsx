import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader, AlertCircle, MapPin, Calendar, User, Package } from 'lucide-react';
import { tokenStorage } from '../utils/auth';

const API = 'http://localhost:4000/api';

interface Booking {
  _id: string;
  bookingId: string;
  status: string;
  serviceName?: string;
  serviceType?: string;
  date?: string;
  time?: string;
  address?: string;
  price?: number;
  balanceAmount?: number;
  customerName?: string;
  email?: string;
}

export default function JobCompletePage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate      = useNavigate();

  const [booking,    setBooking]    = useState<Booking | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed,  setCompleted]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const getAuthHeader = () => {
    const tokens = tokenStorage.getTokens();
    return tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
  };

  useEffect(() => {
    if (!bookingId) { setError('No booking ID provided.'); setLoading(false); return; }

    const fetchBooking = async () => {
      try {
        const res = await fetch(`${API}/bookings/${bookingId}`, {
          headers: getAuthHeader(),
        });
        if (!res.ok) throw new Error('Booking not found.');
        const data = await res.json();
        setBooking(data);

        // If already completed show completed state
        if (data.status === 'completed') setCompleted(true);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleMarkComplete = async () => {
    if (!booking) return;
    setCompleting(true);
    setError(null);

    try {
      const res = await fetch(`${API}/bookings/${booking._id}/complete`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.msg || 'Failed to mark job as complete.');
      }

      setCompleted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCompleting(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader className="animate-spin w-10 h-10 text-purple-600 mx-auto mb-3" />
        <p className="text-gray-600">Loading job details...</p>
      </div>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error && !booking) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Booking Not Found</h2>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    </div>
  );

  // ── Already completed ─────────────────────────────────────────────────────
  if (completed) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
        <div className="bg-green-100 rounded-full p-4 inline-block mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Job Complete!</h2>
        <p className="text-gray-500 mb-2">
          Booking <span className="font-mono font-semibold text-gray-700">{booking?.bookingId}</span> has been marked as complete.
        </p>
        {(booking?.balanceAmount || 0) > 0 && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
            <p className="text-orange-700 text-sm font-medium">
              Balance payment link has been sent to the customer.
            </p>
            <p className="text-orange-600 text-lg font-bold mt-1">
              Rs. {(booking?.balanceAmount || 0).toLocaleString()} outstanding
            </p>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-6">
          Admin and customer have been notified.
        </p>
      </div>
    </div>
  );

  // ── Main — Mark Complete ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-purple-100 rounded-full p-3 inline-block mb-3">
            <Package className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Job Details</h2>
          <p className="text-gray-500 text-sm mt-1 font-mono">{booking?.bookingId}</p>
        </div>

        {/* Booking details */}
        <div className="space-y-3 mb-8">
          {(booking?.serviceName || booking?.serviceType) && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <Package className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Service</p>
                <p className="font-medium text-gray-800">{booking?.serviceName || booking?.serviceType}</p>
              </div>
            </div>
          )}
          {booking?.customerName && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <User className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Customer</p>
                <p className="font-medium text-gray-800">{booking.customerName}</p>
              </div>
            </div>
          )}
          {booking?.date && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <Calendar className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Scheduled</p>
                <p className="font-medium text-gray-800">{booking.date} {booking.time && `at ${booking.time}`}</p>
              </div>
            </div>
          )}
          {booking?.address && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <MapPin className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Address</p>
                <p className="font-medium text-gray-800 text-sm">{booking.address}</p>
              </div>
            </div>
          )}
          {(booking?.price || 0) > 0 && (
            <div className="flex items-center justify-between bg-purple-50 rounded-xl p-3">
              <p className="text-purple-700 font-medium">Total Amount</p>
              <p className="text-purple-800 font-bold">Rs. {(booking?.price || 0).toLocaleString()}</p>
            </div>
          )}
          {(booking?.balanceAmount || 0) > 0 && (
            <div className="flex items-center justify-between bg-orange-50 rounded-xl p-3">
              <p className="text-orange-700 font-medium">Balance Due</p>
              <p className="text-orange-800 font-bold">Rs. {(booking?.balanceAmount || 0).toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* Mark Complete button */}
        <button
          onClick={handleMarkComplete}
          disabled={completing || booking?.status === 'completed'}
          className="w-full py-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold text-lg rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-200"
        >
          {completing
            ? <><Loader className="w-6 h-6 animate-spin" /> Marking Complete...</>
            : <><CheckCircle className="w-6 h-6" /> Mark Job as Complete</>}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          This will notify the admin and send a payment link to the customer if balance is owed.
        </p>
      </div>
    </div>
  );
}

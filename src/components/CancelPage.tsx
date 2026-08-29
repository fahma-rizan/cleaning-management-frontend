import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, CheckCircle, Loader, AlertTriangle, LogIn } from 'lucide-react';
import type { User } from '../types';
import { tokenStorage } from '../utils/auth';

const API_BASE_URL = 'http://localhost:4000/api';

interface BookingDetails {
  _id: string;
  bookingId: string;
  serviceType: string;
  date: string;
  time: string;
  price: number;
  paidAmount: number;
  status: string;
  hasPayment: boolean;
}

// FIX (Payment/Invoice/Notification build-out, A.7): this page previously
// called GET/POST /bookings/cancel/:token — endpoints that don't exist
// anywhere in the backend (routes/booking.js has no /cancel/:token or
// /cancel route at all), so every visit 404'd and the "Confirm
// Cancellation" button could never work. This is the routed cancel UI
// (teammate-authored) but the refund it's supposed to trigger is this
// domain's responsibility, so it's rewired here to the real, working,
// auth-protected endpoints: GET /api/bookings/:id (public — same one
// JobCompletePage/PaymentGatewayPage already rely on) to load details, and
// POST /api/bookings/:id/cancel (auth, ownership-checked) to actually
// cancel + trigger the A.7 refund-if-paid flow. Layout/visual design left
// as-is; only the data layer changed.
//
// Reached via /booking/cancel?bookingId=<the booking's bookingId or _id>
// (linked from CustomerBookings.tsx's new Cancel button).
interface CancelPageProps {
  user?: User;
}

const CancelPage = ({ user }: CancelPageProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const bookingRef = searchParams.get('bookingId');
  const isLoggedIn = !!(user && user.verified !== undefined ? user : tokenStorage.getTokens()?.accessToken);

  useEffect(() => {
    if (!bookingRef) {
      setError('No booking specified. Please open this page from your bookings list.');
      setLoading(false);
      return;
    }

    fetchBookingDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingRef]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(bookingRef || '')}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || 'Failed to load booking details');
      }
      const data = await response.json();
      setBooking({
        _id: data._id,
        bookingId: data.bookingId || data._id,
        serviceType: data.serviceName || data.serviceType || 'Service',
        date: data.date || '',
        time: data.time || '',
        price: data.price || 0,
        paidAmount: data.paidAmount || 0,
        status: data.status,
        hasPayment: (data.paidAmount || 0) > 0,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    setError('');

    try {
      const tokens = tokenStorage.getTokens();
      const authHeader = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};

      const response = await fetch(`${API_BASE_URL}/bookings/${booking?._id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.msg || 'Failed to cancel booking');
      }

      setSuccessMessage(result.msg || 'Your booking has been cancelled.');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <LogIn className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Log In</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to cancel your booking.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Can't Load Booking</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/my-bookings')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Cancelled</h2>
          <p className="text-gray-600 mb-4">{successMessage}</p>
          <button
            onClick={() => navigate('/my-bookings')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Cancel Booking</h1>
          <p className="text-gray-600 mt-2">Confirm cancellation of your booking</p>
        </div>

        {booking && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold text-gray-900 mb-2">Booking Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Booking ID:</strong> {booking.bookingId}</p>
              <p><strong>Service:</strong> {booking.serviceType}</p>
              <p><strong>Date:</strong> {booking.date}</p>
              <p><strong>Time:</strong> {booking.time}</p>
              <p><strong>Price:</strong> Rs. {booking.price.toLocaleString()}</p>
              <p><strong>Paid Amount:</strong> Rs. {booking.paidAmount.toLocaleString()}</p>
            </div>

            {booking.hasPayment && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Refund Information</p>
                    <p className="text-yellow-700 mt-1">
                      Since you have made a payment of Rs. {booking.paidAmount.toLocaleString()},
                      a refund will be processed automatically if you're cancelling more than 24
                      hours before your scheduled service. Cancellations within 24 hours are
                      cancelled immediately but need our support team to arrange the refund.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!showConfirm ? (
          <div className="space-y-4">
            <p className="text-gray-700 text-center">
              Are you sure you want to cancel this booking?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(true)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
              >
                Yes, Cancel Booking
              </button>
              <button
                onClick={() => navigate('/my-bookings')}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Keep Booking
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please let us know why you're cancelling..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={3}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Cancelling...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Go Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CancelPage;

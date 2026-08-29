import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, XCircle } from 'lucide-react';
import PaymentOptions from './PaymentOptions';
import { addNotification } from '../utils/notificationUtils';
import type { User } from '../types';
import { tokenStorage } from '../utils/auth';

interface PaymentPageProps {
  user: User;
}

// Shape written to localStorage under 'currentBooking' by the service/date/
// address selection step earlier in the flow. Nothing about this draft
// touches the database — no booking, no bookingId — until one of the two
// trigger points below actually fires:
//   - Full Online / Advance+Balance -> PayHere payment succeeds (routes/payhere.js /notify)
//   - COD / Pay-After-Completion    -> customer clicks "Confirm Booking" here
interface BookingDraft {
  serviceName: string;
  serviceType?: string;
  serviceCategory?: string;
  serviceItems?: { name: string; price: number; quantity?: number }[];
  price: number; // total, before any loyalty discount
  date: string;
  time: string;
  address: string;
}

const API_BASE_URL = 'http://localhost:4000/api';

export default function PaymentPage({ user }: PaymentPageProps) {
  const navigate = useNavigate();
  // Optional :bookingId — lets /payment/:bookingId load an existing booking's
  // details directly (e.g. one created via the staff invoice page or seed
  // scripts) instead of requiring a 'currentBooking' draft in localStorage.
  const { bookingId: existingBookingId } = useParams();

  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [advancePercentage] = useState<number>(20); // fixed per spec A.3 — not user-selectable
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (existingBookingId) {
      fetch(`${API_BASE_URL}/bookings/${existingBookingId}`)
        .then(res => {
          if (!res.ok) throw new Error('Booking not found');
          return res.json();
        })
        .then(booking => {
          setDraft({
            serviceName:     booking.serviceName,
            serviceType:     booking.serviceType,
            serviceCategory: booking.serviceCategory,
            serviceItems:    booking.serviceItems,
            price:           booking.price,
            date:            booking.date,
            time:            booking.time,
            address:         booking.address,
          });
        })
        .catch(() => setError(`Could not find booking "${existingBookingId}".`));
      return;
    }

    const stored = localStorage.getItem('currentBooking');
    if (!stored) {
      setError('No booking details found. Please start your booking again.');
      return;
    }
    try {
      setDraft(JSON.parse(stored));
    } catch {
      setError('Your booking details could not be read. Please start again.');
    }
  }, [existingBookingId]);

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);

    if (method === 'full-online' || method === 'advance-balance') {
      if (!draft) return;
      // Nothing is saved to the database at this point. The draft is
      // carried straight through to the payment gateway page, which sends
      // it on to PayHere. The real booking (and its bookingId) is only
      // created once PayHere's webhook confirms the payment succeeded.
      navigate('/payment-gateway', { state: { draft, paymentMethod: method } });
    }
    // For COD / Pay-After-Completion we wait for the "Confirm Booking" click below.
  };

  const handleConfirmOfflineBooking = async () => {
    if (!draft || !selectedPaymentMethod) return;
    setProcessing(true);
    setError(null);

    try {
      const tokens = tokenStorage.getTokens();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
      };

      // This click IS the trigger point for COD / Pay-After-Completion —
      // the booking (and its BK-<date>-<sequence> id) is created right
      // here, not before. No invoice is created yet (per spec A.5/B.3);
      // staff generate that later, when the job is marked complete.
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerId:      user.id,
          customerName:    user.name,
          customerEmail:   user.email,
          serviceName:     draft.serviceName,
          serviceType:     draft.serviceType,
          serviceCategory: draft.serviceCategory,
          serviceItems:    draft.serviceItems,
          date:            draft.date,
          time:            draft.time,
          address:         draft.address,
          paymentMethod:   selectedPaymentMethod, // 'cod' | 'pay-after-completion'
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({} as any));
        throw new Error(body.msg || 'We could not confirm your booking. Please try again.');
      }

      const booking = await response.json();

      await addNotification({
        userId: user.id,
        type: 'order-confirmed',
        title: 'Booking Confirmed! 🎉',
        message: `Your ${draft.serviceName} service is scheduled for ${draft.date} at ${draft.time}. Booking ID: ${booking.bookingId}`,
        bookingId: booking.bookingId,
      });

      localStorage.removeItem('currentBooking');
      navigate('/booking-success', { state: { booking, paymentMethod: selectedPaymentMethod } });
    } catch (err: any) {
      setError(err.message || 'We could not confirm your booking. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (error) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-screen">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-700 font-semibold">Something's not right</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button onClick={() => navigate('/services')} className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg">
          Back to Services
        </button>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-screen">
        <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-spin" />
        <p className="text-gray-500 font-medium">Loading booking details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"><ArrowLeft className="w-5 h-5" />Back</button>
          <h1 className="text-4xl font-bold mb-2">Complete Your Booking</h1>
          <p className="mb-8 text-gray-600">Choose your preferred payment method to confirm your booking</p>
          <PaymentOptions
            totalAmount={draft.price}
            serviceDetails={{ serviceName: draft.serviceName, customizations: [] }}
            onPaymentMethodSelect={handlePaymentMethodSelect}
            advancePercentage={advancePercentage}
          />
          {selectedPaymentMethod && (selectedPaymentMethod === 'cod' || selectedPaymentMethod === 'pay-after-completion') && (
            <div className="mt-6">
              <button onClick={handleConfirmOfflineBooking} disabled={processing} className={`w-full py-4 rounded-lg text-lg font-semibold transition-colors ${processing ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} text-white`}>
                {processing ? <span className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</span> : 'Confirm Booking'}
              </button>
              <p className="text-xs mt-3 text-center text-gray-500">By confirming, you agree to our terms and conditions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

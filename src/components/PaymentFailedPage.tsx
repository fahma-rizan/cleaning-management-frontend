import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle, RefreshCw, Home } from 'lucide-react';
import { addNotification } from '../utils/notificationUtils';
import type { User } from '../types';

interface PaymentFailedPageProps {
  user: User;
}

export default function PaymentFailedPage({ user }: PaymentFailedPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // location.state is populated when navigating programmatically (e.g. from
  // our own code). But when PayHere redirects back via cancel_url, it does a
  // full-page redirect with query params — React Router state is empty in that
  // case. So we read from BOTH sources.
  const failureData = location.state as {
    orderId?: string;
    statusCode?: string;
    reason?: string;
    bookingId?: string;
    paymentMethod?: string;
  };

  // FIX: also read PayHere's query params from the cancel_url redirect
  // e.g. /payment-failed?status_code=-1&order_id=BK-xxx&message=...
  const searchParams = new URLSearchParams(location.search);
  const payhereOrderId  = searchParams.get('order_id')  || undefined;
  const payhereMessage  = searchParams.get('message')   || undefined;
  const payhereStatus   = searchParams.get('status_code') || undefined;

  // Resolve the booking ID — from state (programmatic nav) or PayHere query param
  const bookingId = failureData?.bookingId || failureData?.orderId || payhereOrderId;

  // Resolve the message — prefer PayHere's own message, fall back to state reason
  const failureMessage = payhereMessage || failureData?.reason ||
    'Your payment could not be processed. This may be due to insufficient funds, a cancelled payment, or a declined card.';

  useEffect(() => {
    if (user && bookingId) {
      addNotification({
        userId:    user.id,
        type:      'payment-failed',
        title:     'Payment Failed ❌',
        message:   `Your payment for order ${bookingId} was unsuccessful. ${failureMessage}`,
        bookingId,
      });
    }
  }, [user, bookingId, failureMessage]);

  const handleRetry = () => {
    if (bookingId) {
      navigate(`/payment-gateway/${bookingId}`, {
        replace: true,
        state: { bookingId, paymentMethod: failureData?.paymentMethod },
      });
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-500 p-4 rounded-full">
            <XCircle className="w-16 h-16 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Failed</h1>

        <p className="text-gray-600 mb-6">{failureMessage}</p>

        {bookingId && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-mono text-gray-800">{bookingId}</p>
          </div>
        )}

        {payhereStatus && (
          <p className="text-xs text-gray-400 mb-4">Status code: {payhereStatus}</p>
        )}

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Home className="w-5 h-5" />
            Go Home
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>Need help? Contact us at info@cloudlaundry.lk</p>
        </div>
      </div>
    </div>
  );
}

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
  const failureData = location.state as {
    orderId?: string;
    statusCode?: string;
    reason?: string;
    bookingId?: string; // Add bookingId
    paymentMethod?: string; // Add paymentMethod
  };

  // Send payment failed notification
  useEffect(() => {
    if (user && (failureData?.orderId || failureData?.bookingId)) {
      addNotification({
        userId: user.id,
        type: 'payment-failed',
        title: 'Payment Failed ❌',
        message: `Your payment for order ${failureData.orderId || failureData.bookingId} was unsuccessful. ${failureData.reason || 'Please try again or contact support.'}`,
        bookingId: failureData.orderId || failureData.bookingId,
      });
    }
  }, [user, failureData]);

  const handleRetry = () => {
    if (failureData?.bookingId) {
      // If we have the bookingId, we can redirect to the payment gateway
      navigate(`/payment-gateway/${failureData.bookingId}`, { 
        replace: true, 
        state: { 
          bookingId: failureData.bookingId, 
          paymentMethod: failureData.paymentMethod 
        }
      });
    } else {
      // Fallback to previous page if no bookingId is available
      navigate(-1);
    }
  };

  const handleGoHome = () => {
    navigate('/');
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

        <p className="text-gray-600 mb-6">
          {failureData?.reason || 'Your payment could not be processed. Please try again or contact our support team.'}
        </p>

        {failureData?.orderId && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-mono text-gray-800">{failureData.orderId}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          <button
            onClick={handleGoHome}
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
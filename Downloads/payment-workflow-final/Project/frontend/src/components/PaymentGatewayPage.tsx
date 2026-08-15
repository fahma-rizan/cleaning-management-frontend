import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

interface PayHerePayment {
  sandbox: string;
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  currency: string;
  amount: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  hash: string;
}

const PaymentGatewayPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId: bookingIdFromUrl } = useParams(); // Get bookingId from URL
  const { bookingId: bookingIdFromState, paymentMethod } = location.state || {};

  // Use bookingId from URL if present, otherwise from state
  const bookingId = bookingIdFromUrl || bookingIdFromState;

  useEffect(() => {
    const initiatePayment = async () => {
      // For direct URL testing, we can default the paymentMethod
      const effectivePaymentMethod = paymentMethod || 'full-online';

      if (!bookingId || !effectivePaymentMethod) {
        navigate('/booking-details', { replace: true, state: { error: 'Payment details are missing.' } });
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const res = await axios.post(
          'http://localhost:4000/api/payhere/generate-hash',
          { bookingId, paymentMethod: effectivePaymentMethod },
          { headers: { 'x-auth-token': token } }
        );
        const { payhere_payment, hash, booking: bookingData, invoice: invoiceData } = res.data;

        // Save data to localStorage for the success page to retrieve after redirect
        localStorage.setItem('paymentSuccessData', JSON.stringify({
          booking: bookingData,
          invoice: invoiceData,
          paymentMethod: effectivePaymentMethod,
          timestamp: Date.now()
        }));

        const params: PayHerePayment = { ...payhere_payment, hash };

        // Open checkout in a popup so PayHere can legally close it when finished
        const popup = window.open('', 'payhere_checkout', 'width=720,height=800');
        const submitInCurrentWindow = !popup || popup.closed;

        // Create form either in popup (preferred) or in current window (fallback)
        const targetDoc = submitInCurrentWindow ? document : (popup as Window).document;
        const form = targetDoc.createElement('form');
        form.method = 'POST';
        form.action = 'https://sandbox.payhere.lk/pay/checkout';
        form.target = '_self';

        for (const key in params) {
          const input = targetDoc.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = (params as any)[key];
          form.appendChild(input);
        }

        // Append and submit
        targetDoc.body.appendChild(form);
        form.submit();

        // If we opened a popup, poll until it closes then verify actual payment status
        if (!submitInCurrentWindow && popup) {
          popup.focus();
          const timer = setInterval(async () => {
            try {
              if (popup.closed) {
                clearInterval(timer);

                // FIX: Previously always navigated to /payment-success when
                // the popup closed — regardless of whether the user actually
                // paid, cancelled, or had insufficient funds. PayHere closes
                // the popup in all cases (success, cancel, failure), so
                // popup.closed alone tells us nothing about the outcome.
                //
                // Fix: after the popup closes, poll our backend for the
                // booking status. If it's confirmed/completed, the payment
                // succeeded and PayHere's IPN already updated us. If it's
                // still pending, the user cancelled or payment failed.
                try {
                  const res = await fetch(`http://localhost:4000/api/bookings/${bookingId}`);
                  const booking = await res.json();
                  const paid = booking.status === 'confirmed' || booking.status === 'completed';
                  navigate(paid ? '/payment-success' : '/payment-failed', {
                    replace: true,
                    state: paid ? undefined : {
                      message: 'Payment was not completed. This could be due to insufficient funds, a cancelled payment, or a declined card.',
                      bookingId,
                    },
                  });
                } catch {
                  // If we can't reach the backend, check URL as fallback
                  navigate('/payment-failed', {
                    replace: true,
                    state: { message: 'Could not verify payment status. Please contact support.', bookingId },
                  });
                }
              }
            } catch (e) {
              // ignore cross-origin access errors while the popup is still on PayHere
            }
          }, 500);
        } else {
          // fallback: if popup couldn't be opened, we'll rely on the normal redirect flow
        }
      } catch (error) {
        console.error('Payment initiation failed:', error);
        navigate('/payment-failed', { 
          replace: true, 
          state: { 
            message: 'Could not connect to payment gateway.',
            bookingId: bookingId, // Pass bookingId
            paymentMethod: effectivePaymentMethod // Pass paymentMethod
          } 
        });
      }
    };
    initiatePayment();
  }, [bookingId, paymentMethod, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-lg font-semibold text-gray-700">Connecting to Secure Payment Gateway...</p>
        <p className="text-gray-500">Please wait, you are being redirected.</p>
      </div>
    </div>
  );
};

export default PaymentGatewayPage;
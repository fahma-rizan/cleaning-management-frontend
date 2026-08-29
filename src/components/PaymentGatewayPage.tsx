import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { User } from '../types';

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
  custom_1: string;
  hash: string;
}

interface PaymentGatewayPageProps {
  user?: User;
}

// Poll GET /api/bookings/by-ref/:checkoutRef a few times after the PayHere
// popup closes. Nothing exists under checkoutRef until the /notify webhook
// has actually run and created the real Booking + Invoice, so a 404 here
// just means "still processing" (or the payment failed) — not an error.
const pollForBooking = async (checkoutRef: string, attempts = 10, delayMs = 1200): Promise<any | null> => {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`http://localhost:4000/api/bookings/by-ref/${checkoutRef}`);
      if (res.ok) return await res.json();
    } catch {
      // network hiccup — keep retrying until attempts run out
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return null;
};

const PaymentGatewayPage = ({ user }: PaymentGatewayPageProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { draft, paymentMethod } = (location.state as any) || {};

  useEffect(() => {
    const initiatePayment = async () => {
      if (!draft || !paymentMethod) {
        navigate('/payment', { replace: true, state: { error: 'Payment details are missing. Please start your booking again.' } });
        return;
      }

      try {
        const token = localStorage.getItem('token');

        // Nothing is created in the database by this call — it only builds
        // the PayHere checkout payload and carries the booking draft
        // through PayHere's own custom_1 field. The real booking (and its
        // bookingId) is created later, only once payment actually succeeds.
        const res = await axios.post(
          'http://localhost:4000/api/payhere/generate-hash',
          {
            paymentMethod,
            draft: {
              ...draft,
              customerId:      user?.id,
              customerName:    user?.name,
              customerEmail:   user?.email,
              customerPhone:   (user as any)?.phone,
            },
          },
          { headers: { 'x-auth-token': token } }
        );
        const { payhere_payment, hash, checkoutRef } = res.data;

        // Keep the correlation token around in case the tab reloads mid-flow.
        localStorage.setItem('pendingCheckoutRef', checkoutRef);

        const params: PayHerePayment = { ...payhere_payment, hash };

        // Open checkout in a popup so PayHere can legally close it when finished.
        // FIX: a fixed window name ('payhere_checkout') meant a retry after an
        // earlier attempt reused that same popup — but by then it had already
        // navigated to PayHere's cross-origin domain, so reading .document on
        // it threw a SecurityError instead of opening a fresh blank window.
        // A unique name per attempt guarantees window.open() always hands back
        // a brand-new (same-origin, about:blank) popup.
        const popup = window.open('', `payhere_checkout_${checkoutRef}`, 'width=720,height=800');
        let targetDoc: Document;
        let submitInCurrentWindow: boolean;
        try {
          submitInCurrentWindow = !popup || popup.closed;
          targetDoc = submitInCurrentWindow ? document : (popup as Window).document;
        } catch {
          // Popup handle exists but is already cross-origin (shouldn't happen
          // with a unique name, but fall back safely if it ever does).
          submitInCurrentWindow = true;
          targetDoc = document;
        }
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

        targetDoc.body.appendChild(form);
        form.submit();

        if (!submitInCurrentWindow && popup) {
          popup.focus();
          const timer = setInterval(async () => {
            try {
              if (popup.closed) {
                clearInterval(timer);

                // The popup closes whether the customer paid, cancelled, or
                // was declined — that alone tells us nothing. Poll for the
                // real booking, which only exists once /notify has
                // processed a successful payment.
                const booking = await pollForBooking(checkoutRef);

                if (booking) {
                  localStorage.removeItem('pendingCheckoutRef');
                  localStorage.removeItem('currentBooking');
                  navigate('/payment-success', { replace: true, state: { booking } });
                } else {
                  navigate('/payment-failed', {
                    replace: true,
                    state: {
                      message: 'Payment was not completed. This could be due to insufficient funds, a cancelled payment, or a declined card.',
                      checkoutRef,
                    },
                  });
                }
              }
            } catch {
              // ignore cross-origin access errors while the popup is still on PayHere
            }
          }, 500);
        }
      } catch (error) {
        console.error('Payment initiation failed:', error);
        navigate('/payment-failed', {
          replace: true,
          state: { message: 'Could not connect to payment gateway.' },
        });
      }
    };
    initiatePayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

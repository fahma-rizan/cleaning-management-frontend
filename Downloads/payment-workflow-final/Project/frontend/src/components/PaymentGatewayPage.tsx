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

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://sandbox.payhere.lk/pay/checkout';
        const params: PayHerePayment = { ...payhere_payment, hash };
        for (const key in params) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = (params as any)[key];
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
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
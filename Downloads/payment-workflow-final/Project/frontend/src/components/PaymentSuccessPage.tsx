import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, FileText, Hash, Calendar, IndianRupee } from 'lucide-react';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { AddToCalendarButton } from 'add-to-calendar-button-react';
import { addNotification } from '../utils/notificationUtils';
import InvoiceGenerator from './InvoiceGenerator';
import type { User } from '../types';

interface PaymentSuccessPageProps { user: User; }

export default function PaymentSuccessPage({ user }: PaymentSuccessPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showInvoice, setShowInvoice] = useState(false);
  const [booking,     setBooking]     = useState<any>(null);
  const [invoice,     setInvoice]     = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti]   = useState(false);

  useEffect(() => {
    // Priority 1: React Router navigation state (internal navigation)
    let bookingData = location.state?.booking;
    let invoiceData = location.state?.invoice;
    let method      = location.state?.paymentMethod;

    // Priority 2: localStorage (after PayHere full-page redirect — wipes location.state)
    if (!bookingData || !invoiceData) {
      const storedData = localStorage.getItem('paymentSuccessData');
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          if (parsed.timestamp && Date.now() - parsed.timestamp < 10 * 60 * 1000) {
            bookingData = parsed.booking;
            invoiceData = parsed.invoice;
            method      = parsed.paymentMethod;
            localStorage.removeItem('paymentSuccessData');
          }
        } catch (e) {}
      }
    }

    // Priority 3: PayHere return URL query params fallback
    // PayHere appends: ?order_id=BK-xxx&status_code=2&payment_id=xxx&payhere_amount=5000&payhere_currency=LKR
    if (!bookingData) {
      const p          = new URLSearchParams(location.search);
      const orderId    = p.get('order_id');
      const statusCode = p.get('status_code');

      if (orderId) {
        if (statusCode === '2') {
          // FIX: was using p.get('amount') — PayHere sends 'payhere_amount' not 'amount'
          const paidAmt = parseFloat(p.get('payhere_amount') || '0');
          bookingData = { bookingId: orderId };
          invoiceData = {
            invoiceNumber: 'Confirmed — details emailed to you',
            paidAmount:    paidAmt,
            balanceAmount: 0,
            bookingId:     orderId,
          };
          method = 'payhere';
        } else {
          navigate('/payment-failed', {
            state:   { orderId, statusCode, reason: p.get('reason') || 'Payment was declined or cancelled' },
            replace: true,
          });
          return;
        }
      }
    }

    if (bookingData && invoiceData) {
      setBooking(bookingData);
      setInvoice(invoiceData);
      setPaymentMethod(method || '');
    }
  }, [location.state, location.search]);

  // Notifications after payment
  useEffect(() => {
    if (!booking || !invoice || !user) return;
    const paidAmt = Number(invoice.paidAmount) || 0;
    if (paidAmt <= 0) return;

    const points = Math.round(paidAmt / 10);
    addNotification({ userId: user.id, type: 'payment',        title: 'Payment Successful! 💳',     message: `Payment of Rs. ${paidAmt.toLocaleString()} received successfully.`, bookingId: booking.bookingId });
    addNotification({ userId: user.id, type: 'order-confirmed',title: 'Booking Confirmed! 🎉',       message: `Your service is scheduled for ${booking.date || 'scheduled date'} at ${booking.time || 'scheduled time'}. Booking ID: ${booking.bookingId}`, bookingId: booking.bookingId });
    if (points > 0) {
      addNotification({ userId: user.id, type: 'loyalty-points', title: 'Loyalty Points Added! ✨', message: `You earned ${points} loyalty points for your booking.`, bookingId: booking.bookingId });
    }
  }, [booking, invoice, user]);

  // Confetti
  useEffect(() => {
    setShowConfetti(true);
    const t = setTimeout(() => setShowConfetti(false), 8000);
    return () => clearTimeout(t);
  }, []);

  // Redirect if no data after 3 seconds
  useEffect(() => {
    if (!booking || !invoice) {
      const t = setTimeout(() => navigate('/admin/financial-dashboard', { replace: true }), 3000);
      return () => clearTimeout(t);
    }
  }, [booking, invoice, navigate]);

  const calendarEvent = useMemo(() => {
    if (!booking?.date || !booking?.time) return null;
    const convertTo24Hour = (t: string) => {
      const [time, mod] = t.split(' ');
      let [h, m] = time.split(':');
      if (h === '12') h = '00';
      if (mod?.toUpperCase() === 'PM') h = String(parseInt(h) + 12);
      return `${String(h).padStart(2,'0')}:${m}`;
    };
    const startTime = convertTo24Hour(booking.time);
    const [sh, sm]  = startTime.split(':').map(Number);
    const endObj    = new Date(); endObj.setHours(sh + 2, sm);
    const endTime   = `${String(endObj.getHours()).padStart(2,'0')}:${String(endObj.getMinutes()).padStart(2,'0')}`;
    return {
      name:        `Service: ${booking.serviceName || booking.serviceType || 'Home Service'}`,
      description: `Booking ID: ${booking.bookingId}<br>Invoice No: ${invoice?.invoiceNumber || 'N/A'}`,
      startDate:   booking.date, endDate: booking.date, startTime, endTime,
      timeZone:    'Asia/Colombo',
      location:    booking.address || 'Service Location',
    };
  }, [booking, invoice]);

  if (!booking || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment information...</p>
          <p className="text-sm mt-2 text-gray-500">You'll be redirected shortly if this takes too long.</p>
        </div>
      </div>
    );
  }

  const paidAmount    = Number(invoice.paidAmount)    || 0;
  const balanceAmount = Number(invoice.balanceAmount) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {showConfetti && <Confetti width={width} height={height} recycle={false} />}

      {!showInvoice ? (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto rounded-2xl shadow-xl p-8 text-center bg-white">

            <div className="flex justify-center mb-6">
              <div className="bg-green-500 p-4 rounded-full">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            </div>

            <h1 className="text-3xl mb-4">Payment Successful!</h1>

            <p className="mb-8 text-gray-600 max-w-lg mx-auto">
              {paymentMethod === 'advance-balance'
                ? `Thank you for your advance payment of Rs. ${paidAmount.toLocaleString()}. The balance of Rs. ${balanceAmount.toLocaleString()} will be collected after service.`
                : 'Your booking has been confirmed and your payment is complete. Thank you for choosing our services!'}
            </p>

            <div className="text-left bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Booking Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2"><Hash size={16} /> Booking ID</span>
                  <span className="font-mono text-gray-800">{booking.bookingId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2"><FileText size={16} /> Invoice No.</span>
                  <span className="font-mono text-gray-800">{invoice.invoiceNumber}</span>
                </div>
                {booking.date && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2"><Calendar size={16} /> Service Date</span>
                    <span className="font-medium text-gray-800">{booking.date}{booking.time ? ` at ${booking.time}` : ''}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <span className="text-gray-600 flex items-center gap-2 font-semibold"><IndianRupee size={16} /> Amount Paid</span>
                  <span className="font-bold text-green-600 text-lg">Rs. {paidAmount.toLocaleString()}</span>
                </div>
                {balanceAmount > 0 && (
                  <div className="flex items-center justify-between text-orange-600">
                    <span className="flex items-center gap-2 font-semibold"><IndianRupee size={16} /> Balance Due</span>
                    <span className="font-bold text-lg">Rs. {balanceAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={`grid grid-cols-1 ${calendarEvent ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
              {calendarEvent && (
                <div className="[&>button]:w-full [&>button]:bg-blue-600 [&>button]:text-white [&>button]:py-3 [&>button]:rounded-lg [&>button]:hover:bg-blue-700 [&>button]:transition-colors">
                  <AddToCalendarButton {...calendarEvent} options={['Google','Outlook.com','Apple']} label="Add to Calendar" buttonStyle="default" listStyle="modal" />
                </div>
              )}
              <button onClick={() => { setShowConfetti(false); setShowInvoice(true); }}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-base font-medium">
                <FileText className="w-5 h-5" /> View Invoice
              </button>
              <button onClick={() => navigate('/admin/financial-dashboard')}
                className="w-full py-3 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 text-base font-medium">
                Go to Home
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <button onClick={() => setShowInvoice(false)}
            className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100">
            ← Back to Success Page
          </button>
          <InvoiceGenerator invoice={invoice} onDownload={() => {}} />
        </div>
      )}
    </div>
  );
}
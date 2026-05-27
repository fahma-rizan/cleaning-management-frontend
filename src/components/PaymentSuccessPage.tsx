import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, FileText, Hash, Calendar, IndianRupee, CalendarPlus } from 'lucide-react';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { AddToCalendarButton } from 'add-to-calendar-button-react';

import { addNotification } from '../utils/notificationUtils';
import InvoiceGenerator from './InvoiceGenerator';
import type { User } from '../types';

interface PaymentSuccessPageProps {
  user: User;
}

export default function PaymentSuccessPage({ user }: PaymentSuccessPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showInvoice, setShowInvoice] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  // Load data from navigation state (internal navigations) OR localStorage (PayHere redirect)
  useEffect(() => {
    // Priority 1: React Router navigation state (used when navigating internally)
    let bookingData = location.state?.booking;
    let invoiceData = location.state?.invoice;
    let method      = location.state?.paymentMethod;

    // Priority 2: localStorage (used when PayHere redirects back via full browser redirect,
    // which wipes location.state). PaymentGatewayPage saves this before form.submit().
    // FIX (Bug 6): This fallback now actually works because PaymentGatewayPage
    // was fixed to save to localStorage before submitting the PayHere form.
    if (!bookingData || !invoiceData) {
      const storedData = localStorage.getItem('paymentSuccessData');
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          // Only use data saved within the last 10 minutes (safety guard)
          if (parsed.timestamp && Date.now() - parsed.timestamp < 10 * 60 * 1000) {
            bookingData = parsed.booking;
            invoiceData = parsed.invoice;
            method      = parsed.paymentMethod;
            localStorage.removeItem('paymentSuccessData');
          }
        } catch (e) {
          // Ignore parse errors silently
        }
      }
    }

    // Priority 3: Read PayHere's return URL query params as a final fallback.
    // When PayHere redirects back it appends ?order_id=...&status_code=2&...
    // FIX (Bug 6): Parse these params so the page never shows a blank screen
    // even if localStorage was cleared before the redirect completed.
    if (!bookingData) {
      const searchParams = new URLSearchParams(location.search);
      const orderId      = searchParams.get('order_id');
      const statusCode   = searchParams.get('status_code');

      if (orderId) {
        if (statusCode === '2') {
          // Payment was successful — construct minimal display data from URL params
          bookingData = { bookingId: orderId };
          invoiceData = {
            invoiceNumber: 'Confirmed — details emailed to you',
            paidAmount:    parseFloat(searchParams.get('amount') || '0'),
            balanceAmount: 0,
            bookingId:     orderId,
          };
          method = 'payhere';
        } else {
          // Payment failed - redirect to failure page
          navigate('/payment-failed', { 
            state: { 
              orderId, 
              statusCode,
              reason: searchParams.get('reason') || 'Payment was declined or cancelled'
            },
            replace: true 
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

  // Award loyalty points notification (only once when booking + invoice are both loaded)
  useEffect(() => {
    if (booking && invoice && user && invoice.paidAmount > 0) {
      // Send all three success notifications
      const points = Math.round(invoice.paidAmount / 10); // 1 point per Rs. 10
      
      // 1. Payment success notification
      addNotification({
        userId:    user.id,
        type:      'payment',
        title:     'Payment Successful! 💳',
        message:   `Payment of Rs. ${invoice.paidAmount.toLocaleString()} received successfully.${invoice.balanceAmount > 0 ? ` Balance Rs. ${invoice.balanceAmount.toLocaleString()} due after service.` : ''}`,
        bookingId: booking.bookingId,
      });

      // 2. Booking confirmation notification
      addNotification({
        userId:    user.id,
        type:      'order-confirmed',
        title:     'Booking Confirmed! 🎉',
        message:   `Your ${booking.serviceType || 'service'} is scheduled for ${booking.date || 'scheduled date'} at ${booking.time || 'scheduled time'}. Booking ID: ${booking.bookingId}`,
        bookingId: booking.bookingId,
      });

      // 3. Loyalty points notification (if points earned)
      if (points > 0) {
        addNotification({
          userId:    user.id,
          type:      'loyalty-points',
          title:     'Loyalty Points Added! ✨',
          message:   `You have earned ${points} loyalty points for your booking.`,
          bookingId: booking.bookingId,
        });
      }
    }
  }, [booking, invoice, user]);

  // Confetti on arrival
  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  // FIX (Bug 7): /dashboard route does not exist in App.tsx.
  // Changed fallback redirect to /admin/financials which is the actual landing page.
  useEffect(() => {
    if (!booking || !invoice) {
      const timer = setTimeout(() => {
        navigate('/admin/financials', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [booking, invoice, navigate]);

  const calendarEvent = useMemo(() => {
    if (!booking?.date || !booking?.time) return null;

    const convertTo24Hour = (timeStr: string) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes]   = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier?.toUpperCase() === 'PM') {
        hours = String(parseInt(hours, 10) + 12);
      }
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    };

    const startTime = convertTo24Hour(booking.time);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const endDateObj = new Date();
    endDateObj.setHours(startHours + 2, startMinutes);
    const endTime = `${String(endDateObj.getHours()).padStart(2, '0')}:${String(endDateObj.getMinutes()).padStart(2, '0')}`;

    return {
      name:        `Service: ${booking.serviceName || booking.serviceType || 'Home Service'}`,
      description: `Booking ID: ${booking.bookingId}<br>Invoice No: ${invoice?.invoiceNumber || 'N/A'}`,
      startDate:   booking.date,
      endDate:     booking.date,
      startTime,
      endTime,
      timeZone:    'Asia/Colombo',
      location:    booking.address || 'Service Location',
    };
  }, [booking, invoice]);

  if (!booking || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto rounded-2xl shadow-xl p-8 text-center bg-white">
            <p className="text-gray-600">Loading payment information...</p>
            {/* FIX (Bug 7): Updated message to reflect correct redirect destination */}
            <p className="text-sm mt-4 text-gray-500">
              If this takes too long, you'll be redirected to the home page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const CalendarButton = calendarEvent && (
    <div className="[&>button]:w-full [&>button]:bg-blue-600 [&>button]:text-white [&>button]:py-3 [&>button]:rounded-lg [&>button]:hover:bg-blue-700 [&>button]:transition-colors [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:gap-2 [&>button]:text-base [&>button]:font-medium">
      <AddToCalendarButton
        {...calendarEvent}
        options={['Google', 'Outlook.com', 'Apple']}
        label="Add to Calendar"
        buttonStyle="default"
        styleLight="--btn-background: #2563EB; --btn-text: #FFFFFF; --btn-border: #1D4ED8;"
        listStyle="modal"
      />
    </div>
  );

  const InvoiceButton = (
    <button
      onClick={() => {
        console.log('Invoice data on click:', invoice); // DEBUG
        setRunConfetti(false); // Stop confetti immediately
        setShowInvoice(true);
      }}
      className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-base font-medium"
    >
      <FileText className="w-5 h-5" />
      View Invoice
    </button>
  );

  // FIX (Bug 7): Changed navigate target from '/dashboard' (non-existent)
  // to '/admin/financials' which is the actual home/landing route in App.tsx
  const HomeButton = (
    <button
      onClick={() => navigate('/admin/financials')}
      className="w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300 text-base font-medium"
    >
      Go to Home
    </button>
  );

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
                ? `Thank you for your advance payment of Rs. ${invoice.paidAmount.toLocaleString()}. The balance of Rs. ${invoice.balanceAmount.toLocaleString()} will be collected after service.`
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
                    <span className="font-medium text-gray-800">
                      {booking.date}{booking.time ? ` at ${booking.time}` : ''}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <span className="text-gray-600 flex items-center gap-2 font-semibold"><IndianRupee size={16} /> Amount Paid</span>
                  <span className="font-bold text-green-600 text-lg">Rs. {Number(invoice.paidAmount).toLocaleString()}</span>
                </div>
                {invoice.balanceAmount > 0 && (
                  <div className="flex items-center justify-between text-orange-600">
                    <span className="flex items-center gap-2 font-semibold"><IndianRupee size={16} /> Balance Due</span>
                    <span className="font-bold text-lg">Rs. {Number(invoice.balanceAmount).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={`grid grid-cols-1 ${calendarEvent ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
              {CalendarButton}
              {InvoiceButton}
              {HomeButton}
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => setShowInvoice(false)}
            className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-white text-gray-700 hover:bg-gray-100"
          >
            ← Back to Success Page
          </button>
          <InvoiceGenerator invoice={invoice} onDownload={() => {}} />
        </div>
      )}
    </div>
  );
}
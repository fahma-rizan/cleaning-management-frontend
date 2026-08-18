import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, FileText, Hash, Calendar, IndianRupee } from 'lucide-react';
import { AddToCalendarButton } from 'add-to-calendar-button-react';

import InvoiceGenerator from './InvoiceGenerator';
import type { User } from '../types';

interface BookingSuccessPageProps {
  user: User;
}

export default function BookingSuccessPage({ user }: BookingSuccessPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasLoadedData = useRef(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  // Load data from navigation state or localStorage fallback
  useEffect(() => {
    // Only run once
    if (hasLoadedData.current) return;
    hasLoadedData.current = true;

    let bookingData = location.state?.booking;
    let invoiceData = location.state?.invoice;
    let method      = location.state?.paymentMethod;

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
        } catch (e) {
          console.error('Error parsing localStorage data:', e);
        }
      }
    }

    if (bookingData && invoiceData) {
      setBooking(bookingData);
      setInvoice(invoiceData);
      setPaymentMethod(method || '');
    }
    // Intentionally only run on mount - no dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // FIX (Bug 7): /dashboard does not exist as a route in App.tsx.
  // Changed to /admin/financials which is the real landing page.
  useEffect(() => {
    if (!booking || !invoice) {
      const timer = setTimeout(() => navigate('/billing/admin/financial-dashboard', { replace: true }), 3000);
      return () => clearTimeout(timer);
    }
  }, [booking, invoice, navigate]);

  if (!booking || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto rounded-2xl shadow-xl p-8 text-center bg-white">
            <p className="text-gray-600">Loading booking information...</p>
            {/* FIX (Bug 7): Updated redirect message */}
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
      onClick={() => setShowInvoice(true)}
      className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-base font-medium"
    >
      <FileText className="w-5 h-5" />
      View Invoice
    </button>
  );

  // FIX (Bug 7): Changed from navigate('/dashboard') to navigate('/admin/financials')
  const HomeButton = (
    <button
      onClick={() => navigate('/billing/admin/financial-dashboard')}
      className="w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300 text-base font-medium"
    >
      Go to Home
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {!showInvoice ? (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto rounded-2xl shadow-xl p-8 text-center bg-white">
            <div className="flex justify-center mb-6">
              <div className="bg-green-500 p-4 rounded-full">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            </div>

            <h1 className="text-3xl mb-4">Booking Confirmed!</h1>

            <p className="mb-8 text-gray-600 max-w-lg mx-auto">
              {paymentMethod === 'cod'
                ? 'Your booking is confirmed. Please pay cash to the service professional upon service completion.'
                : 'Your booking is confirmed. You will receive a payment link after the service is completed.'}
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
              </div>
            </div>

            <div className={`grid grid-cols-1 ${calendarEvent ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
              {InvoiceButton}
              {CalendarButton}
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
            ← Back to Confirmation
          </button>
          <InvoiceGenerator invoice={invoice} onDownload={() => {}} />
        </div>
      )}
    </div>
  );
}
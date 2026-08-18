import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { addNotification } from '../utils/notificationUtils';
import InvoiceGenerator, { InvoiceData, InvoiceType } from './InvoiceGenerator';
import type { User } from '../types';
import DemoTopBar from './DemoTopBar';

interface BalancePaymentPageProps {
  user: User;
}

const API_BASE_URL = 'http://localhost:5000/api';

export default function BalancePaymentPage({ user }: BalancePaymentPageProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const state     = (location.state as any) || {};

  // Check for invoice parameter in URL
  const searchParams = new URLSearchParams(location.search);
  const invoiceParam = searchParams.get('invoice');

  const booking   = state.booking  || JSON.parse(localStorage.getItem('balancePaymentBooking') || 'null');
  const balance   = state.balance  || booking?.balanceAmount || 0;
  const bookingId = state.bookingId || booking?.bookingId || '';
  const advInvoiceNumber = state.advanceInvoiceNumber || '';

  const [step, setStep]       = useState<'pay' | 'processing' | 'done'>('pay');
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [loading, setLoading] = useState(!!invoiceParam);

  // Fetch invoice data if invoice parameter is provided
  useEffect(() => {
    if (invoiceParam) {
      fetchInvoiceData(invoiceParam);
    }
  }, [invoiceParam]);

  const fetchInvoiceData = async (invoiceNumber: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/${invoiceNumber}`);
      if (!response.ok) throw new Error('Invoice not found');
      const invoiceData = await response.json();
      
      // Set booking data from invoice
      const bookingData = {
        bookingId: invoiceData.bookingId,
        serviceType: invoiceData.service?.name || 'Cleaning Service',
        balanceAmount: invoiceData.balanceAmount,
        totalAmount: invoiceData.totalAmount,
        customer: invoiceData.customer
      };
      
      // Update state with fetched data
      // Note: This is a simplified approach - in production you'd want to properly manage this state
      localStorage.setItem('balancePaymentBooking', JSON.stringify(bookingData));
      
    } catch (error) {
      console.error('Error fetching invoice:', error);
      alert('Invoice not found or invalid link.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!booking && !invoiceParam) navigate('/billing/payment');
  }, [booking, invoiceParam]);

  const handlePay = async () => {
    setStep('processing');

    setTimeout(async () => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      const serviceCode = booking?.serviceType?.substring(0, 3).toUpperCase() || 'SRV';
      const invoiceNumber = `INV-${serviceCode}-${dateStr}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;

      const inv: InvoiceData = {
        invoiceNumber,
        invoiceType: 'final' as InvoiceType,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        bookingId,
        customer: {
          name: user.name,
          email: user.email,
          phone: user.phone || '+94 XXX XXX XXX',
          address: booking?.address || 'N/A',
        },
        service: {
          name: booking?.serviceType || 'Cleaning Service',
          date: booking?.date || '',
          time: booking?.time || '',
          customizations: [],
        },
        pricing: {
          basePrice: booking?.price || 0,
          customizationTotal: 0,
          total: balance,
          paidAmount: balance,
          balanceAmount: 0,
        },
        paymentMethod: 'Online Payment (Balance)',
        status: 'paid',
      };

      setInvoice(inv);

      // Save invoice
      const invoices = JSON.parse(localStorage.getItem('userInvoices') || '[]');
      invoices.push(inv);
      localStorage.setItem('userInvoices', JSON.stringify(invoices));

      // Update booking
      const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      const updated = bookings.map((b: any) =>
        b.bookingId === bookingId
          ? { ...b, status: 'confirmed-paid', balanceAmount: 0, paidAmount: (b.paidAmount || 0) + balance }
          : b
      );
      localStorage.setItem('userBookings', JSON.stringify(updated));

      // Backend
      try {
        await fetch(`${API_BASE_URL}/invoices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceType: 'FINAL',
            status: 'PAID',
            customer: { userId: user.id, name: user.name, email: user.email, phone: user.phone || '', address: booking?.address || '' },
            bookingId,
            serviceItems: [{ name: booking?.serviceType || 'Service', price: balance, quantity: 1 }],
            subTotal: balance,
            totalAmount: balance,
            paidAmount: balance,
            balanceAmount: 0,
            notes: `Balance payment for booking ${bookingId}. Advance invoice: ${advInvoiceNumber}`,
          }),
        });
      } catch (e) {
        console.error('Backend save failed:', e);
      }

      // Notifications
      await addNotification({
        userId: user.id,
        type: 'payment',
        title: 'Balance Payment Received ✅',
        message: `Your balance payment of Rs. ${balance.toLocaleString()} for booking ${bookingId} has been received. Booking is now fully paid.`,
        bookingId,
      });

      localStorage.removeItem('balancePaymentBooking');
      setStep('done');
    }, 2500);
  };

  if (showInvoice && invoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DemoTopBar user={user} />
        <div className="container mx-auto px-4 py-8">
          <button onClick={() => setShowInvoice(false)}
            className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100">
            ← Back
          </button>
          <InvoiceGenerator invoice={invoice} />
        </div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <DemoTopBar user={user} />
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 border-8 border-purple-200 rounded-full" />
              <div className="w-20 h-20 border-8 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Processing Balance Payment...</h2>
          <p className="text-gray-500 text-sm">Rs. {balance.toLocaleString()} — Please wait</p>
        </div>
      </div>
    );
  }

  if (step === 'done' && invoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DemoTopBar user={user} />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="w-14 h-14 text-green-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Balance Paid! 🎉</h1>
            <p className="text-gray-500 mb-6">
              Your balance of <span className="font-semibold text-purple-600">Rs. {balance.toLocaleString()}</span> has been paid. Booking fully complete!
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left text-sm space-y-2">
              <div className="flex justify-between"><span className="text-gray-500">Booking ID</span><span className="font-mono font-semibold">{bookingId}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Balance Paid</span><span className="font-semibold text-green-600">Rs. {balance.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Final Invoice</span><span className="font-mono text-xs">{invoice.invoiceNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-semibold text-green-600">Fully Paid ✅</span></div>
            </div>
            <div className="space-y-3">
              <button onClick={() => setShowInvoice(true)}
                className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 font-medium">
                View Final Invoice
              </button>
              <button onClick={() => navigate('/billing/payment')}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200">
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Balance payment form ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <DemoTopBar user={user} />
        <div className="bg-white p-8 rounded-xl text-center shadow-lg max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoTopBar user={user} />
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">

          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="bg-orange-100 p-3 rounded-full">
                <CreditCard className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Balance Payment Due</h1>
            <p className="text-gray-500 text-sm mt-1">Please pay the remaining balance after service completion</p>
          </div>

          <div className="bg-orange-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Service</span>
              <span className="font-semibold">{booking?.serviceType || 'Cleaning Service'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Booking ID</span>
              <span className="font-mono font-semibold">{bookingId}</span>
            </div>
            {advInvoiceNumber && (
              <div className="flex justify-between">
                <span className="text-gray-500">Advance Invoice</span>
                <span className="font-mono text-xs">{advInvoiceNumber}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-orange-200 pt-2 text-base">
              <span className="text-gray-700 font-semibold">Balance Due</span>
              <span className="font-bold text-orange-600">Rs. {balance.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5 text-sm text-blue-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>This is the remaining balance from your advance payment. The service has been completed.</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 mb-5 justify-center">
            <Shield className="w-4 h-4" />
            <span>Secure 256-bit SSL encrypted payment</span>
          </div>

          <button onClick={handlePay}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-md flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pay Balance — Rs. {balance.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { User } from '../types';
import { useEffect, useState } from 'react';
import InvoiceGenerator, { InvoiceData, InvoiceType } from './InvoiceGenerator';
import Header from './Header';

interface InvoiceProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

export default function Invoice({ user, onLogout, theme, onToggleTheme, onProfileClick }: InvoiceProps) {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      navigate('/dashboard');
      return;
    }

    // First, try to find the invoice in stored invoices
    const storedInvoices = JSON.parse(localStorage.getItem('userInvoices') || '[]');
    const foundInvoice = storedInvoices.find((inv: InvoiceData) => inv.bookingId === bookingId);

    if (foundInvoice) {
      // Use the stored invoice
      console.log('Found stored invoice:', foundInvoice);
      setInvoice(foundInvoice);
      setLoading(false);
      return;
    }

    // If no invoice found, try to find the booking and generate an invoice from it
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const foundBooking = bookings.find((b: any) => b.bookingId === bookingId);

    if (foundBooking) {
      console.log('Found booking, generating invoice:', foundBooking);
      const generatedInvoice = generateInvoiceFromBooking(foundBooking);
      setInvoice(generatedInvoice);
      
      // Store the generated invoice for future reference
      storedInvoices.push(generatedInvoice);
      localStorage.setItem('userInvoices', JSON.stringify(storedInvoices));
      setLoading(false);
    } else {
      console.error('No booking or invoice found for ID:', bookingId);
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [bookingId, navigate]);

  const generateInvoiceFromBooking = (booking: any): InvoiceData => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const serviceCode = booking.serviceType?.substring(0, 3).toUpperCase() || 'SRV';
    const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    const invoiceNumber = booking.invoiceNumber || `INV-${serviceCode}-${dateStr}-${randomNum}`;

    // Determine invoice type based on payment status
    let invoiceType: InvoiceType = 'full';
    if (booking.paymentStatus === 'advance-paid') {
      invoiceType = 'advance';
    } else if (booking.paymentStatus === 'pending' && booking.paymentMethod === 'cod') {
      invoiceType = 'cod';
    } else if (booking.status === 'cancelled') {
      invoiceType = 'cancellation';
    }

    // Calculate pricing
    const basePrice = booking.price || 0;
    const customizationTotal = booking.customizations?.reduce((sum: number, c: any) => 
      sum + ((c.quantity || 1) * c.price), 0) || 0;
    const discount = booking.discount || 0;
    const tax = 0;
    const transportCharge = 0;
    const total = basePrice + customizationTotal + tax + transportCharge - discount;
    const paidAmount = booking.paidAmount || 0;
    const balanceAmount = booking.balanceAmount !== undefined ? booking.balanceAmount : (total - paidAmount);

    // Determine status
    let status: 'paid' | 'partial' | 'pending' | 'refunded' | 'cancelled' = 'pending';
    if (booking.status === 'cancelled') {
      status = 'cancelled';
    } else if (balanceAmount === 0 && paidAmount > 0) {
      status = 'paid';
    } else if (paidAmount > 0 && balanceAmount > 0) {
      status = 'partial';
    } else if (booking.paymentMethod === 'cod' || booking.paymentMethod === 'pay-after-completion') {
      status = 'pending';
    }

    return {
      invoiceNumber,
      invoiceType,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      bookingId: booking.bookingId,
      customer: {
        name: booking.customerName || user.name || 'Customer',
        email: booking.customerEmail || user.email || 'customer@example.com',
        phone: booking.customerPhone || user.phone || '+94 11 234 5678',
        address: booking.address || 'Colombo, Sri Lanka',
      },
      service: {
        name: booking.serviceType || 'Cleaning Service',
        date: booking.date || now.toLocaleDateString(),
        time: booking.time || now.toLocaleTimeString(),
        customizations: booking.customizations || [],
      },
      pricing: {
        basePrice,
        customizationTotal,
        discount,
        tax,
        transportCharge,
        total,
        paidAmount,
        balanceAmount,
      },
      paymentMethod: booking.paymentMethod || 'Cash on Delivery',
      status,
    };
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} onProfileClick={onProfileClick} />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading invoice...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} onProfileClick={onProfileClick} />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className={`text-xl mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Invoice not found
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} onProfileClick={onProfileClick} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="max-w-[210mm] mx-auto mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-gray-800 text-white hover:bg-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Invoice */}
        <InvoiceGenerator 
          invoice={invoice}
          theme={theme}
          onDownload={() => {
            console.log('Invoice downloaded');
          }}
        />
      </div>
    </div>
  );
}
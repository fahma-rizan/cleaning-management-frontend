import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, FileText } from 'lucide-react';
import Header from './Header';
import InvoiceGenerator, { InvoiceData } from './InvoiceGenerator';
import type { User } from '../types';

interface PaymentSuccessPageProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

export default function PaymentSuccessPage({ user, onLogout, theme, onToggleTheme, onProfileClick }: PaymentSuccessPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showInvoice, setShowInvoice] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  
  // Load data from navigation state or localStorage
  useEffect(() => {
    console.log('PaymentSuccessPage - Location state:', location.state);
    
    // Try to get from location state first
    let bookingData = location.state?.booking;
    let invoiceData = location.state?.invoice;
    let method = location.state?.paymentMethod;
    
    // If not in state, try localStorage
    if (!bookingData || !invoiceData) {
      console.log('Data not in state, checking localStorage...');
      const storedData = localStorage.getItem('paymentSuccessData');
      
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          console.log('Found data in localStorage:', parsed);
          
          // Check if data is recent (within last 5 minutes)
          if (parsed.timestamp && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
            bookingData = parsed.booking;
            invoiceData = parsed.invoice;
            method = parsed.paymentMethod;
            
            // Clear the localStorage data after using it
            localStorage.removeItem('paymentSuccessData');
          } else {
            console.log('localStorage data is too old, ignoring');
          }
        } catch (e) {
          console.error('Error parsing localStorage data:', e);
        }
      }
    }
    
    console.log('Final data:', { bookingData, invoiceData, method });
    
    if (bookingData && invoiceData) {
      setBooking(bookingData);
      setInvoice(invoiceData);
      setPaymentMethod(method || '');
    }
  }, [location.state]);

  // Redirect if no booking data after loading
  useEffect(() => {
    if (!booking || !invoice) {
      console.error('Missing booking or invoice data');
      console.log('Attempting to redirect to dashboard in 3 seconds...');
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [booking, invoice, navigate]);

  if (!booking || !invoice) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} onProfileClick={onProfileClick} />
        <div className="container mx-auto px-4 py-16">
          <div className={`max-w-2xl mx-auto rounded-2xl shadow-xl p-8 text-center ${
            theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
          }`}>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Loading payment information...
            </p>
            <p className={`text-sm mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              If this takes too long, you'll be redirected to the dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} onProfileClick={onProfileClick} />
      
      {!showInvoice ? (
        <div className="container mx-auto px-4 py-16">
          <div className={`max-w-2xl mx-auto rounded-2xl shadow-xl p-8 text-center ${
            theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
          }`}>
            <div className="flex justify-center mb-6">
              <div className="bg-green-500 p-4 rounded-full">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl mb-4">
              {paymentMethod === 'cod' || paymentMethod === 'pay-after-completion'
                ? 'Booking Confirmed!'
                : 'Payment Successful!'}
            </h1>
            
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {paymentMethod === 'cod'
                ? 'Your booking is confirmed. Please pay cash to the service professional after completion.'
                : paymentMethod === 'pay-after-completion'
                  ? 'Your booking is confirmed. You will receive a payment link after service completion.'
                  : paymentMethod === 'advance-balance'
                    ? `Thank you for your advance payment of Rs. ${invoice.pricing.paidAmount.toLocaleString()}. Balance Rs. ${invoice.pricing.balanceAmount.toLocaleString()} will be collected after service.`
                    : 'Your booking has been confirmed and payment is complete.'}
            </p>

            <div className={`rounded-lg p-6 mb-6 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-purple-50'
            }`}>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Booking ID
                  </p>
                  <p className="font-mono">{booking.bookingId}</p>
                </div>
                <div>
                  <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Invoice Number
                  </p>
                  <p className="font-mono">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Service Date
                  </p>
                  <p>{booking.date}</p>
                </div>
                <div>
                  <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Time
                  </p>
                  <p>{booking.time}</p>
                </div>
                <div>
                  <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Amount Paid
                  </p>
                  <p className="text-green-600">Rs. {invoice.pricing.paidAmount.toLocaleString()}</p>
                </div>
                {invoice.pricing.balanceAmount > 0 && (
                  <div>
                    <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Balance Due
                    </p>
                    <p className="text-orange-600">Rs. {invoice.pricing.balanceAmount.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowInvoice(true)}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                View & Download Invoice
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}>
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => setShowInvoice(false)}
            className={`mb-4 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-gray-800 text-white hover:bg-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            ← Back to Success Page
          </button>
          
          <InvoiceGenerator 
            invoice={invoice}
            theme={theme}
            onDownload={() => {
              console.log('Invoice downloaded');
            }}
          />
        </div>
      )}
    </div>
  );
}
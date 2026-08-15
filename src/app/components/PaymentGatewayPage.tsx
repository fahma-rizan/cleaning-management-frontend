import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Smartphone, Building2, CheckCircle, ArrowLeft, Shield } from 'lucide-react';
import Header from './Header';
import type { User } from '../types';

interface PaymentGatewayPageProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

export default function PaymentGatewayPage({ user, onLogout, theme, onToggleTheme, onProfileClick }: PaymentGatewayPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Try to get state from location or localStorage
  const stateData = location.state || {};
  const paymentMethod = stateData.paymentMethod || localStorage.getItem('pendingPaymentMethod');
  const advancePercentage = stateData.advancePercentage || parseInt(localStorage.getItem('pendingAdvancePercentage') || '20');
  
  // Get booking data
  const bookingData = stateData.bookingData || JSON.parse(localStorage.getItem('currentBooking') || '{}');
  
  // Calculate amount
  const amount = stateData.amount || (
    paymentMethod === 'full-online' && bookingData.price
      ? bookingData.price
      : bookingData.price && advancePercentage
        ? Math.round(bookingData.price * (advancePercentage / 100))
        : 0
  );

  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });
  const [mobileWalletNumber, setMobileWalletNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [processing, setProcessing] = useState(false);

  // Debug: Log the received state
  useEffect(() => {
    console.log('PaymentGatewayPage mounted with state:', {
      paymentMethod,
      amount,
      bookingData,
      advancePercentage,
      locationState: location.state,
      localStorage: {
        pendingPaymentMethod: localStorage.getItem('pendingPaymentMethod'),
        pendingAdvancePercentage: localStorage.getItem('pendingAdvancePercentage'),
        currentBooking: localStorage.getItem('currentBooking')
      }
    });
  }, []);

  // Redirect if no payment data
  useEffect(() => {
    if (!amount || !paymentMethod) {
      console.error('Missing payment data:', { amount, paymentMethod });
      console.log('Redirecting back to payment page in 2 seconds...');
      const timer = setTimeout(() => {
        navigate('/payment');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [amount, paymentMethod, navigate]);

  const paymentGateways = [
    { 
      id: 'card', 
      name: 'Credit/Debit Card', 
      icon: CreditCard, 
      description: 'Visa, Mastercard, Amex',
      color: 'blue'
    },
    { 
      id: 'mobile-wallet', 
      name: 'Mobile Wallets', 
      icon: Smartphone, 
      description: 'FriMi, eZ Cash, mCash',
      color: 'green'
    },
    { 
      id: 'bank-transfer', 
      name: 'Online Banking', 
      icon: Building2, 
      description: 'All major banks',
      color: 'purple'
    },
  ];

  const banks = [
    'Commercial Bank',
    'Sampath Bank',
    'Bank of Ceylon',
    'People\'s Bank',
    'Hatton National Bank',
    'DFCC Bank',
    'NDB Bank',
    'Seylan Bank',
  ];

  const wallets = [
    { id: 'frimi', name: 'FriMi', color: 'red' },
    { id: 'ezcash', name: 'eZ Cash', color: 'orange' },
    { id: 'mcash', name: 'mCash', color: 'blue' },
  ];

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(' ') : numbers;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardDetails({ ...cardDetails, cardNumber: formatted });
    }
  };

  const validateCardForm = () => {
    return (
      cardDetails.cardNumber.replace(/\s/g, '').length === 16 &&
      cardDetails.cardHolderName.length > 0 &&
      cardDetails.expiryMonth &&
      cardDetails.expiryYear &&
      cardDetails.cvv.length === 3
    );
  };

  const validateMobileWallet = () => {
    return mobileWalletNumber.length === 10 && selectedWallet;
  };

  const validateBankTransfer = () => {
    return selectedBank !== '';
  };

  const canProceed = () => {
    if (selectedGateway === 'card') return validateCardForm();
    if (selectedGateway === 'mobile-wallet') return validateMobileWallet();
    if (selectedGateway === 'bank-transfer') return validateBankTransfer();
    return false;
  };

  const handlePayment = () => {
    if (!canProceed()) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate booking data
    if (!bookingData || !bookingData.bookingId || !bookingData.price) {
      console.error('Invalid booking data:', bookingData);
      alert('Missing booking information. Please go back and try again.');
      navigate('/payment');
      return;
    }

    setProcessing(true);

    // Simulate payment processing (3-5 seconds)
    setTimeout(() => {
      // Generate invoice data
      const now = new Date();
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      const serviceCode = bookingData?.serviceType?.substring(0, 3).toUpperCase() || 'SRV';
      const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      const invoiceNumber = `INV-${serviceCode}-${dateStr}-${randomNum}`;
      
      const paidAmount = amount;
      const balanceAmount = paymentMethod === 'full-online' ? 0 : (bookingData.price || 0) - amount;
      
      console.log('Creating invoice with data:', {
        bookingData,
        paymentMethod,
        paidAmount,
        balanceAmount
      });
      
      const invoiceData = {
        invoiceNumber,
        invoiceType: paymentMethod === 'full-online' ? 'full' : 'advance',
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        bookingId: bookingData.bookingId || 'N/A',
        customer: {
          name: bookingData.customerName || user.name || 'Customer',
          email: bookingData.customerEmail || user.email || 'N/A',
          phone: bookingData.customerPhone || user.phone || 'N/A',
          address: bookingData.address || 'N/A',
        },
        service: {
          name: bookingData.serviceType || 'Service',
          date: bookingData.date || 'N/A',
          time: bookingData.time || 'N/A',
          customizations: bookingData.customizations || [],
        },
        pricing: {
          basePrice: bookingData.price || 0,
          customizationTotal: 0,
          discount: 0,
          tax: 0,
          transportCharge: 0,
          total: bookingData.price || 0,
          paidAmount,
          balanceAmount,
        },
        paymentMethod: selectedGateway === 'card' ? 'Credit/Debit Card' 
          : selectedGateway === 'mobile-wallet' ? `Mobile Wallet (${selectedWallet})` 
          : `Online Banking (${selectedBank})`,
        status: balanceAmount > 0 ? 'partial' : 'paid',
      };
      
      // Store invoice
      const existingInvoices = JSON.parse(localStorage.getItem('userInvoices') || '[]');
      existingInvoices.push(invoiceData);
      localStorage.setItem('userInvoices', JSON.stringify(existingInvoices));
      
      // Update booking status
      const completedBooking = {
        ...bookingData,
        status: 'confirmed',
        paymentStatus: balanceAmount > 0 ? 'advance-paid' : 'paid',
        paidAmount,
        balanceAmount,
        paymentMethod: invoiceData.paymentMethod,
        invoiceNumber,
      };
      
      console.log('Completed booking:', completedBooking);
      console.log('Invoice data:', invoiceData);
      
      // Store booking
      const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      existingBookings.push(completedBooking);
      localStorage.setItem('userBookings', JSON.stringify(existingBookings));
      
      // Store payment success data temporarily for the success page
      const successData = {
        booking: completedBooking,
        invoice: invoiceData,
        paymentMethod: paymentMethod,
        timestamp: Date.now()
      };
      
      console.log('Storing paymentSuccessData:', successData);
      localStorage.setItem('paymentSuccessData', JSON.stringify(successData));
      
      // Navigate to payment success page
      console.log('Navigating to payment success with state:', {
        booking: completedBooking,
        invoice: invoiceData,
        paymentMethod: paymentMethod,
      });
      
      navigate('/payment-success', { 
        replace: true,
        state: { 
          booking: completedBooking,
          invoice: invoiceData,
          paymentMethod: paymentMethod,
        } 
      });
    }, 4000); // Changed to 4 seconds for more realistic processing time
  };

  // Payment Processing Overlay UI
  if (processing) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} onProfileClick={onProfileClick} />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className={`rounded-xl p-12 shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="text-center">
                {/* Animated Processing Icon */}
                <div className="mb-8 flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 border-8 border-purple-200 dark:border-purple-900 rounded-full"></div>
                    <div className="w-24 h-24 border-8 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CreditCard className="w-10 h-10 text-purple-600" />
                    </div>
                  </div>
                </div>

                <h2 className={`text-3xl mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Processing Payment...
                </h2>
                
                <p className={`text-lg mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Please wait while we securely process your payment
                </p>

                <div className={`inline-block px-6 py-3 rounded-lg mb-8 ${
                  theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-700'
                }`}>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Amount: Rs. {amount?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Processing Steps Animation */}
                <div className="space-y-3 text-left max-w-md mx-auto">
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-700'
                  }`}>
                    <CheckCircle className="w-5 h-5" />
                    <span>Verifying card details</span>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-700'
                  }`}>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing transaction</span>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <div className="w-5 h-5 border-2 border-current rounded-full opacity-50"></div>
                    <span>Confirming payment</span>
                  </div>
                </div>

                <div className={`mt-8 p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    🔒 Do not close this window or press back button
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} onProfileClick={onProfileClick} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/payment')}
            className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-gray-800 text-white hover:bg-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Payment Options
          </button>

          {/* Header */}
          <div className={`rounded-xl p-6 mb-6 shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className={`text-3xl mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>
                  Complete Payment
                </h1>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {paymentMethod === 'full-online' ? 'Pay Full Amount' : `Pay Advance (${advancePercentage}%)`}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Amount to Pay
                </div>
                <div className="text-3xl text-purple-600 dark:text-purple-400">
                  Rs. {amount?.toLocaleString()}
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'
            }`}>
              <Shield className="w-5 h-5" />
              <span className="text-sm">Secure payment • 256-bit SSL encryption</span>
            </div>
          </div>

          {/* Payment Gateway Selection */}
          {!selectedGateway && (
            <div className={`rounded-xl p-6 shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-2xl mb-6 ${theme === 'dark' ? 'text-white' : ''}`}>
                Select Payment Gateway
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {paymentGateways.map((gateway) => {
                  const Icon = gateway.icon;
                  
                  return (
                    <button
                      key={gateway.id}
                      onClick={() => setSelectedGateway(gateway.id)}
                      className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                        theme === 'dark'
                          ? 'border-gray-600 bg-gray-700 hover:border-purple-400 hover:shadow-lg'
                          : 'border-gray-200 bg-white hover:border-purple-600 hover:shadow-xl'
                      }`}
                    >
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        gateway.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        gateway.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                        'bg-purple-100 dark:bg-purple-900/30'
                      }`}>
                        <Icon className={`w-8 h-8 ${
                          gateway.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                          gateway.color === 'green' ? 'text-green-600 dark:text-green-400' :
                          'text-purple-600 dark:text-purple-400'
                        }`} />
                      </div>
                      <h3 className={`text-lg mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>
                        {gateway.name}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {gateway.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Card Payment Form */}
          {selectedGateway === 'card' && (
            <div className={`rounded-xl p-6 shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl ${theme === 'dark' ? 'text-white' : ''}`}>
                  Card Payment
                </h2>
                <button
                  onClick={() => setSelectedGateway('')}
                  className={`text-sm px-3 py-1 rounded ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Change Gateway
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Card Number *
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Card Holder Name *
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cardHolderName}
                    onChange={(e) => setCardDetails({ ...cardDetails, cardHolderName: e.target.value.toUpperCase() })}
                    placeholder="JOHN DOE"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Month *
                    </label>
                    <select
                      value={cardDetails.expiryMonth}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiryMonth: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month.toString().padStart(2, '0')}>
                          {month.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Year *
                    </label>
                    <select
                      value={cardDetails.expiryYear}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiryYear: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="">YY</option>
                      {Array.from({ length: 10 }, (_, i) => 2024 + i).map((year) => (
                        <option key={year} value={year.toString().slice(-2)}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      CVV *
                    </label>
                    <input
                      type="text"
                      value={cardDetails.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 3) {
                          setCardDetails({ ...cardDetails, cvv: value });
                        }
                      }}
                      placeholder="123"
                      maxLength={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-6" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" alt="Amex" className="h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Mobile Wallet Form */}
          {selectedGateway === 'mobile-wallet' && (
            <div className={`rounded-xl p-6 shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl ${theme === 'dark' ? 'text-white' : ''}`}>
                  Mobile Wallet Payment
                </h2>
                <button
                  onClick={() => setSelectedGateway('')}
                  className={`text-sm px-3 py-1 rounded ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Change Gateway
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select Wallet Provider *
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {wallets.map((wallet) => (
                      <button
                        key={wallet.id}
                        onClick={() => setSelectedWallet(wallet.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedWallet === wallet.id
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                            : theme === 'dark'
                              ? 'border-gray-600 bg-gray-700 hover:border-purple-400'
                              : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <Smartphone className={`w-10 h-10 mx-auto mb-2 ${
                          wallet.color === 'red' ? 'text-red-600' :
                          wallet.color === 'orange' ? 'text-orange-600' :
                          'text-blue-600'
                        }`} />
                        <div className="text-sm font-medium">{wallet.name}</div>
                        {selectedWallet === wallet.id && (
                          <CheckCircle className="w-5 h-5 mx-auto mt-2 text-purple-600 dark:text-purple-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={mobileWalletNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setMobileWalletNumber(value);
                      }
                    }}
                    placeholder="0771234567"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                  <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    You will receive an OTP to complete the payment
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer Form */}
          {selectedGateway === 'bank-transfer' && (
            <div className={`rounded-xl p-6 shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl ${theme === 'dark' ? 'text-white' : ''}`}>
                  Online Banking
                </h2>
                <button
                  onClick={() => setSelectedGateway('')}
                  className={`text-sm px-3 py-1 rounded ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Change Gateway
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select Your Bank *
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="">Choose your bank</option>
                    {banks.map((bank) => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>
                
                {selectedBank && (
                  <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'
                  }`}>
                    <p className="text-sm">
                      <strong>Next Step:</strong> You will be securely redirected to {selectedBank}'s online banking portal to complete the payment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Button */}
          {selectedGateway && (
            <div className="mt-6">
              <button
                onClick={handlePayment}
                disabled={!canProceed() || processing}
                className={`w-full py-4 rounded-lg text-lg transition-colors flex items-center justify-center gap-2 ${
                  !canProceed() || processing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white`}
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Pay Rs. {amount?.toLocaleString()}
                  </>
                )}
              </button>
              <p className={`text-xs mt-3 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Your payment information is secure and encrypted
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
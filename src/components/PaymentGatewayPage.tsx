import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Smartphone, Building2, CheckCircle, ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import type { User } from '../types';

interface PaymentGatewayPageProps {
  user: User;
}

export default function PaymentGatewayPage({ user }: PaymentGatewayPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const stateData = (location.state as any) || {};
  const paymentMethod = stateData.paymentMethod || localStorage.getItem('pendingPaymentMethod') || '';
  const advancePercentage = stateData.advancePercentage || parseInt(localStorage.getItem('pendingAdvancePercentage') || '20');
  const bookingData = stateData.bookingData || JSON.parse(localStorage.getItem('currentBooking') || 'null');
  const amount = stateData.amount || (
    bookingData
      ? paymentMethod === 'full-online'
        ? bookingData.price
        : Math.round(bookingData.price * (advancePercentage / 100))
      : 0
  );

  const [selectedGateway, setSelectedGateway] = useState('');
  const [cardDetails, setCardDetails] = useState({ cardNumber: '', cardHolderName: '', expiryMonth: '', expiryYear: '', cvv: '' });
  const [mobileWalletNumber, setMobileWalletNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [processing, setProcessing] = useState(false);
  const [missingData, setMissingData] = useState(false);

  useEffect(() => {
    if (!amount || !paymentMethod || !bookingData) {
      setMissingData(true);
    }
  }, []);

  const paymentGateways = [
    { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, description: 'Visa, Mastercard, Amex', color: 'blue' },
    { id: 'mobile-wallet', name: 'Mobile Wallet', icon: Smartphone, description: 'FriMi, eZ Cash, mCash', color: 'green' },
    { id: 'bank-transfer', name: 'Online Banking', icon: Building2, description: 'All major banks', color: 'purple' },
  ];

  const banks = ['Commercial Bank', 'Sampath Bank', 'Bank of Ceylon', "People's Bank", 'Hatton National Bank', 'DFCC Bank', 'NDB Bank', 'Seylan Bank'];
  const wallets = [{ id: 'frimi', name: 'FriMi', color: 'red' }, { id: 'ezcash', name: 'eZ Cash', color: 'orange' }, { id: 'mcash', name: 'mCash', color: 'blue' }];

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(' ') : numbers;
  };

  const validateCardForm = () =>
    cardDetails.cardNumber.replace(/\s/g, '').length === 16 &&
    cardDetails.cardHolderName.length > 0 &&
    cardDetails.expiryMonth !== '' &&
    cardDetails.expiryYear !== '' &&
    cardDetails.cvv.length === 3;

  const validateMobileWallet = () => mobileWalletNumber.length === 10 && selectedWallet !== '';
  const validateBankTransfer = () => selectedBank !== '';

  const canProceed = () => {
    if (selectedGateway === 'card') return validateCardForm();
    if (selectedGateway === 'mobile-wallet') return validateMobileWallet();
    if (selectedGateway === 'bank-transfer') return validateBankTransfer();
    return false;
  };

  const handlePayment = () => {
    if (!canProceed()) return;
    setProcessing(true);

    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      const serviceCode = bookingData?.serviceType?.substring(0, 3).toUpperCase() || 'SRV';
      const invoiceNumber = `INV-${serviceCode}-${dateStr}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
      const paidAmount = amount;
      const balanceAmount = paymentMethod === 'full-online' ? 0 : (bookingData?.price || 0) - amount;

      const invoiceData = {
        invoiceNumber,
        invoiceType: paymentMethod === 'full-online' ? 'full' : 'advance',
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        bookingId: bookingData?.bookingId || 'N/A',
        customer: {
          name: user.name,
          email: user.email,
          phone: user.phone || '+94 XXX XXX XXX',
          address: bookingData?.address || 'N/A',
        },
        service: {
          name: bookingData?.serviceType || 'Cleaning Service',
          date: bookingData?.date || 'N/A',
          time: bookingData?.time || 'N/A',
          customizations: bookingData?.customizations || [],
        },
        pricing: {
          basePrice: bookingData?.price || 0,
          customizationTotal: 0,
          total: bookingData?.price || 0,
          paidAmount,
          balanceAmount,
        },
        paymentMethod:
          selectedGateway === 'card' ? 'Credit/Debit Card'
          : selectedGateway === 'mobile-wallet' ? `Mobile Wallet (${selectedWallet})`
          : `Online Banking (${selectedBank})`,
        status: balanceAmount > 0 ? 'partial' : 'paid',
      };

      const completedBooking = {
        ...bookingData,
        status: balanceAmount > 0 ? 'confirmed-partial' : 'confirmed-paid',
        paidAmount,
        balanceAmount,
        paymentMethod: invoiceData.paymentMethod,
        invoiceNumber,
        bookingDate: now.toISOString(),
      };

      const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      existingBookings.push(completedBooking);
      localStorage.setItem('userBookings', JSON.stringify(existingBookings));

      const existingInvoices = JSON.parse(localStorage.getItem('userInvoices') || '[]');
      existingInvoices.push(invoiceData);
      localStorage.setItem('userInvoices', JSON.stringify(existingInvoices));

      localStorage.setItem('paymentSuccessData', JSON.stringify({ booking: completedBooking, invoice: invoiceData, paymentMethod, timestamp: Date.now() }));
      localStorage.removeItem('currentBooking');
      localStorage.removeItem('pendingPaymentMethod');
      localStorage.removeItem('pendingAdvancePercentage');

      navigate('/payment-success', {
        replace: true,
        state: { booking: completedBooking, invoice: invoiceData, paymentMethod },
      });
    }, 3000);
  };

  // ── Missing data screen — shows instead of white screen ──────────────────
  if (missingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 p-4 rounded-full">
              <AlertCircle className="w-12 h-12 text-orange-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Payment Data Found</h2>
          <p className="text-gray-500 mb-6 text-sm">
            It looks like you navigated here directly. Please start from the payment page and select a payment method first.
          </p>
          <button
            onClick={() => navigate('/payment')}
            className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition-colors font-medium"
          >
            Go to Payment Page
          </button>
        </div>
      </div>
    );
  }

  // ── Processing screen ─────────────────────────────────────────────────────
  if (processing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-purple-200 rounded-full" />
              <div className="w-24 h-24 border-8 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CreditCard className="w-10 h-10 text-purple-600" />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment...</h2>
          <p className="text-gray-500 mb-6">Please wait while we securely process your payment</p>
          <div className="bg-purple-50 rounded-xl px-5 py-3 inline-flex items-center gap-2 mb-8">
            <Shield className="w-5 h-5 text-purple-600" />
            <span className="text-purple-700 font-medium">Rs. {amount?.toLocaleString()}</span>
          </div>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 text-green-700">
              <CheckCircle className="w-5 h-5" /><span className="text-sm">Verifying details</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-700">
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Processing transaction</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 text-gray-400">
              <div className="w-5 h-5 border-2 border-current rounded-full opacity-40" />
              <span className="text-sm">Confirming payment</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-6">🔒 Do not close this window or press back</p>
        </div>
      </div>
    );
  }

  // ── Main gateway page ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          <button onClick={() => navigate('/payment')}
            className="mb-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Payment Options
          </button>

          {/* Summary header */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Complete Payment</h1>
                <p className="text-gray-500">{paymentMethod === 'full-online' ? 'Pay Full Amount' : `Pay Advance (${advancePercentage}%)`}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400 mb-1">Amount to Pay</p>
                <p className="text-3xl font-bold text-purple-600">Rs. {amount?.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
              <Shield className="w-4 h-4" /> Secure payment • 256-bit SSL encryption
            </div>
          </div>

          {/* Gateway selection */}
          {!selectedGateway && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Select Payment Gateway</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentGateways.map(({ id, name, icon: Icon, description, color }) => (
                  <button key={id} onClick={() => setSelectedGateway(id)}
                    className="p-6 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all text-center">
                    <div className={`w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center ${
                      color === 'blue' ? 'bg-blue-100' : color === 'green' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      <Icon className={`w-7 h-7 ${
                        color === 'blue' ? 'text-blue-600' : color === 'green' ? 'text-green-600' : 'text-purple-600'
                      }`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
                    <p className="text-sm text-gray-500">{description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Card form */}
          {selectedGateway === 'card' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Card Payment</h2>
                <button onClick={() => setSelectedGateway('')} className="text-sm text-purple-600 hover:underline">Change</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
                  <input type="text" value={cardDetails.cardNumber}
                    onChange={e => { const f = formatCardNumber(e.target.value); if (f.replace(/\s/g, '').length <= 16) setCardDetails({ ...cardDetails, cardNumber: f }); }}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Holder Name *</label>
                  <input type="text" value={cardDetails.cardHolderName}
                    onChange={e => setCardDetails({ ...cardDetails, cardHolderName: e.target.value.toUpperCase() })}
                    placeholder="JOHN DOE"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
                    <select value={cardDetails.expiryMonth} onChange={e => setCardDetails({ ...cardDetails, expiryMonth: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m.toString().padStart(2, '0')}>{m.toString().padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                    <select value={cardDetails.expiryYear} onChange={e => setCardDetails({ ...cardDetails, expiryYear: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">YY</option>
                      {Array.from({ length: 10 }, (_, i) => 2024 + i).map(y => (
                        <option key={y} value={y.toString().slice(-2)}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                    <input type="password" value={cardDetails.cvv}
                      onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 3) setCardDetails({ ...cardDetails, cvv: v }); }}
                      placeholder="•••" maxLength={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile wallet form */}
          {selectedGateway === 'mobile-wallet' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Mobile Wallet</h2>
                <button onClick={() => setSelectedGateway('')} className="text-sm text-purple-600 hover:underline">Change</button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Wallet *</label>
                  <div className="grid grid-cols-3 gap-4">
                    {wallets.map(w => (
                      <button key={w.id} onClick={() => setSelectedWallet(w.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${selectedWallet === w.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                        <Smartphone className={`w-8 h-8 mx-auto mb-2 ${w.color === 'red' ? 'text-red-500' : w.color === 'orange' ? 'text-orange-500' : 'text-blue-500'}`} />
                        <p className="text-sm font-medium">{w.name}</p>
                        {selectedWallet === w.id && <CheckCircle className="w-4 h-4 mx-auto mt-2 text-purple-600" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <input type="tel" value={mobileWalletNumber}
                    onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 10) setMobileWalletNumber(v); }}
                    placeholder="0771234567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <p className="text-xs text-gray-400 mt-1">You will receive an OTP to complete the payment</p>
                </div>
              </div>
            </div>
          )}

          {/* Bank transfer form */}
          {selectedGateway === 'bank-transfer' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Online Banking</h2>
                <button onClick={() => setSelectedGateway('')} className="text-sm text-purple-600 hover:underline">Change</button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Your Bank *</label>
                <select value={selectedBank} onChange={e => setSelectedBank(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Choose your bank</option>
                  {banks.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {selectedBank && (
                  <div className="mt-4 p-4 rounded-lg bg-blue-50 text-blue-700 text-sm">
                    You will be redirected to <strong>{selectedBank}</strong>'s secure portal to complete payment.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pay button */}
          {selectedGateway && (
            <div className="mt-6">
              <button onClick={handlePayment} disabled={!canProceed()}
                className={`w-full py-4 rounded-xl text-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                  canProceed() ? 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg' : 'bg-gray-300 cursor-not-allowed'
                }`}>
                <Shield className="w-5 h-5" />
                Pay Rs. {amount?.toLocaleString()}
              </button>
              <p className="text-xs text-center text-gray-400 mt-3">Your payment information is secure and encrypted</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

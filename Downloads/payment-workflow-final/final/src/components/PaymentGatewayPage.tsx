import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Shield, ArrowLeft, Smartphone, Building2, CheckCircle } from 'lucide-react';
import { addNotification } from '../utils/notificationUtils';
import type { User } from '../types';
import DemoTopBar from './DemoTopBar';

const API_BASE_URL = 'http://localhost:4000/api';

interface PaymentState {
  paymentMethod: string;
  advancePercentage: number;
  bookingData: any;
  amount: number;
}

interface PaymentGatewayPageProps {
  user: User;
}

type PaymentType = 'card' | 'wallet' | 'bank';

export default function PaymentGatewayPage({ user }: PaymentGatewayPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state as PaymentState;

  const {
    paymentMethod = '',
    advancePercentage = 20,
    bookingData = null,
    amount = 0,
  } = stateData || {};

  const [processing, setProcessing] = useState(false);
  const [missingData, setMissingData] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType>('card');

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');

  // Wallet form state
  const [selectedWallet, setSelectedWallet] = useState('');
  const [walletNumber, setWalletNumber] = useState('');

  // Bank form state
  const [selectedBank, setSelectedBank] = useState('');

  useEffect(() => {
    if (!amount || !paymentMethod || !bookingData) {
      setMissingData(true);
    }
  }, [amount, paymentMethod, bookingData]);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const isCardFormValid = () => {
    return cardNumber.replace(/\s/g, '').length === 16 &&
           cardholderName.trim().length > 0 &&
           expiryMonth && expiryYear && cvv.length === 3;
  };

  const isWalletFormValid = () => {
    return selectedWallet && walletNumber.length === 10;
  };

  const isBankFormValid = () => {
    return selectedBank;
  };

  const getPaymentMethodName = () => {
    switch (selectedPaymentType) {
      case 'card': return 'Credit/Debit Card';
      case 'wallet': return `Mobile Wallet (${selectedWallet})`;
      case 'bank': return `Online Banking (${selectedBank})`;
      default: return 'Online Payment';
    }
  };

  const handlePay = async () => {
    if (!bookingData || !amount) return;

    // Validate form based on selected payment type
    if (selectedPaymentType === 'card' && !isCardFormValid()) {
      alert('Please fill in all card details correctly.');
      return;
    }
    if (selectedPaymentType === 'wallet' && !isWalletFormValid()) {
      alert('Please select a wallet provider and enter a valid wallet number.');
      return;
    }
    if (selectedPaymentType === 'bank' && !isBankFormValid()) {
      alert('Please select your bank.');
      return;
    }

    setProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create invoice data
      const invoiceData = {
        invoiceType: paymentMethod === 'full-online' ? 'FULL' : 'ADVANCE',
        status: paymentMethod === 'full-online' ? 'PAID' : 'PARTIAL',
        customer: {
          userId: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '+94 XXX XXX XXX',
          address: bookingData.address || 'N/A',
        },
        bookingId: bookingData.bookingId,
        serviceItems: [{
          name: bookingData.serviceType || 'Cleaning Service',
          price: bookingData.price,
          quantity: 1,
        }],
        customizationItems: [],
        discounts: [],
        taxAmount: 0,
        subTotal: bookingData.price,
        totalAmount: bookingData.price,
        paidAmount: amount,
        balanceAmount: bookingData.price - amount,
        notes: `Payment processed via ${getPaymentMethodName()}.`,
      };

      // Create invoice
      const response = await fetch(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.msg || 'Invoice creation failed');
      }

      const savedInvoice = await response.json();

      // Navigate to success page
      navigate('/payment-success', {
        state: {
          booking: bookingData,
          invoice: savedInvoice,
          paymentMethod: paymentMethod,
        }
      });

    } catch (error: any) {
      console.error('Payment error:', error);
      
      // Send payment failed notification
      if (bookingData?.bookingId) {
        await addNotification({
          userId: user.id,
          type: 'payment-failed',
          title: 'Payment Failed ❌',
          message: `Your payment attempt failed: ${error.message || 'Please try again or contact support.'}`,
          bookingId: bookingData.bookingId,
        });
      }
      
      alert(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (missingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DemoTopBar user={user} />
        <div className="bg-white p-8 rounded-xl text-center shadow-lg max-w-md w-full">
          <p className="text-red-600 mb-4 font-medium">Missing payment data.</p>
          <p className="text-gray-500 text-sm mb-6">
            Please select a payment method from the payment page first.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoTopBar user={user} />

      <div className="max-w-3xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Complete Payment</h1>
        <p className="text-gray-500 mb-6">
          Choose your preferred payment method below.
        </p>

        {/* Order summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600 text-sm">Booking</span>
            <span className="font-mono text-sm text-gray-800">{bookingData?.bookingId}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600 text-sm">Service</span>
            <span className="text-sm text-gray-800">{bookingData?.serviceType || 'Cleaning Service'}</span>
          </div>
          <div className="flex justify-between items-center border-t pt-3 mt-3">
            <span className="font-semibold text-gray-800">Amount to Pay</span>
            <span className="text-xl font-bold text-purple-600">
              Rs. {Number(amount).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Payment Method Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSelectedPaymentType('card')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                selectedPaymentType === 'card'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <CreditCard className="w-5 h-5 mx-auto mb-2" />
              Credit/Debit Card
            </button>
            <button
              onClick={() => setSelectedPaymentType('wallet')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                selectedPaymentType === 'wallet'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Smartphone className="w-5 h-5 mx-auto mb-2" />
              Mobile Wallet
            </button>
            <button
              onClick={() => setSelectedPaymentType('bank')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                selectedPaymentType === 'bank'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Building2 className="w-5 h-5 mx-auto mb-2" />
              Online Banking
            </button>
          </div>

          <div className="p-6">
            {/* Card Payment Form */}
            {selectedPaymentType === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={19}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Month
                    </label>
                    <select
                      value={expiryMonth}
                      onChange={(e) => setExpiryMonth(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Year
                    </label>
                    <select
                      value={expiryYear}
                      onChange={(e) => setExpiryYear(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">YYYY</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 3) setCvv(value);
                      }}
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Payment Form */}
            {selectedPaymentType === 'wallet' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Wallet Provider
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['FriMi', 'eZ Cash', 'mCash'].map((wallet) => (
                      <button
                        key={wallet}
                        onClick={() => setSelectedWallet(wallet)}
                        className={`p-4 border-2 rounded-lg text-center transition-colors ${
                          selectedWallet === wallet
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {wallet}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedWallet && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {selectedWallet} Number
                    </label>
                    <input
                      type="text"
                      value={walletNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10) setWalletNumber(value);
                      }}
                      placeholder="0712345678"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      maxLength={10}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Bank Payment Form */}
            {selectedPaymentType === 'bank' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Your Bank
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'Commercial Bank',
                      'Sampath Bank',
                      'Bank of Ceylon',
                      'People\'s Bank',
                      'Hatton National Bank',
                      'DFCC Bank',
                      'NDB Bank',
                      'Seylan Bank'
                    ].map((bank) => (
                      <button
                        key={bank}
                        onClick={() => setSelectedBank(bank)}
                        className={`p-4 border-2 rounded-lg text-center text-sm transition-colors ${
                          selectedBank === bank
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Shield className="w-4 h-4 text-green-500" />
          <span>Your payment information is secured and encrypted.</span>
        </div>

        <button
          onClick={handlePay}
          disabled={processing || (selectedPaymentType === 'card' && !isCardFormValid()) ||
                   (selectedPaymentType === 'wallet' && !isWalletFormValid()) ||
                   (selectedPaymentType === 'bank' && !isBankFormValid())}
          className={`w-full py-4 rounded-xl text-white font-semibold text-lg transition-colors ${
            processing || (selectedPaymentType === 'card' && !isCardFormValid()) ||
            (selectedPaymentType === 'wallet' && !isWalletFormValid()) ||
            (selectedPaymentType === 'bank' && !isBankFormValid())
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {processing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing Payment...
            </div>
          ) : (
            `Pay Rs. ${Number(amount).toLocaleString()}`
          )}
        </button>

        <p className="text-xs text-center text-gray-400 mt-3">
          By proceeding, you agree to our terms and conditions.
        </p>
      </div>
    </div>
  );
}
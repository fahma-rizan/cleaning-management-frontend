import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchWithAuth } from '../utils/api';
import { CheckCircle, FileText, ArrowLeft } from 'lucide-react';
import Header from './Header';
import BackButton from './BackButton';
import PaymentOptions from './PaymentOptions';
import InvoiceGenerator, { InvoiceData, InvoiceType } from './InvoiceGenerator';
import { addNotification } from './NotificationCenter';
import type { User } from '../types';

interface PaymentPageProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function PaymentPage({ user, onLogout, theme, onToggleTheme }: PaymentPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [advancePercentage, setAdvancePercentage] = useState<number>(20);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const paymentProcessedRef = useRef(false);

  // ── Loyalty points — redeem for a discount before confirming the booking ──
  // Both mirror the backend's hard limits (constants/loyalty.js) — enforced
  // there regardless of what's sent here, this is just a UI hint. The
  // customer must always keep at least MIN_RETAINED_BALANCE points — this is
  // NOT a minimum redemption amount, it's a floor the balance can never drop
  // below (a customer with 150 points can redeem any amount from 1 to 50).
  const MIN_RETAINED_BALANCE = 100;
  const MAX_REDEEM_PER_BOOKING = 500;
  const [loyaltyAccount, setLoyaltyAccount] = useState<{ currentBalance: number; loyaltyDebt: number; discountAvailable: boolean; discountPercent: number; currentTier: string } | null>(null);
  const [redeemInput, setRedeemInput] = useState(0);
  const [redeeming, setRedeeming] = useState(false);
  const [loyaltyMessage, setLoyaltyMessage] = useState('');
  // Original price before any loyalty discount, and how much of the current
  // discount is a tier perk vs a points redemption — tracked separately (not
  // just folded into booking.price) because the backend needs to know the
  // amount "after tier discount, before points discount" to award points
  // correctly (see constants/loyalty.js / loyaltyController.js).
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [tierDiscountAmount, setTierDiscountAmount] = useState(0);
  const [tierDiscountApplied, setTierDiscountApplied] = useState(false);
  const [pointsRedeemed, setPointsRedeemed] = useState(0);
  const [pointsDiscountAmount, setPointsDiscountAmount] = useState(0);
  // Snapshot of the customer's remaining spendable balance right after a
  // successful /loyalty/redeem call — carried on the booking object so the
  // success screen can show "remaining loyalty points" without a re-fetch.
  const [remainingLoyaltyBalance, setRemainingLoyaltyBalance] = useState<number | null>(null);
  // Points earned FROM this booking's payment (server-computed, see
  // reportLoyaltyResult below) — separate from pointsRedeemed/remainingLoyaltyBalance,
  // which are about spending points, not earning them.
  const [pointsEarned, setPointsEarned] = useState(0);
  // Opt-in toggle for the redemption control — redeeming points is never
  // forced, so the input/button stay hidden until the customer asks for them.
  const [wantsToRedeem, setWantsToRedeem] = useState(false);

  useEffect(() => {
    const storedBooking = localStorage.getItem('currentBooking');
    if (storedBooking) {
      const parsed = JSON.parse(storedBooking);
      // Snapshot the pre-loyalty-discount price onto the booking object too
      // (not just React state) so it survives into PaymentGatewayPage via
      // localStorage's currentBooking.
      if (parsed.originalPrice === undefined) parsed.originalPrice = parsed.price;
      setBooking(parsed);
      localStorage.setItem('currentBooking', JSON.stringify(parsed));
      setOriginalPrice(parsed.originalPrice);
    } else {
      navigate('/services');
    }
    fetchWithAuth('/loyalty/account')
      .then(acc => { if (acc && !acc.error) setLoyaltyAccount(acc); })
      .catch(err => console.error('Failed to load loyalty account:', err));
  }, [navigate]);

  const persistBooking = (updated: any) => {
    setBooking(updated);
    localStorage.setItem('currentBooking', JSON.stringify(updated));
  };

  // Amount after the tier discount, before any points discount — the base
  // that the points redemption is calculated against. Mirrors the required
  // Original Price → Tier Discount → Loyalty Points Discount → Final order.
  const amountAfterTierDiscount = originalPrice != null
    ? originalPrice - (tierDiscountApplied ? tierDiscountAmount : 0)
    : booking?.price ?? 0;

  // The UI must never let a customer redeem enough points to make the final
  // payable amount zero (or pay 100% with points), or drop currentBalance
  // below MIN_RETAINED_BALANCE — cap redemption at (balance - 100),
  // MAX_REDEEM_PER_BOOKING, AND one rupee short of amountAfterTierDiscount.
  // The backend still re-validates all of this.
  const maxRedeemable = loyaltyAccount
    ? Math.max(0, Math.min(loyaltyAccount.currentBalance - MIN_RETAINED_BALANCE, MAX_REDEEM_PER_BOOKING, amountAfterTierDiscount - 1))
    : 0;

  const canRedeemPoints = !!loyaltyAccount
    && loyaltyAccount.loyaltyDebt === 0
    && loyaltyAccount.currentBalance > MIN_RETAINED_BALANCE
    && maxRedeemable > 0
    && pointsRedeemed === 0;

  // Live preview only — purely informational until "Redeem Points" is
  // clicked and the backend confirms the discount (see rule #24: the
  // frontend is not the source of truth).
  const previewPoints = Math.min(redeemInput || 0, maxRedeemable);
  const previewFinalAmount = Math.max(0, amountAfterTierDiscount - previewPoints);

  // Order enforced by the UI: tier discount first, THEN points redemption —
  // handleApplyTierDiscount must be used (if at all) before handleRedeemPoints,
  // since points redemption is computed against whatever booking.price is at
  // that moment (already reduced by the tier discount, if one was applied).
  const handleRedeemPoints = async () => {
    if (!booking || redeemInput <= 0) return;
    if (loyaltyAccount && loyaltyAccount.loyaltyDebt > 0) {
      setLoyaltyMessage('❌ You have an outstanding loyalty debt — it must be repaid by a future earned payment before you can redeem points.');
      return;
    }
    if (loyaltyAccount && loyaltyAccount.currentBalance <= MIN_RETAINED_BALANCE) {
      setLoyaltyMessage(`❌ You need more than ${MIN_RETAINED_BALANCE} points to redeem — your balance must always stay at or above ${MIN_RETAINED_BALANCE}.`);
      return;
    }
    if (redeemInput > maxRedeemable) {
      setLoyaltyMessage(
        maxRedeemable <= 0
          ? '❌ This booking amount is too low to redeem points against — it would leave nothing to pay.'
          : `❌ You can redeem at most ${maxRedeemable} points — your balance must always stay at or above ${MIN_RETAINED_BALANCE}.`
      );
      return;
    }
    setRedeeming(true);
    setLoyaltyMessage('');
    try {
      const data = await fetchWithAuth('/loyalty/redeem', {
        // No real Booking document exists yet at this point (it's created
        // further down, after a payment method is chosen) — booking.bookingId
        // here is only a client-generated placeholder string, not a Mongo
        // ObjectId, so it's deliberately omitted rather than sent as one.
        method: 'POST',
        body: JSON.stringify({ points: redeemInput, bookingAmountInRs: booking.price }),
      });
      if (data?.finalAmount !== undefined) {
        setPointsRedeemed(redeemInput);
        setPointsDiscountAmount(data.discountAmount);
        setRemainingLoyaltyBalance(data.currentBalance);
        // Folded onto the booking object itself (not just React state) so
        // it survives into localStorage's currentBooking — PaymentGatewayPage
        // reads that directly for the online-payment path and needs these
        // same fields to send through to the backend on booking creation.
        persistBooking({
          ...booking,
          price: data.finalAmount,
          pointsRedeemed: redeemInput,
          pointsDiscountAmount: data.discountAmount,
          remainingLoyaltyBalance: data.currentBalance,
        });
        setLoyaltyAccount(acc => acc ? { ...acc, currentBalance: data.currentBalance } : acc);
        setLoyaltyMessage(`✅ Redeemed ${redeemInput} pts — Rs. ${data.discountAmount.toLocaleString()} off.`);
      } else {
        setLoyaltyMessage(`❌ ${data?.message || 'Could not redeem points.'}`);
      }
    } catch (err) {
      console.error('Redeem points failed:', err);
      toast.error('Failed to redeem points. Please try again.');
    } finally {
      setRedeeming(false);
    }
  };

  const handleApplyTierDiscount = async () => {
    if (!booking) return;
    setRedeeming(true);
    setLoyaltyMessage('');
    try {
      const data = await fetchWithAuth('/loyalty/tier-discount/apply', {
        method: 'POST',
        body: JSON.stringify({ bookingTotal: booking.price }),
      });
      if (data?.applied) {
        setTierDiscountAmount(data.discountAmount || 0);
        setTierDiscountApplied(true);
        persistBooking({ ...booking, price: data.finalAmount, tierDiscountApplied: true, tierDiscountAmount: data.discountAmount || 0 });
        setLoyaltyAccount(acc => acc ? { ...acc, discountAvailable: false } : acc);
        setLoyaltyMessage(`✅ ${data.percent}% ${data.tier} tier discount applied — Rs. ${(data.discountAmount || 0).toLocaleString()} off.`);
      } else {
        setLoyaltyMessage(`❌ ${data?.message || 'Could not apply the tier discount.'}`);
      }
    } catch (err) {
      console.error('Apply tier discount failed:', err);
      toast.error('Failed to apply the tier discount. Please try again.');
    } finally {
      setRedeeming(false);
    }
  };

  // Points are now awarded automatically, server-side, at the moment the
  // booking is created with payment already resolved (see createBooking in
  // bookingController.js) — its response carries the result, so there's no
  // separate call to make here. Errors are still surfaced (not swallowed):
  // if the booking-creation response came back without a loyalty result even
  // though a payment was made, that's told to the customer, not hidden.
  const reportLoyaltyResult = (loyalty: any, paidAmount: number) => {
    if (!paidAmount || paidAmount <= 0) return;
    if (loyalty?.earned > 0) {
      setPointsEarned(loyalty.earned);
      toast.success(`🎉 You earned ${loyalty.earned} loyalty points!`);
    } else if (!loyalty) {
      console.error('Booking response carried no loyalty result for a paid booking.');
      toast.error('Booking confirmed, but we could not confirm your loyalty points — please contact support.');
    }
  };

  // Handle return from payment gateway
  useEffect(() => {
    const locationState = location.state as any;
    
    // Check if returning from payment gateway and not already processed
    if (locationState?.processPayment && booking && !paymentProcessedRef.current) {
      paymentProcessedRef.current = true;
      
      const method = locationState.paymentMethod || localStorage.getItem('pendingPaymentMethod');
      const percentage = locationState.advancePercentage || localStorage.getItem('pendingAdvancePercentage');
      
      console.log('Returning from payment gateway, processing payment...', {
        method,
        percentage,
        locationState
      });
      
      if (method) {
        setSelectedPaymentMethod(method);
        if (percentage) {
          setAdvancePercentage(typeof percentage === 'string' ? parseInt(percentage) : percentage);
        }
        
        // Clear pending data
        localStorage.removeItem('pendingPaymentMethod');
        localStorage.removeItem('pendingAdvancePercentage');
        
        // Process payment automatically
        setProcessing(true);
        processPaymentCompletion(method, percentage, booking);
      }
    }
  }, [booking, location.state]);
  
  const processPaymentCompletion = async (method: string, percentage: any, bookingData: any) => {
    const paidAmount = method === 'full-online' 
      ? bookingData.price 
      : Math.round(bookingData.price * ((percentage || 20) / 100));
    const balanceAmount = bookingData.price - paidAmount;
    
    // Store completed booking
    const completedBooking = {
      ...bookingData,
      paymentMethod: method,
      paidAmount,
      balanceAmount,
      status: 'confirmed',
      paymentStatus: method === 'full-online' ? 'paid' : 'partial',
      bookingDate: new Date().toISOString(),
      originalPrice: originalPrice ?? bookingData.price,
      tierDiscountApplied,
      tierDiscountAmount,
      pointsRedeemed,
      pointsDiscountAmount,
    };

    // Save booking to MongoDB
    // FIX: this used to log a failed/rejected save and fall straight through to
    // the "Booking Confirmed!" screen anyway — e.g. when the slot no longer has
    // enough qualified staff for this service's size (backend returns 400), the
    // customer saw a fake success screen while nothing was ever saved, so the
    // booking never appeared in Upcoming Bookings. Now a failed save stops here
    // and tells the customer, instead of silently pretending it worked.
    try {
      const result = await fetchWithAuth('/bookings', {
        method: 'POST',
        body: JSON.stringify(completedBooking),
      });
      if (!result.success) {
        console.error('Booking API error:', result.message);
        toast.error(result.message || 'Could not confirm your booking. Please choose a different date/time and try again.');
        setProcessing(false);
        return;
      }
      console.log('✅ Booking saved to database:', result.booking?.bookingId);
      reportLoyaltyResult(result.loyalty, paidAmount);
    } catch (err) {
      console.error('Booking save failed:', err);
      toast.error('Could not confirm your booking. Please check your connection and try again.');
      setProcessing(false);
      return;
    }

    const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    existingBookings.push(completedBooking);
    localStorage.setItem('userBookings', JSON.stringify(existingBookings));

    // Generate invoice
    const invoiceType = method === 'full-online' ? 'full' : 'advance';
    const now = new Date();
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const serviceCode = bookingData?.serviceType?.substring(0, 3).toUpperCase() || 'SRV';
    const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    const invoiceNumber = `INV-${serviceCode}-${dateStr}-${randomNum}`;
    
    const invoiceData: InvoiceData = {
      invoiceNumber,
      invoiceType: invoiceType as InvoiceType,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      bookingId: bookingData.bookingId,
      customer: {
        name: user.name,
        email: user.email,
        phone: user.phone || '+94 XXX XXX XXX',
        address: bookingData.address || 'N/A',
      },
      service: {
        name: bookingData.serviceType || 'Cleaning Service',
        date: bookingData.date,
        time: bookingData.time,
        customizations: [],
      },
      pricing: {
        basePrice: bookingData.price,
        customizationTotal: 0,
        total: bookingData.price,
        paidAmount,
        balanceAmount,
      },
      paymentMethod: method === 'full-online' 
        ? 'Online Payment (Full)' 
        : `Advance Payment (${percentage || 20}%)`,
      status: method === 'full-online' ? 'paid' : 'partial',
    };
    
    setInvoice(invoiceData);

    // Store invoice
    const existingInvoices = JSON.parse(localStorage.getItem('userInvoices') || '[]');
    existingInvoices.push(invoiceData);
    localStorage.setItem('userInvoices', JSON.stringify(existingInvoices));

    // Send notifications
    addNotification(user.id, {
      type: 'order-confirmed',
      title: 'Booking Confirmed! 🎉',
      message: `Your ${bookingData.serviceType} service is scheduled for ${bookingData.date} at ${bookingData.time}. Booking ID: ${bookingData.bookingId}`,
      bookingId: bookingData.bookingId,
    });

    if (paidAmount > 0) {
      addNotification(user.id, {
        type: 'payment',
        title: 'Payment Received',
        message: `Payment of Rs. ${paidAmount.toLocaleString()} received successfully. ${
          balanceAmount > 0 ? `Balance Rs. ${balanceAmount.toLocaleString()} due after service.` : ''
        }`,
        bookingId: bookingData.bookingId,
      });
    }

    localStorage.removeItem('currentBooking');
    
    setProcessing(false);
    setSuccess(true);
  };

  const generateInvoiceNumber = (type: string): string => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const serviceCode = booking?.serviceType?.substring(0, 3).toUpperCase() || 'SRV';
    const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `INV-${serviceCode}-${dateStr}-${randomNum}`;
  };

  const createInvoice = (bookingData: any, type: InvoiceType): InvoiceData => {
    const now = new Date();
    const paidAmount = getPaidAmount();
    const balanceAmount = bookingData.price - paidAmount;

    return {
      invoiceNumber: generateInvoiceNumber(type),
      invoiceType: type,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      bookingId: bookingData.bookingId,
      customer: {
        name: user.name,
        email: user.email,
        phone: user.phone || '+94 XXX XXX XXX',
        address: bookingData.address || 'N/A',
      },
      service: {
        name: bookingData.serviceType || 'Cleaning Service',
        date: bookingData.date,
        time: bookingData.time,
        customizations: [],
      },
      pricing: {
        basePrice: bookingData.price,
        customizationTotal: 0,
        total: bookingData.price,
        paidAmount,
        balanceAmount,
      },
      paymentMethod: getPaymentMethodName(),
      status: getPaymentStatus(),
    };
  };

  const getPaymentMethodName = (): string => {
    const methodNames: { [key: string]: string } = {
      'full-online': 'Online Payment (Full)',
      'advance-balance': `Advance Payment (${advancePercentage}%)`,
      'cod': 'Cash on Delivery',
      'pay-after-completion': 'Online Payment After Completion',
    };
    return methodNames[selectedPaymentMethod] || 'Not Selected';
  };

  const getPaidAmount = (): number => {
    if (!booking) return 0;
    switch (selectedPaymentMethod) {
      case 'full-online':
        return booking.price;
      case 'advance-balance':
        return Math.round(booking.price * (advancePercentage / 100));
      case 'cod':
      case 'pay-after-completion':
        return 0;
      default:
        return 0;
    }
  };

  const getPaymentStatus = (): 'paid' | 'partial' | 'pending' | 'refunded' | 'cancelled' => {
    switch (selectedPaymentMethod) {
      case 'full-online':
        return 'paid';
      case 'advance-balance':
        return 'partial';
      case 'cod':
      case 'pay-after-completion':
        return 'pending';
      default:
        return 'pending';
    }
  };

  const getInvoiceType = (): InvoiceType => {
    switch (selectedPaymentMethod) {
      case 'full-online':
        return 'full';
      case 'advance-balance':
        return 'advance';
      case 'cod':
        return 'cod';
      case 'pay-after-completion':
        return 'full';
      default:
        return 'full';
    }
  };

  const handlePaymentMethodSelect = (method: string, percentage?: number) => {
    setSelectedPaymentMethod(method);
    if (percentage) {
      setAdvancePercentage(percentage);
    }

    // If online payment selected, navigate to gateway page immediately
    if (method === 'full-online' || method === 'advance-balance') {
      // Make sure booking is loaded
      if (!booking) {
        console.error('Booking data not available');
        return;
      }

      const amount = method === 'full-online' 
        ? booking.price 
        : Math.round(booking.price * (percentage || 20) / 100);
      
      // Store payment method before navigation
      localStorage.setItem('pendingPaymentMethod', method);
      if (percentage) {
        localStorage.setItem('pendingAdvancePercentage', percentage.toString());
      }
      
      console.log('Navigating to payment gateway with:', {
        paymentMethod: method,
        amount: amount,
        bookingData: booking,
        advancePercentage: percentage,
      });
      
      navigate('/payment-gateway', {
        state: {
          paymentMethod: method,
          amount: amount,
          bookingData: booking,
          advancePercentage: percentage,
        }
      });
    }
  };

  const handlePaymentProcessing = async () => {
    setProcessing(true);

    const paidAmount = getPaidAmount();
    const balanceAmount = booking.price - paidAmount;

    const completedBooking = {
      ...booking,
      paymentMethod: selectedPaymentMethod,
      paidAmount,
      balanceAmount,
      status: 'confirmed',
      paymentStatus:
        selectedPaymentMethod === 'cod' || selectedPaymentMethod === 'pay-after-completion'
          ? 'pending'
          : paidAmount === booking.price
            ? 'paid'
            : 'partial',
      bookingDate: new Date().toISOString(),
      originalPrice: originalPrice ?? booking.price,
      tierDiscountApplied,
      tierDiscountAmount,
      pointsRedeemed,
      pointsDiscountAmount,
      remainingLoyaltyBalance,
    };

    // ── Save to MongoDB ──────────────────────────────────────────────────────
    // FIX: this used to log a failed/rejected save and fall straight through to
    // the "Booking Confirmed!" screen anyway — e.g. when the slot no longer has
    // enough qualified staff for this service's size (backend returns 400), the
    // customer saw a fake success screen while nothing was ever saved, so the
    // booking never appeared in Upcoming Bookings. Now a failed save stops here
    // and tells the customer, instead of silently pretending it worked.
    try {
      const result = await fetchWithAuth('/bookings', {
        method: 'POST',
        body: JSON.stringify(completedBooking),
      });
      if (!result.success) {
        console.error('Booking API error:', result.message);
        toast.error(result.message || 'Could not confirm your booking. Please choose a different date/time and try again.');
        setProcessing(false);
        return;
      }
      console.log('✅ Booking saved to database:', result.booking?.bookingId);
      reportLoyaltyResult(result.loyalty, paidAmount);
    } catch (err) {
      console.error('Booking save failed:', err);
      toast.error('Could not confirm your booking. Please check your connection and try again.');
      setProcessing(false);
      return;
    }

    // ── Also keep in localStorage as local cache ─────────────────────────────
    const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    existingBookings.push(completedBooking);
    localStorage.setItem('userBookings', JSON.stringify(existingBookings));

    // ── Invoice ──────────────────────────────────────────────────────────────
    const invoiceData = createInvoice(completedBooking, getInvoiceType());
    setInvoice(invoiceData);
    const existingInvoices = JSON.parse(localStorage.getItem('userInvoices') || '[]');
    existingInvoices.push(invoiceData);
    localStorage.setItem('userInvoices', JSON.stringify(existingInvoices));

    // ── Notifications ────────────────────────────────────────────────────────
    addNotification(user.id, {
      type: 'order-confirmed',
      title: 'Booking Confirmed! 🎉',
      message: `Your ${booking.serviceType} service is scheduled for ${booking.date} at ${booking.time}. Booking ID: ${booking.bookingId}`,
      bookingId: booking.bookingId,
    });
    if (paidAmount > 0) {
      addNotification(user.id, {
        type: 'payment',
        title: 'Payment Received',
        message: `Payment of Rs. ${paidAmount.toLocaleString()} received successfully. ${
          balanceAmount > 0 ? `Balance Rs. ${balanceAmount.toLocaleString()} due after service.` : ''
        }`,
        bookingId: booking.bookingId,
      });
    }

    localStorage.removeItem('currentBooking');
    setProcessing(false);
    setSuccess(true);
  };

  if (!booking) {
    return null;
  }

  if (success && invoice) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
        
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
                {selectedPaymentMethod === 'cod' || selectedPaymentMethod === 'pay-after-completion'
                  ? 'Booking Confirmed!'
                  : 'Payment Successful!'}
              </h1>
              
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedPaymentMethod === 'cod'
                  ? 'Your booking is confirmed. Please pay cash to the service professional after completion.'
                  : selectedPaymentMethod === 'pay-after-completion'
                    ? 'Your booking is confirmed. You will receive a payment link after service completion.'
                    : selectedPaymentMethod === 'advance-balance'
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

              {pointsEarned > 0 && (
                <div className={`rounded-lg p-4 mb-6 flex items-center justify-center gap-2 font-semibold ${theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-700'}`}>
                  🎉 You earned {pointsEarned.toLocaleString()} loyalty points!
                </div>
              )}

              {(tierDiscountApplied || pointsRedeemed > 0) && (
                <div className={`rounded-lg p-6 mb-6 text-left ${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'}`}>
                  <p className={`text-sm font-bold uppercase tracking-wide mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Loyalty Savings</p>
                  <div className="grid grid-cols-2 gap-4">
                    {tierDiscountApplied && (
                      <div>
                        <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tier Discount</p>
                        <p className="text-green-600">Rs. {tierDiscountAmount.toLocaleString()}</p>
                      </div>
                    )}
                    {pointsRedeemed > 0 && (
                      <>
                        <div>
                          <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loyalty Points Redeemed</p>
                          <p>{pointsRedeemed.toLocaleString()} pts</p>
                        </div>
                        <div>
                          <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loyalty Discount</p>
                          <p className="text-green-600">Rs. {pointsDiscountAmount.toLocaleString()}</p>
                        </div>
                        {remainingLoyaltyBalance !== null && (
                          <div>
                            <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Remaining Loyalty Points</p>
                            {/* remainingLoyaltyBalance is the balance right after redemption — this
                                same payment then earned pointsEarned on top of it, so reflect that too */}
                            <p>{(remainingLoyaltyBalance + pointsEarned).toLocaleString()} pts</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

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
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Confirmation
            </button>
            <InvoiceGenerator invoice={invoice} theme={theme} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          <h1 className={`text-4xl mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>
            Complete Your Booking
          </h1>
          <p className={`mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Choose your preferred payment method to confirm your booking
          </p>

          {loyaltyAccount && (
            <div className={`rounded-xl p-6 shadow-sm mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Payment Summary</h2>

              {/* Original Price → Tier Discount → After Tier Discount → Loyalty Points Discount → Final — required order */}
              <div className="text-sm space-y-2 mb-5">
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Booking Price</span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Rs. {(originalPrice ?? booking.price).toLocaleString()}</span>
                </div>
                {tierDiscountApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>{loyaltyAccount.currentTier} Tier Discount</span>
                    <span>- Rs. {tierDiscountAmount.toLocaleString()}</span>
                  </div>
                )}
                {(tierDiscountApplied || pointsRedeemed > 0) && (
                  <div className={`flex justify-between pt-2 border-t font-medium ${theme === 'dark' ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-700'}`}>
                    <span>After Tier Discount</span>
                    <span>Rs. {amountAfterTierDiscount.toLocaleString()}</span>
                  </div>
                )}
                {pointsRedeemed > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>Loyalty Points Discount ({pointsRedeemed} pts)</span>
                    <span>- Rs. {pointsDiscountAmount.toLocaleString()}</span>
                  </div>
                )}
                {pointsRedeemed === 0 && wantsToRedeem && previewPoints > 0 && (
                  <div className="flex justify-between text-purple-400 italic">
                    <span>Loyalty Points Discount ({previewPoints} pts, not yet applied)</span>
                    <span>≈ - Rs. {previewPoints.toLocaleString()}</span>
                  </div>
                )}
                <div className={`flex justify-between pt-2 border-t text-base font-bold ${theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'}`}>
                  <span>Final Amount to Pay</span>
                  <span className="text-purple-600 dark:text-purple-400">Rs. {booking.price.toLocaleString()}</span>
                </div>
                {pointsRedeemed === 0 && wantsToRedeem && previewPoints > 0 && (
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Redeem {previewPoints} pts to bring this down to ≈ Rs. {previewFinalAmount.toLocaleString()}.
                  </p>
                )}
              </div>

              <hr className={theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} />

              <h3 className={`text-sm font-bold uppercase tracking-wide mt-5 mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Redeem Loyalty Points</h3>

              {loyaltyAccount.loyaltyDebt > 0 && (
                <p className="text-amber-600 text-sm font-medium mb-3">
                  ⚠️ Available: {loyaltyAccount.currentBalance.toLocaleString()} pts — but you have {loyaltyAccount.loyaltyDebt.toLocaleString()} pts of loyalty debt (from previously-redeemed points on a cancelled booking).
                  Point redemption is temporarily unavailable — your next earned points will first clear this debt.
                </p>
              )}

              {loyaltyAccount.loyaltyDebt === 0 && loyaltyAccount.currentBalance <= MIN_RETAINED_BALANCE && (
                <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Available Points: {loyaltyAccount.currentBalance.toLocaleString()}. You need more than {MIN_RETAINED_BALANCE} points to redeem — your balance must always stay at or above {MIN_RETAINED_BALANCE}.
                </p>
              )}

              {loyaltyAccount.loyaltyDebt === 0 && loyaltyAccount.currentBalance > MIN_RETAINED_BALANCE && maxRedeemable <= 0 && (
                <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Available Points: {loyaltyAccount.currentBalance.toLocaleString()}, but this booking's amount is too low to redeem points against — redemption can never bring the total to Rs. 0.
                </p>
              )}

              {/* Tier discount — reserved via the Loyalty dashboard, applied here at checkout */}
              {tierDiscountApplied ? (
                <p className="text-green-600 font-medium text-sm mb-3">✅ Rs. {tierDiscountAmount.toLocaleString()} tier discount applied.</p>
              ) : loyaltyAccount.discountAvailable && (
                <div className="flex items-center gap-3 mb-4">
                  <button
                    type="button"
                    onClick={handleApplyTierDiscount}
                    disabled={redeeming || processing}
                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold"
                  >
                    Use my {loyaltyAccount.discountPercent}% {loyaltyAccount.currentTier} tier discount
                  </button>
                </div>
              )}

              {pointsRedeemed > 0 ? (
                <p className="text-green-600 font-medium text-sm">✅ Redeemed {pointsRedeemed} pts — Rs. {pointsDiscountAmount.toLocaleString()} off.</p>
              ) : canRedeemPoints && (
                <div>
                  {/* Required by the redemption rule: always show both figures clearly.
                      Maximum Redeemable = min(currentBalance - 100, 500) — never a
                      "minimum redemption" of 100, just the floor the balance can't cross. */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm mb-3">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Available Points: <strong>{loyaltyAccount.currentBalance.toLocaleString()}</strong>
                    </span>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Maximum Redeemable: <strong>{maxRedeemable.toLocaleString()}</strong>
                    </span>
                  </div>

                  <label className={`flex items-center gap-2 text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    <input
                      type="checkbox"
                      checked={wantsToRedeem}
                      onChange={e => setWantsToRedeem(e.target.checked)}
                      disabled={processing}
                      className="w-4 h-4"
                    />
                    Use loyalty points — you'll always keep at least {MIN_RETAINED_BALANCE} pts in your balance
                  </label>

                  {wantsToRedeem && (
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setRedeemInput(v => Math.max(1, (v || 10) - 10))}
                        disabled={redeeming || processing || redeemInput <= 1}
                        aria-label="Decrease points to redeem"
                        className={`w-9 h-9 rounded-lg border font-bold disabled:opacity-40 ${theme === 'dark' ? 'border-gray-600 text-white' : 'border-gray-300 text-gray-700'}`}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={maxRedeemable}
                        step={10}
                        value={redeemInput || ''}
                        onChange={e => {
                          const v = Number(e.target.value);
                          setRedeemInput(Number.isNaN(v) ? 0 : Math.max(0, Math.min(maxRedeemable, v)));
                        }}
                        disabled={redeeming || processing}
                        placeholder="Points to redeem"
                        aria-label="Points to redeem"
                        className={`w-32 px-3 py-2 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setRedeemInput(v => Math.min(maxRedeemable, (v || 0) + 10))}
                        disabled={redeeming || processing || redeemInput >= maxRedeemable}
                        aria-label="Increase points to redeem"
                        className={`w-9 h-9 rounded-lg border font-bold disabled:opacity-40 ${theme === 'dark' ? 'border-gray-600 text-white' : 'border-gray-300 text-gray-700'}`}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={handleRedeemPoints}
                        disabled={redeeming || processing || redeemInput <= 0 || redeemInput > maxRedeemable}
                        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold"
                      >
                        {redeeming ? 'Applying…' : 'Redeem Points'}
                      </button>
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        1 pt = Rs. 1 · always keeps at least {MIN_RETAINED_BALANCE} pts in your balance
                      </span>
                    </div>
                  )}
                </div>
              )}

              {loyaltyMessage && <p className={`text-sm mt-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{loyaltyMessage}</p>}
            </div>
          )}

          <PaymentOptions
            totalAmount={booking.price}
            serviceDetails={{
              serviceName: booking.serviceType || 'Cleaning Service',
              customizations: [],
            }}
            onPaymentMethodSelect={handlePaymentMethodSelect}
            theme={theme}
          />

          {/* Debug info */}
          {selectedPaymentMethod && (
            <div className={`mt-4 p-4 rounded-lg ${ theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className="text-sm">Selected: {selectedPaymentMethod}</p>
              <p className="text-sm">Booking loaded: {booking ? 'Yes' : 'No'}</p>
            </div>
          )}

          {/* Confirm Button - Only show for COD and Pay After Completion */}
          {selectedPaymentMethod && 
           (selectedPaymentMethod === 'cod' || selectedPaymentMethod === 'pay-after-completion') && (
            <div className="mt-6">
              <button
                onClick={handlePaymentProcessing}
                disabled={processing}
                className={`w-full py-4 rounded-lg text-lg transition-colors ${
                  processing
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white`}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Confirm Booking'
                )}
              </button>
              <p className={`text-xs mt-3 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                By confirming, you agree to our terms and conditions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
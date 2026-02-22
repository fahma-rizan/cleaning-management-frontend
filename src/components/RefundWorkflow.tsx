import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import InvoiceGenerator, { InvoiceData } from './InvoiceGenerator';
import { addNotification } from './NotificationCenter';
import type { User } from '../types';

interface RefundWorkflowProps {
  user: User;
}

interface BookingRecord {
  bookingId: string;
  serviceType: string;
  date: string;
  time: string;
  paymentMethod: string;
  paymentMethodName: string;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  bookingDate: string;
  address?: string;
}

export default function RefundWorkflow({ user }: RefundWorkflowProps) {
  const navigate = useNavigate();
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [refundDone, setRefundDone] = useState(false);
  const [refundInvoice, setRefundInvoice] = useState<InvoiceData | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  // Only show bookings that are refundable (paid something and not already cancelled)
  const refundableBookings: BookingRecord[] = useMemo(() => {
    const all = JSON.parse(localStorage.getItem('userBookings') || '[]');
    return all.filter((b: BookingRecord) =>
      (b.paidAmount > 0) &&
      b.status !== 'cancelled' &&
      b.status !== 'refunded'
    );
  }, []);

  const canRefund = (booking: BookingRecord) => {
    // Policy: refund allowed if service date is > 24hrs away
    const serviceDate = new Date(booking.date);
    const now = new Date();
    const hoursUntilService = (serviceDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilService > 24;
  };

  const isOnlinePayment = (booking: BookingRecord) => {
    return booking.paymentMethod === 'full-online' || booking.paymentMethod === 'advance-balance';
  };

  const handleRefund = () => {
    if (!selectedBooking || !refundReason) return;
    setProcessing(true);

    setTimeout(() => {
      // Update booking status in localStorage
      const all: BookingRecord[] = JSON.parse(localStorage.getItem('userBookings') || '[]');
      const updated = all.map(b =>
        b.bookingId === selectedBooking.bookingId
          ? { ...b, status: 'refunded' }
          : b
      );
      localStorage.setItem('userBookings', JSON.stringify(updated));

      // Generate refund invoice
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      const serviceCode = selectedBooking.serviceType?.substring(0, 3).toUpperCase() || 'SRV';
      const invoiceNumber = `REF-${serviceCode}-${dateStr}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;

      const invoice: InvoiceData = {
        invoiceNumber,
        invoiceType: 'refund',
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        bookingId: selectedBooking.bookingId,
        customer: {
          name: user.name,
          email: user.email,
          phone: user.phone || '+94 XXX XXX XXX',
          address: selectedBooking.address || 'N/A',
        },
        service: {
          name: selectedBooking.serviceType,
          date: selectedBooking.date,
          time: selectedBooking.time,
          customizations: [],
        },
        pricing: {
          basePrice: selectedBooking.paidAmount,
          customizationTotal: 0,
          total: selectedBooking.paidAmount,
          paidAmount: selectedBooking.paidAmount,
          balanceAmount: 0,
        },
        paymentMethod: selectedBooking.paymentMethodName || selectedBooking.paymentMethod,
        status: 'refunded',
      };

      setRefundInvoice(invoice);

      // Store refund invoice
      const invoices = JSON.parse(localStorage.getItem('userInvoices') || '[]');
      invoices.push(invoice);
      localStorage.setItem('userInvoices', JSON.stringify(invoices));

      // Notification
      addNotification(user.id, {
        type: 'payment',
        title: 'Refund Initiated ✅',
        message: `Refund of Rs. ${selectedBooking.paidAmount.toLocaleString()} for ${selectedBooking.serviceType} has been initiated. ${isOnlinePayment(selectedBooking) ? 'Amount will be credited to your account in 5–7 business days.' : 'Please collect your cash refund from our office.'}`,
        bookingId: selectedBooking.bookingId,
      });

      setProcessing(false);
      setRefundDone(true);
    }, 2000);
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (refundDone && refundInvoice) {
    if (showInvoice) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <button onClick={() => setShowInvoice(false)}
              className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <InvoiceGenerator invoice={refundInvoice} />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Refund Initiated!</h1>
          <p className="text-gray-500 mb-6">
            {isOnlinePayment(selectedBooking!)
              ? `Rs. ${selectedBooking!.paidAmount.toLocaleString()} will be credited to your account within 5–7 business days.`
              : `Rs. ${selectedBooking!.paidAmount.toLocaleString()} — please collect your cash refund from our office.`}
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Booking ID</span>
              <span className="font-mono font-semibold">{selectedBooking!.bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Refund Amount</span>
              <span className="font-semibold text-green-600">Rs. {selectedBooking!.paidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Refund Type</span>
              <span className="font-semibold">{isOnlinePayment(selectedBooking!) ? 'Bank Transfer' : 'Manual Cash'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Reference</span>
              <span className="font-mono text-xs">{refundInvoice.invoiceNumber}</span>
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={() => setShowInvoice(true)}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
              View Refund Invoice
            </button>
            <button onClick={() => navigate('/payment')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors">
              Back to Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Refund form ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-1">Request a Refund</h1>
        <p className="text-gray-500 mb-8">Select a booking to cancel and initiate your refund</p>

        {/* Refundable Bookings */}
        {refundableBookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No refundable bookings</p>
            <p className="text-gray-400 text-sm mt-1">Only paid bookings that haven't been completed can be refunded</p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {refundableBookings.map((booking) => {
              const eligible = canRefund(booking);
              const isSelected = selectedBooking?.bookingId === booking.bookingId;

              return (
                <button key={booking.bookingId} type="button"
                  onClick={() => eligible && setSelectedBooking(isSelected ? null : booking)}
                  className={`w-full text-left rounded-xl p-5 border-2 transition-all ${
                    !eligible ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' :
                    isSelected ? 'border-purple-600 bg-purple-50 shadow-md' :
                    'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                  }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{booking.serviceType}</h3>
                        {!eligible && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                            Within 24hrs — not eligible
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{booking.date} at {booking.time}</p>
                      <p className="text-xs text-gray-400 font-mono mt-1">{booking.bookingId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Paid</p>
                      <p className="text-xl font-bold text-green-600">Rs. {booking.paidAmount.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        {isOnlinePayment(booking)
                          ? <><CheckCircle className="w-3 h-3 text-blue-500" /><span className="text-xs text-blue-500">Bank refund</span></>
                          : <><Clock className="w-3 h-3 text-orange-500" /><span className="text-xs text-orange-500">Manual cash</span></>
                        }
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-3 flex items-center gap-2 text-purple-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Selected for refund</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Refund Reason + Confirm */}
        {selectedBooking && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">Reason for Cancellation</h2>
            <div className="space-y-3 mb-4">
              {['Change of plans', 'Found a better price', 'Service no longer needed', 'Scheduling conflict', 'Other'].map(reason => (
                <label key={reason} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  refundReason === reason ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <input type="radio" name="reason" value={reason}
                    checked={refundReason === reason}
                    onChange={() => setRefundReason(reason)}
                    className="text-purple-600" />
                  <span className="text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>

            {/* Policy notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">Refund Policy</p>
                <ul className="space-y-1 text-blue-600 list-disc ml-4">
                  <li>Cancellations more than 24 hours before service: full refund</li>
                  <li>Online payments refunded to bank in 5–7 business days</li>
                  <li>COD/cash refunds collected manually from our office</li>
                </ul>
              </div>
            </div>

            <button onClick={handleRefund}
              disabled={!refundReason || processing}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                !refundReason || processing
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg'
              }`}>
              {processing
                ? <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" /> Processing Refund...
                  </span>
                : `Confirm Cancellation & Refund Rs. ${selectedBooking.paidAmount.toLocaleString()}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

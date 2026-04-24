import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle, XCircle, Clock, RefreshCw, ShieldCheck } from 'lucide-react';
import InvoiceGenerator, { InvoiceData } from './InvoiceGenerator';
import { addNotification } from '../utils/notificationUtils';
import type { User } from '../types';
import DemoTopBar from './DemoTopBar';

interface RefundWorkflowProps { user: User; }

interface BookingRecord {
  _id: string; // Use the invoice's actual database ID
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

// Refund request stages
type Stage = 'select' | 'pending-approval' | 'approved' | 'rejected';

export default function RefundWorkflow({ user }: RefundWorkflowProps) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [refundReason, setRefundReason]       = useState('');
  const [processing, setProcessing]           = useState(false);
  const [stage, setStage]                     = useState<Stage>('select');
  const [refundInvoice, setRefundInvoice]     = useState<InvoiceData | null>(null);
  const [showInvoice, setShowInvoice]         = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [refundId, setRefundId]               = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/invoices/user/${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bookings.');
        }
        const data = await response.json();
        
        // The API returns full invoice objects, so we need to adapt them to the BookingRecord structure.
        const formattedBookings = data.map((inv: any): BookingRecord => ({
          _id: inv._id, // Important: we need the invoice's database ID
          bookingId: inv.bookingId,
          serviceType: inv.serviceItems[0]?.name || 'Service',
          date: new Date(inv.createdAt).toLocaleDateString(),
          time: new Date(inv.createdAt).toLocaleTimeString(),
          paymentMethod: inv.notes.includes('Cash on Delivery') ? 'cod' : 'online',
          paymentMethodName: inv.notes,
          paidAmount: inv.paidAmount,
          balanceAmount: inv.balanceAmount,
          status: inv.status.toLowerCase(),
          bookingDate: inv.createdAt,
          address: inv.customer.address,
        }));

        setBookings(formattedBookings);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
        console.error("Error fetching bookings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user.id]);

  const refundableBookings: BookingRecord[] = useMemo(() => {
    return bookings.filter((b: BookingRecord) =>
      b.paidAmount > 0 && b.status !== 'cancelled' && b.status !== 'refunded'
    );
  }, [bookings]);

  const canRefund = (booking: BookingRecord) => {
    const serviceDate = new Date(booking.date);
    const now = new Date();
    return (serviceDate.getTime() - now.getTime()) / (1000 * 60 * 60) > 24;
  };

  const isOnlinePayment = (booking: BookingRecord) =>
    booking.paymentMethod === 'full-online' || booking.paymentMethod === 'advance-balance';

  // ── Step 1: Customer submits refund request ────────────────────────────
  const handleSubmitRequest = async () => {
    if (!selectedBooking || !refundReason) return;
    setProcessing(true);

    try {
      const response = await fetch('http://localhost:4000/api/refunds/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: selectedBooking._id, reason: refundReason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to submit refund request.');
      }

      const refundData = await response.json();

      // Store the refund ID for later use in approve/reject
      setRefundId(refundData._id);

      // Notify customer — request pending
      await addNotification({
        userId: user.id,
        type: 'update',
        title: 'Refund Request Submitted',
        message: `Your refund request for booking ${selectedBooking.bookingId} has been submitted and is pending admin approval.`,
        bookingId: selectedBooking.bookingId,
      });

      setStage('pending-approval');
    } catch (err: any) {
      console.error("Error submitting refund request:", err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // ── Step 2: Admin approves (simulated) ────────────────────────────────
  const handleAdminApprove = async () => {
    if (!selectedBooking || !refundId) return;
    setProcessing(true);

    try {
      const response = await fetch(`http://localhost:4000/api/refunds/approve/${refundId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to approve refund.');
      }
      
      const updatedInvoice = await response.json();

      // Generate refund invoice for display
      const now = new Date();
      const refundInv: InvoiceData = {
        invoiceNumber: `REF-${updatedInvoice.invoiceNumber}`,
        invoiceType: 'refund',
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        bookingId: updatedInvoice.bookingId,
        customer: {
          name: user.name, email: user.email,
          phone: user.phone || '+94 XXX XXX XXX',
          address: updatedInvoice.customer.address || 'N/A',
        },
        service: {
          name: updatedInvoice.serviceItems[0]?.name || 'Refunded Service',
          date: selectedBooking.date,
          time: selectedBooking.time,
          customizations: [],
        },
        pricing: {
          basePrice: updatedInvoice.paidAmount,
          customizationTotal: 0,
          total: updatedInvoice.paidAmount,
          paidAmount: updatedInvoice.paidAmount,
          balanceAmount: 0,
        },
        paymentMethod: selectedBooking.paymentMethodName || selectedBooking.paymentMethod,
        status: 'REFUNDED',
      };
      
      setRefundInvoice(refundInv);

      // Notify customer — approved
      await addNotification({
        userId: user.id,
        type: 'payment-reduction-approved',
        title: 'Refund Approved ✅',
        message: `Your refund of Rs. ${selectedBooking.paidAmount.toLocaleString()} has been approved.`,
        bookingId: selectedBooking.bookingId,
      });

      setStage('approved');
    } catch (err: any) {
      console.error("Error approving refund:", err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // ── Step 2 alt: Admin rejects ─────────────────────────────────────────
  const handleAdminReject = async (reason: string) => {
    if (!selectedBooking || !refundId) return;
    setProcessing(true);

    try {
      const response = await fetch(`http://localhost:4000/api/refunds/reject/${refundId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to reject refund.');
      }

      await addNotification({
        userId: user.id,
        type: 'complaint-rejected',
        title: 'Refund Request Rejected',
        message: `Your refund request for booking ${selectedBooking?.bookingId} was not approved. Reason: ${reason}`,
        bookingId: selectedBooking?.bookingId,
      });
      
      setRejectionReason(reason);
      setStage('rejected');
    } catch (err: any) {
      console.error("Error rejecting refund:", err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // ── Rejected screen ───────────────────────────────────────────────────
  if (stage === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50">
        <DemoTopBar user={user} />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-4 rounded-full"><XCircle className="w-14 h-14 text-red-500" /></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Refund Not Approved</h2>
            <p className="text-gray-500 mb-4">Your refund request was reviewed and could not be approved.</p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
              <p className="font-semibold mb-1">Reason:</p>
              <p>{rejectionReason}</p>
            </div>
            <button onClick={() => { setStage('select'); setSelectedBooking(null); setRefundReason(''); }}
              className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 font-medium">
              Back to Refund Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Approved screen ───────────────────────────────────────────────────
  if (stage === 'approved' && refundInvoice) {
    if (showInvoice) {
      return (
        <div className="min-h-screen bg-gray-50">
          <DemoTopBar user={user} />
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
      <div className="min-h-screen bg-gray-50">
        <DemoTopBar user={user} />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full"><CheckCircle className="w-16 h-16 text-green-500" /></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Refund Approved!</h1>
            <p className="text-gray-500 mb-6">
              {isOnlinePayment(selectedBooking!)
                ? `Rs. ${selectedBooking!.paidAmount.toLocaleString()} will be credited within 5–7 business days.`
                : `Rs. ${selectedBooking!.paidAmount.toLocaleString()} — collect cash refund from our office.`}
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Booking ID</span><span className="font-mono font-semibold">{selectedBooking!.bookingId}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Refund Amount</span><span className="font-semibold text-green-600">Rs. {selectedBooking!.paidAmount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-semibold">{isOnlinePayment(selectedBooking!) ? 'Bank Transfer' : 'Manual Cash'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Reference</span><span className="font-mono text-xs">{refundInvoice.invoiceNumber}</span></div>
            </div>
            <div className="space-y-3">
              <button onClick={() => setShowInvoice(true)} className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-medium">View Refund Invoice</button>
              <button onClick={() => navigate(`/staff-invoice/${refundInvoice.invoiceNumber}`)} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium">View Staff Invoice</button>
              <button onClick={() => navigate('/payment')} className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200">Back to Payment</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Pending admin approval screen ─────────────────────────────────────
  if (stage === 'pending-approval') {
    return (
      <div className="min-h-screen bg-gray-50">
        <DemoTopBar user={user} />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-yellow-100 p-4 rounded-full"><ShieldCheck className="w-14 h-14 text-yellow-500" /></div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Awaiting Admin Approval</h2>
            <p className="text-gray-500 text-sm mb-6">
              Your refund request for <span className="font-semibold">{selectedBooking?.bookingId}</span> has been submitted.
              The admin will review it shortly.
            </p>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Service</span><span className="font-semibold">{selectedBooking?.serviceType}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Refund Amount</span><span className="font-semibold text-green-600">Rs. {selectedBooking?.paidAmount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Reason</span><span className="font-medium">{refundReason}</span></div>
            </div>

            <a href={`/staff-invoice/${selectedBooking?.bookingId}`} target="_blank" rel="noopener noreferrer"
              className="block w-full text-center bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 mb-4 font-medium">
              View Original Invoice
            </a>

            {/* ── Admin panel (simulated for demo) ── */}
            <div className="border-t border-gray-200 pt-5 mt-2">
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-semibold">Admin Action (Demo)</p>
              <div className="flex gap-3">
                <button onClick={handleAdminApprove} disabled={processing}
                  className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all ${processing ? 'bg-green-300' : 'bg-green-500 hover:bg-green-600'}`}>
                  {processing ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : '✅ Approve'}
                </button>
                <button onClick={() => handleAdminReject('Cancellation is within 24 hours of service — not eligible per refund policy.')}
                  disabled={processing}
                  className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all ${processing ? 'bg-red-300' : 'bg-red-500 hover:bg-red-600'}`}>
                  ❌ Reject
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">In production, this panel is only visible to admins.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main select + reason form ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <DemoTopBar user={user} />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-1">Request a Refund</h1>
        <p className="text-gray-500 mb-8">Select a booking to cancel and initiate your refund</p>

        {isLoading ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-3 animate-spin" />
            <p className="text-gray-500 font-medium">Loading your bookings...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-700 font-semibold">Error Loading Bookings</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        ) : refundableBookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No refundable bookings</p>
            <p className="text-gray-400 text-sm mt-1">Only paid bookings that haven't been completed can be refunded</p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {refundableBookings.map(booking => {
              const eligible  = canRefund(booking);
              const isSelected = selectedBooking?.bookingId === booking.bookingId;
              return (
                <button key={booking._id} type="button"
                  onClick={() => eligible && setSelectedBooking(isSelected ? null : booking)}
                  className={`w-full text-left rounded-xl p-5 border-2 transition-all ${
                    !eligible  ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' :
                    isSelected ? 'border-purple-600 bg-purple-50 shadow-md' :
                    'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                  }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{booking.serviceType}</h3>
                        {!eligible && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Within 24hrs — not eligible</span>}
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
                          : <><Clock className="w-3 h-3 text-orange-500" /><span className="text-xs text-orange-500">Manual cash</span></>}
                      </div>
                    </div>
                  </div>
                  {isSelected && <div className="mt-3 flex items-center gap-2 text-purple-600"><CheckCircle className="w-4 h-4" /><span className="text-sm font-medium">Selected for refund</span></div>}
                </button>
              );
            })}
          </div>
        )}

        {selectedBooking && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">Reason for Cancellation</h2>
            <div className="space-y-3 mb-4">
              {['Change of plans', 'Found a better price', 'Service no longer needed', 'Scheduling conflict', 'Other'].map(reason => (
                <label key={reason} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  refundReason === reason ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <input type="radio" name="reason" value={reason} checked={refundReason === reason}
                    onChange={() => setRefundReason(reason)} className="text-purple-600" />
                  <span className="text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">Refund Policy</p>
                <ul className="space-y-1 text-blue-600 list-disc ml-4">
                  <li>Cancellations more than 24 hours before service: full refund</li>
                  <li>Online payments refunded to bank in 5–7 business days</li>
                  <li>COD/cash refunds collected manually from our office</li>
                  <li>All refund requests are subject to admin approval</li>
                </ul>
              </div>
            </div>

            <button onClick={handleSubmitRequest} disabled={!refundReason || processing}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                !refundReason || processing ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 shadow-md'
              }`}>
              {processing
                ? <span className="flex items-center justify-center gap-2"><RefreshCw className="w-5 h-5 animate-spin" /> Submitting Request...</span>
                : `Submit Refund Request — Rs. ${selectedBooking.paidAmount.toLocaleString()}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
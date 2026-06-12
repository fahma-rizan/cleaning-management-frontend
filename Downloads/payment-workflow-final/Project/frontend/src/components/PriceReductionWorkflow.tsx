import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle, XCircle, Clock, RefreshCw, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { addNotification } from '../utils/notificationUtils';
import type { User } from '../types';
import DemoTopBar from './DemoTopBar';

interface PriceReductionWorkflowProps { user: User; }

interface BookingRecord {
  _id: string;
  bookingId: string;
  serviceType: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  date: string;
}

type Stage = 'select' | 'pending-approval' | 'approved' | 'rejected';

const REASONS = [
  'Service quality did not meet expectations',
  'Service took longer than estimated',
  'Some services were not completed',
  'Price was different from the original quote',
  'Loyalty / returning customer discount',
  'Other',
];

export default function PriceReductionWorkflow({ user }: PriceReductionWorkflowProps) {
  const navigate = useNavigate();
  const [invoices, setInvoices]               = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading]             = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const [selected, setSelected]               = useState<BookingRecord | null>(null);
  const [reason, setReason]                   = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [amountError, setAmountError]         = useState('');
  const [processing, setProcessing]           = useState(false);
  const [stage, setStage]                     = useState<Stage>('select');
  const [reductionId, setReductionId]         = useState<string | null>(null);
  const [approvedAmount, setApprovedAmount]   = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const API = 'http://localhost:4000/api';

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch(`${API}/invoices/user/${user.id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch invoices.');
        const data = await res.json();

        const eligible = data
          .filter((inv: any) => ['PAID', 'PARTIAL'].includes(inv.status))
          .map((inv: any): BookingRecord => ({
            _id:           inv._id,
            bookingId:     inv.bookingId,
            invoiceNumber: inv.invoiceNumber,
            serviceType:   inv.serviceItems?.[0]?.name || 'Service',
            totalAmount:   inv.totalAmount,
            paidAmount:    inv.paidAmount,
            balanceAmount: inv.balanceAmount,
            status:        inv.status,
            date:          new Date(inv.createdAt).toLocaleDateString(),
          }));

        setInvoices(eligible);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, [user.id, user.token]);

  const validateAmount = (val: string) => {
    if (!selected) return;
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) {
      setAmountError('Please enter a valid amount greater than Rs. 0.');
    } else if (num >= selected.totalAmount) {
      setAmountError(`Amount must be less than the invoice total (Rs. ${selected.totalAmount.toLocaleString()}). For a full refund, use the Refund page.`);
    } else {
      setAmountError('');
    }
    setRequestedAmount(val);
  };

  const isValid = selected && reason && requestedAmount && !amountError;

  // Step 1 — customer submits
  const handleSubmit = async () => {
    if (!isValid) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API}/price-reductions/request`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body:    JSON.stringify({ invoiceId: selected!._id, requestedAmount: parseFloat(requestedAmount), reason }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.msg || 'Failed to submit request.');
      }
      const data = await res.json();
      setReductionId(data._id);

      await addNotification({
        userId:    user.id,
        type:      'update',
        title:     'Price Reduction Request Submitted',
        message:   `Your request for Rs. ${parseFloat(requestedAmount).toLocaleString()} reduction on booking ${selected!.bookingId} is under review.`,
        bookingId: selected!.bookingId,
      });

      setStage('pending-approval');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Step 2a — admin approves (demo panel)
  const handleAdminApprove = async () => {
    if (!reductionId) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API}/price-reductions/approve/${reductionId}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body:    JSON.stringify({ approvedAmount: parseFloat(requestedAmount) }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.msg || 'Failed to approve reduction.');
      }
      const data = await res.json();
      setApprovedAmount(data.reduction.approvedAmount);
      setStage('approved');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Step 2b — admin rejects (demo panel)
  const handleAdminReject = async () => {
    if (!reductionId) return;
    setProcessing(true);
    const rejectReason = 'The requested reduction does not meet our price adjustment policy.';
    try {
      const res = await fetch(`${API}/price-reductions/reject/${reductionId}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body:    JSON.stringify({ reason: rejectReason }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.msg || 'Failed to reject reduction.');
      }
      setRejectionReason(rejectReason);
      setStage('rejected');
    } catch (err: any) {
      toast.error(err.message);
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Not Approved</h2>
            <p className="text-gray-500 mb-4">Your price reduction request was reviewed and could not be approved.</p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
              <p className="font-semibold mb-1">Reason:</p>
              <p>{rejectionReason}</p>
            </div>
            <button onClick={() => { setStage('select'); setSelected(null); setReason(''); setRequestedAmount(''); }}
              className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 font-medium">
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Approved screen ───────────────────────────────────────────────────
  if (stage === 'approved') {
    return (
      <div className="min-h-screen bg-gray-50">
        <DemoTopBar user={user} />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full"><CheckCircle className="w-16 h-16 text-green-500" /></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Price Reduction Approved!</h1>
            <p className="text-gray-500 mb-6">
              {selected!.paidAmount > 0
                ? `Rs. ${approvedAmount?.toLocaleString()} will be refunded to your original payment method within 5–7 business days.`
                : `Your invoice balance has been reduced by Rs. ${approvedAmount?.toLocaleString()}.`}
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Booking ID</span><span className="font-mono font-semibold">{selected!.bookingId}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Reduction</span><span className="font-semibold text-green-600">Rs. {approvedAmount?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Invoice</span><span className="font-mono text-xs">{selected!.invoiceNumber}</span></div>
            </div>
            <button onClick={() => navigate('/payment')} className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200">
              Back to Payments
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Pending screen ────────────────────────────────────────────────────
  if (stage === 'pending-approval') {
    return (
      <div className="min-h-screen bg-gray-50">
        <DemoTopBar user={user} />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-yellow-100 p-4 rounded-full"><Clock className="w-14 h-14 text-yellow-500" /></div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Awaiting Admin Review</h2>
            <p className="text-gray-500 text-sm mb-6">
              Your request for a <span className="font-semibold">Rs. {parseFloat(requestedAmount).toLocaleString()}</span> reduction on booking <span className="font-semibold">{selected?.bookingId}</span> has been submitted.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Service</span><span className="font-semibold">{selected?.serviceType}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Requested reduction</span><span className="font-semibold text-green-600">Rs. {parseFloat(requestedAmount).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Reason</span><span className="font-medium">{reason}</span></div>
            </div>

            {/* Demo admin panel */}
            <div className="border-t border-gray-200 pt-5 mt-2">
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-semibold">Admin Action (Demo)</p>
              <div className="flex gap-3">
                <button onClick={handleAdminApprove} disabled={processing}
                  className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all ${processing ? 'bg-green-300' : 'bg-green-500 hover:bg-green-600'}`}>
                  {processing ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Approve'}
                </button>
                <button onClick={handleAdminReject} disabled={processing}
                  className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all ${processing ? 'bg-red-300' : 'bg-red-500 hover:bg-red-600'}`}>
                  Reject
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">In production, only admins see this panel.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main select + form ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <DemoTopBar user={user} />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-1">Request a Price Reduction</h1>
        <p className="text-gray-500 mb-8">Select an invoice and explain why you'd like a price adjustment</p>

        {isLoading ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">Loading your invoices...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No eligible invoices found. Only paid invoices can be adjusted.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {invoices.map(inv => {
              const isSelected = selected?._id === inv._id;
              return (
                <button key={inv._id} type="button" onClick={() => setSelected(isSelected ? null : inv)}
                  className={`w-full text-left rounded-xl p-5 border-2 transition-all ${isSelected ? 'border-purple-600 bg-purple-50 shadow-md' : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{inv.serviceType}</h3>
                      <p className="text-sm text-gray-500">{inv.date}</p>
                      <p className="text-xs text-gray-400 font-mono mt-1">{inv.bookingId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Invoice total</p>
                      <p className="text-xl font-bold text-gray-800">Rs. {inv.totalAmount.toLocaleString()}</p>
                      <p className="text-xs text-green-600 mt-1">Paid: Rs. {inv.paidAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  {isSelected && <div className="mt-3 flex items-center gap-2 text-purple-600"><CheckCircle className="w-4 h-4" /><span className="text-sm font-medium">Selected</span></div>}
                </button>
              );
            })}
          </div>
        )}

        {selected && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
            {/* Reason */}
            <div>
              <h2 className="font-semibold text-gray-800 mb-3">Reason for request</h2>
              <div className="space-y-2">
                {REASONS.map(r => (
                  <label key={r} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${reason === r ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="text-purple-600" />
                    <span className="text-sm text-gray-700">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <h2 className="font-semibold text-gray-800 mb-1">Requested reduction amount (Rs.)</h2>
              <p className="text-xs text-gray-400 mb-2">Max: Rs. {(selected.totalAmount - 1).toLocaleString()}</p>
              <input
                type="number"
                min={1}
                max={selected.totalAmount - 1}
                value={requestedAmount}
                onChange={e => validateAmount(e.target.value)}
                placeholder="e.g. 500"
                className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 ${amountError ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-purple-300'}`}
              />
              {amountError && <p className="text-xs text-red-500 mt-1">{amountError}</p>}
            </div>

            {/* Policy note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">Price Reduction Policy</p>
                <ul className="space-y-1 text-blue-600 list-disc ml-4">
                  <li>All requests are subject to admin review and approval</li>
                  <li>Approved reductions on paid invoices are refunded within 5–7 business days</li>
                  <li>For a full refund, please use the Refund page instead</li>
                </ul>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={!isValid || processing}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${!isValid || processing ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-md'}`}>
              {processing
                ? <span className="flex items-center justify-center gap-2"><RefreshCw className="w-5 h-5 animate-spin" /> Submitting...</span>
                : `Submit Request — Rs. ${parseFloat(requestedAmount || '0').toLocaleString()} reduction`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

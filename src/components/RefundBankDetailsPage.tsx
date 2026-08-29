import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Banknote, CheckCircle, XCircle, Loader, MapPin } from 'lucide-react';
import { tokenStorage } from '../utils/auth';
import type { User } from '../types';

const API_BASE_URL = 'http://localhost:4000/api';

// NEW — self-service replacement for the admin manually typing the
// customer's bank details into a browser prompt(). A customer whose cash-
// paid price reduction was approved gets emailed a link straight to this
// page (see sendBankDetailsRequestEmail in utils/emailService.js and
// approveReduction's cash branch in controllers/priceReductionController.js).
// Requires the customer to be logged in as the invoice's own owner (or an
// admin) — matches this app's existing convention for other customer-
// facing action pages rather than an unauthenticated token link.
//
// CHANGED (Tier 4.1, audit finding "In-person cash pickup option —
// missing"): this page used to go straight to the bank-details form — now
// it starts with a choice between bank transfer and in-person pickup (see
// refundMethod on models/PriceReduction.js), matching the spec's
// requirement that both be offered.

interface ReductionDetails {
  _id: string;
  status: string;
  approvedAmount?: number;
  requestedAmount: number;
  reason: string;
  refundMethod?: 'BANK_TRANSFER' | 'CASH_PICKUP' | null;
  pickupNotes?: string;
  bankDetails?: { accountHolder?: string; bankName?: string; accountNumber?: string; branch?: string };
  invoice?: { invoiceNumber?: string; customer?: { name?: string } };
}

interface RefundBankDetailsPageProps {
  user?: User;
}

const RefundBankDetailsPage = ({ user }: RefundBankDetailsPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [reduction, setReduction] = useState<ReductionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branch, setBranch] = useState('');
  // NEW (Tier 4.1) — null until the customer picks one of the two options.
  const [refundMethod, setRefundMethod] = useState<'BANK_TRANSFER' | 'CASH_PICKUP' | null>(null);
  const [pickupNotes, setPickupNotes] = useState('');

  const authHeader = () => {
    const tokens = tokenStorage.getTokens();
    return tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
  };

  useEffect(() => {
    if (!id) {
      setError('Invalid link.');
      setLoading(false);
      return;
    }
    fetchReduction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchReduction = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/price-reductions/${id}`, { headers: authHeader() });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.msg || 'Could not load this refund request.');
      }
      const data: ReductionDetails = await response.json();
      setReduction(data);
      // NEW (Tier 4.1) — already chosen (e.g. reopening the link after a
      // partial submission) — pre-select so the customer sees where they
      // left off instead of the choice screen again.
      if (data.refundMethod) {
        setRefundMethod(data.refundMethod);
      }
      if (data.bankDetails?.bankName) {
        // Already submitted — pre-fill so the customer can see/update.
        setAccountHolder(data.bankDetails.accountHolder || '');
        setBankName(data.bankDetails.bankName || '');
        setAccountNumber(data.bankDetails.accountNumber || '');
        setBranch(data.bankDetails.branch || '');
      }
      if (data.pickupNotes) {
        setPickupNotes(data.pickupNotes);
      }
    } catch (err: any) {
      setError(err.message || 'Could not load this refund request.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (refundMethod === 'BANK_TRANSFER' && (!accountHolder || !bankName || !accountNumber)) {
      setError('Account holder, bank name and account number are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      // NEW (Tier 4.1) — same endpoint, now carries which method was
      // chosen; pickup sends no bank fields at all.
      const body = refundMethod === 'CASH_PICKUP'
        ? { refundMethod: 'CASH_PICKUP', pickupNotes }
        : { refundMethod: 'BANK_TRANSFER', accountHolder, bankName, accountNumber, branch };
      const response = await fetch(`${API_BASE_URL}/price-reductions/${id}/bank-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Failed to submit your refund method.');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit your refund method.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading your refund request...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Log In</h2>
          <p className="text-gray-600 mb-4">
            Log in to the account this refund belongs to, then reopen the link from your email.
          </p>
        </div>
      </div>
    );
  }

  if (error && !reduction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Can't Load This Request</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => navigate('/my-bookings')} className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  if (reduction && reduction.status !== 'AWAITING_BANK_DETAILS') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Nothing Left To Do Here</h2>
          <p className="text-gray-600 mb-4">
            {reduction.status === 'APPROVED'
              ? 'This refund has already been completed.'
              : 'This request is no longer awaiting bank details.'}
          </p>
          <button onClick={() => navigate('/my-bookings')} className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {refundMethod === 'CASH_PICKUP' ? 'Pickup Confirmed' : 'Bank Details Submitted'}
          </h2>
          <p className="text-gray-600 mb-4">
            {refundMethod === 'CASH_PICKUP'
              ? "Thanks — our team will confirm when your cash refund is ready to collect in person."
              : "Thanks — our team will process your refund shortly and confirm once it's sent."}
          </p>
          <button onClick={() => navigate('/my-bookings')} className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const reductionSummary = reduction && (
    <div className="mb-6 p-4 bg-gray-50 rounded-md text-sm text-gray-600 space-y-1">
      <p><strong>Invoice:</strong> {reduction.invoice?.invoiceNumber || '—'}</p>
      <p><strong>Refund Amount:</strong> Rs. {(reduction.approvedAmount || 0).toLocaleString()}</p>
    </div>
  );

  // NEW (Tier 4.1, audit finding "In-person cash pickup option — missing")
  // — the choice screen. Shown first; picking either option reveals its
  // own short form below instead of assuming bank transfer.
  if (refundMethod === null) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <Banknote className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">How Would You Like Your Refund?</h1>
            <p className="text-gray-600 mt-2">Your invoice was paid in cash, so choose how we should get it back to you</p>
          </div>

          {reductionSummary}

          <div className="space-y-3">
            <button
              onClick={() => setRefundMethod('BANK_TRANSFER')}
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-start gap-3"
            >
              <Banknote className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Bank Transfer</p>
                <p className="text-sm text-gray-500">We'll send it directly to your bank account</p>
              </div>
            </button>
            <button
              onClick={() => setRefundMethod('CASH_PICKUP')}
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-start gap-3"
            >
              <MapPin className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">In-Person Pickup</p>
                <p className="text-sm text-gray-500">Collect your cash refund at our office — no bank details needed</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // NEW (Tier 4.1) — the pickup path's own short form (just an optional
  // note), replacing the bank-details form for this choice.
  if (refundMethod === 'CASH_PICKUP') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <MapPin className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">In-Person Pickup</h1>
            <p className="text-gray-600 mt-2">Come by our office to collect your cash refund</p>
          </div>

          {reductionSummary}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred day/time (optional)</label>
              <textarea
                value={pickupNotes}
                onChange={(e) => setPickupNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Weekday afternoons work best for me"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Confirming...
                </>
              ) : (
                'Confirm In-Person Pickup'
              )}
            </button>
            <button
              type="button"
              onClick={() => setRefundMethod(null)}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              ← Choose a different method
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <Banknote className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Submit Bank Details</h1>
          <p className="text-gray-600 mt-2">So we can send your price reduction refund via bank transfer</p>
        </div>

        {reductionSummary}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
            <input
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch (optional)</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {submitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Bank Details'
            )}
          </button>
          <button
            type="button"
            onClick={() => setRefundMethod(null)}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            ← Choose a different method
          </button>
        </form>
      </div>
    </div>
  );
};

export default RefundBankDetailsPage;

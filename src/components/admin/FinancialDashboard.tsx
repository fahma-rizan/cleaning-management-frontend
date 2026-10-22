import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { socket } from '../../socket';
import { toast } from 'sonner';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  CreditCard,
  Clock,
  Calendar,
  RefreshCw,
  XCircle,
  Eye,
  X,
  Mail,
  Loader,
  CheckSquare,
  FileText,
  TrendingDown,
} from 'lucide-react';
import { BarChart3, LineChart, PieChart } from 'lucide-react';
import type { User } from '../../types';
import DemoTopBar from '../DemoTopBar';
import { addNotification } from '../../utils/notificationUtils';
import { auditLogger, AUDIT_ACTIONS } from '../../utils/auditLogger';
import { tokenStorage, authApi } from '../../utils/auth';

import AdminSidebar from './AdminSidebar';

// Local currency formatting function
// FIX: this crashed the whole dashboard (blank/white page, no error message)
// whenever `amount` was undefined/null instead of a number — e.g.
// formatCurrency(refund.refundedAmount) in the Refunds & Credit Notes tab,
// for any Refund document missing that field. `undefined.toLocaleString()`
// throws a TypeError, and with no error boundary above this component the
// whole tree unmounts, leaving a white screen instead of a visible error.
// Now falls back to 0 instead of throwing.
const formatCurrency = (amount: number | null | undefined): string => {
  return `Rs. ${(Number(amount) || 0).toLocaleString()}`;
};

const API_BASE_URL = 'http://localhost:4000/api';

interface FinancialDashboardProps {
  user: User;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  mainCategories: string[];
  createdAt: string;
  bookingId?: string;
  paymentMethod?: string;
  // FIX: an Advance+Balance booking that's completed now has TWO invoice
  // documents — the original advance invoice and a linked "-BAL" settlement
  // invoice (routes/booking.js, createCompletionInvoice()). The original's
  // totalAmount is already the FULL order value; the -BAL invoice's
  // totalAmount is only the remaining portion. Summing totalAmount across
  // every invoice with no filter double-counted every completed
  // Advance+Balance order by ~180%. isBalanceInvoice marks which documents
  // to exclude from "order value" totals below — paidAmount/balanceAmount
  // don't need the same filter, since those never overlapped between the
  // two documents in the first place.
  isBalanceInvoice?: boolean;
  customer: {
    name: string;
    userId?: string;
  };
}

interface Refund {
  _id: string;
  invoice: {
    _id?: string;
    invoiceNumber: string;
    totalAmount: number;
    bookingId?: string;
    payherePaymentId?: string;
    customer?: { name: string; email: string };
  };
  refundedAmount: number;
  status: string;
  createdAt: string;
  reason: string;
  // NEW (Tier 3.2) — the payment gateway's own error message from the most
  // recent failed attempt (see models/Refund.js).
  failureReason?: string;
  refundDate?: string;
  paymentReference?: string;
}

// NEW (Tier 3.2) — the shape GET /api/refunds/details/:refundId actually
// returns (controllers/refundController.js's getRefundDetails), once its
// nested populate resolves invoice.bookingId and invoice.customer.userId
// into full documents instead of bare ObjectIds. A separate type from
// `Refund` (the flat-list shape from GET /api/refunds) rather than widening
// that one, since the list endpoint never populates this deeply.
interface RefundDetail extends Omit<Refund, 'invoice'> {
  invoice: Refund['invoice'] & {
    bookingId?: {
      bookingId?: string;
      serviceName?: string;
      serviceType?: string;
      date?: string;
      time?: string;
      address?: string;
      status?: string;
    };
  };
}

interface PriceReduction {
  _id: string;
  invoice: {
    _id?: string;
    invoiceNumber: string;
    totalAmount: number;
    paidAmount?: number;
    // Presence tells admin whether this invoice was paid online (PayHere,
    // refundable through the gateway) or in cash (no gateway — a manual
    // bank-transfer refund is needed instead). Used by handleApproveReduction
    // to decide whether to prompt for bank details.
    payherePaymentId?: string;
    customer?: { name: string; email: string };
    // NEW — the booking behind this invoice (now nested-populated by
    // getAllReductions, see controllers/priceReductionController.js), so
    // the detail view can show what the job actually was, not just the
    // invoice total.
    bookingId?: {
      bookingId?: string;
      serviceName?: string;
      serviceType?: string;
      date?: string;
      time?: string;
      address?: string;
      status?: string;
    };
  };
  requestedAmount: number;
  approvedAmount?: number;
  reason: string;
  status: string;
  createdAt: string;
  // FIX (task #19, A.8): these existed on the backend schema but the admin
  // UI never read or displayed any of them.
  photos?: { url: string; description?: string }[];
  staffAssigned?: { staffId?: string; staffName?: string; staffEmail?: string }[];
  bankDetailsRequested?: boolean;
  bankDetails?: { accountHolder?: string; bankName?: string; accountNumber?: string; branch?: string };
  manualRefundReason?: string;
  // NEW (Tier 4.1, audit finding "In-person cash pickup option — missing")
  // — see the matching fields on models/PriceReduction.js.
  refundMethod?: 'BANK_TRANSFER' | 'CASH_PICKUP' | null;
  pickupNotes?: string;
  pickupConfirmedAt?: string;
}

// NEW (Tier 4.1) — a cash reduction is "ready to complete" once the
// customer has responded at all: chosen pickup (no bank details needed),
// or chosen/defaulted to bank transfer AND actually submitted real bank
// details. Centralized here since it's checked in 3 places below (the tab
// badge, the card list, and the modal) and the pickup case would otherwise
// need adding to each independently.
const isReductionReadyToComplete = (r: PriceReduction): boolean =>
  r.status === 'AWAITING_BANK_DETAILS' && (r.refundMethod === 'CASH_PICKUP' || !!r.bankDetails?.bankName);

type DashboardTab = 'invoices' | 'refunds' | 'price-reductions';

export default function FinancialDashboard({ user }: FinancialDashboardProps) {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [priceReductions, setPriceReductions] = useState<PriceReduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [refundProcessingId, setRefundProcessingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null);
  const [approvingInvoiceId, setApprovingInvoiceId] = useState<string | null>(null);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  // NEW: reads ?tab= so a direct link (e.g. the sidebar's "Refunds" item,
  // now pointed at /admin/financial-dashboard?tab=refunds since the
  // standalone /refund request page was retired) opens straight into that
  // tab instead of always landing on Invoices.
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as DashboardTab) || 'invoices';
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (requestedTab === 'invoices' || requestedTab === 'refunds' || requestedTab === 'price-reductions') {
      setActiveTab(requestedTab);
    }
  }, [searchParams]);
  const [reductionProcessingId, setReductionProcessingId] = useState<string | null>(null);
  // NEW — the price reduction currently open in the detail modal (see the
  // Price Reductions tab below). Approving/rejecting straight from the
  // flat list is replaced with "open the full detail, then decide."
  const [viewingReduction, setViewingReduction] = useState<PriceReduction | null>(null);
  // NEW (Tier 3.2, audit finding "Refund detail modal — missing") — same
  // click-through pattern as Price Reductions above, backed by the
  // GET /api/refunds/details/:refundId route that already existed but the
  // frontend never called.
  const [viewingRefund, setViewingRefund] = useState<RefundDetail | null>(null);
  const [loadingRefundDetail, setLoadingRefundDetail] = useState(false);

  const handleLogout = async () => {
    await authApi.logout();
    // NOTE: this project has no /login route in this snapshot — falling
    // back to '/' (which redirects to the financial dashboard) rather than
    // a route that doesn't exist. Point this at your real login route once
    // one exists.
    navigate('/');
  };

  const fetchInvoices = async () => {
    try {
      const tokens = tokenStorage.getTokens();
      const authHeader = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
      const response = await fetch(`${API_BASE_URL}/invoices`, { headers: authHeader });
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoices(data);
      // Count DRAFT invoices needing approval
      setPendingApprovalCount(data.filter((inv: Invoice) => inv.status === 'DRAFT').length);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRefunds = async () => {
    try {
      const tokens = tokenStorage.getTokens();
      const authHeader = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
      const response = await fetch(`${API_BASE_URL}/refunds`, { headers: authHeader });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Failed to fetch refunds (HTTP ${response.status}${detail ? `: ${detail}` : ''})`);
      }
      const data = await response.json();
      setRefunds(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchPriceReductions = async () => {
    try {
      const tokens = tokenStorage.getTokens();
      const authHeader = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
      const response = await fetch(`${API_BASE_URL}/price-reductions`, { headers: authHeader });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Failed to fetch price reductions (HTTP ${response.status}${detail ? `: ${detail}` : ''})`);
      }
      const data = await response.json();
      setPriceReductions(data);
    } catch (err: any) {
      console.error('Failed to fetch price reductions:', err.message);
    }
  };

  // Approve a pending price reduction request (admin)
  const handleApproveReduction = async (reduction: PriceReduction) => {
    const { _id: reductionId, requestedAmount } = reduction;
    const amtStr = prompt(`Approve price reduction. Enter approved amount (requested: Rs. ${requestedAmount}):`, String(requestedAmount));
    if (!amtStr) return;
    const approvedAmount = parseFloat(amtStr);
    if (isNaN(approvedAmount) || approvedAmount <= 0) { toast.error('Invalid amount.'); return; }

    // CHANGED: the admin no longer hand-types the customer's bank details
    // via a chain of prompt()s here. If the original payment was cash, the
    // backend now moves the reduction to AWAITING_BANK_DETAILS and emails
    // the customer a self-service link to submit their own bank details —
    // see the "Complete Refund" action in the detail modal below, which
    // appears once those details are in.
    setReductionProcessingId(reductionId);
    try {
      const tokens = tokenStorage.getTokens();
      const authHeader = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
      const response = await fetch(`${API_BASE_URL}/price-reductions/approve/${reductionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ approvedAmount }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to approve price reduction.');
      }
      toast.success(
        data.reduction?.status === 'AWAITING_BANK_DETAILS'
          // FIX (Tier 4.1): the customer is now offered a choice (bank
          // transfer or in-person pickup), not only bank details.
          ? 'Approved — customer has been emailed to choose a refund method.'
          : 'Price reduction approved successfully.'
      );
      fetchPriceReductions();
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve price reduction.');
    } finally {
      setReductionProcessingId(null);
    }
  };

  // NEW — the second half of the cash-refund flow: once the customer has
  // submitted their bank details (reduction.status === 'AWAITING_BANK_DETAILS'
  // with bankDetails populated), the admin clicks this to actually send the
  // money and finalize the refund.
  const handleCompleteRefund = async (reductionId: string) => {
    if (!window.confirm('Confirm the bank transfer has been sent and complete this refund? This cannot be undone.')) return;
    setReductionProcessingId(reductionId);
    try {
      const tokens = tokenStorage.getTokens();
      const authHeader = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
      const response = await fetch(`${API_BASE_URL}/price-reductions/${reductionId}/complete-refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.msg || 'Failed to complete refund.');
      }
      toast.success('Refund completed and recorded.');
      fetchPriceReductions();
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete refund.');
    } finally {
      setReductionProcessingId(null);
    }
  };

  // Reject a pending price reduction request (admin)
  const handleRejectReduction = async (reductionId: string) => {
    const reason = prompt('Reason for rejecting this price reduction request:');
    if (!reason) return;
    setReductionProcessingId(reductionId);
    try {
      const tokens = tokenStorage.getTokens();
      const authHeader = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
      const response = await fetch(`${API_BASE_URL}/price-reductions/reject/${reductionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.msg || 'Failed to reject price reduction.');
      }
      toast.success('Price reduction request rejected.');
      fetchPriceReductions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject price reduction.');
    } finally {
      setReductionProcessingId(null);
    }
  };


  // Admin approves a pending refund request — calls PayHere for online
  // payments, or records a manual cash refund directly.
  // NEW (Tier 3.2): `isRetry` only changes the confirm/success copy — a
  // retry hits the exact same POST /refunds/approve/:refundId endpoint,
  // since approveRefund never actually gated on the refund's current status
  // in the first place (it just re-runs the gateway call). See
  // handleRetryRefund below.
  const handleApproveRefund = async (refundId: string, isRetry = false) => {
    if (!window.confirm(isRetry ? 'Retry this refund? It will be sent to the payment gateway again.' : 'Approve this refund? This cannot be undone.')) return;
    setRefundProcessingId(refundId);
    try {
      const tokens = tokenStorage.getTokens();
      const authHeader = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
      const response = await fetch(`${API_BASE_URL}/refunds/approve/${refundId}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body:    JSON.stringify({}),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.msg || (isRetry ? 'Retry failed — still failing at the payment gateway.' : 'Failed to approve refund.'));
      }
      toast.success(isRetry ? 'Refund retried and processed successfully.' : 'Refund approved successfully.');
      fetchRefunds();
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve refund.');
    } finally {
      setRefundProcessingId(null);
    }
  };

  // NEW (Tier 3.2, audit finding "Gateway failure ... no re-surfacing for
  // other admins") — a thin wrapper so a FAILED refund's Retry button reads
  // clearly at the call site while sharing all of handleApproveRefund's
  // actual logic (and its refundProcessingId spinner state).
  const handleRetryRefund = (refundId: string) => handleApproveRefund(refundId, true);

  // NEW (Tier 3.2, audit finding "Refund detail modal — missing") — the
  // backend route (GET /api/refunds/details/:refundId) already existed;
  // nothing in the frontend ever called it. Mirrors handleApproveReduction/
  // setViewingReduction's click-through pattern for Price Reductions.
  const handleViewRefund = async (refundId: string) => {
    setLoadingRefundDetail(true);
    try {
      const tokens = tokenStorage.getTokens();
      const authHeader = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
      const response = await fetch(`${API_BASE_URL}/refunds/details/${refundId}`, { headers: authHeader });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.msg || 'Failed to load refund details.');
      }
      const data: RefundDetail = await response.json();
      setViewingRefund(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load refund details.');
    } finally {
      setLoadingRefundDetail(false);
    }
  };

  // Admin rejects a pending refund request
  const handleRejectRefund = async (refundId: string) => {
    const reason = prompt('Reason for rejecting this refund request:');
    if (!reason) return;
    setRefundProcessingId(refundId);
    try {
      const tokens = tokenStorage.getTokens();
      const authHeader = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
      const response = await fetch(`${API_BASE_URL}/refunds/reject/${refundId}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body:    JSON.stringify({ reason }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.msg || 'Failed to reject refund.');
      }
      toast.success('Refund request rejected.');
      fetchRefunds();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject refund.');
    } finally {
      setRefundProcessingId(null);
    }
  };

  const handleNewInvoice = (newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const handleRefundUpdate = (updatedRefund: Refund) => {
    setRefunds((prev) =>
      prev.map((refund) => (refund._id === updatedRefund._id ? updatedRefund : refund))
    );
  };

  // Send invoice email to customer
  const handleSendInvoice = async (invoice: Invoice) => {
    if (sendingInvoiceId) return;
    setSendingInvoiceId(invoice._id);
    try {
      const tokens = tokenStorage.getTokens();
      const authHeader = tokens?.accessToken
        ? { Authorization: `Bearer ${tokens.accessToken}` } : {};

      const response = await fetch(
        `${API_BASE_URL}/invoices/${invoice.invoiceNumber}/send-email`,
        { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader } }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.msg || 'Failed to send invoice email.');
      }
      alert(`Invoice #${invoice.invoiceNumber} sent to ${invoice.customer.name}.`);
    } catch (error: any) {
      console.error('Error sending invoice email:', error);
      alert('Failed to send invoice email: ' + error.message);
    } finally {
      setSendingInvoiceId(null);
    }
  };

  // Approve a DRAFT invoice — changes status to SENT and emails customer
  const handleApproveInvoice = async (invoice: Invoice) => {
    if (approvingInvoiceId) return;
    if (!window.confirm(`Approve invoice #${invoice.invoiceNumber} for ${invoice.customer.name}?\n\nThis will send the invoice email to the customer immediately.`)) return;
    setApprovingInvoiceId(invoice._id);
    try {
      const tokens = tokenStorage.getTokens();
      const authHeader = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
      const response = await fetch(`${API_BASE_URL}/invoices/${invoice._id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.msg || 'Failed to approve invoice.');
      }
      // Update local state — change DRAFT → SENT
      setInvoices(prev => prev.map(inv =>
        inv._id === invoice._id ? { ...inv, status: 'SENT' } : inv
      ));
      setPendingApprovalCount(prev => Math.max(0, prev - 1));
      alert(`Invoice #${invoice.invoiceNumber} approved and sent to ${invoice.customer.name}.`);
    } catch (error: any) {
      console.error('Error approving invoice:', error);
      alert('Failed to approve invoice: ' + error.message);
    } finally {
      setApprovingInvoiceId(null);
    }
  };

  const handleCancelBooking = async (invoice: Invoice) => {
    if (invoice.paidAmount === 0) {
      alert('Cannot cancel booking with no payment.');
      return;
    }

    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      // First, update invoice status to CANCELLED
      const statusResponse = await fetch(`${API_BASE_URL}/invoices/${invoice.invoiceNumber}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to cancel booking');
      }

      // Then, automatically create a refund request
      const refundResponse = await fetch(`${API_BASE_URL}/refunds/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice._id,
          reason: `Admin cancellation: ${reason}`,
        }),
      });

      if (!refundResponse.ok) {
        throw new Error('Failed to create refund request');
      }

      // Update the invoice in the local state
      setInvoices((prev) =>
        prev.map((inv) =>
          inv._id === invoice._id ? { ...inv, status: 'CANCELLED' } : inv
        )
      );

      // Log audit event
      await auditLogger.logAdminAction(
        AUDIT_ACTIONS.BOOKING_CANCEL,
        'invoice',
        invoice._id,
        {
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.paidAmount,
          reason: `Admin cancellation: ${reason}`,
          customerId: invoice.customer.userId,
        }
      );

      alert('Booking cancelled and refund request created automatically.');
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking: ' + error.message);
    }
  };

  const handleRequestReschedule = async (invoice: Invoice) => {
    const reason = prompt('Please provide a reason for reschedule request:');
    if (!reason) return;
    try {
      const tokens = tokenStorage.getTokens();
      const authHeader = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
      const response = await fetch(`${API_BASE_URL}/bookings/${invoice.bookingId}/request-reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error('Failed to send reschedule request');
      alert('Reschedule request sent to customer.');
    } catch (error: any) {
      alert('Failed to send reschedule request: ' + error.message);
    }
  };

  const handleRequestCancel = async (invoice: Invoice) => {
    const reason = prompt('Please provide a reason for cancel request:');
    if (!reason) return;
    try {
      const tokens = tokenStorage.getTokens();
      const authHeader = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
      const response = await fetch(`${API_BASE_URL}/bookings/${invoice.bookingId}/request-cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error('Failed to send cancel request');
      alert('Cancel request sent to customer.');
    } catch (error: any) {
      alert('Failed to send cancel request: ' + error.message);
    }
  };

  const handleServiceCompletion = async (invoice: Invoice) => {
    try {
      const userId = invoice.customer.userId || 'user-001'; // Fallback for demo
      const bookingId = invoice.bookingId || invoice.invoiceNumber;

      // 1. Send worker arrival notification
      await addNotification({
        userId: userId,
        type: 'worker-arrival',
        title: 'Service Completed! ✅',
        message: `Your cleaning service has been completed successfully for booking ${bookingId}.`,
        bookingId: bookingId,
      });

      // 2. Send payment link based on payment method
      if (invoice.balanceAmount > 0) {
        if (invoice.paymentMethod?.toLowerCase().includes('advance') || invoice.status === 'PARTIAL') {
          // Send balance payment link for advance payments
          await addNotification({
            userId: userId,
            type: 'payment',
            title: 'Balance Payment Required 💳',
            message: `Your service is complete! Please pay the remaining balance of Rs. ${invoice.balanceAmount.toLocaleString()}. Click here to pay: /balance-payment?invoiceId=${invoice._id}`,
            bookingId: bookingId,
            actionUrl: `/balance-payment?invoiceId=${invoice._id}`,
          });
        } else if (invoice.paymentMethod?.toLowerCase().includes('after completion') || invoice.paidAmount === 0) {
          // Send full payment link for pay-after-completion
          await addNotification({
            userId: userId,
            type: 'payment',
            title: 'Payment Required 💳',
            message: `Your service is complete! Please pay Rs. ${invoice.totalAmount.toLocaleString()}. Click here to pay: /balance-payment?invoiceId=${invoice._id}`,
            bookingId: bookingId,
            actionUrl: `/balance-payment?invoiceId=${invoice._id}`,
          });
        }
      }

      // Log audit event for service completion
      await auditLogger.logAdminAction(
        AUDIT_ACTIONS.BOOKING_COMPLETE,
        'invoice',
        invoice._id,
        {
          invoiceNumber: invoice.invoiceNumber,
          paymentMethod: invoice.paymentMethod,
          balanceAmount: invoice.balanceAmount,
          totalAmount: invoice.totalAmount,
          customerId: invoice.customer.userId,
        }
      );

      alert('Service completion notification and payment link sent to customer.');
    } catch (error: any) {
      console.error('Error sending service completion notifications:', error);
      alert('Failed to send notifications: ' + error.message);
    }
  };

  const handleTrackingUpdate = async (invoice: Invoice) => {
    try {
      await addNotification({
        userId: invoice.customer.userId || 'user-001', // Fallback for demo
        type: 'tracking-update',
        title: 'Cleaner Location Update 📍',
        message: `Your cleaner is on the way to ${invoice.customer.address || 'your location'} for booking ${invoice.bookingId || invoice.invoiceNumber}. Expected arrival in 15 minutes.`,
        bookingId: invoice.bookingId || invoice.invoiceNumber,
      });

      alert('Tracking update notification sent to customer.');
    } catch (error: any) {
      console.error('Error sending tracking update notification:', error);
      alert('Failed to send notification: ' + error.message);
    }
  };

  // NEW (Tier 3.1) — extracted so the merged Advance+Balance row (see
  // groupedInvoiceRows above) can render this exact same action bar twice,
  // once per underlying invoice document, instead of duplicating ~80 lines
  // of JSX inline. Behavior is byte-for-byte identical to before extraction.
  const renderInvoiceActions = (invoice: Invoice) => (
    <div className="flex items-center gap-2">
      {/* View invoice — navigate to full formatted A4 view */}
      <button
        onClick={() => navigate(`/staff-invoice/${invoice.invoiceNumber}`)}
        className="text-purple-600 hover:text-purple-900"
        title="View invoice"
      >
        <Eye className="w-4 h-4" />
      </button>

      {/* Approve button — only for DRAFT invoices */}
      {invoice.status === 'DRAFT' && (
        <button
          onClick={() => handleApproveInvoice(invoice)}
          disabled={approvingInvoiceId === invoice._id}
          className="text-emerald-600 hover:text-emerald-800 disabled:text-emerald-300 font-medium"
          title="Approve invoice and send to customer"
        >
          {approvingInvoiceId === invoice._id
            ? <Loader className="w-4 h-4 animate-spin" />
            : <CheckSquare className="w-4 h-4" />}
        </button>
      )}

      {/* Send Invoice email to customer */}
      <button
        onClick={() => handleSendInvoice(invoice)}
        disabled={sendingInvoiceId === invoice._id}
        className="text-blue-600 hover:text-blue-900 disabled:text-blue-300"
        title="Send invoice email to customer"
      >
        {sendingInvoiceId === invoice._id
          ? <Loader className="w-4 h-4 animate-spin" />
          : <Mail className="w-4 h-4" />}
      </button>
      <button
        onClick={() => handleRequestReschedule(invoice)}
        className="text-orange-600 hover:text-orange-900"
        title="Request reschedule from customer"
      >
        <Calendar className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleRequestCancel(invoice)}
        className="text-yellow-600 hover:text-yellow-900"
        title="Request cancellation from customer"
      >
        <XCircle className="w-4 h-4" />
      </button>
      {(invoice.status === 'PAID' || invoice.status === 'PARTIAL') && (
        <>
          <button
            onClick={() => handleCancelBooking(invoice)}
            className="text-red-600 hover:text-red-900"
            title="Cancel booking and create refund"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleServiceCompletion(invoice)}
            className="text-green-600 hover:text-green-900"
            title="Mark service as completed and send payment link"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleTrackingUpdate(invoice)}
            className="text-blue-600 hover:text-blue-900"
            title="Send tracking update"
          >
            <TrendingUp className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );

  useEffect(() => {
    // Connect to socket server
    socket.connect();

    // Listen for real-time invoice updates
    socket.on('newInvoice', handleNewInvoice);
    socket.on('refundUpdate', handleRefundUpdate);

    // Listen for DRAFT invoices needing admin approval (real-time badge + list update)
    socket.on('invoiceApprovalNeeded', (data: any) => {
      setPendingApprovalCount(prev => prev + 1);
      setInvoices(prev => [{
        _id:           data.invoiceId,
        invoiceNumber: data.invoiceNumber,
        totalAmount:   data.totalAmount,
        paidAmount:    0,
        balanceAmount: data.totalAmount,
        status:        'DRAFT',
        mainCategories: [],
        createdAt:     new Date().toISOString(),
        customer:      { name: data.customerName },
      } as Invoice, ...prev]);
    });

    // Listen for invoice status changes (e.g. another admin approved)
    socket.on('invoiceUpdate', (updated: Invoice) => {
      setInvoices(prev => prev.map(inv =>
        inv._id === updated._id ? { ...inv, status: updated.status } : inv
      ));
    });

    // Initial data load
    fetchInvoices();
    fetchRefunds();
    fetchPriceReductions();

    return () => {
      socket.off('newInvoice', handleNewInvoice);
      socket.off('refundUpdate', handleRefundUpdate);
      socket.off('invoiceApprovalNeeded');
      socket.off('invoiceUpdate');
      socket.disconnect();
    };
  }, []);

  // Refunds awaiting admin action — drives the pending-review panel below
  const pendingRefunds = useMemo(
    () => refunds.filter(r => r.status === 'PENDING'),
    [refunds]
  );

  const filteredInvoices = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let filtered = invoices;

    // 1. Date Filter
    switch (filter) {
      case 'today':
        filtered = filtered.filter((inv) => new Date(inv.createdAt) >= startOfDay);
        break;
      case 'week':
        filtered = filtered.filter((inv) => new Date(inv.createdAt) >= startOfWeek);
        break;
      case 'month':
        filtered = filtered.filter((inv) => new Date(inv.createdAt) >= startOfMonth);
        break;
    }

    // 2. Category Filter (Inclusive)
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter((inv) =>
        inv.mainCategories && inv.mainCategories.includes(categoryFilter)
      );
    }

    return filtered;
  }, [invoices, filter, categoryFilter]);

  // NEW (Tier 3.1, audit finding "Display grouping — half done") —
  // PaymentReportExport.tsx already merges an Advance+Balance booking's two
  // invoice documents (the original advance invoice + its linked -BAL
  // settlement invoice) into one row; this table never got the same
  // treatment, so the same booking still shows up as two separate,
  // seemingly-unrelated rows here. Unlike that report — which is read-only
  // with no per-row actions — every row in this table drives real
  // per-invoice actions (Approve, Send, Cancel, Reschedule, ...), so merging
  // only changes what the Invoice/Customer/Amount/Status/Date columns
  // DISPLAY; the Action column still renders a full, independent action bar
  // for each underlying invoice document (labeled Advance/Balance), so
  // nothing an admin could previously do is lost or ambiguous about which
  // invoice it applies to.
  const groupedInvoiceRows = useMemo(() => {
    const byBooking = new Map<string, Invoice[]>();
    filteredInvoices.forEach((inv) => {
      const key = inv.bookingId || inv._id;
      if (!byBooking.has(key)) byBooking.set(key, []);
      byBooking.get(key)!.push(inv);
    });

    type Row =
      | { merged: false; invoice: Invoice }
      | { merged: true; bookingId: string; advance: Invoice; balance: Invoice };

    const rows: Row[] = [];
    byBooking.forEach((group, key) => {
      const balanceLeg = group.find((inv) => inv.isBalanceInvoice);
      const advanceLeg = group.find((inv) => !inv.isBalanceInvoice);
      if (group.length === 2 && balanceLeg && advanceLeg) {
        rows.push({ merged: true, bookingId: key, advance: advanceLeg, balance: balanceLeg });
      } else {
        group.forEach((invoice) => rows.push({ merged: false, invoice }));
      }
    });

    // `invoices` comes back newest-first from the API (sort({createdAt:-1})
    // in invoiceController.js's getAllInvoices) — re-sort explicitly by each
    // row's most recent leg so grouping can't change that ordering.
    rows.sort((a, b) => {
      const aDate = a.merged ? Math.max(new Date(a.advance.createdAt).getTime(), new Date(a.balance.createdAt).getTime()) : new Date(a.invoice.createdAt).getTime();
      const bDate = b.merged ? Math.max(new Date(b.advance.createdAt).getTime(), new Date(b.balance.createdAt).getTime()) : new Date(b.invoice.createdAt).getTime();
      return bDate - aDate;
    });

    return rows;
  }, [filteredInvoices]);

  const metrics = useMemo(() => {
    const totalInvoices = filteredInvoices.length;
    // FIX: exclude -BAL settlement invoices from order-value totals — see
    // the isBalanceInvoice comment on the Invoice interface above. Without
    // this, a completed Advance+Balance booking's order value was counted
    // twice (its original invoice's totalAmount is already the full price;
    // the linked -BAL invoice's totalAmount is the remaining portion on
    // top of that). paidAmount/balanceAmount are summed across ALL
    // invoices unfiltered — those two documents' amounts never overlap.
    const totalAmount = filteredInvoices
      .filter((inv) => !inv.isBalanceInvoice)
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = filteredInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalBalance = filteredInvoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);
    const paidInvoices = filteredInvoices.filter((inv) => inv.status === 'PAID').length;

    // Only count APPROVED refunds against revenue
    const approvedRefundedAmount = refunds
      .filter(r => r.status === 'APPROVED')
      .reduce((sum, ref) => sum + ref.refundedAmount, 0);

    // Only count APPROVED price reductions against revenue
    const approvedReductionAmount = priceReductions
      .filter(r => r.status === 'APPROVED')
      .reduce((sum, r) => sum + (r.approvedAmount || 0), 0);

    // Net revenue = total invoiced - approved refunds - approved price reductions
    const netRevenue = Math.max(0, totalAmount - approvedRefundedAmount - approvedReductionAmount);

    const totalRefundsCount = refunds.filter(r => r.status === 'APPROVED').length;
    const pendingRefundCount = refunds.filter(r => r.status === 'PENDING').length;
    // NEW (Tier 3.2) — surfaced as its own red badge on the tab (see below)
    // so a gateway failure is visible to any admin loading the dashboard,
    // not just the one who happened to be looking when it failed.
    const failedRefundCount = refunds.filter(r => r.status === 'FAILED').length;

    return {
      totalInvoices,
      totalAmount,
      netRevenue,
      totalPaid,
      totalBalance,
      paidInvoices,
      approvedRefundedAmount,
      approvedReductionAmount,
      totalRefundsCount,
      pendingRefundCount,
      failedRefundCount,
    };
  }, [filteredInvoices, refunds, priceReductions]);

  const statusBreakdown = useMemo(() => {
    return filteredInvoices.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredInvoices]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar user={user} onLogout={handleLogout} />
        <div className="ml-64">
          <DemoTopBar user={user} />
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[80vh]">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-purple-300 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600 font-medium">Loading financial data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar user={user} onLogout={handleLogout} />
        <div className="ml-64">
          <DemoTopBar user={user} />
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[80vh]">
              <div className="text-center">
                <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-600 font-semibold mb-2">Error Loading Data</p>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => {
                    setLoading(true);
                    fetchInvoices();
                    fetchRefunds();
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar user={user} onLogout={handleLogout} />
      <div className="ml-64">
      <DemoTopBar user={user} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">

          {/* Pending approval banner — shown when DRAFT invoices need review */}
          {pendingApprovalCount > 0 && (
            <div className="mb-6 flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
              <CheckSquare className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800">
                  {pendingApprovalCount} invoice{pendingApprovalCount > 1 ? 's' : ''} waiting for your approval
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Staff-created invoices are held as DRAFT until you approve them. Approved invoices are emailed to the customer automatically.
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/financial-dashboard?tab=invoices')}
                className="text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                Review Now
              </button>
            </div>
          )}

          {/* Pending refunds banner — shown when customers have requested refunds */}
          {pendingRefunds.length > 0 && (
            <div className="mb-6 flex items-center gap-4 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
              <RefreshCw className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">
                  {pendingRefunds.length} refund request{pendingRefunds.length > 1 ? 's' : ''} awaiting your review
                </p>
                <p className="text-xs text-red-600 mt-0.5">
                  Customers are waiting — review and approve or reject below.
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/refunds')}
                className="text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                Review Now
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
              <p className="text-gray-600 mt-1">Overview of all financial transactions</p>
            </div>            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('today')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'today'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setFilter('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'week'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setFilter('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'month'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                This Month
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-sm font-medium text-gray-700">Filter by Category:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'ALL', label: 'All Services' },
                { id: 'LND', label: 'Laundry' },
                { id: 'CUR', label: 'Curtain Cleaning' },
                { id: 'SVC', label: 'Shampoo Vacuum' },
                { id: 'HOC', label: 'Home/Office' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    categoryFilter === cat.id
                      ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Key Metrics — 4 cards: Total Invoices, Net Revenue, Total Paid, Total Refunded */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Invoices</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{metrics.totalInvoices}</h3>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Net Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(metrics.netRevenue)}
                  </h3>
                  {(metrics.approvedRefundedAmount > 0 || metrics.approvedReductionAmount > 0) && (
                    <p className="text-xs text-gray-400 mt-1">
                      Gross: {formatCurrency(metrics.totalAmount)}
                      {metrics.approvedRefundedAmount > 0 && ` − Refunds: ${formatCurrency(metrics.approvedRefundedAmount)}`}
                      {metrics.approvedReductionAmount > 0 && ` − Reductions: ${formatCurrency(metrics.approvedReductionAmount)}`}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Collected</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(metrics.totalPaid)}
                  </h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Refunded</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(metrics.approvedRefundedAmount)}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {metrics.totalRefundsCount} approved · {metrics.pendingRefundCount} pending
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Status + Deductions Summary Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Invoice Status</h2>
              <div className="space-y-2">
                {Object.entries(statusBreakdown).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 capitalize">{status.toLowerCase()}</span>
                    <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Refund Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Approved Refunds</span><span className="font-semibold text-green-700">{metrics.totalRefundsCount}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Pending Refunds</span><span className="font-semibold text-amber-700">{metrics.pendingRefundCount}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Total Refunded</span><span className="font-semibold text-red-600">{formatCurrency(metrics.approvedRefundedAmount)}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Price Reductions</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Approved</span><span className="font-semibold text-green-700">{priceReductions.filter(r => r.status === 'APPROVED').length}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Pending</span><span className="font-semibold text-amber-700">{priceReductions.filter(r => r.status === 'PENDING').length}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Total Deducted</span><span className="font-semibold text-orange-600">{formatCurrency(metrics.approvedReductionAmount)}</span></div>
              </div>
            </div>
          </div>

          {/* 3-Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm mb-0 overflow-hidden">
            <div className="flex border-b border-gray-200">
              {([
                { id: 'invoices' as DashboardTab, label: '📄 All Invoices', badge: metrics.totalInvoices },
                { id: 'refunds' as DashboardTab, label: '🔄 Refunds & Credit Notes', badge: refunds.length, badgeRed: metrics.pendingRefundCount > 0 || metrics.failedRefundCount > 0 },
                { id: 'price-reductions' as DashboardTab, label: '📉 Price Reductions', badge: priceReductions.length, badgeRed: priceReductions.filter(r => r.status === 'PENDING').length > 0 },
              ] as Array<{ id: DashboardTab; label: string; badge: number; badgeRed?: boolean }>).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-purple-600 text-purple-700 bg-purple-50'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab.badgeRed ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab: All Invoices */}
            {activeTab === 'invoices' && (
              <div id="invoices-panel" className="p-6">
                <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedInvoiceRows.slice(0, 10).map((row) => {
                    // NEW (Tier 3.1) — a merged Advance+Balance row. Same
                    // grouping PaymentReportExport.tsx does, adapted to keep
                    // this table's per-invoice actions fully intact (see
                    // renderInvoiceActions above and the comment on
                    // groupedInvoiceRows).
                    if (row.merged) {
                      const { advance, balance } = row;
                      const bothPaid = advance.status === 'PAID' && balance.status === 'PAID';
                      const combinedAmount = advance.totalAmount; // full order value already lives on the advance leg — see the Invoice interface's isBalanceInvoice comment
                      return (
                        <tr key={row.bookingId} className="align-top">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            <div>{advance.invoiceNumber}</div>
                            <div className="text-gray-400">{balance.invoiceNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {advance.customer.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatCurrency(combinedAmount)}
                            <div className="mt-1 space-y-0.5 text-xs">
                              <div className="text-gray-500">Advance: {formatCurrency(advance.paidAmount)} ({advance.status})</div>
                              <div className="text-gray-500">Balance: {formatCurrency(balance.paidAmount || balance.balanceAmount)} ({balance.status})</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                bothPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {bothPaid ? 'PAID' : 'PARTIAL'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(advance.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            <div className="space-y-2">
                              <div>
                                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Advance</div>
                                {renderInvoiceActions(advance)}
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Balance</div>
                                {renderInvoiceActions(balance)}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    const invoice = row.invoice;
                    return (
                    <tr key={invoice._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {invoice.customer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatCurrency(invoice.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            invoice.status === 'PAID'
                              ? 'bg-green-100 text-green-800'
                              : invoice.status === 'PARTIAL'
                              ? 'bg-yellow-100 text-yellow-800'
                              : invoice.status === 'DRAFT'
                              ? 'bg-amber-100 text-amber-800'
                              : invoice.status === 'SENT'
                              ? 'bg-blue-100 text-blue-800'
                              /* NEW (Tier 3.3) — 'UNPAID' invoices (Pay-
                                 After-Completion at generation, and now
                                 unsettled balance invoices too — see the
                                 'SENT'→'UNPAID' fix) previously fell into
                                 the generic gray bucket below; give them the
                                 same orange "money is owed" treatment
                                 PaymentReportExport.tsx already uses. */
                              : invoice.status === 'UNPAID'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {renderInvoiceActions(invoice)}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
                </div>
              </div>
            )}

            {/* Tab: Refunds & Credit Notes */}
            {activeTab === 'refunds' && (
              <div id="pending-refunds-panel" className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  Refunds & Credit Notes
                  {metrics.pendingRefundCount > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{metrics.pendingRefundCount} pending</span>
                  )}
                  {/* NEW (Tier 3.2) — a gateway failure no longer only
                      flashes once for the admin who clicked Approve; it
                      stays flagged here for whoever opens this tab next. */}
                  {metrics.failedRefundCount > 0 && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{metrics.failedRefundCount} failed — needs retry</span>
                  )}
                  {loadingRefundDetail && <Loader className="w-4 h-4 animate-spin text-gray-400" />}
                </h2>
                {refunds.length === 0 ? (
                  <p className="text-gray-400 text-center py-10">No refunds found.</p>
                ) : (
                  <div className="space-y-3">
                    {/* CHANGED (Tier 3.2, audit finding "Refund detail modal
                        — missing") — every card is now a click-through into
                        the full detail modal below, same pattern as Price
                        Reductions: booking info, payment reference, and (for
                        a FAILED refund) the gateway's own error message all
                        live there instead of nowhere. Approve/Reject/Retry
                        moved into the modal too, so there's one place to
                        both see the full picture and act on it. */}
                    {refunds.map(refund => {
                      const creditNoteNumber = refund.status === 'APPROVED'
                        ? `CN-${refund.invoice?.invoiceNumber || refund._id.slice(-8).toUpperCase()}`
                        : null;
                      return (
                        <button
                          key={refund._id}
                          onClick={() => handleViewRefund(refund._id)}
                          className={`w-full text-left border rounded-xl p-4 flex flex-wrap items-start gap-4 hover:shadow-sm transition-shadow ${
                            refund.status === 'PENDING' ? 'border-amber-200 bg-amber-50' :
                            refund.status === 'APPROVED' ? 'border-green-200 bg-green-50' :
                            refund.status === 'FAILED' ? 'border-red-200 bg-red-50' :
                            'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex-1 min-w-[220px]">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900">{refund.invoice?.customer?.name || 'Customer'}</span>
                              <span className="text-xs font-mono text-gray-500">{refund.invoice?.invoiceNumber}</span>
                              {creditNoteNumber && (
                                <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                  <FileText className="w-3 h-3" /> {creditNoteNumber}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                refund.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                refund.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                refund.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>{refund.status}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{refund.reason}</p>
                            <p className="text-sm font-semibold text-gray-800 mt-1">Amount: {formatCurrency(refund.refundedAmount)}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{new Date(refund.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            {/* NEW (Tier 3.2) — the gateway's own error, right
                                in the list, not just inside the modal — this
                                is the "only the admin who clicked Approve
                                sees the error" gap, fixed. */}
                            {refund.status === 'FAILED' && refund.failureReason && (
                              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <XCircle className="w-3 h-3 flex-shrink-0" /> {refund.failureReason} — click to retry
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Price Reductions */}
            {activeTab === 'price-reductions' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  Price Reduction Requests
                  {priceReductions.filter(r => r.status === 'PENDING').length > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {priceReductions.filter(r => r.status === 'PENDING').length} pending
                    </span>
                  )}
                  {/* NEW — surfaces reductions whose customer has already
                      submitted bank details and just need the final
                      "complete refund" click, so they don't get lost among
                      the ones still waiting on the customer. */}
                  {priceReductions.filter(isReductionReadyToComplete).length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {priceReductions.filter(isReductionReadyToComplete).length} ready to complete
                    </span>
                  )}
                </h2>
                {priceReductions.length === 0 ? (
                  <p className="text-gray-400 text-center py-10">No price reduction requests found.</p>
                ) : (
                  <div className="space-y-3">
                    {/* FIX: this list used to show everything inline (photos,
                        staff badges, bank-transfer record) AND let admin
                        approve/reject straight from here — no way to
                        actually look at the booking behind the complaint
                        first. Trimmed to the essentials per row; clicking
                        opens the full detail modal below (booking info,
                        reason, all photos, staff, bank record), and
                        approve/reject now only happen from inside it. */}
                    {priceReductions.map(reduction => (
                      <button
                        key={reduction._id}
                        onClick={() => setViewingReduction(reduction)}
                        className={`w-full text-left border rounded-xl p-4 flex flex-wrap items-center gap-4 hover:shadow-sm transition-shadow ${
                          reduction.status === 'PENDING' ? 'border-amber-200 bg-amber-50' :
                          reduction.status === 'AWAITING_BANK_DETAILS' ? 'border-blue-200 bg-blue-50' :
                          reduction.status === 'APPROVED' ? 'border-green-200 bg-green-50' :
                          'border-gray-200 bg-gray-50'
                        }`}>
                        <div className="flex-1 min-w-[220px]">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">{reduction.invoice?.customer?.name || 'Customer'}</span>
                            <span className="text-xs font-mono text-gray-500">{reduction.invoice?.invoiceNumber}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              reduction.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                              reduction.status === 'AWAITING_BANK_DETAILS' ? 'bg-blue-100 text-blue-700' :
                              reduction.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>{reduction.status === 'AWAITING_BANK_DETAILS'
                              ? (isReductionReadyToComplete(reduction) ? 'READY TO COMPLETE' : 'AWAITING CUSTOMER')
                              : reduction.status}</span>
                            {!!reduction.photos?.length && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <FileText className="w-3 h-3" /> {reduction.photos.length} photo{reduction.photos.length === 1 ? '' : 's'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{reduction.reason}</p>
                          <div className="flex gap-4 mt-1 text-sm">
                            <span>Requested: <span className="font-semibold">{formatCurrency(reduction.requestedAmount)}</span></span>
                            {reduction.approvedAmount && (
                              <span>Approved: <span className="font-semibold text-green-700">{formatCurrency(reduction.approvedAmount)}</span></span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-purple-700 flex items-center gap-1.5 whitespace-nowrap">
                          <Eye className="w-4 h-4" />{' '}
                          {reduction.status === 'PENDING' ? 'Review & Decide'
                            : reduction.status === 'AWAITING_BANK_DETAILS' && isReductionReadyToComplete(reduction) ? 'Complete Refund'
                            : reduction.status === 'AWAITING_BANK_DETAILS' ? 'Awaiting Customer'
                            : 'View Details'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Price Reduction detail modal — booking details, reason,
                photos, and staff, THEN approve/reject. Replaces approving
                straight off the flat list above. */}
            {viewingReduction && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setViewingReduction(null)}>
                <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Price Reduction Request</h3>
                      <p className="text-sm text-gray-500">{viewingReduction.invoice?.invoiceNumber}</p>
                    </div>
                    <button onClick={() => setViewingReduction(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold mb-4 ${
                    viewingReduction.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    viewingReduction.status === 'AWAITING_BANK_DETAILS' ? 'bg-blue-100 text-blue-700' :
                    viewingReduction.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>{viewingReduction.status === 'AWAITING_BANK_DETAILS'
                    ? (isReductionReadyToComplete(viewingReduction) ? 'READY TO COMPLETE' : 'AWAITING CUSTOMER')
                    : viewingReduction.status}</span>

                  {/* Booking details — the part that was missing entirely
                      before: what job this complaint is actually about. */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Booking Details</p>
                    {viewingReduction.invoice?.bookingId ? (
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                        <span><span className="text-gray-400">Booking ID:</span> {viewingReduction.invoice.bookingId.bookingId || '—'}</span>
                        <span><span className="text-gray-400">Service:</span> {viewingReduction.invoice.bookingId.serviceName || viewingReduction.invoice.bookingId.serviceType || '—'}</span>
                        <span><span className="text-gray-400">Date:</span> {viewingReduction.invoice.bookingId.date || '—'} {viewingReduction.invoice.bookingId.time || ''}</span>
                        <span><span className="text-gray-400">Status:</span> {viewingReduction.invoice.bookingId.status || '—'}</span>
                        <span className="col-span-2"><span className="text-gray-400">Address:</span> {viewingReduction.invoice.bookingId.address || '—'}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No linked booking found for this invoice.</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Customer's Reason</p>
                    <p className="text-sm text-gray-700">{viewingReduction.reason}</p>
                  </div>

                  <div className="flex gap-6 mb-4 text-sm">
                    <span>Requested: <span className="font-semibold">{formatCurrency(viewingReduction.requestedAmount)}</span></span>
                    {viewingReduction.approvedAmount && (
                      <span>Approved: <span className="font-semibold text-green-700">{formatCurrency(viewingReduction.approvedAmount)}</span></span>
                    )}
                    <span className="text-gray-400">Invoice Total: {formatCurrency(viewingReduction.invoice?.totalAmount || 0)}</span>
                  </div>

                  {/* Staff who did the job */}
                  {!!viewingReduction.staffAssigned?.length && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Staff Assigned</p>
                      <div className="flex flex-wrap gap-1.5">
                        {viewingReduction.staffAssigned.map((s, i) => (
                          <span key={s.staffId || i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {s.staffName || 'Staff member'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evidence photos — larger than the old inline thumbnails */}
                  {!!viewingReduction.photos?.length && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Attached Photos</p>
                      <div className="flex flex-wrap gap-2">
                        {viewingReduction.photos.map((p, i) => (
                          <a key={i} href={p.url} target="_blank" rel="noreferrer" title={p.description || `Photo ${i + 1}`}>
                            <img src={p.url} alt={p.description || `Evidence ${i + 1}`} className="w-24 h-24 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {viewingReduction.bankDetailsRequested && viewingReduction.refundMethod !== 'CASH_PICKUP' && viewingReduction.bankDetails?.bankName && (
                    <div className="mb-4 text-xs bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-blue-700">
                      <span className="font-semibold">Bank transfer refund:</span>{' '}
                      {viewingReduction.bankDetails.accountHolder} — {viewingReduction.bankDetails.bankName}
                      {viewingReduction.bankDetails.accountNumber && ` (a/c ending ${viewingReduction.bankDetails.accountNumber.slice(-4)})`}
                      {viewingReduction.bankDetails.branch && `, ${viewingReduction.bankDetails.branch}`}
                    </div>
                  )}

                  {/* NEW (Tier 4.1, audit finding "In-person cash pickup
                      option — missing") — the customer chose to collect in
                      person instead of a bank transfer. */}
                  {viewingReduction.refundMethod === 'CASH_PICKUP' && (
                    <div className="mb-4 text-xs bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-blue-700">
                      <span className="font-semibold">In-person pickup requested.</span>
                      {viewingReduction.pickupNotes && <> {viewingReduction.pickupNotes}</>}
                      {viewingReduction.pickupConfirmedAt && (
                        <div className="mt-1 text-blue-600">Handed over {new Date(viewingReduction.pickupConfirmedAt).toLocaleString()}</div>
                      )}
                    </div>
                  )}

                  {/* NEW — the customer hasn't responded yet (bank details
                      or a pickup choice). They were emailed a self-service
                      link on approval; nothing for the admin to do here but
                      wait. */}
                  {viewingReduction.status === 'AWAITING_BANK_DETAILS' && !isReductionReadyToComplete(viewingReduction) && (
                    <div className="mb-4 text-xs bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-amber-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      Approved for {formatCurrency(viewingReduction.approvedAmount || 0)} — customer has been emailed to choose a refund method (bank transfer or in-person pickup). The refund will finalize once they do.
                    </div>
                  )}

                  {viewingReduction.status === 'PENDING' && (
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={async () => { await handleApproveReduction(viewingReduction); setViewingReduction(null); }}
                        disabled={reductionProcessingId === viewingReduction._id}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors"
                      >
                        {reductionProcessingId === viewingReduction._id ? <Loader className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
                        Approve
                      </button>
                      <button
                        onClick={async () => { await handleRejectReduction(viewingReduction._id); setViewingReduction(null); }}
                        disabled={reductionProcessingId === viewingReduction._id}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}

                  {/* NEW — the self-service flow's final step: only shown
                      once the customer has actually responded (bank
                      details submitted, or a pickup chosen — Tier 4.1). */}
                  {viewingReduction.status === 'AWAITING_BANK_DETAILS' && isReductionReadyToComplete(viewingReduction) && (
                    <div className="pt-2 border-t border-gray-100">
                      <button
                        onClick={async () => { await handleCompleteRefund(viewingReduction._id); setViewingReduction(null); }}
                        disabled={reductionProcessingId === viewingReduction._id}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors"
                      >
                        {reductionProcessingId === viewingReduction._id ? <Loader className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
                        {viewingReduction.refundMethod === 'CASH_PICKUP' ? 'Confirm Cash Handed Over & Complete Refund' : 'Confirm Transfer Sent & Complete Refund'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* NEW (Tier 3.2, audit finding "Refund detail modal — missing")
                — read-only detail view (booking + audit trail), same modal
                pattern as Price Reductions above, backed by the
                GET /api/refunds/details/:refundId route that already
                existed on the backend but nothing in the frontend called.
                Approve/Reject (PENDING) and Retry (FAILED) live here rather
                than on the flat list card. */}
            {viewingRefund && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setViewingRefund(null)}>
                <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Refund Request</h3>
                      <p className="text-sm text-gray-500">{viewingRefund.invoice?.invoiceNumber}</p>
                    </div>
                    <button onClick={() => setViewingRefund(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold mb-4 ${
                    viewingRefund.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    viewingRefund.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    viewingRefund.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{viewingRefund.status}</span>

                  {/* Gateway failure detail — the part that used to only
                      exist as a one-time 502 alert() for whoever clicked
                      Approve. */}
                  {viewingRefund.status === 'FAILED' && viewingRefund.failureReason && (
                    <div className="mb-4 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-red-700 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      Payment gateway error: {viewingRefund.failureReason}
                    </div>
                  )}

                  {/* Booking details — same pattern as the Price Reduction
                      modal, using the same nested populate shape. */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Booking Details</p>
                    {viewingRefund.invoice?.bookingId ? (
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                        <span><span className="text-gray-400">Booking ID:</span> {viewingRefund.invoice.bookingId.bookingId || '—'}</span>
                        <span><span className="text-gray-400">Service:</span> {viewingRefund.invoice.bookingId.serviceName || viewingRefund.invoice.bookingId.serviceType || '—'}</span>
                        <span><span className="text-gray-400">Date:</span> {viewingRefund.invoice.bookingId.date || '—'} {viewingRefund.invoice.bookingId.time || ''}</span>
                        <span><span className="text-gray-400">Status:</span> {viewingRefund.invoice.bookingId.status || '—'}</span>
                        <span className="col-span-2"><span className="text-gray-400">Address:</span> {viewingRefund.invoice.bookingId.address || '—'}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No linked booking found for this invoice.</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Reason</p>
                    <p className="text-sm text-gray-700">{viewingRefund.reason}</p>
                  </div>

                  <div className="flex flex-wrap gap-6 mb-4 text-sm">
                    <span>Refund Amount: <span className="font-semibold">{formatCurrency(viewingRefund.refundedAmount)}</span></span>
                    <span className="text-gray-400">Invoice Total: {formatCurrency(viewingRefund.invoice?.totalAmount || 0)}</span>
                    <span className="text-gray-400">
                      {viewingRefund.invoice?.payherePaymentId ? 'Paid online (PayHere)' : 'Paid in cash'}
                    </span>
                  </div>

                  {/* Audit trail — payment reference / refund date only
                      exist once a refund has actually gone through. */}
                  {(viewingRefund.paymentReference || viewingRefund.refundDate) && (
                    <div className="mb-4 text-xs text-gray-500 space-y-0.5">
                      {viewingRefund.paymentReference && viewingRefund.paymentReference !== 'N/A' && (
                        <p>Payment reference: <span className="font-mono">{viewingRefund.paymentReference}</span></p>
                      )}
                      {viewingRefund.refundDate && (
                        <p>Processed: {new Date(viewingRefund.refundDate).toLocaleString()}</p>
                      )}
                    </div>
                  )}

                  {viewingRefund.status === 'PENDING' && (
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={async () => { await handleApproveRefund(viewingRefund._id); setViewingRefund(null); }}
                        disabled={refundProcessingId === viewingRefund._id}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors"
                      >
                        {refundProcessingId === viewingRefund._id ? <Loader className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
                        Approve
                      </button>
                      <button
                        onClick={async () => { await handleRejectRefund(viewingRefund._id); setViewingRefund(null); }}
                        disabled={refundProcessingId === viewingRefund._id}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}

                  {/* NEW (Tier 3.2) — the actual fix for "no re-surfacing for
                      other admins": any admin who opens this modal can retry
                      immediately, not just the one who saw the original
                      alert(). Re-runs the exact same approve endpoint. */}
                  {viewingRefund.status === 'FAILED' && (
                    <div className="pt-2 border-t border-gray-100">
                      <button
                        onClick={async () => { await handleRetryRefund(viewingRefund._id); setViewingRefund(null); }}
                        disabled={refundProcessingId === viewingRefund._id}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:bg-red-300 transition-colors"
                      >
                        {refundProcessingId === viewingRefund._id ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Retry Refund
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
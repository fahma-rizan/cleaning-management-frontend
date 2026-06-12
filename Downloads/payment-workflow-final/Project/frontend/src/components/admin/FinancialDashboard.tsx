import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../../socket';
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
} from 'lucide-react';
import { BarChart3, LineChart, PieChart } from 'lucide-react';
import type { User } from '../../types';
import DemoTopBar from '../DemoTopBar';
import { addNotification } from '../../utils/notificationUtils';
import { auditLogger, AUDIT_ACTIONS } from '../../utils/auditLogger';
import { tokenStorage } from '../../utils/auth';

// Local currency formatting function
const formatCurrency = (amount: number): string => {
  return `Rs. ${amount.toLocaleString()}`;
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
  mainCategories: string[]; // Added for inclusive filtering
  createdAt: string;
  bookingId?: string;
  paymentMethod?: string;
  customer: {
    name: string;
    userId?: string;
  };
}

interface Refund {
  _id: string;
  invoice: {
    invoiceNumber: string;
    totalAmount: number;
  };
  refundedAmount: number;
  status: string;
  createdAt: string;
  reason: string;
}

export default function FinancialDashboard({ user }: FinancialDashboardProps) {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('today');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null);
  const [approvingInvoiceId, setApprovingInvoiceId] = useState<string | null>(null);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);

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
      const response = await fetch(`${API_BASE_URL}/refunds`);
      if (!response.ok) throw new Error('Failed to fetch refunds');
      const data = await response.json();
      setRefunds(data);
    } catch (err: any) {
      setError(err.message);
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
            message: `Your service is complete! Please pay the remaining balance of Rs. ${invoice.balanceAmount.toLocaleString()}. Click here to pay: /balance-payment?invoice=${invoice.invoiceNumber}`,
            bookingId: bookingId,
            actionUrl: `/balance-payment?invoice=${invoice.invoiceNumber}`,
          });
        } else if (invoice.paymentMethod?.toLowerCase().includes('after completion') || invoice.paidAmount === 0) {
          // Send full payment link for pay-after-completion
          await addNotification({
            userId: userId,
            type: 'payment',
            title: 'Payment Required 💳',
            message: `Your service is complete! Please pay Rs. ${invoice.totalAmount.toLocaleString()}. Click here to pay: /payment-link?invoice=${invoice.invoiceNumber}`,
            bookingId: bookingId,
            actionUrl: `/payment-link?invoice=${invoice.invoiceNumber}`,
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

    return () => {
      socket.off('newInvoice', handleNewInvoice);
      socket.off('refundUpdate', handleRefundUpdate);
      socket.off('invoiceApprovalNeeded');
      socket.off('invoiceUpdate');
      socket.disconnect();
    };
  }, []);

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

  const metrics = useMemo(() => {
    const totalInvoices = filteredInvoices.length;
    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = filteredInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalBalance = filteredInvoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);
    const paidInvoices = filteredInvoices.filter((inv) => inv.status === 'PAID').length;
    const refundedAmount = refunds.reduce((sum, ref) => sum + ref.refundedAmount, 0);

    return {
      totalInvoices,
      totalAmount,
      totalPaid,
      totalBalance,
      paidInvoices,
      refundedAmount,
      paymentRate: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0,
    };
  }, [filteredInvoices, refunds]);

  const statusBreakdown = useMemo(() => {
    return filteredInvoices.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredInvoices]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                onClick={() => {
                  // Scroll to the invoice table and filter to show DRAFT invoices
                  document.querySelector('table')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
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

          {/* Key Metrics */}
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

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">
                    {formatCurrency(metrics.totalAmount)}
                  </h3>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Paid</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">
                    {formatCurrency(metrics.totalPaid)}
                  </h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Payment Rate</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">
                    {metrics.paymentRate.toFixed(1)}%
                  </h3>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Status</h2>
              <div className="space-y-3">
                {Object.entries(statusBreakdown).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-gray-600 capitalize">{status}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Refunds</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Refunds</span>
                  <span className="font-semibold text-gray-900">{refunds.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Refunded Amount</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(metrics.refundedAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Refund Rate</span>
                  <span className="font-semibold text-gray-900">
                    {invoices.length > 0
                      ? ((refunds.length / invoices.length) * 100).toFixed(1)
                      : '0.0'}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Invoices</h2>
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
                  {filteredInvoices.slice(0, 10).map((invoice) => (
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { DollarSign, FileText, RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react';
import RevenueChart from './RevenueChart';
import { fetchWithAuth } from '../../utils/api';

interface Invoice {
  _id: string;
  bookingId: string;
  customerName: string;
  serviceName: string;
  price: number;
  paidAmount: number;
  balanceAmount: number;
  paymentMethod?: string;
  paymentStatus: string;
  status: string;
  date: string;
}

interface Refund {
  _id: string;
  bookingRef: string;
  customerName: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Overview {
  totalRevenue: number;
  totalInvoices: number;
  pendingRefunds: number;
  totalRefunded: number;
  revenueSeries: { date: string; revenue: number }[];
}

export function PaymentsManagement() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [tab, setTab] = useState<'invoices' | 'refunds'>('invoices');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingOn, setActingOn] = useState<string | null>(null);

  const loadAll = async () => {
    try {
      const [ov, inv, ref] = await Promise.all([
        fetchWithAuth('/payments/overview'),
        fetchWithAuth('/payments/invoices'),
        fetchWithAuth('/payments/refunds'),
      ]);
      setOverview(ov);
      setInvoices(Array.isArray(inv) ? inv : []);
      setRefunds(Array.isArray(ref) ? ref : []);
    } catch (err) {
      setError('Failed to load payments data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    setActingOn(id);
    try {
      await fetchWithAuth(`/payments/refunds/${id}/${action}`, { method: 'PUT', body: JSON.stringify({}) });
      await loadAll();
    } catch (err) {
      setError(`Failed to ${action} refund`);
    } finally {
      setActingOn(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading payments...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl"><DollarSign className="w-5 h-5 text-green-600" /></div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Total Revenue</p>
            <p className="text-2xl font-black text-gray-900">LKR {(overview?.totalRevenue || 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl"><FileText className="w-5 h-5 text-blue-600" /></div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Invoices</p>
            <p className="text-2xl font-black text-gray-900">{overview?.totalInvoices || 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl"><Clock className="w-5 h-5 text-amber-600" /></div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Pending Refunds</p>
            <p className="text-2xl font-black text-gray-900">{overview?.pendingRefunds || 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-xl"><RotateCcw className="w-5 h-5 text-purple-600" /></div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Total Refunded</p>
            <p className="text-2xl font-black text-gray-900">LKR {(overview?.totalRefunded || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Revenue Overview</h3>
        <RevenueChart data={overview?.revenueSeries || []} />
      </div>

      {/* Invoices / Refunds tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTab('invoices')}
            className={`px-6 py-4 text-sm font-bold ${tab === 'invoices' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'}`}
          >
            Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setTab('refunds')}
            className={`px-6 py-4 text-sm font-bold ${tab === 'refunds' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'}`}
          >
            Refunds ({refunds.length})
          </button>
        </div>

        {tab === 'invoices' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-400 uppercase text-xs font-bold">
                <tr>
                  <th className="text-left px-6 py-3">Booking</th>
                  <th className="text-left px-6 py-3">Customer</th>
                  <th className="text-left px-6 py-3">Service</th>
                  <th className="text-left px-6 py-3">Paid</th>
                  <th className="text-left px-6 py-3">Balance</th>
                  <th className="text-left px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">No invoices yet</td></tr>
                )}
                {invoices.map(inv => (
                  <tr key={inv._id}>
                    <td className="px-6 py-3 font-semibold text-purple-600">{inv.bookingId}</td>
                    <td className="px-6 py-3">{inv.customerName}</td>
                    <td className="px-6 py-3">{inv.serviceName}</td>
                    <td className="px-6 py-3">LKR {(inv.paidAmount || 0).toLocaleString()}</td>
                    <td className="px-6 py-3">LKR {(inv.balanceAmount || 0).toLocaleString()}</td>
                    <td className="px-6 py-3 capitalize">{inv.paymentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'refunds' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-400 uppercase text-xs font-bold">
                <tr>
                  <th className="text-left px-6 py-3">Booking</th>
                  <th className="text-left px-6 py-3">Amount</th>
                  <th className="text-left px-6 py-3">Reason</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {refunds.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">No refund requests</td></tr>
                )}
                {refunds.map(r => (
                  <tr key={r._id}>
                    <td className="px-6 py-3 font-semibold text-purple-600">{r.bookingRef || '—'}</td>
                    <td className="px-6 py-3">LKR {(r.amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-3">{r.reason}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        r.status === 'approved' ? 'bg-green-100 text-green-700'
                        : r.status === 'rejected' ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {r.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            disabled={actingOn === r._id}
                            onClick={() => handleReview(r._id, 'approve')}
                            className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            disabled={actingOn === r._id}
                            onClick={() => handleReview(r._id, 'reject')}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

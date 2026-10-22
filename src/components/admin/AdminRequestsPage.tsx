import { useEffect, useState } from 'react';
import { Check, Clock, Loader, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '../../types';
import DemoTopBar from '../DemoTopBar';
import AdminSidebar from './AdminSidebar';
import { tokenStorage } from '../../utils/auth';

type RequestKind = 'refunds' | 'price-reductions';

interface AdminRequestsPageProps {
  user: User;
  kind: RequestKind;
}

interface RequestItem {
  _id: string;
  status: string;
  reason?: string;
  requestedAmount?: number;
  refundedAmount?: number;
  approvedAmount?: number;
  createdAt: string;
  invoice?: {
    invoiceNumber?: string;
    totalAmount?: number;
    customer?: { name?: string; email?: string };
  };
}

const API_BASE_URL = 'http://localhost:4000/api';

export default function AdminRequestsPage({ user, kind }: AdminRequestsPageProps) {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const authHeaders = () => {
    const tokens = tokenStorage.getTokens();
    return tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
  };

  const loadRequests = async () => {
    setLoading(true);
    try {
      const endpoint = kind === 'refunds' ? '/refunds' : '/price-reductions';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers: authHeaders() });
      const body = await response.text();
      let data: unknown;
      try {
        data = body ? JSON.parse(body) : null;
      } catch {
        data = null;
      }
      if (!response.ok) {
        const message = data && typeof data === 'object' && data !== null && 'message' in data
          ? String(data.message)
          : data && typeof data === 'object' && data !== null && 'msg' in data
          ? String(data.msg)
          : body || response.statusText;
        throw new Error(`HTTP ${response.status}: ${message}`);
      }
      if (!Array.isArray(data)) {
        throw new Error('The server returned an invalid requests response.');
      }
      setRequests(data as RequestItem[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [kind]);

  const rejectRequest = async (request: RequestItem) => {
    const reason = window.prompt('Reason for rejecting this request:');
    if (!reason) return;
    setProcessingId(request._id);
    try {
      const endpoint = kind === 'refunds'
        ? `/refunds/reject/${request._id}`
        : `/price-reductions/reject/${request._id}`;
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.msg || 'Request could not be rejected.');
      }
      toast.success('Request rejected.');
      await loadRequests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Request could not be rejected.');
    } finally {
      setProcessingId(null);
    }
  };

  const approveRequest = async (request: RequestItem) => {
    let approvedAmount: number | undefined;
    if (kind === 'price-reductions') {
      const entered = window.prompt(
        `Approved reduction amount (requested: Rs. ${(request.requestedAmount || 0).toLocaleString()}):`,
        String(request.requestedAmount || 0),
      );
      if (!entered) return;
      approvedAmount = Number(entered);
      if (!Number.isFinite(approvedAmount) || approvedAmount <= 0) {
        toast.error('Enter a valid approved amount.');
        return;
      }
    } else if (!window.confirm('Approve this refund request?')) {
      return;
    }

    setProcessingId(request._id);
    try {
      const endpoint = kind === 'refunds'
        ? `/refunds/approve/${request._id}`
        : `/price-reductions/approve/${request._id}`;
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(kind === 'price-reductions' ? { approvedAmount } : {}),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.msg || 'Request could not be approved.');
      }
      toast.success('Request approved.');
      await loadRequests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Request could not be approved.');
    } finally {
      setProcessingId(null);
    }
  };

  const title = kind === 'refunds' ? 'Refund Requests' : 'Price Reduction Requests';
  const description = kind === 'refunds'
    ? 'Review refund requests submitted by customers.'
    : 'Review customer messages and requested price adjustments.';
  const pending = requests.filter(request => request.status === 'PENDING');

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar user={user} onLogout={() => { window.location.href = '/'; }} />
      <div className="ml-64">
        <DemoTopBar user={user} />
        <main className="container mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600 mt-1">{description}</p>
            </div>
            <button onClick={loadRequests} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader className="h-8 w-8 animate-spin text-purple-600" /></div>
          ) : requests.length === 0 ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm">
              <Clock className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-600">No {kind === 'refunds' ? 'refund' : 'price reduction'} requests found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-600">{pending.length} awaiting review</p>
              {requests.map(request => (
                <article key={request._id} className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {request.invoice?.customer?.name || 'Customer'}
                        <span className="ml-2 font-mono text-sm text-gray-500">{request.invoice?.invoiceNumber || 'Invoice unavailable'}</span>
                      </p>
                      <p className="mt-1 text-sm text-gray-500">{new Date(request.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      request.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                      request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>{request.status}</span>
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div><p className="text-xs uppercase text-gray-500">Amount</p><p className="font-semibold">Rs. {(kind === 'refunds' ? request.refundedAmount : request.requestedAmount || 0)?.toLocaleString()}</p></div>
                    <div className="md:col-span-2"><p className="text-xs uppercase text-gray-500">Customer message / reason</p><p className="text-gray-800">{request.reason || 'No message provided.'}</p></div>
                  </div>
                  {request.status === 'PENDING' && (
                    <div className="mt-5 flex gap-3 border-t pt-4">
                      <button disabled={processingId === request._id} onClick={() => approveRequest(request)} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"><Check className="h-4 w-4" /> Approve</button>
                      <button disabled={processingId === request._id} onClick={() => rejectRequest(request)} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"><X className="h-4 w-4" /> Reject</button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

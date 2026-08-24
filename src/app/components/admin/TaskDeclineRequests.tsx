import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, RefreshCw, ClipboardX } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';
import { toast } from 'sonner';
import { ConfirmDialog } from '../ui/confirm-dialog';

interface DeclineRequestRow {
  _id: string;
  bookingId: string;
  bookingRef: string;
  staffId: string;
  staffName: string;
  staffEmail: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  booking: { bookingId: string; serviceName: string; date: string; time: string; status: string } | null;
}

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export function TaskDeclineRequests() {
  const [requests, setRequests] = useState<DeclineRequestRow[]>([]);
  const [filter, setFilter]     = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [loading, setLoading]   = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ row: DeclineRequestRow; type: 'approve' | 'reject' } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/staff-requests/decline');
      if (data.success) setRequests(data.requests || []);
    } catch (err) {
      console.error('Failed to load decline requests:', err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = requests.filter(r => filter === 'All' || r.status === filter.toLowerCase());
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const approve = async (r: DeclineRequestRow) => {
    setActingId(r._id);
    try {
      const data = await fetchWithAuth(`/staff-requests/decline/${r._id}/approve`, { method: 'PATCH', body: JSON.stringify({}) });
      if (data.success) {
        toast.success('Decline approved — task reassignment attempted.');
        setRequests(prev => prev.map(x => x._id === r._id ? { ...x, status: 'approved' } : x));
        // Refresh the sidebar badge + bell notification immediately instead
        // of waiting for their next 30s poll.
        window.dispatchEvent(new Event('staff-requests-updated'));
      } else {
        toast.error(data.message || 'Failed to approve request.');
      }
    } catch {
      toast.error('Failed to approve request.');
    }
    setActingId(null);
  };

  const reject = async (r: DeclineRequestRow) => {
    setActingId(r._id);
    try {
      const data = await fetchWithAuth(`/staff-requests/decline/${r._id}/reject`, { method: 'PATCH', body: JSON.stringify({}) });
      if (data.success) {
        toast.success(`Request rejected — task stays with ${r.staffName}.`);
        setRequests(prev => prev.map(x => x._id === r._id ? { ...x, status: 'rejected' } : x));
        window.dispatchEvent(new Event('staff-requests-updated'));
      } else {
        toast.error(data.message || 'Failed to reject request.');
      }
    } catch {
      toast.error('Failed to reject request.');
    }
    setActingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Task Decline Requests</h2>
            <p className="text-sm text-gray-600 mt-1">
              Staff requests to decline an assigned task — review and approve or reject.
              {pendingCount > 0 && <span className="ml-2 font-semibold text-amber-600">{pendingCount} pending</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(['Pending', 'All', 'Approved', 'Rejected'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filter === f ? 'bg-purple-100 text-purple-700 border-2 border-purple-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
            <button onClick={load} className="text-purple-600 hover:text-purple-800 ml-2">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <ClipboardX className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No {filter !== 'All' ? filter.toLowerCase() : ''} decline requests.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => (
              <div key={r._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{r.staffName}</span>
                      <span className="text-xs text-gray-400 font-mono">#{r.staffId.slice(-6)}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_STYLES[r.status]}`}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mt-2 font-medium">
                      {r.booking?.serviceName || 'Service'} — <span className="font-mono text-xs text-gray-500">{r.bookingRef}</span>
                    </p>
                    {r.booking && (
                      <p className="text-sm text-gray-600">{r.booking.date} at {r.booking.time}</p>
                    )}
                    <p className="text-sm text-gray-700 mt-2">"{r.reason}"</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Requested {new Date(r.createdAt).toLocaleString()}
                    </p>
                    {r.reviewedAt && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Reviewed by {r.reviewedBy} on {new Date(r.reviewedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => setConfirmAction({ row: r, type: 'approve' })}
                        disabled={actingId === r._id}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => setConfirmAction({ row: r, type: 'reject' })}
                        disabled={actingId === r._id}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => { if (!open) setConfirmAction(null); }}
        title={confirmAction?.type === 'approve' ? 'Approve decline request?' : 'Reject decline request?'}
        description={
          confirmAction
            ? confirmAction.type === 'approve'
              ? `Approve ${confirmAction.row.staffName}'s decline request for "${confirmAction.row.booking?.serviceName || confirmAction.row.bookingRef}"? The task will be unassigned from them and a replacement will be sought automatically.`
              : `Reject ${confirmAction.row.staffName}'s decline request? The task will remain assigned to them and must be completed.`
            : ''
        }
        confirmLabel={confirmAction?.type === 'approve' ? 'Approve' : 'Reject'}
        variant={confirmAction?.type === 'reject' ? 'destructive' : 'default'}
        onConfirm={() => {
          if (!confirmAction) return;
          const { row, type } = confirmAction;
          setConfirmAction(null);
          if (type === 'approve') approve(row); else reject(row);
        }}
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, RefreshCw, UserX } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';
import { toast } from 'sonner';

interface AvailabilityRequestRow {
  _id: string;
  staffId: string;
  staffName: string;
  staffEmail: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export function AvailabilityRequests() {
  const [requests, setRequests] = useState<AvailabilityRequestRow[]>([]);
  const [filter, setFilter]     = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [loading, setLoading]   = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/staff-requests/availability');
      if (data.success) setRequests(data.requests || []);
    } catch (err) {
      console.error('Failed to load availability requests:', err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = requests.filter(r => filter === 'All' || r.status === filter.toLowerCase());
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const approve = async (r: AvailabilityRequestRow) => {
    if (!window.confirm(`Approve ${r.staffName}'s unavailability request? They will immediately be marked Unavailable.`)) return;
    setActingId(r._id);
    try {
      const data = await fetchWithAuth(`/staff-requests/availability/${r._id}/approve`, { method: 'PATCH', body: JSON.stringify({}) });
      if (data.success) {
        toast.success(`${r.staffName} marked Unavailable.`);
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

  const reject = async (r: AvailabilityRequestRow) => {
    if (!window.confirm(`Reject ${r.staffName}'s unavailability request? They will remain Available.`)) return;
    setActingId(r._id);
    try {
      const data = await fetchWithAuth(`/staff-requests/availability/${r._id}/reject`, { method: 'PATCH', body: JSON.stringify({}) });
      if (data.success) {
        toast.success(`Request rejected — ${r.staffName} remains Available.`);
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
            <h2 className="text-2xl font-bold text-gray-900">Availability Requests</h2>
            <p className="text-sm text-gray-600 mt-1">
              Staff requests to be marked Unavailable — review and approve or reject.
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
            <UserX className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No {filter !== 'All' ? filter.toLowerCase() : ''} availability requests.</p>
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
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700">Unavailable</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_STYLES[r.status]}`}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </div>
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
                        onClick={() => approve(r)}
                        disabled={actingId === r._id}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => reject(r)}
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
    </div>
  );
}

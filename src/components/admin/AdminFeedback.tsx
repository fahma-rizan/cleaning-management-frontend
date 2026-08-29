import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, XCircle, Star, AlertTriangle, MessageSquare, CheckSquare, Loader } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '../../types';
import DemoTopBar from '../DemoTopBar';
import { tokenStorage, authApi } from '../../utils/auth';
import AdminSidebar from './AdminSidebar';

const API_BASE_URL = 'http://localhost:4000/api';

interface AdminFeedbackProps { user: User; }

interface FeedbackRecord {
  _id: string;
  booking?: {
    _id?: string;
    bookingId?: string;
    serviceType?: string;
    serviceName?: string;
    assignedStaffName?: string;
    date?: string;
  };
  customer?: { name?: string; email?: string };
  type: 'FEEDBACK' | 'COMPLAINT';
  category?: string;
  rating?: number;
  comment: string;
  photos?: { url: string; description?: string }[];
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminResponse?: string;
  respondedAt?: string;
  respondedBy?: string;
  createdAt: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  SERVICE_QUALITY: 'Service Quality',
  STAFF_BEHAVIOR:  'Staff Behavior',
  DAMAGE:          'Damage to Property',
  LATE_ARRIVAL:    'Late Arrival',
  BILLING:         'Billing Issue',
  OTHER:           'Other',
};

const STATUS_BADGE: Record<string, string> = {
  OPEN:        'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED:    'bg-green-100 text-green-700',
  CLOSED:      'bg-gray-200 text-gray-600',
};

// FIX (task #21, C.3a): this admin page — reviewing and responding to
// customer feedback/complaints — didn't exist at all before. AdminSidebar's
// "Complaints" nav item pointed at the Financial Dashboard as a placeholder.
export default function AdminFeedback({ user }: AdminFeedbackProps) {
  const navigate = useNavigate();
  const [items, setItems]       = useState<FeedbackRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [typeFilter, setTypeFilter]     = useState<'all' | 'FEEDBACK' | 'COMPLAINT'>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleLogout = async () => {
    await authApi.logout();
    navigate('/');
  };

  const authHeader = () => {
    const tokens = tokenStorage.getTokens();
    return tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
  };

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/feedback`, { headers: authHeader() });
      if (!res.ok) throw new Error('Failed to load feedback.');
      setItems(await res.json());
    } catch (err: any) {
      setError(err.message || 'Something went wrong loading feedback.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedback(); }, []);

  const filtered = useMemo(() => {
    return items.filter(i => {
      const matchesType = typeFilter === 'all' || i.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
      return matchesType && matchesStatus;
    });
  }, [items, typeFilter, statusFilter]);

  const openCount = items.filter(i => i.status === 'OPEN').length;

  const handleRespond = async (id: string) => {
    if (!responseText.trim()) { toast.error('Please enter a response.'); return; }
    setProcessingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/feedback/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ response: responseText, status: 'RESOLVED' }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.msg || 'Failed to save response.');
      }
      toast.success('Response sent.');
      setRespondingId(null);
      setResponseText('');
      fetchFeedback();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/feedback/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status.');
      fetchFeedback();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const content = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-purple-300 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 font-medium">Loading feedback...</p>
          </div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 font-semibold mb-2">Couldn't load feedback</p>
            <p className="text-gray-600 mb-6">{error}</p>
            <button onClick={fetchFeedback} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Feedback & Complaints
              {openCount > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{openCount} open</span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">{filtered.length} shown</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="all">All Types</option>
            <option value="FEEDBACK">Feedback</option>
            <option value="COMPLAINT">Complaints</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="all">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No feedback or complaints found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => (
              <div key={item._id} className={`border rounded-xl p-4 ${
                item.status === 'OPEN' ? 'border-amber-200 bg-amber-50' :
                item.status === 'RESOLVED' ? 'border-green-200 bg-green-50' :
                item.status === 'IN_PROGRESS' ? 'border-blue-200 bg-blue-50' :
                'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex-1 min-w-[240px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.type === 'COMPLAINT'
                        ? <AlertTriangle className="w-4 h-4 text-red-500" />
                        : <Star className="w-4 h-4 text-amber-500 fill-amber-400" />}
                      <span className="font-semibold text-gray-900">{item.customer?.name || 'Customer'}</span>
                      <span className="text-xs font-mono text-gray-500">{item.booking?.bookingId}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_BADGE[item.status]}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                      {item.type === 'COMPLAINT' && item.category && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {CATEGORY_LABEL[item.category] || item.category}
                        </span>
                      )}
                      {item.type === 'FEEDBACK' && item.rating && (
                        <span className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < item.rating! ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                          ))}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1.5">{item.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {item.booking?.serviceName || item.booking?.serviceType} — {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>

                    {!!item.photos?.length && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.photos.map((p, i) => (
                          <a key={i} href={p.url} target="_blank" rel="noreferrer">
                            <img src={p.url} alt={p.description || `Photo ${i + 1}`} className="w-14 h-14 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    )}

                    {item.adminResponse && (
                      <div className="mt-2 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-600">
                        <span className="font-semibold text-gray-700">Response{item.respondedBy ? ` (${item.respondedBy})` : ''}:</span> {item.adminResponse}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    {item.status === 'OPEN' && respondingId !== item._id && (
                      <button
                        onClick={() => { setRespondingId(item._id); setResponseText(''); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" /> Respond
                      </button>
                    )}
                    {item.status !== 'CLOSED' && item.status !== 'OPEN' && (
                      <button
                        onClick={() => handleStatusChange(item._id, 'CLOSED')}
                        disabled={processingId === item._id}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        {processingId === item._id ? <Loader className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
                        Close
                      </button>
                    )}
                  </div>
                </div>

                {respondingId === item._id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <textarea
                      value={responseText}
                      onChange={e => setResponseText(e.target.value)}
                      rows={3}
                      placeholder="Write your response to the customer..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleRespond(item._id)}
                        disabled={processingId === item._id}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-green-300"
                      >
                        {processingId === item._id ? 'Sending...' : 'Send Response'}
                      </button>
                      <button
                        onClick={() => { setRespondingId(null); setResponseText(''); }}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar user={user} onLogout={handleLogout} />
      <div className="ml-64">
        <DemoTopBar user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            {content()}
          </div>
        </div>
      </div>
    </div>
  );
}

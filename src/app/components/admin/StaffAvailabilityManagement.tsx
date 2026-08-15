import { useState, useEffect } from 'react';
import { UserCheck, UserX, Send, AlertTriangle, CheckCircle, X, Clock, RefreshCw } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';
import { toast } from 'sonner';

interface StaffStatus {
  staffEmail: string;
  staffName: string;
  status: 'available' | 'unavailable';
  timestamp: string;
  date: string;
  time: string;
}

interface AttentionBooking {
  _id: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  service: string;
  date: string;
  time: string;
  address: string;
  status: string;
  reason: string;
  teamMembers: { staffName: string; staffEmail: string }[];
}

export function StaffAvailabilityManagement() {
  const [staffStatuses, setStaffStatuses]               = useState<Record<string, boolean>>({});
  const [statusLogs, setStatusLogs]                     = useState<StaffStatus[]>([]);
  const [allAttentionBookings, setAllAttentionBookings] = useState<AttentionBooking[]>([]);
  const [resolving, setResolving]                       = useState<string | null>(null);

  // Per-booking notification modal
  const [notifyBooking, setNotifyBooking]   = useState<AttentionBooking | null>(null);
  const [notifyMessage, setNotifyMessage]   = useState('');
  const [sendingNotify, setSendingNotify]   = useState(false);
  const [notifiedIds, setNotifiedIds]       = useState<Set<string>>(new Set());

  const loadData = async () => {
    try {
      const data = await fetchWithAuth('/staff/all');
      if (data.success) {
        setStaffStatuses(data.staffStatuses || {});
        setStatusLogs(data.statusLogs || []);
      }
    } catch (err) {
      console.error('Failed to load staff availability:', err);
    }
  };

  const loadAttentionBookings = async () => {
    try {
      const data = await fetchWithAuth('/bookings/needs-attention');
      if (data.success) setAllAttentionBookings(data.bookings || []);
    } catch (err) {
      console.error('Failed to load attention bookings:', err);
    }
  };

  useEffect(() => {
    loadData();
    loadAttentionBookings();
  }, []);

  // ── Notify a single customer ──────────────────────────────────────────────
  const openNotifyModal = (booking: AttentionBooking) => {
    setNotifyBooking(booking);
    setNotifyMessage(
      `Dear ${booking.customerName},\n\nWe regret to inform you that your booking (${booking.service} on ${booking.date} at ${booking.time}) could not be fully staffed due to staff unavailability.\n\nWe kindly request you to reschedule your booking to another available date. Our team will assign staff for your service.\n\nWe apologize for any inconvenience caused.\n\nBest regards,\nCloud Laundry.LK Team`
    );
  };

  const sendNotification = async () => {
    if (!notifyBooking) return;
    setSendingNotify(true);

    // Save to localStorage so CustomerDashboard can display it
    const existing: any[] = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
    existing.unshift({
      id:            `NOTIF-${Date.now()}-${notifyBooking._id}`,
      bookingId:     notifyBooking._id,
      customerEmail: notifyBooking.customerEmail,
      customerName:  notifyBooking.customerName,
      subject:       'Action Required: Please Reschedule Your Booking',
      message:       notifyMessage,
      service:       notifyBooking.service,
      date:          notifyBooking.date,
      time:          notifyBooking.time,
      sentAt:        new Date().toISOString(),
      displayDate:   new Date().toLocaleDateString(),
      displayTime:   new Date().toLocaleTimeString(),
      type:          'reschedule',
      read:          false,
    });
    localStorage.setItem('customerNotifications', JSON.stringify(existing));

    setNotifiedIds(prev => new Set(prev).add(notifyBooking._id));
    toast.success(`Notification sent to ${notifyBooking.customerName}.`);
    setNotifyBooking(null);
    setSendingNotify(false);
  };

  // ── Mark a booking as resolved ────────────────────────────────────────────
  const resolveBooking = async (bookingId: string) => {
    setResolving(bookingId);
    try {
      const result = await fetchWithAuth(`/bookings/${bookingId}/resolve-attention`, { method: 'PATCH' });
      if (result.success) {
        setAllAttentionBookings(prev => prev.filter(b => b._id !== bookingId));
        toast.success('Booking marked as resolved.');
      }
    } catch {
      toast.error('Failed to resolve booking.');
    }
    setResolving(null);
  };

  const getUniqueStaff = () => {
    const seen = new Set<string>();
    const result: { email: string; name: string; status: boolean }[] = [];
    statusLogs.forEach(log => {
      if (!seen.has(log.staffEmail)) {
        seen.add(log.staffEmail);
        result.push({ email: log.staffEmail, name: log.staffName, status: staffStatuses[log.staffEmail] ?? true });
      }
    });
    Object.keys(staffStatuses).forEach(email => {
      if (!seen.has(email)) {
        seen.add(email);
        result.push({ email, name: email.split('@')[0], status: staffStatuses[email] });
      }
    });
    return result;
  };

  const uniqueStaff = getUniqueStaff();

  return (
    <div className="space-y-6">

      {/* ── Needs Admin Attention ─────────────────────────────────────────── */}
      {allAttentionBookings.length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-400 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <h2 className="text-lg font-bold text-orange-800">
              Needs Admin Attention ({allAttentionBookings.length})
            </h2>
            <button onClick={loadAttentionBookings} className="ml-auto text-orange-600 hover:text-orange-800">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-orange-700 mb-4">
            These bookings could not be fully staffed. Notify the customer and/or mark as resolved.
          </p>
          <div className="space-y-3">
            {allAttentionBookings.map(b => (
              <div key={b._id} className="bg-white border border-orange-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{b.customerName}</span>
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">{b.service}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{b.date} at {b.time} — {b.address}</p>
                    <p className="text-xs text-gray-500">{b.customerEmail}</p>
                    <p className="text-xs text-orange-700 font-medium mt-1">⚠ {b.reason}</p>
                    {b.teamMembers.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1 items-center">
                        <span className="text-xs text-gray-500">Currently assigned:</span>
                        {b.teamMembers.map((m, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                            {m.staffName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Action buttons */}
                  <div className="flex gap-2 flex-shrink-0 flex-wrap">
                    {notifiedIds.has(b._id) ? (
                      <span className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg font-medium flex items-center gap-1">
                        ✓ Customer Notified
                      </span>
                    ) : (
                      <button
                        onClick={() => openNotifyModal(b)}
                        className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        Notify Customer
                      </button>
                    )}
                    <button
                      onClick={() => resolveBooking(b._id)}
                      disabled={resolving === b._id}
                      className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {resolving === b._id ? 'Resolving...' : 'Mark Resolved'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Staff Status Cards ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Staff Availability Management</h2>
            <p className="text-sm text-gray-600 mt-1">Monitor staff availability</p>
          </div>
          <button onClick={() => { loadData(); loadAttentionBookings(); }} className="text-purple-600 hover:text-purple-800">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
       {/*staff availability cards*/}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {uniqueStaff.length > 0 ? (
            uniqueStaff.map(staff => (
              <div
                key={staff.email}
                className={`p-4 rounded-lg border-2 ${
                  staff.status ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {staff.status
                      ? <UserCheck className="w-5 h-5 text-green-600" />
                      : <UserX className="w-5 h-5 text-red-600" />
                    }
                    <span className="font-semibold text-gray-900">{staff.name}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    staff.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {staff.status ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{staff.email}</p>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No staff availability data yet</p>
              <p className="text-sm mt-1">Staff members will appear here once they update their status</p>
            </div>
          )}
        </div>

        {/* Status Change Logs */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Change History</h3>
          <div className="space-y-2">
            {statusLogs.length > 0 ? (
              statusLogs.slice(0, 10).map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {log.status === 'available'
                      ? <CheckCircle className="w-5 h-5 text-green-600" />
                      : <AlertTriangle className="w-5 h-5 text-red-600" />
                    }
                    <div>
                      <p className="font-medium text-gray-900">{log.staffName}</p>
                      <p className="text-xs text-gray-600">{log.staffEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      log.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status === 'available' ? 'Available' : 'Unavailable'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{log.date} at {log.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No status changes recorded</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Per-booking Notify Modal ──────────────────────────────────────── */}
      {notifyBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Notify Customer</h3>
                <button onClick={() => setNotifyBooking(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm">
                <p className="font-medium text-gray-900">{notifyBooking.customerName}</p>
                <p className="text-gray-600">{notifyBooking.service} — {notifyBooking.date} at {notifyBooking.time}</p>
                <p className="text-xs text-gray-500">{notifyBooking.customerEmail}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message to Customer</label>
                <textarea
                  value={notifyMessage}
                  onChange={e => setNotifyMessage(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={sendNotification}
                  disabled={sendingNotify}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 font-semibold disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {sendingNotify ? 'Sending...' : 'Send Notification'}
                </button>
                <button
                  onClick={() => setNotifyBooking(null)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

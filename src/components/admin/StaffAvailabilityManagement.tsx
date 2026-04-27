import { useState, useEffect } from 'react';
import { UserCheck, UserX, Bell, Send, AlertTriangle, CheckCircle, X, Clock } from 'lucide-react';

interface StaffStatus {
  staffEmail: string;
  staffName: string;
  status: 'available' | 'unavailable';
  timestamp: string;
  date: string;
  time: string;
}

interface Booking {
  id: string;
  customer: string;
  customerEmail: string;
  service: string;
  date: string;
  time: string;
  staffEmail?: string;
  status: string;
}

export function StaffAvailabilityManagement() {
  const [staffStatuses, setStaffStatuses] = useState<Record<string, boolean>>({});
  const [statusLogs, setStatusLogs] = useState<StaffStatus[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [affectedBookings, setAffectedBookings] = useState<Booking[]>([]);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    // Load staff availability from localStorage
    const statuses = JSON.parse(localStorage.getItem('staffAvailability') || '{}');
    setStaffStatuses(statuses);

    // Load status logs
    const logs = JSON.parse(localStorage.getItem('staffStatusLogs') || '[]');
    setStatusLogs(logs);
  }, []);

  const getAffectedBookings = (staffEmail: string): Booking[] => {
    // Mock function to get bookings assigned to this staff
    // In a real app, this would fetch from backend
    const today = new Date().toISOString().split('T')[0];
    const mockBookings: Booking[] = [
      {
        id: 'B001',
        customer: 'John Doe',
        customerEmail: 'john@example.com',
        service: 'Home Cleaning',
        date: today,
        time: '10:00 AM',
        staffEmail: staffEmail,
        status: 'confirmed',
      },
      {
        id: 'B002',
        customer: 'Jane Smith',
        customerEmail: 'jane@example.com',
        service: 'Laundry Service',
        date: today,
        time: '02:00 PM',
        staffEmail: staffEmail,
        status: 'pending',
      },
    ];
    return mockBookings.filter(b => b.staffEmail === staffEmail);
  };

  const handleNotifyCustomers = (staffEmail: string, staffName: string) => {
    const bookings = getAffectedBookings(staffEmail);
    setAffectedBookings(bookings);
    setSelectedStaff(staffName);
    setNotificationMessage(
      `Dear Customer,\n\nWe regret to inform you that your assigned staff member (${staffName}) is unavailable today due to unforeseen circumstances.\n\nWe kindly request you to reschedule your booking to another date. Our team will assign a new staff member for your service.\n\nWe apologize for any inconvenience caused.\n\nBest regards,\nCloud Laundry.LK Team`
    );
    setShowNotificationModal(true);
  };

  const sendNotifications = () => {
    // Save notifications to localStorage
    const notifications = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
    
    affectedBookings.forEach(booking => {
      notifications.unshift({
        id: `NOTIF-${Date.now()}-${booking.id}`,
        bookingId: booking.id,
        customerEmail: booking.customerEmail,
        customerName: booking.customer,
        subject: 'Request to Reschedule Booking - Staff Unavailable',
        message: notificationMessage,
        sentAt: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        status: 'sent',
        type: 'reschedule',
      });
    });

    localStorage.setItem('customerNotifications', JSON.stringify(notifications));

    alert(`✅ Notifications sent to ${affectedBookings.length} customer(s)!`);
    setShowNotificationModal(false);
    setAffectedBookings([]);
    setSelectedStaff(null);
  };

  const getUniqueStaff = () => {
    const staffEmails = new Set<string>();
    const staffData: Array<{ email: string; name: string; status: boolean }> = [];

    // Get staff from status logs
    statusLogs.forEach(log => {
      if (!staffEmails.has(log.staffEmail)) {
        staffEmails.add(log.staffEmail);
        staffData.push({
          email: log.staffEmail,
          name: log.staffName,
          status: staffStatuses[log.staffEmail] !== undefined ? staffStatuses[log.staffEmail] : true,
        });
      }
    });

    // Add staff from staffStatuses that might not be in logs yet
    Object.keys(staffStatuses).forEach(email => {
      if (!staffEmails.has(email)) {
        staffEmails.add(email);
        staffData.push({
          email: email,
          name: email.split('@')[0], // Use email prefix as name if not in logs
          status: staffStatuses[email],
        });
      }
    });

    return staffData;
  };

  const uniqueStaff = getUniqueStaff();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Staff Availability Management</h2>
            <p className="text-sm text-gray-600 mt-1">Monitor staff availability and notify customers</p>
          </div>
          <Bell className="w-8 h-8 text-purple-600" />
        </div>

        {/* Current Staff Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {uniqueStaff.length > 0 ? (
            uniqueStaff.map((staff) => (
              <div
                key={staff.email}
                className={`p-4 rounded-lg border-2 ${
                  staff.status
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {staff.status ? (
                      <UserCheck className="w-5 h-5 text-green-600" />
                    ) : (
                      <UserX className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-semibold text-gray-900">{staff.name}</span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      staff.status
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {staff.status ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">{staff.email}</p>
                {!staff.status && (
                  <button
                    onClick={() => handleNotifyCustomers(staff.email, staff.name)}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <Send className="w-4 h-4" />
                    Notify Customers
                  </button>
                )}
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
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {log.status === 'available' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{log.staffName}</p>
                      <p className="text-xs text-gray-600">{log.staffEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        log.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {log.status === 'available' ? 'Available' : 'Unavailable'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {log.date} at {log.time}
                    </p>
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

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  Notify Customers - {selectedStaff}
                </h3>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Affected Bookings */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Affected Bookings ({affectedBookings.length})
                </h4>
                <div className="space-y-2">
                  {affectedBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-3 bg-orange-50 border border-orange-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{booking.customer}</p>
                          <p className="text-sm text-gray-600">{booking.service}</p>
                          <p className="text-xs text-gray-500">
                            {booking.date} at {booking.time}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                          Needs Reschedule
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification Message */}
              <div className="mb-6">
                <label className="block font-semibold text-gray-900 mb-2">
                  Notification Message
                </label>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={sendNotifications}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  <Send className="w-5 h-5" />
                  Send Notifications
                </button>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
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

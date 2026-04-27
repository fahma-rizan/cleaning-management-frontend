import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, User, Calendar, Clock, MapPin, Bell } from 'lucide-react';

interface DeclinedTask {
  id: string;
  customer: string;
  service: string;
  date: string;
  time: string;
  address: string;
  amount: number;
  declinedBy: string;
  declinedByName: string;
  declineReason: string;
  declinedAt: string;
  declinedDate: string;
  declinedTime: string;
  status: string;
}

interface Reassignment {
  taskId: string;
  originalStaff: string;
  originalStaffName: string;
  newStaff: string;
  newStaffName: string;
  reason: string;
  reassignedAt: string;
  reassignedDate: string;
  reassignedTime: string;
  taskDetails: any;
  status: string;
}

interface AdminNotification {
  id: string;
  type: string;
  taskId: string;
  originalStaff?: string;
  newStaff?: string;
  declinedBy?: string;
  reason: string;
  customer: string;
  service: string;
  date: string;
  time: string;
  message: string;
  timestamp: string;
  notificationDate: string;
  notificationTime: string;
  status: string;
}

export function TaskReassignmentManagement() {
  const [declinedTasks, setDeclinedTasks] = useState<DeclinedTask[]>([]);
  const [reassignments, setReassignments] = useState<Reassignment[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [activeView, setActiveView] = useState<'notifications' | 'declined' | 'reassigned'>('notifications');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load declined tasks
    const declined = JSON.parse(localStorage.getItem('declinedTasks') || '[]');
    setDeclinedTasks(declined);

    // Load reassignments
    const assigned = JSON.parse(localStorage.getItem('taskReassignments') || '[]');
    setReassignments(assigned);

    // Load admin notifications
    const notifs = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    setNotifications(notifs);
  };

  const markNotificationAsRead = (id: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, status: 'read' } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
  };

  const clearAllNotifications = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      localStorage.setItem('adminNotifications', JSON.stringify([]));
      setNotifications([]);
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Task Reassignment Management</h2>
            <p className="text-sm text-gray-600 mt-1">Monitor declined tasks and automatic reassignments</p>
          </div>
          <div className="relative">
            <Bell className="w-8 h-8 text-purple-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-3 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveView('notifications')}
            className={`px-4 py-2 border-b-2 transition-all font-medium text-sm relative ${
              activeView === 'notifications'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveView('declined')}
            className={`px-4 py-2 border-b-2 transition-all font-medium text-sm ${
              activeView === 'declined'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Declined Tasks ({declinedTasks.length})
          </button>
          <button
            onClick={() => setActiveView('reassigned')}
            className={`px-4 py-2 border-b-2 transition-all font-medium text-sm ${
              activeView === 'reassigned'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Reassignments ({reassignments.length})
          </button>
        </div>

        {/* Notifications View */}
        {activeView === 'notifications' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Admin Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border-2 ${
                      notification.status === 'unread'
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {notification.type === 'task-reassigned' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                        )}
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            notification.type === 'task-reassigned'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {notification.type === 'task-reassigned' ? 'Auto-Reassigned' : 'Needs Attention'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {notification.notificationDate} at {notification.notificationTime}
                      </div>
                    </div>

                    <p className="text-sm font-medium text-gray-900 mb-2">{notification.message}</p>

                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div>
                        <span className="text-gray-500">Task ID:</span>
                        <span className="ml-2 font-medium text-gray-900">{notification.taskId}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Customer:</span>
                        <span className="ml-2 font-medium text-gray-900">{notification.customer}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Service:</span>
                        <span className="ml-2 font-medium text-gray-900">{notification.service}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <span className="ml-2 font-medium text-gray-900">{notification.date} at {notification.time}</span>
                      </div>
                    </div>

                    {notification.type === 'task-reassigned' && (
                      <div className="bg-green-100 p-3 rounded-lg mb-3">
                        <p className="text-sm text-green-800">
                          <strong>From:</strong> {notification.originalStaff} → <strong>To:</strong> {notification.newStaff}
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          <strong>Reason:</strong> {notification.reason}
                        </p>
                      </div>
                    )}

                    {notification.type === 'task-declined-no-staff' && (
                      <div className="bg-orange-100 p-3 rounded-lg mb-3">
                        <p className="text-sm text-orange-800">
                          <strong>Declined by:</strong> {notification.declinedBy}
                        </p>
                        <p className="text-xs text-orange-700 mt-1">
                          <strong>Reason:</strong> {notification.reason}
                        </p>
                        <p className="text-xs text-orange-700 mt-1 font-semibold">
                          ⚠️ No available staff for automatic reassignment
                        </p>
                      </div>
                    )}

                    {notification.status === 'unread' && (
                      <button
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        )}

        {/* Declined Tasks View */}
        {activeView === 'declined' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Declined Tasks History</h3>

            {declinedTasks.length > 0 ? (
              <div className="space-y-3">
                {declinedTasks.map((task) => (
                  <div key={task.id} className="p-4 rounded-lg border-2 border-red-200 bg-red-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <h4 className="font-semibold text-gray-900">{task.service}</h4>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                            Task #{task.id}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>Customer: {task.customer}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{task.date} at {task.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{task.address}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">
                          LKR {task.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg mb-2">
                      <div className="text-sm">
                        <p className="text-gray-700 mb-1">
                          <strong>Declined by:</strong> {task.declinedByName} ({task.declinedBy})
                        </p>
                        <p className="text-gray-700 mb-1">
                          <strong>Reason:</strong> {task.declineReason}
                        </p>
                        <p className="text-xs text-gray-500">
                          Declined on {task.declinedDate} at {task.declinedTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={`px-2 py-1 rounded font-medium ${
                          task.status === 'pending-reassignment'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {task.status === 'pending-reassignment' ? 'Pending Reassignment' : 'Reassigned'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No declined tasks</p>
              </div>
            )}
          </div>
        )}

        {/* Reassignments View */}
        {activeView === 'reassigned' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Automatic Reassignments</h3>

            {reassignments.length > 0 ? (
              <div className="space-y-3">
                {reassignments.map((reassignment, index) => (
                  <div key={index} className="p-4 rounded-lg border-2 border-green-200 bg-green-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <RefreshCw className="w-5 h-5 text-green-600" />
                          <h4 className="font-semibold text-gray-900">{reassignment.taskDetails.service}</h4>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            Task #{reassignment.taskId}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>Customer: {reassignment.taskDetails.customer}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{reassignment.taskDetails.date} at {reassignment.taskDetails.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{reassignment.taskDetails.address}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">
                          LKR {reassignment.taskDetails.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg mb-2">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">
                            <strong>From:</strong> {reassignment.originalStaffName}
                          </p>
                          <p className="text-xs text-gray-500">{reassignment.originalStaff}</p>
                        </div>
                        <RefreshCw className="w-5 h-5 text-purple-600" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">
                            <strong>To:</strong> {reassignment.newStaffName}
                          </p>
                          <p className="text-xs text-gray-500">{reassignment.newStaff}</p>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <p className="text-sm text-gray-700">
                          <strong>Reason:</strong> {reassignment.reason}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Reassigned on {reassignment.reassignedDate} at {reassignment.reassignedTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">Automatically Reassigned</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <RefreshCw className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No reassignments yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

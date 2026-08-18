import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle, Clock, Package, Star, Gift, TrendingUp, MapPin, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tokenStorage } from '../utils/auth';

const API_BASE_URL = 'http://localhost:5000/api';

export type NotificationType = 
  | 'order-confirmed' 
  | 'tracking-update' 
  | 'worker-arrival' 
  | 'reminder' 
  | 'promotion' 
  | 'recommendation'
  | 'payment'
  | 'rating-request'
  | 'loyalty-points'
  | 'complaint-received'
  | 'complaint-update'
  | 'complaint-resolved'
  | 'complaint-rejected'
  | 'payment-reduction-approved'
  | 'invoice-approval';

export interface Notification {
  _id: string; // Changed from id to _id to match MongoDB
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string; // Changed from timestamp to createdAt
  read: boolean;
  actionUrl?: string;
  bookingId?: string;
  userId: string;
}

interface NotificationCenterProps {
  userId: string;
}

export default function NotificationCenter({ userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (userId && !hasFetched.current) {
      loadNotifications();
      requestNotificationPermission();
      hasFetched.current = true;
    }
  }, [userId]);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const loadNotifications = async () => {
    if (!userId) return;
    try {
      const accessToken = tokenStorage.getAccessToken();
      const headers: Record<string, string> = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      // FIX: use /user/:userId (auth-protected) not /:userId (which no longer exists)
      const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}`, {
        headers,
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data: Notification[] = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    setIsOpen(false);
  };

  const markAsRead = async (notificationId: string) => {
    // Optimistic UI update
    setNotifications(prev => 
      prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
    );

    try {
      const accessToken = tokenStorage.getAccessToken();
      await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      // No need to refetch, UI is already updated
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Revert UI update on error
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: false } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    // Optimistic UI update
    const originalNotifications = [...notifications];
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
      const accessToken = tokenStorage.getAccessToken();
      await fetch(`${API_BASE_URL}/notifications/mark-all-read/${userId}`, {
        method: 'PUT',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      // Revert on error
      setNotifications(originalNotifications);
    }
  };

  const deleteAllNotifications = async () => {
    const originalNotifications = [...notifications];
    setNotifications([]);

    try {
      const accessToken = tokenStorage.getAccessToken();
      await fetch(`${API_BASE_URL}/notifications/user/${userId}`, {
        method: 'DELETE',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      setNotifications(originalNotifications);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    // Optimistic UI update
    const originalNotifications = [...notifications];
    setNotifications(prev => prev.filter(n => n._id !== notificationId));

    try {
      const accessToken = tokenStorage.getAccessToken();
      await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      setNotifications(originalNotifications);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    const icons: Record<NotificationType, any> = {
      'order-confirmed': CheckCircle,
      'tracking-update': Package,
      'worker-arrival': MapPin,
      'reminder': Clock,
      'promotion': Gift,
      'recommendation': TrendingUp,
      'payment': CheckCircle,
      'rating-request': Star,
      'loyalty-points': Star,
      'complaint-received': Bell,
      'complaint-update': Bell,
      'complaint-resolved': CheckCircle,
      'complaint-rejected': Bell,
      'payment-reduction-approved': CheckCircle,
      'invoice-approval': FileText,
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type: NotificationType) => {
    const colors: Record<NotificationType, string> = {
      'order-confirmed': 'bg-green-100 text-green-600',
      'tracking-update': 'bg-blue-100 text-blue-600',
      'worker-arrival': 'bg-purple-100 text-purple-600',
      'reminder': 'bg-yellow-100 text-yellow-600',
      'promotion': 'bg-pink-100 text-pink-600',
      'recommendation': 'bg-indigo-100 text-indigo-600',
      'payment': 'bg-green-100 text-green-600',
      'rating-request': 'bg-orange-100 text-orange-600',
      'loyalty-points': 'bg-amber-100 text-amber-600',
      'complaint-received': 'bg-red-100 text-red-600',
      'complaint-update': 'bg-orange-100 text-orange-600',
      'complaint-resolved': 'bg-green-100 text-green-600',
      'complaint-rejected': 'bg-red-100 text-red-600',
      'payment-reduction-approved': 'bg-teal-100 text-teal-600',
      'invoice-approval': 'bg-purple-100 text-purple-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return ''; // Guard against undefined timestamp
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors ${
          'hover:bg-gray-100 text-gray-700'
        }`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className={`absolute right-0 mt-2 w-96 max-h-[600px] rounded-xl shadow-2xl overflow-hidden z-50 ${
            'bg-white'
          }`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-purple-600 text-white">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <h3 className="text-lg">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-white text-purple-600 text-xs px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-purple-700 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Controls */}
            {notifications.length > 0 && (
              <div className="p-2 border-b border-gray-200 flex justify-between items-center">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="text-sm text-purple-600 hover:text-purple-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Mark all as read
                </button>
                <button
                  onClick={deleteAllNotifications}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[500px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const iconColor = getNotificationColor(notification.type);
                    
                    return (
                      <div
                        key={notification._id}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-purple-50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-lg flex-shrink-0 h-fit ${iconColor}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(notification.createdAt)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification._id);
                                }}
                                className="text-xs text-red-500 hover:text-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, Clock, Package, Star, Gift, TrendingUp, MapPin } from 'lucide-react';

export type NotificationType = 
  | 'order-confirmed' 
  | 'tracking-update' 
  | 'worker-arrival' 
  | 'reminder' 
  | 'promotion' 
  | 'recommendation'
  | 'payment'
  | 'rating-request';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  bookingId?: string;
}

interface NotificationCenterProps {
  userId: string;
  theme?: 'light' | 'dark';
}

export default function NotificationCenter({ userId, theme = 'light' }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load notifications from localStorage
    loadNotifications();
  }, [userId]);

  useEffect(() => {
    // Count unread notifications
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const loadNotifications = () => {
    const stored = localStorage.getItem(`notifications_${userId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      setNotifications(parsed);
    } else {
      // Demo notifications
      const demoNotifications = generateDemoNotifications();
      setNotifications(demoNotifications);
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(demoNotifications));
    }
  };

  const generateDemoNotifications = (): Notification[] => {
    return [
      {
        id: 'n1',
        type: 'order-confirmed',
        title: 'Booking Confirmed! 🎉',
        message: 'Your home cleaning service is scheduled for Feb 12, 2026 at 10:00 AM. Booking ID: BK-1001',
        timestamp: new Date().toISOString(),
        read: false,
        bookingId: 'BK-1001',
      },
      {
        id: 'n2',
        type: 'tracking-update',
        title: 'Service Team On The Way',
        message: 'Your cleaning team has started and will arrive in approximately 15 minutes.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
        bookingId: 'BK-1001',
      },
      {
        id: 'n3',
        type: 'reminder',
        title: 'Service Reminder',
        message: 'Your home cleaning service is scheduled for tomorrow at 10:00 AM. Make sure someone is available.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        read: true,
      },
      {
        id: 'n4',
        type: 'promotion',
        title: 'Special Festive Offer! 🎊',
        message: 'Get 25% off on all cleaning services this weekend. Use code: FEST25',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        read: false,
      },
    ];
  };

  const markAsRead = (notificationId: string) => {
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
  };

  const deleteNotification = (notificationId: string) => {
    const updated = notifications.filter(n => n.id !== notificationId);
    setNotifications(updated);
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
  };

  const getNotificationIcon = (type: NotificationType) => {
    const icons = {
      'order-confirmed': CheckCircle,
      'tracking-update': Package,
      'worker-arrival': MapPin,
      'reminder': Clock,
      'promotion': Gift,
      'recommendation': TrendingUp,
      'payment': CheckCircle,
      'rating-request': Star,
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type: NotificationType) => {
    const colors = {
      'order-confirmed': 'bg-green-100 text-green-600',
      'tracking-update': 'bg-blue-100 text-blue-600',
      'worker-arrival': 'bg-purple-100 text-purple-600',
      'reminder': 'bg-yellow-100 text-yellow-600',
      'promotion': 'bg-pink-100 text-pink-600',
      'recommendation': 'bg-indigo-100 text-indigo-600',
      'payment': 'bg-green-100 text-green-600',
      'rating-request': 'bg-orange-100 text-orange-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const formatTimestamp = (timestamp: string) => {
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
          theme === 'dark' 
            ? 'hover:bg-gray-700 text-white' 
            : 'hover:bg-gray-100 text-gray-700'
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
            theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
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

            {/* Mark all as read */}
            {unreadCount > 0 && (
              <div className="p-2 border-b border-gray-200">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  Mark all as read
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
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-purple-50' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
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
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
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

// Export function to add notifications programmatically
export const addNotification = (userId: string, notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
  const stored = localStorage.getItem(`notifications_${userId}`);
  const notifications: Notification[] = stored ? JSON.parse(stored) : [];
  
  const newNotification: Notification = {
    ...notification,
    id: `n${Date.now()}`,
    timestamp: new Date().toISOString(),
    read: false,
  };
  
  notifications.unshift(newNotification);
  localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
  
  // Also send browser notification if permitted
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/logo.png',
    });
  }
};

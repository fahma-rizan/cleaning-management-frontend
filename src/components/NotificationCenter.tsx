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
    loadNotifications();
  }, [userId]);

  useEffect(() => {
    const count = notifications.filter((n) => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const loadNotifications = () => {
    const stored = localStorage.getItem(`notifications_${userId}`);
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      const demo = generateDemoNotifications();
      setNotifications(demo);
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(demo));
    }
  };

  const generateDemoNotifications = (): Notification[] => [
    {
      id: 'n1',
      type: 'order-confirmed',
      title: 'Booking Confirmed! 🎉',
      message: 'Your home cleaning service is scheduled for Feb 12, 2026 at 10:00 AM.',
      timestamp: new Date().toISOString(),
      read: false,
      bookingId: 'BK-1001',
    },
    {
      id: 'n2',
      type: 'promotion',
      title: 'Special Offer! 🎊',
      message: 'Get 25% off on all cleaning services this weekend. Use code: FEST25',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      read: false,
    },
  ];

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
  };

  const getIcon = (type: NotificationType) => {
    const map: Record<NotificationType, any> = {
      'order-confirmed': CheckCircle,
      'tracking-update': Package,
      'worker-arrival': MapPin,
      reminder: Clock,
      promotion: Gift,
      recommendation: TrendingUp,
      payment: CheckCircle,
      'rating-request': Star,
    };
    return map[type] || Bell;
  };

  const getColor = (type: NotificationType) => {
    const map: Record<NotificationType, string> = {
      'order-confirmed': 'bg-green-100 text-green-600',
      'tracking-update': 'bg-blue-100 text-blue-600',
      'worker-arrival': 'bg-purple-100 text-purple-600',
      reminder: 'bg-yellow-100 text-yellow-600',
      promotion: 'bg-pink-100 text-pink-600',
      recommendation: 'bg-indigo-100 text-indigo-600',
      payment: 'bg-green-100 text-green-600',
      'rating-request': 'bg-orange-100 text-orange-600',
    };
    return map[type] || 'bg-gray-100 text-gray-600';
  };

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors ${
          theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute right-0 mt-2 w-96 max-h-[500px] rounded-xl shadow-2xl overflow-hidden z-50 ${
              theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
            }`}
          >
            <div className="p-4 border-b flex justify-between items-center bg-purple-600 text-white">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <h3 className="text-lg">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-white text-purple-600 text-xs px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-purple-700 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {unreadCount > 0 && (
              <div className="p-2 border-b">
                <button onClick={markAllAsRead} className="text-sm text-purple-600 hover:text-purple-700">
                  Mark all as read
                </button>
              </div>
            )}

            <div className="overflow-y-auto max-h-[400px] divide-y">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = getIcon(n.type);
                  return (
                    <div
                      key={n.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-purple-50' : ''}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 h-fit ${getColor(n.type)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`text-sm ${!n.read ? 'font-semibold' : ''}`}>{n.title}</h4>
                            {!n.read && <span className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-1" />}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{n.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{formatTime(n.timestamp)}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                              className="text-xs text-red-500 hover:text-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

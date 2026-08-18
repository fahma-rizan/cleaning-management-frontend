const API_BASE_URL = 'http://localhost:5000/api';

// All notification types across the entire system
export type NotificationType =
  | 'payment'
  | 'payment-failed'
  | 'order-confirmed'
  | 'loyalty-points'
  | 'refund-initiated'
  | 'cancellation'
  | 'update'
  | 'reminder'
  | 'tracking-update'
  | 'worker-arrival'
  | 'promotion'
  | 'recommendation'
  | 'rating-request'
  // complaint types — for teammates to use
  | 'complaint-received'
  | 'complaint-update'
  | 'complaint-resolved'
  | 'complaint-rejected'
  | 'payment-reduction-approved'
  | 'invoice-approval';

export interface NewNotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  bookingId?: string;
  actionUrl?: string;
  complaintId?: string;
}

/**
 * Sends a new notification to the backend server (MongoDB via Express API).
 * Called anywhere in the app when a notification should be created.
 *
 * @example
 * await addNotification({
 *   userId: user.id,
 *   type: 'order-confirmed',
 *   title: 'Booking Confirmed! 🎉',
 *   message: 'Your service is scheduled for March 15.',
 *   bookingId: 'BK-2026-001',
 * });
 */
export const addNotification = async (notificationData: NewNotificationPayload): Promise<void> => {
  try {
    // Get token for authenticated POST (required after our notifications.js fix)
    const tokens = (await import('./auth')).tokenStorage.getTokens();
    const authHeader = tokens?.accessToken
      ? { Authorization: `Bearer ${tokens.accessToken}` } : {};

    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to add notification:', errorText);
      return;
    }

    const newNotification = await response.json();
    console.log('Notification saved to DB:', newNotification);

    // Also fire a browser push notification if permission granted
    if ('Notification' in window && window.Notification.permission === 'granted') {
      new window.Notification(notificationData.title, {
        body: notificationData.message,
        icon: '/logo.png',
      });
    }
  } catch (error) {
    // Error is caught but not handled to keep the console clean.
  }
};
import { authApi } from './auth';

export interface AuditLogEntry {
  _id?: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  status: 'success' | 'failure' | 'warning';
}

export interface AuditLogger {
  log: (entry: Omit<AuditLogEntry, '_id' | 'timestamp' | 'ipAddress' | 'userAgent'>) => Promise<void>;
  logAdminAction: (action: string, resource: string, resourceId?: string, details?: Record<string, any>) => Promise<void>;
}

// Audit logging utility
export const auditLogger: AuditLogger = {
  // Generic audit log method
  async log(entry: Omit<AuditLogEntry, '_id' | 'timestamp' | 'ipAddress' | 'userAgent'>): Promise<void> {
    try {
      await authApi.apiCall('/audit/log', {
        method: 'POST',
        body: JSON.stringify({
          ...entry,
          timestamp: new Date(),
          ipAddress: await auditLogger.getClientIP(),
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // Don't throw - audit logging failures shouldn't break the app
    }
  },

  // Convenience method for admin actions
  async logAdminAction(action: string, resource: string, resourceId?: string, details?: Record<string, any>): Promise<void> {
    const tokens = JSON.parse(localStorage.getItem('authTokens') || '{}');
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (!user?.id || !user?.email) {
      console.warn('Cannot log admin action: user not authenticated');
      return;
    }

    await auditLogger.log({
      userId: user.id,
      userEmail: user.email,
      action,
      resource,
      resourceId,
      details,
      status: 'success',
    });
  },

  // Get client IP (best effort)
  async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  },
};

// Predefined audit actions
export const AUDIT_ACTIONS = {
  // Admin actions
  ADMIN_LOGIN: 'admin_login',
  ADMIN_LOGOUT: 'admin_logout',
  ADMIN_PASSWORD_CHANGE: 'admin_password_change',

  // Invoice actions
  INVOICE_CREATE: 'invoice_create',
  INVOICE_UPDATE: 'invoice_update',
  INVOICE_DELETE: 'invoice_delete',
  INVOICE_VIEW: 'invoice_view',

  // Payment actions
  PAYMENT_PROCESS: 'payment_process',
  PAYMENT_REFUND: 'payment_refund',
  PAYMENT_CANCEL: 'payment_cancel',

  // Booking actions
  BOOKING_CREATE: 'booking_create',
  BOOKING_UPDATE: 'booking_update',
  BOOKING_CANCEL: 'booking_cancel',
  BOOKING_COMPLETE: 'booking_complete',

  // Notification actions
  NOTIFICATION_SEND: 'notification_send',
  NOTIFICATION_DELETE: 'notification_delete',

  // Report actions
  REPORT_GENERATE: 'report_generate',
  REPORT_EXPORT: 'report_export',

  // System actions
  SYSTEM_BACKUP: 'system_backup',
  SYSTEM_MAINTENANCE: 'system_maintenance',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];
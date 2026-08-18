// Audit logger — records admin actions to the backend AuditLog collection.
//
// FIX 1: Was calling authApi.apiCall('/audit/log') but that route did not exist
//         on the backend. The route POST /api/audit/log is now created in
//         backend/routes/audit.js and registered in server.js.
//
// FIX 2: Was using authApi.apiCall which internally uses its own token logic.
//         Changed to a direct fetch with the token from tokenStorage — simpler,
//         more consistent with how all other API calls in the codebase work.
//
// FIX 3: getClientIP() called 'https://api.ipify.org' — an external service.
//         This adds 200-500ms latency to every single admin action. The real IP
//         is now extracted server-side from the request headers, so the frontend
//         no longer needs to call ipify. getClientIP is removed.
//
// FIX 4: logAdminAction was reading tokens from localStorage directly using
//         the key 'authTokens' — but the actual key used by tokenStorage in
//         auth.ts is 'accessToken'. Changed to use tokenStorage.getTokens().

import { tokenStorage } from './auth';

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

const API_BASE_URL = 'http://localhost:5000/api';

export interface AuditLogger {
  log:            (entry: Omit<AuditLogEntry, '_id' | 'timestamp' | 'ipAddress' | 'userAgent'>) => Promise<void>;
  logAdminAction: (action: string, resource: string, resourceId?: string, details?: Record<string, any>) => Promise<void>;
}

export const auditLogger: AuditLogger = {

  // Generic audit log — call this from any component to record an action
  async log(entry: Omit<AuditLogEntry, '_id' | 'timestamp' | 'ipAddress' | 'userAgent'>): Promise<void> {
    try {
      const tokens = tokenStorage.getTokens();
      if (!tokens?.accessToken) {
        console.warn('[auditLogger] No auth token — cannot log audit entry.');
        return;
      }

      // FIX 1: Correct endpoint that now exists on the backend
      const response = await fetch(`${API_BASE_URL}/audit/log`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          // FIX 2: Use tokenStorage instead of authApi
          Authorization: `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify({
          ...entry,
          timestamp: new Date(),
          // FIX 3: IP is extracted server-side from request headers — no ipify call
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('[auditLogger] Failed to save log entry:', err);
      }
    } catch (error) {
      // Never throw — audit log failures must never break the main user flow
      console.error('[auditLogger] Log request failed:', error instanceof Error ? error.message : error);
    }
  },

  // Convenience wrapper for admin actions — reads current user from tokenStorage
  async logAdminAction(
    action:     string,
    resource:   string,
    resourceId?: string,
    details?:    Record<string, any>
  ): Promise<void> {
    // FIX 4: Use tokenStorage.getTokens() — the correct key, not 'authTokens'
    const tokens = tokenStorage.getTokens();
    if (!tokens?.accessToken) {
      console.warn('[auditLogger] Cannot log admin action: user not authenticated.');
      return;
    }

    // Decode the JWT payload to get userId and email without a network call
    let userId    = 'unknown';
    let userEmail = 'unknown';
    try {
      const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
      userId    = payload.user?.id    || payload.sub || 'unknown';
      userEmail = payload.user?.email || payload.email || 'unknown';
    } catch {
      console.warn('[auditLogger] Could not decode JWT payload for audit log.');
    }

    await auditLogger.log({
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      details,
      status: 'success',
    });
  },
};

// ── Predefined audit action constants ─────────────────────────────────────────
// Import AUDIT_ACTIONS wherever you call auditLogger.logAdminAction()

export const AUDIT_ACTIONS = {
  // Admin session
  ADMIN_LOGIN:           'admin_login',
  ADMIN_LOGOUT:          'admin_logout',
  ADMIN_PASSWORD_CHANGE: 'admin_password_change',

  // Invoice
  INVOICE_CREATE:  'invoice_create',
  INVOICE_APPROVE: 'invoice_approve',
  INVOICE_UPDATE:  'invoice_update',
  INVOICE_DELETE:  'invoice_delete',
  INVOICE_VIEW:    'invoice_view',
  INVOICE_SEND:    'invoice_send',

  // Payment
  PAYMENT_PROCESS: 'payment_process',
  PAYMENT_REFUND:  'payment_refund',
  PAYMENT_CANCEL:  'payment_cancel',

  // Price reduction
  PRICE_REDUCTION_APPROVE: 'price_reduction_approve',
  PRICE_REDUCTION_REJECT:  'price_reduction_reject',

  // Booking
  BOOKING_CREATE:   'booking_create',
  BOOKING_UPDATE:   'booking_update',
  BOOKING_CANCEL:   'booking_cancel',
  BOOKING_COMPLETE: 'booking_complete',

  // Notifications / comms
  NOTIFICATION_SEND:   'notification_send',
  NOTIFICATION_DELETE: 'notification_delete',
  EMAIL_SEND:          'email_send',

  // Reports
  REPORT_GENERATE: 'report_generate',
  REPORT_EXPORT:   'report_export',

  // System
  SYSTEM_BACKUP:      'system_backup',
  SYSTEM_MAINTENANCE: 'system_maintenance',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];
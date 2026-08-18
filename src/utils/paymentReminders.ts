import { addNotification } from './notificationUtils';
import { auditLogger, AUDIT_ACTIONS } from './auditLogger';

export interface PaymentReminder {
  _id?: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerEmail: string;
  amount: number;
  dueDate: Date;
  reminderType: 'first' | 'second' | 'final' | 'overdue';
  sentAt: Date;
  status: 'sent' | 'failed' | 'pending';
}

export interface PaymentReminderConfig {
  firstReminderDays: number;    // Days before due date for first reminder
  secondReminderDays: number;   // Days before due date for second reminder
  finalReminderDays: number;    // Days before due date for final reminder
  overdueReminderHours: number; // Hours after due date for overdue reminder
  maxReminders: number;         // Maximum reminders per invoice
}

const DEFAULT_CONFIG: PaymentReminderConfig = {
  firstReminderDays: 7,
  secondReminderDays: 3,
  finalReminderDays: 1,
  overdueReminderHours: 24,
  maxReminders: 4,
};

export class PaymentReminderService {
  private config: PaymentReminderConfig;
  private apiBaseUrl: string;

  constructor(config: Partial<PaymentReminderConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  }

  // Check for invoices that need payment reminders
  async checkAndSendReminders(): Promise<void> {
    try {
      // Get pending invoices with balances
      const response = await fetch(`${this.apiBaseUrl}/invoices?status=PARTIAL&hasBalance=true`);
      if (!response.ok) throw new Error('Failed to fetch invoices');

      const invoices = await response.json();

      for (const invoice of invoices) {
        await this.processInvoiceReminders(invoice);
      }
    } catch (error) {
      console.error('Error checking payment reminders:', error);
    }
  }

  // Process reminders for a specific invoice
  private async processInvoiceReminders(invoice: any): Promise<void> {
    const now = new Date();
    const balanceAmount = invoice.balanceAmount || 0;

    if (balanceAmount <= 0) return;

    // Check if we should send a reminder
    const reminderType = this.determineReminderType(invoice, now);
    if (!reminderType) return;

    // Check if we've already sent this type of reminder
    const hasSentReminder = await this.hasSentReminder(invoice._id, reminderType);
    if (hasSentReminder) return;

    // Send the reminder
    await this.sendPaymentReminder(invoice, reminderType, balanceAmount);
  }

  // Determine what type of reminder to send
  private determineReminderType(invoice: any, now: Date): PaymentReminder['reminderType'] | null {
    // For partial payments, we assume due date is service completion + 7 days
    const serviceDate = new Date(invoice.createdAt || invoice.date);
    const assumedDueDate = new Date(serviceDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days after service

    const timeDiff = assumedDueDate.getTime() - now.getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // Overdue
    if (hoursDiff < -this.config.overdueReminderHours) {
      return 'overdue';
    }

    // Final reminder (1 day before)
    if (daysDiff <= this.config.finalReminderDays && daysDiff > 0) {
      return 'final';
    }

    // Second reminder (3 days before)
    if (daysDiff <= this.config.secondReminderDays && daysDiff > this.config.finalReminderDays) {
      return 'second';
    }

    // First reminder (7 days before)
    if (daysDiff <= this.config.firstReminderDays && daysDiff > this.config.secondReminderDays) {
      return 'first';
    }

    return null;
  }

  // Check if reminder has already been sent
  private async hasSentReminder(invoiceId: string, reminderType: PaymentReminder['reminderType']): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/payment-reminders?invoiceId=${invoiceId}&type=${reminderType}`);
      if (response.ok) {
        const reminders = await response.json();
        return reminders.length > 0;
      }
    } catch (error) {
      console.error('Error checking reminder history:', error);
    }
    return false;
  }

  // Send payment reminder
  private async sendPaymentReminder(
    invoice: any,
    reminderType: PaymentReminder['reminderType'],
    amount: number
  ): Promise<void> {
    const reminderMessages = {
      first: {
        title: 'Payment Reminder 📅',
        message: `Your payment of Rs. ${amount.toLocaleString()} for invoice ${invoice.invoiceNumber} is due in 7 days. Please make your payment to avoid any delays.`,
      },
      second: {
        title: 'Payment Due Soon ⏰',
        message: `Reminder: Your payment of Rs. ${amount.toLocaleString()} for invoice ${invoice.invoiceNumber} is due in 3 days. Please complete your payment.`,
      },
      final: {
        title: 'Final Payment Reminder ⚠️',
        message: `URGENT: Your payment of Rs. ${amount.toLocaleString()} for invoice ${invoice.invoiceNumber} is due tomorrow. Please make your payment immediately.`,
      },
      overdue: {
        title: 'Payment Overdue 🚨',
        message: `Your payment of Rs. ${amount.toLocaleString()} for invoice ${invoice.invoiceNumber} is now overdue. Please contact us to arrange payment.`,
      },
    };

    const reminder = reminderMessages[reminderType];

    try {
      // Send notification
      await addNotification({
        userId: invoice.customer.userId || 'customer-id',
        type: 'reminder',
        title: reminder.title,
        message: reminder.message,
        bookingId: invoice.bookingId,
        actionUrl: `/balance-payment?invoice=${invoice.invoiceNumber}`,
      });

      // Log the reminder
      await this.logReminder(invoice, reminderType, 'sent');

      // Audit log
      await auditLogger.logAdminAction(
        'payment_reminder_sent',
        'invoice',
        invoice._id,
        {
          reminderType,
          amount,
          invoiceNumber: invoice.invoiceNumber,
          customerId: invoice.customer.userId,
        }
      );

    } catch (error) {
      console.error('Failed to send payment reminder:', error);
      await this.logReminder(invoice, reminderType, 'failed');
    }
  }

  // Log reminder attempt
  private async logReminder(
    invoice: any,
    reminderType: PaymentReminder['reminderType'],
    status: 'sent' | 'failed'
  ): Promise<void> {
    try {
      const reminder: Omit<PaymentReminder, '_id'> = {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customer.userId || 'unknown',
        customerEmail: invoice.customer.email || 'unknown',
        amount: invoice.balanceAmount,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Assume 7 days
        reminderType,
        sentAt: new Date(),
        status,
      };

      await fetch(`${this.apiBaseUrl}/payment-reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminder),
      });
    } catch (error) {
      console.error('Failed to log reminder:', error);
    }
  }

  // Manual reminder trigger (for admin use)
  async sendManualReminder(invoiceId: string, reminderType: PaymentReminder['reminderType'] = 'first'): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/invoices/${invoiceId}`);
      if (!response.ok) throw new Error('Invoice not found');

      const invoice = await response.json();
      await this.sendPaymentReminder(invoice, reminderType, invoice.balanceAmount);
    } catch (error) {
      console.error('Failed to send manual reminder:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const paymentReminderService = new PaymentReminderService();

// Auto-run reminder checks (can be called by a cron job or interval)
export const startPaymentReminderScheduler = (): void => {
  // Check every 6 hours
  setInterval(() => {
    paymentReminderService.checkAndSendReminders();
  }, 6 * 60 * 60 * 1000);

  // Initial check
  paymentReminderService.checkAndSendReminders();
};
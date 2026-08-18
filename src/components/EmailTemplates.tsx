import { useState } from 'react';
import { Mail, Copy, CheckCircle, ChevronDown, ChevronUp, Send, X, Loader } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '../types';
import DemoTopBar from './DemoTopBar';
import { tokenStorage } from '../utils/auth';

interface EmailTemplatesProps { user: User; }

interface Template {
  id: string;
  category: string;
  subject: string;
  trigger: string;
  body: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'booking-confirmed',
    category: 'Booking',
    subject: 'Your Booking is Confirmed! — Cloud Laundry.lk',
    trigger: 'Sent automatically when booking is placed',
    body: `Dear {{customer_name}},

Thank you for choosing Cloud Laundry.lk! Your booking has been confirmed.

BOOKING DETAILS
───────────────────────────────
Booking ID     : {{booking_id}}
Service        : {{service_name}}
Date & Time    : {{service_date}} at {{service_time}}
Address        : {{address}}
───────────────────────────────

PAYMENT SUMMARY
Amount Paid    : Rs. {{paid_amount}}
Balance Due    : Rs. {{balance_amount}}
Payment Method : {{payment_method}}

Our team will arrive at your location at the scheduled time.

If you have any questions, call us at +94 11 234 5678.

Warm regards,
Cloud Laundry.lk Team`,
  },
  {
    id: 'payment-received',
    category: 'Payment',
    subject: 'Payment Received — Invoice #{{invoice_number}}',
    trigger: 'Sent when payment is successfully processed',
    body: `Dear {{customer_name}},

We have received your payment. Thank you!

INVOICE SUMMARY
───────────────────────────────
Invoice No.    : {{invoice_number}}
Booking ID     : {{booking_id}}
Service        : {{service_name}}
Amount Paid    : Rs. {{paid_amount}}
Payment Method : {{payment_method}}
Date           : {{payment_date}}
───────────────────────────────

Thank you for trusting Cloud Laundry.lk!

Best regards,
Cloud Laundry.lk Billing Team`,
  },
  {
    id: 'service-reminder',
    category: 'Reminder',
    subject: 'Reminder: Your Service is Tomorrow — Cloud Laundry.lk',
    trigger: 'Sent automatically 24 hours before service',
    body: `Dear {{customer_name}},

Your cleaning service is scheduled for tomorrow!

SERVICE DETAILS
───────────────────────────────
Service        : {{service_name}}
Date           : {{service_date}}
Time           : {{service_time}}
Address        : {{address}}
Booking ID     : {{booking_id}}
───────────────────────────────

Need to reschedule? Call us at least 4 hours before: +94 11 234 5678.

See you tomorrow!
Cloud Laundry.lk Team`,
  },
  {
    id: 'balance-due',
    category: 'Reminder',
    subject: 'Balance Payment Due — Cloud Laundry.lk',
    trigger: 'Sent when balance remains unpaid after service',
    body: `Dear {{customer_name}},

Your service is complete. The remaining balance is now due.

BALANCE DETAILS
───────────────────────────────
Booking ID     : {{booking_id}}
Service        : {{service_name}}
Balance Due    : Rs. {{balance_amount}}
Advance Paid   : Rs. {{paid_amount}}
───────────────────────────────

Please pay your balance at: {{payment_link}}

Cloud Laundry.lk Team`,
  },
  {
    id: 'refund-initiated',
    category: 'Refund',
    subject: 'Refund Initiated — Rs. {{refund_amount}} — Cloud Laundry.lk',
    trigger: 'Sent when a refund is processed',
    body: `Dear {{customer_name}},

Your refund has been processed successfully.

REFUND DETAILS
───────────────────────────────
Refund Amount  : Rs. {{refund_amount}}
Booking ID     : {{booking_id}}
Reason         : {{refund_reason}}
Reference No.  : {{refund_reference}}
───────────────────────────────

Your refund will appear in your account within 5-7 business days.

Cloud Laundry.lk Support Team
+94 11 234 5678`,
  },
  {
    id: 'promotion',
    category: 'Marketing',
    subject: 'Special Offer Just for You — {{discount}}% Off!',
    trigger: 'Sent manually by admin for promotions',
    body: `Dear {{customer_name}},

We have an exclusive offer just for you!

{{discount}}% OFF on all {{service_category}} services
Valid: {{promo_start}} to {{promo_end}}
Code: {{promo_code}}

Book now at cloudlaundry.lk or call +94 11 234 5678.

Cloud Laundry.lk Team`,
  },
  {
    id: 're-clean-reminder',
    category: 'Recommendation',
    subject: 'Time for a Re-Clean? — Cloud Laundry.lk',
    trigger: 'Sent 30 days after last service',
    body: `Dear {{customer_name}},

It has been {{days_since}} days since your last {{service_name}}.

Most customers schedule a re-clean every 30 days.

Book now and use code RE-CLEAN10 for 10% off.

cloudlaundry.lk | +94 11 234 5678

Cloud Laundry.lk Team`,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Booking:        'bg-green-100 text-green-700',
  Payment:        'bg-blue-100 text-blue-700',
  Reminder:       'bg-yellow-100 text-yellow-700',
  Refund:         'bg-red-100 text-red-700',
  Marketing:      'bg-pink-100 text-pink-700',
  Recommendation: 'bg-indigo-100 text-indigo-700',
};

// Extract {{variable}} names from a template string
const extractVariables = (text: string): string[] =>
  [...new Set((text.match(/\{\{(\w+)\}\}/g) || []).map(v => v.slice(2, -2)))];

// Replace {{variable}} in text with actual values
const fillVariables = (text: string, values: Record<string, string>): string =>
  text.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] || `{{${key}}}`);

export default function EmailTemplates({ user }: EmailTemplatesProps) {
  const [expanded,       setExpanded]       = useState<string | null>('booking-confirmed');
  const [copied,         setCopied]         = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  // Send modal state
  const [sendModal,    setSendModal]    = useState<Template | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [varValues,    setVarValues]    = useState<Record<string, string>>({});
  const [sending,      setSending]      = useState(false);

  const categories = ['All', ...Array.from(new Set(TEMPLATES.map(t => t.category)))];
  const filtered   = activeCategory === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.category === activeCategory);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const openSendModal = (template: Template) => {
    setSendModal(template);
    setRecipientEmail('');
    // Pre-fill variables with empty strings so the form shows all fields
    const vars = extractVariables(template.body + ' ' + template.subject);
    setVarValues(Object.fromEntries(vars.map(v => [v, ''])));
  };

  const closeSendModal = () => {
    setSendModal(null);
    setSending(false);
  };

  // FIX: Calls POST /api/email/send with templateId + recipient + variable values.
  // Previously the page had no send button at all — templates were copy-paste only.
  const handleSend = async () => {
    if (!sendModal || !recipientEmail) return;
    setSending(true);

    const tokens = tokenStorage.getTokens();
    const authHeader = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};

    try {
      const response = await fetch('http://localhost:5000/api/email/send', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body:    JSON.stringify({
          templateId: sendModal.id,
          to:         recipientEmail,
          variables:  varValues,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to send email.');
      }

      toast.success(`Email sent to ${recipientEmail}`);
      closeSendModal();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  const modalVariables = sendModal
    ? extractVariables(sendModal.body + ' ' + sendModal.subject)
    : [];

  const previewSubject = sendModal ? fillVariables(sendModal.subject, varValues) : '';
  const previewBody    = sendModal ? fillVariables(sendModal.body,    varValues) : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoTopBar user={user} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
          </div>
          <p className="text-gray-500">
            Ready-made templates for all customer communications. Copy or send directly from here.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Templates */}
        <div className="space-y-4">
          {filtered.map(template => (
            <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

              {/* Template Header */}
              <button type="button"
                onClick={() => setExpanded(expanded === template.id ? null : template.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${CATEGORY_COLORS[template.category] || 'bg-gray-100 text-gray-600'}`}>
                    {template.category}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{template.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{template.trigger}</p>
                  </div>
                </div>
                {expanded === template.id
                  ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
              </button>

              {/* Template Body */}
              {expanded === template.id && (
                <div className="border-t border-gray-100">
                  {/* Subject */}
                  <div className="px-5 py-3 bg-gray-50 flex items-center justify-between border-b border-gray-100">
                    <div>
                      <span className="text-xs text-gray-400 uppercase tracking-wide mr-2">Subject:</span>
                      <span className="text-sm font-medium text-gray-700">{template.subject}</span>
                    </div>
                    <button onClick={() => handleCopy(template.id + '-subject', template.subject)}
                      className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 px-2 py-1 rounded hover:bg-purple-50 transition-colors">
                      {copied === template.id + '-subject'
                        ? <><CheckCircle className="w-3.5 h-3.5" /> Copied!</>
                        : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                  </div>

                  {/* Body */}
                  <div className="relative">
                    <pre className="p-5 text-sm text-gray-700 font-mono whitespace-pre-wrap leading-relaxed bg-white overflow-x-auto">
                      {template.body}
                    </pre>
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button onClick={() => handleCopy(template.id, template.body)}
                        className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-300 px-3 py-1.5 rounded-lg shadow-sm transition-colors">
                        {copied === template.id
                          ? <><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Copied!</>
                          : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                      </button>
                      {/* FIX: Send to Customer button — calls POST /api/email/send */}
                      <button onClick={() => openSendModal(template)}
                        className="flex items-center gap-1.5 text-xs bg-purple-600 text-white hover:bg-purple-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors">
                        <Send className="w-3.5 h-3.5" /> Send
                      </button>
                    </div>
                  </div>

                  {/* Variables used */}
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Variables in this template:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {extractVariables(template.body + ' ' + template.subject).map(variable => (
                        <code key={variable}
                          className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-mono">
                          {`{{${variable}}}`}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          {filtered.length} template{filtered.length !== 1 ? 's' : ''} — Cloud Laundry.lk
        </p>
      </div>

      {/* Send Modal */}
      {sendModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'16px' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Send Email</h2>
                <p className="text-sm text-gray-500 mt-0.5">Template: {sendModal.id}</p>
              </div>
              <button onClick={closeSendModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email *</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              {/* Variable fields */}
              {modalVariables.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Fill in template variables:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {modalVariables.map(varName => (
                      <div key={varName}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          <code className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-xs">{`{{${varName}}}`}</code>
                        </label>
                        <input
                          type="text"
                          value={varValues[varName] || ''}
                          onChange={e => setVarValues(prev => ({ ...prev, [varName]: e.target.value }))}
                          placeholder={varName.replace(/_/g, ' ')}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <span className="text-xs text-gray-500">Subject: </span>
                    <span className="text-xs text-gray-800 font-medium">{previewSubject}</span>
                  </div>
                  <pre className="p-4 text-xs text-gray-700 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto bg-white">
                    {previewBody}
                  </pre>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={closeSendModal}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={!recipientEmail || sending}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-all ${
                    !recipientEmail || sending ? 'bg-purple-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                  }`}>
                  {sending
                    ? <><Loader className="w-4 h-4 animate-spin" /> Sending...</>
                    : <><Send className="w-4 h-4" /> Send Email</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

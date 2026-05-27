import { useState } from 'react';
import { Mail, Copy, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { User } from '../types';
import DemoTopBar from './DemoTopBar';

interface EmailTemplatesProps {
  user: User;
}

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
    subject: 'Your Booking is Confirmed! 🎉 — Cloud Laundry.lk',
    trigger: 'Sent automatically when booking is placed',
    body: `Dear {{customer_name}},

Thank you for choosing Cloud Laundry.lk! Your booking has been confirmed.

📋 BOOKING DETAILS
───────────────────────────────
Booking ID     : {{booking_id}}
Service        : {{service_name}}
Date & Time    : {{service_date}} at {{service_time}}
Address        : {{address}}
───────────────────────────────

💳 PAYMENT SUMMARY
Amount Paid    : Rs. {{paid_amount}}
Balance Due    : Rs. {{balance_amount}}
Payment Method : {{payment_method}}

Our team will arrive at your location at the scheduled time. Please ensure someone is available to let them in.

If you have any questions, reply to this email or call us at +94 11 234 5678.

Warm regards,
Cloud Laundry.lk Team
📍 Colombo, Sri Lanka | info@cloudlaundry.lk`,
  },
  {
    id: 'payment-received',
    category: 'Payment',
    subject: 'Payment Received — Invoice #{{invoice_number}}',
    trigger: 'Sent when payment is successfully processed',
    body: `Dear {{customer_name}},

We have received your payment. Thank you!

🧾 INVOICE SUMMARY
───────────────────────────────
Invoice No.    : {{invoice_number}}
Booking ID     : {{booking_id}}
Service        : {{service_name}}
Amount Paid    : Rs. {{paid_amount}}
Payment Method : {{payment_method}}
Date           : {{payment_date}}
───────────────────────────────

{{#if balance_due}}
⚠️  Balance Remaining: Rs. {{balance_amount}}
The remaining balance will be collected after your service is completed.
{{/if}}

Your invoice is attached to this email. You can also view it anytime by scanning the QR code on the invoice.

Thank you for trusting Cloud Laundry.lk!

Best regards,
Cloud Laundry.lk Billing Team`,
  },
  {
    id: 'service-reminder',
    category: 'Reminder',
    subject: '🔔 Reminder: Your Service is Tomorrow — Cloud Laundry.lk',
    trigger: 'Sent automatically 24 hours before service',
    body: `Dear {{customer_name}},

This is a friendly reminder that your cleaning service is scheduled for tomorrow!

📅 SERVICE DETAILS
───────────────────────────────
Service        : {{service_name}}
Date           : {{service_date}}
Time           : {{service_time}}
Address        : {{address}}
Booking ID     : {{booking_id}}
───────────────────────────────

✅ PREPARATION CHECKLIST
• Ensure someone is home at the scheduled time
• Clear access to the area to be cleaned
• Keep pets secured if applicable
• Have your Booking ID ready for reference

Need to reschedule? Contact us at least 4 hours before the appointment at +94 11 234 5678.

See you tomorrow!
Cloud Laundry.lk Team`,
  },
  {
    id: 'worker-arrival',
    category: 'Tracking',
    subject: '📍 Your Service Team is On the Way!',
    trigger: 'Sent when worker marks "En Route" on their app',
    body: `Dear {{customer_name}},

Great news! Your Cloud Laundry.lk service team is on their way to you.

🚗 ARRIVAL UPDATE
───────────────────────────────
Worker Name    : {{worker_name}}
ETA            : {{eta}} minutes
Booking ID     : {{booking_id}}
Service        : {{service_name}}
───────────────────────────────

Please make sure someone is available to receive them.

If you need to contact the team directly, call: {{worker_phone}}

Track your service in real time from your dashboard.

Cloud Laundry.lk Team`,
  },
  {
    id: 'refund-initiated',
    category: 'Refund',
    subject: 'Refund Initiated — Rs. {{refund_amount}} — Cloud Laundry.lk',
    trigger: 'Sent when a refund is processed',
    body: `Dear {{customer_name}},

Your refund request has been processed successfully.

💸 REFUND DETAILS
───────────────────────────────
Refund Amount  : Rs. {{refund_amount}}
Booking ID     : {{booking_id}}
Service        : {{service_name}}
Reason         : {{refund_reason}}
Refund Method  : {{refund_method}}
Reference No.  : {{refund_reference}}
───────────────────────────────

{{#if online_payment}}
⏳ Your refund will appear in your account within 5–7 business days, depending on your bank.
{{else}}
🏢 Please visit our office to collect your cash refund. Bring this email or your Booking ID.
   Office Hours: Mon–Sat, 9:00 AM – 5:00 PM
{{/if}}

We're sorry to see you go. If there's anything we can improve, please let us know.

Cloud Laundry.lk Support Team
📞 +94 11 234 5678 | info@cloudlaundry.lk`,
  },
  {
    id: 'promotion',
    category: 'Marketing',
    subject: '🎊 Special Offer Just for You — {{discount}}% Off This Weekend!',
    trigger: 'Sent manually by admin for promotions',
    body: `Dear {{customer_name}},

We have an exclusive offer just for you! 🎉

🏷️  {{discount}}% OFF on all {{service_category}} services
    Valid: {{promo_start}} to {{promo_end}}
    Code: {{promo_code}}

──────────────────────────────────────
    USE CODE: {{promo_code}} AT CHECKOUT
──────────────────────────────────────

WHAT'S INCLUDED:
{{service_list}}

This is a limited-time offer and available only while slots last.

👉 Book now at cloudlaundry.lk or call +94 11 234 5678

You're receiving this because you're a valued Cloud Laundry.lk customer.
To unsubscribe, reply with "UNSUBSCRIBE".

Cloud Laundry.lk Marketing Team`,
  },
  {
    id: 're-clean-reminder',
    category: 'Recommendation',
    subject: '✨ Time for a Re-Clean? — Cloud Laundry.lk',
    trigger: 'Sent 30 days after last service of same type',
    body: `Dear {{customer_name}},

It's been {{days_since}} days since your last {{service_name}} with us. 

Most of our customers schedule a re-clean every 30 days to keep things fresh and hygienic. Based on your history, we think it's time!

🔄 YOUR LAST SERVICE
───────────────────────────────
Service        : {{service_name}}
Date           : {{last_service_date}}
Rating         : {{last_rating}} ⭐
───────────────────────────────

📅 BOOK YOUR NEXT CLEAN
• Same service in one click
• Your saved address is remembered
• Loyalty points: {{loyalty_points}} pts available

Book now and use code RE-CLEAN10 for 10% off your next booking.

👉 cloudlaundry.lk

Cloud Laundry.lk Team
"Excellence In Every Clean"`,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Booking: 'bg-green-100 text-green-700',
  Payment: 'bg-blue-100 text-blue-700',
  Reminder: 'bg-yellow-100 text-yellow-700',
  Tracking: 'bg-purple-100 text-purple-700',
  Refund: 'bg-red-100 text-red-700',
  Marketing: 'bg-pink-100 text-pink-700',
  Recommendation: 'bg-indigo-100 text-indigo-700',
};

export default function EmailTemplates({ user }: EmailTemplatesProps) {
  const [expanded, setExpanded] = useState<string | null>('booking-confirmed');
  const [copied, setCopied] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(TEMPLATES.map(t => t.category)))];

  const filtered = activeCategory === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === activeCategory);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

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
            Ready-made email templates for all customer communications. Copy and use in your email system.
          </p>
        </div>

        {/* Backend note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex gap-3">
          <span className="text-amber-500 text-lg flex-shrink-0">⚡</span>
          <div className="text-sm text-amber-700">
            <p className="font-semibold mb-1">Integration Note</p>
            <p>These templates are ready to plug into any email service (SendGrid, Mailgun, SMTP). Variables in <code className="bg-amber-100 px-1 rounded">{"{{double_braces}}"}</code> are replaced automatically by the backend when sending.</p>
          </div>
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
            <div key={template.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

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
                  {/* Subject line */}
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
                    <button onClick={() => handleCopy(template.id, template.body)}
                      className="absolute top-3 right-3 flex items-center gap-1.5 text-xs bg-white border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-300 px-3 py-1.5 rounded-lg shadow-sm transition-colors">
                      {copied === template.id
                        ? <><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Copied!</>
                        : <><Copy className="w-3.5 h-3.5" /> Copy Body</>}
                    </button>
                  </div>

                  {/* Variables list */}
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Variables used in this template:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(template.body.match(/\{\{[^}]+\}\}/g) || [])
                        .filter((v, i, arr) => arr.indexOf(v) === i)
                        .map(variable => (
                          <code key={variable}
                            className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-mono">
                            {variable}
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
    </div>
  );
}

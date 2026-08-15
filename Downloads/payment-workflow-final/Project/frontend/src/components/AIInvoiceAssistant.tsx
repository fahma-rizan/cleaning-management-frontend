import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, ArrowLeft, FileText, RefreshCw, CheckCircle, User, Bot } from 'lucide-react';
import InvoiceGenerator, { InvoiceData, InvoiceType } from './InvoiceGenerator';
import type { User as AppUser } from '../types';
import DemoTopBar from './DemoTopBar';
import { tokenStorage } from '../utils/auth';

interface AIInvoiceAssistantProps { user: AppUser; }

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ── Real price list context given to the AI ────────────────────────────────
// This tells Claude exactly what services exist and how they are priced,
// so it can calculate accurate totals from natural language.
const PRICE_LIST_CONTEXT = `
You are an invoice assistant for Cloud Laundry.lk, a professional cleaning company in Sri Lanka.

AVAILABLE SERVICES AND PRICING (all prices in Sri Lankan Rupees, LKR):

HOME / OFFICE CLEANING (category: home):
- House Deep Cleaning (per sqft):
    Normal Deep Cleaning: Rs. 25/sqft
    Move In / Move Out: Rs. 30/sqft
    After Construction: Rs. 35/sqft
- Kitchen Deep Cleaning (fixed):
    Small: Rs. 3,000  |  Medium: Rs. 4,000  |  Large: Rs. 5,000
- Bathroom Deep Cleaning: Rs. 2,500 per unit/bathroom

LAUNDRY (category: laundry):
- Laundry Service:
    Wash & Fold: Rs. 450/kg
    Wash & Iron: Rs. 650/kg
    Iron & Hang: Rs. 150/piece

SHAMPOO / VACUUM CLEANING (category: shampoo):
- Sofa Shampooing (per seat): Rs. 800/seat
- Carpet Shampooing (per sqft):
    Normal Carpet: Rs. 35/sqft
    Persian Carpet: Rs. 50/sqft
- Mattress Shampooing (fixed):
    Single: Rs. 2,500  |  Double: Rs. 3,000  |  Queen: Rs. 3,500  |  King: Rs. 4,000
- Chair Shampooing: Rs. 500 per chair

CURTAIN CLEANING (category: curtain):
- Curtain Cleaning:
    On-site Steam Cleaning: Rs. 1,000/piece
    Dry Cleaning: Rs. 800/kg

YOUR JOB:
1. Collect from the user: customer name, email, phone, address, service date, service time, and all service items with quantities/sizes.
2. Calculate prices accurately using the price list above.
3. When you have ALL the information needed, respond with a JSON block (and ONLY a JSON block, no other text) in this exact format:

\`\`\`invoice
{
  "customer": {
    "name": "...",
    "email": "...",
    "phone": "...",
    "address": "..."
  },
  "serviceDate": "YYYY-MM-DD",
  "serviceTime": "HH:MM",
  "items": [
    {
      "name": "House Deep Cleaning — Normal, 1200 sqft",
      "category": "home",
      "price": 30000,
      "quantity": 1,
      "description": "Normal Deep Cleaning @ Rs. 25/sqft × 1200 sqft"
    }
  ],
  "discount": 0,
  "paymentMethod": "cash",
  "notes": "Any special notes"
}
\`\`\`

4. If the user is missing information, ask for ONLY the missing fields — one or two at a time, conversationally.
5. If the user asks to change something, update the invoice and re-output the full JSON block.
6. Always greet the user warmly and be helpful and concise.
7. Do NOT output the JSON block until you have all required fields: customer name, email, phone, address, at least one service item, date, and time.
`;

// ── Parse invoice JSON from AI response ───────────────────────────────────
const parseInvoiceFromResponse = (text: string): any | null => {
  const match = text.match(/```invoice\s*([\s\S]*?)```/);
  if (!match) return null;
  try {
    return JSON.parse(match[1].trim());
  } catch {
    return null;
  }
};

// ── Map AI invoice data → InvoiceData for InvoiceGenerator ───────────────
const buildInvoiceData = (aiData: any): InvoiceData => {
  const now = new Date();
  const subtotal = aiData.items.reduce((s: number, i: any) => s + i.price * (i.quantity || 1), 0);
  const discount = aiData.discount || 0;
  const total    = Math.max(0, subtotal - discount);

  const categoriesSet = new Set<string>();
  aiData.items.forEach((item: any) => {
    const cat = item.category;
    if (cat === 'laundry') categoriesSet.add('LND');
    else if (cat === 'curtain') categoriesSet.add('CUR');
    else if (cat === 'shampoo') categoriesSet.add('SVC');
    else if (cat === 'home')    categoriesSet.add('HOC');
  });
  const mainCategories = Array.from(categoriesSet);
  const prefix = mainCategories.length > 1 ? 'MULTI' : (mainCategories[0] || 'SRV');
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');

  return {
    invoiceNumber:  `${prefix}-${dateStr}-DRAFT`,
    mainCategories,
    invoiceType:    'FULL' as InvoiceType,
    date:           now.toLocaleDateString(),
    time:           now.toLocaleTimeString(),
    bookingId:      `MANUAL-${Date.now().toString().slice(-6)}`,
    customer:       aiData.customer,
    service: {
      name: aiData.items[0]?.name || 'Cleaning Service',
      date: aiData.serviceDate || now.toLocaleDateString(),
      time: aiData.serviceTime || now.toLocaleTimeString(),
      items: aiData.items.map((i: any) => ({
        name:        i.name,
        description: i.description,
        price:       i.price,
        quantity:    i.quantity || 1,
      })),
    },
    pricing: {
      subtotal,
      discount: discount > 0 ? discount : undefined,
      total,
      paidAmount:    aiData.paymentMethod === 'cod' ? 0 : total,
      balanceAmount: aiData.paymentMethod === 'cod' ? total : 0,
    },
    paymentMethod: aiData.paymentMethod === 'cod' ? 'Cash on Delivery'
                 : aiData.paymentMethod === 'online' ? 'Online (PayHere)'
                 : 'Cash',
    status: aiData.paymentMethod === 'cod' ? 'SENT' : 'PAID',
  };
};

export default function AIInvoiceAssistant({ user }: AIInvoiceAssistantProps) {
  const navigate = useNavigate();
  const API = 'http://localhost:4000/api';
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [aiInvoice, setAiInvoice]   = useState<any | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Initial greeting from assistant
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: `Hi! I'm your AI invoice assistant. Just tell me what you need and I'll create the invoice for you.\n\nFor example: *"Invoice for Kavya Perera, kavya@email.com, +94771234567, 45 Galle Road Colombo. House deep cleaning 1500 sqft normal, 2 bathrooms. Service on 15th June at 9am. Cash payment."*\n\nOr describe it step by step — I'll ask for anything I'm missing.`,
    }]);
  }, []);

  // Check server-side AI availability
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API}/assistant/status`);
        const json = await res.json();
        if (!mounted) return;
        setAiEnabled(!!json.enabled);
      } catch (err) {
        if (!mounted) return;
        setAiEnabled(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ── Call Claude API ────────────────────────────────────────────────────────
  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system:     PRICE_LIST_CONTEXT,
          messages:   newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const assistantText = data.content?.[0]?.text || 'Sorry, I could not process that. Please try again.';

      // Check if the AI returned a complete invoice JSON
      const parsed = parseInvoiceFromResponse(assistantText);
      if (parsed) {
        setAiInvoice(parsed);
        setInvoiceData(buildInvoiceData(parsed));
        setSaved(false);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: assistantText }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please check your connection and try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ── Save invoice to backend ───────────────────────────────────────────────
  const handleSaveInvoice = async () => {
    if (!aiInvoice || !invoiceData) return;
    setSaving(true);

    const tokens = tokenStorage.getTokens();
    const authHeader = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};

    const subtotal = aiInvoice.items.reduce((s: number, i: any) => s + i.price * (i.quantity || 1), 0);
    const discount = aiInvoice.discount || 0;
    const total    = Math.max(0, subtotal - discount);

    const payload = {
      invoiceType:  invoiceData.status === 'SENT' ? 'COD' : 'FULL',
      bookingId:    invoiceData.bookingId,
      customer:     aiInvoice.customer,
      serviceItems: aiInvoice.items.map((i: any) => ({
        name:     i.name,
        price:    i.price * (i.quantity || 1),
        quantity: i.quantity || 1,
      })),
      pricing: {
        basePrice:  subtotal,
        discount,
        total,
      },
      payment: {
        method:        invoiceData.paymentMethod,
        status:        invoiceData.status,
        paidAmount:    invoiceData.pricing.paidAmount,
        balanceAmount: invoiceData.pricing.balanceAmount,
      },
      status:         'active',
      createdByStaff: user.id,
    };

    try {
      const res = await fetch('http://localhost:4000/api/invoices', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.msg || 'Failed to save invoice.');
      }

      const saved = await res.json();
      // Update the invoice number with the real one from the backend
      setInvoiceData(prev => prev ? { ...prev, invoiceNumber: saved.invoiceNumber } : prev);
      setSaved(true);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Invoice **${saved.invoiceNumber}** saved successfully! You can now download it as a PDF or navigate away.`,
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Failed to save invoice: ${err.message}`,
      }]);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setMessages([{
      role: 'assistant',
      content: `Invoice cleared. Tell me about the next one!`,
    }]);
    setAiInvoice(null);
    setInvoiceData(null);
    setSaved(false);
  };

  // ── Render message text with basic markdown (bold, italic, newlines) ──────
  const renderMessage = (text: string) => {
    // Hide the raw JSON block from the chat — we show it as the invoice preview instead
    const cleaned = text.replace(/```invoice[\s\S]*?```/g, '*(Invoice generated — see preview on the right)*');
    return cleaned
      .split('\n')
      .map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
        return (
          <p key={i} style={{ margin: '2px 0', minHeight: '1em' }}>
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j}>{part.slice(2, -2)}</strong>;
              }
              if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={j}>{part.slice(1, -1)}</em>;
              }
              return part;
            })}
          </p>
        );
      });
  };

  const hasSplitLayout = !!invoiceData;

  if (aiEnabled === false) {
    return (
      <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontSize: '22px', fontWeight: 700 }}>AI Invoice Assistant — Coming Soon</div>
        <div style={{ maxWidth: 800, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          The AI invoice assistant is currently disabled on this server. Once the AI service is configured, this page will be available.
        </div>
        <button onClick={() => navigate(-1)} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: 'white' }}>Back</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-background-tertiary)' }}>
      <DemoTopBar user={user} />

      {/* Page header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '8px' }}>
          <div style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', borderRadius: '10px', padding: '8px', display: 'flex' }}>
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: '16px', color: 'var(--color-text-primary)' }}>AI Invoice Assistant</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>Describe your service — I'll build the invoice</div>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: 0 }}>

        {/* Chat panel */}
        <div style={{
          width: hasSplitLayout ? '42%' : '100%',
          maxWidth: hasSplitLayout ? '520px' : '680px',
          margin: hasSplitLayout ? '0' : '0 auto',
          display: 'flex',
          flexDirection: 'column',
          borderRight: hasSplitLayout ? '1px solid var(--color-border-tertiary)' : 'none',
          background: 'var(--color-background-primary)',
          transition: 'width 0.3s ease',
        }}>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '16px',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
              }}>
                {/* Avatar */}
                <div style={{
                  flexShrink: 0,
                  width: '32px', height: '32px',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: msg.role === 'assistant'
                    ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                    : 'var(--color-background-tertiary)',
                }}>
                  {msg.role === 'assistant'
                    ? <Bot size={16} color="white" />
                    : <User size={16} color="var(--color-text-secondary)" />}
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'assistant' ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                  background: msg.role === 'assistant'
                    ? 'var(--color-background-secondary)'
                    : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: msg.role === 'user' ? 'white' : 'var(--color-text-primary)',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  border: msg.role === 'assistant' ? '1px solid var(--color-border-tertiary)' : 'none',
                }}>
                  {renderMessage(msg.content)}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                  <Bot size={16} color="white" />
                </div>
                <div style={{ padding: '12px 16px', background: 'var(--color-background-secondary)', borderRadius: '4px 14px 14px 14px', border: '1px solid var(--color-border-tertiary)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#7c3aed', opacity: 0.6,
                      animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          {messages.length === 1 && (
            <div style={{ padding: '0 16px 12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                'House deep cleaning 1500 sqft',
                '3 sofa seats + carpet 200sqft',
                '10kg laundry wash and iron',
                'Curtain cleaning 5 pieces',
              ].map(prompt => (
                <button key={prompt} onClick={() => sendMessage(prompt)}
                  style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--color-border-secondary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border-tertiary)', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading || saved}
              placeholder={saved ? 'Invoice saved. Start a new one?' : 'Type your message… (Enter to send, Shift+Enter for new line)'}
              rows={2}
              style={{
                flex: 1, resize: 'none', border: '1px solid var(--color-border-secondary)',
                borderRadius: '10px', padding: '10px 14px', fontSize: '13px',
                background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)',
                outline: 'none', lineHeight: '1.5',
                opacity: (loading || saved) ? 0.6 : 1,
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading || saved}
              style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: (!input.trim() || loading || saved) ? 'var(--color-background-tertiary)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                border: 'none', cursor: (!input.trim() || loading || saved) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
              <Send size={16} color={(!input.trim() || loading || saved) ? 'var(--color-text-tertiary)' : 'white'} />
            </button>
          </div>
        </div>

        {/* Invoice preview panel */}
        {invoiceData && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: 'var(--color-background-tertiary)' }}>

            {/* Action bar */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, fontWeight: 500, fontSize: '14px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} />
                Invoice Preview
                <span style={{ fontSize: '11px', background: '#FAEEDA', color: '#854F0B', padding: '2px 8px', borderRadius: '20px' }}>
                  DRAFT
                </span>
              </div>

              {!saved ? (
                <>
                  <button onClick={handleReset}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--color-border-secondary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', fontSize: '13px', cursor: 'pointer' }}>
                    <RefreshCw size={14} /> Start Over
                  </button>
                  <button onClick={handleSaveInvoice} disabled={saving}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: saving ? '#a78bfa' : 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white', fontSize: '13px', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer' }}>
                    {saving
                      ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                      : <><CheckCircle size={14} /> Save Invoice</>}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3B6D11', fontSize: '13px', fontWeight: 500 }}>
                    <CheckCircle size={16} /> Saved
                  </div>
                  <button onClick={handleReset}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white', fontSize: '13px', cursor: 'pointer' }}>
                    New Invoice
                  </button>
                </>
              )}
            </div>

            {/* Invoice */}
            <InvoiceGenerator invoice={invoiceData} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

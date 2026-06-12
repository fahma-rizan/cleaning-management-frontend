import { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Send, X, Minimize2, Maximize2, Bot, User,
  Loader, FileText, Users, BarChart3, RefreshCw, ChevronRight,
} from 'lucide-react';
import { tokenStorage } from '../../utils/auth';
import type { User as AppUser } from '../../types';

interface WorkflowAssistantProps {
  user: AppUser;
  defaultOpen?: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}

const API = 'http://localhost:4000/api';

// ── Suggested questions by category ──────────────────────────────────────────
const SUGGESTIONS = [
  { icon: FileText,  label: 'Invoices',    questions: [
    'Show me all DRAFT invoices waiting for approval',
    'Which invoices have outstanding balances?',
    'How many invoices were created this week?',
    'Show me Kavya\'s invoice history',
  ]},
  { icon: Users,     label: 'Customers',   questions: [
    'Which customers still owe money?',
    'Show me the top customers by spending',
    'Find all invoices for a customer named Silva',
    'How many unique customers this month?',
  ]},
  { icon: BarChart3, label: 'Financials',  questions: [
    'What is our total revenue this month?',
    'How much is outstanding across all invoices?',
    'Show me a revenue breakdown by service type',
    'What is our refund total this year?',
  ]},
  { icon: RefreshCw, label: 'Workflow',    questions: [
    'How does the refund process work?',
    'What happens when a customer pays advance?',
    'How do I approve a staff invoice?',
    'What is the difference between DRAFT and SENT?',
  ]},
];

// ── Basic markdown renderer ───────────────────────────────────────────────────
// Handles **bold**, *italic*, bullet lists, numbered lists, and inline code
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let key = 0;

  const inlineRender = (line: string) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={i}>{part.slice(2,-2)}</strong>;
      if (part.startsWith('*') && part.endsWith('*'))
        return <em key={i}>{part.slice(1,-1)}</em>;
      if (part.startsWith('`') && part.endsWith('`'))
        return <code key={i} style={{ background:'rgba(0,0,0,0.08)', borderRadius:'3px', padding:'1px 5px', fontFamily:'monospace', fontSize:'12px' }}>{part.slice(1,-1)}</code>;
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      elements.push(<div key={key++} style={{ height:'6px' }} />);
    } else if (/^#{1,3}\s/.test(line)) {
      const level = line.match(/^(#+)/)?.[1].length || 1;
      const content = line.replace(/^#+\s/, '');
      const sizes = ['16px','14px','13px'];
      elements.push(
        <p key={key++} style={{ fontWeight:600, fontSize: sizes[level-1] || '13px', margin:'8px 0 4px', color:'var(--color-text-primary)' }}>
          {inlineRender(content)}
        </p>
      );
    } else if (/^[-•]\s/.test(line)) {
      elements.push(
        <div key={key++} style={{ display:'flex', gap:'8px', margin:'2px 0' }}>
          <span style={{ color:'var(--color-text-tertiary)', flexShrink:0 }}>•</span>
          <span>{inlineRender(line.replace(/^[-•]\s/, ''))}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)?.[1];
      elements.push(
        <div key={key++} style={{ display:'flex', gap:'8px', margin:'2px 0' }}>
          <span style={{ color:'var(--color-text-tertiary)', flexShrink:0, minWidth:'16px' }}>{num}.</span>
          <span>{inlineRender(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
    } else {
      elements.push(
        <p key={key++} style={{ margin:'2px 0', lineHeight:'1.6' }}>
          {inlineRender(line)}
        </p>
      );
    }
  }
  return elements;
}

export default function WorkflowAssistant({ user, defaultOpen = false }: WorkflowAssistantProps) {
  const [isOpen,      setIsOpen]      = useState(defaultOpen);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages,    setMessages]    = useState<Message[]>([]);
  const [input,       setInput]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);

  // Message history in the format Claude API expects
  const [apiMessages, setApiMessages] = useState<{role:string; content:string}[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hi! I'm your Cloud Laundry assistant. I can help you with:\n\n- **Invoice queries** — find, filter, and understand invoices\n- **Customer history** — look up what a customer has ordered and paid\n- **Financial stats** — revenue, outstanding balances, refund totals\n- **Workflow questions** — how any process in the system works\n\nTry one of the suggested questions below, or just ask me anything.`,
      }]);
    }
  }, [isOpen]);

  const getAuthHeader = () => {
    const tokens = tokenStorage.getTokens();
    return tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setApiMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    setActiveCategory(null);

    // Add loading placeholder
    setMessages(prev => [...prev, { role: 'assistant', content: '', isLoading: true }]);

    try {
      const newApiMessages = [...apiMessages, { role: 'user', content: text }];

      const response = await fetch(`${API}/assistant/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body:    JSON.stringify({ messages: newApiMessages }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.msg || 'Failed to get response.');
      }

      const data = await response.json();
      const reply = data.reply || 'I could not generate a response. Please try again.';

      // Replace loading placeholder with real response
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: reply },
      ]);
      setApiMessages(prev => [...prev, { role: 'assistant', content: reply }]);

    } catch (err: any) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: `Sorry, I ran into an error: ${err.message}. Please try again.` },
      ]);
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

  const handleReset = () => {
    setMessages([]);
    setApiMessages([]);
    setActiveCategory(null);
    setTimeout(() => {
      setMessages([{
        role: 'assistant',
        content: `Conversation cleared. What would you like to know?`,
      }]);
    }, 100);
  };

  // Panel dimensions
  const panelStyle: React.CSSProperties = isMaximized
    ? { position:'fixed', inset:0, zIndex:100, borderRadius:0, width:'100%', height:'100%' }
    : { position:'fixed', bottom:'80px', right:'20px', zIndex:100, width:'420px', height:'600px', borderRadius:'16px', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' };

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position:'fixed', bottom:'20px', right:'20px', zIndex:99,
            width:'56px', height:'56px', borderRadius:'50%', border:'none',
            background:'linear-gradient(135deg, #7c3aed, #a855f7)',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', boxShadow:'0 4px 20px rgba(124,58,237,0.5)',
          }}
          title="Open AI Assistant"
        >
          <Sparkles size={22} color="white" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div style={{
          ...panelStyle,
          background:'var(--color-background-primary)',
          display:'flex', flexDirection:'column',
          overflow:'hidden',
          border:'1px solid var(--color-border-tertiary)',
        }}>

          {/* Header */}
          <div style={{
            background:'linear-gradient(135deg, #7c3aed, #a855f7)',
            padding:'14px 16px',
            display:'flex', alignItems:'center', gap:'10px',
            flexShrink:0,
          }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Sparkles size={16} color="white" />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ color:'white', fontWeight:600, fontSize:'14px' }}>Workflow Assistant</div>
              <div style={{ color:'rgba(255,255,255,0.75)', fontSize:'11px' }}>Cloud Laundry.lk · Live data access</div>
            </div>
            <button onClick={handleReset} title="Clear conversation"
              style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.7)', padding:'4px', borderRadius:'6px', display:'flex' }}>
              <RefreshCw size={14} />
            </button>
            <button onClick={() => setIsMaximized(m => !m)} title={isMaximized ? 'Minimise' : 'Maximise'}
              style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.7)', padding:'4px', borderRadius:'6px', display:'flex' }}>
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button onClick={() => setIsOpen(false)} title="Close"
              style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.7)', padding:'4px', borderRadius:'6px', display:'flex' }}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'12px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                display:'flex', gap:'8px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems:'flex-start',
              }}>
                {/* Avatar */}
                <div style={{
                  flexShrink:0, width:28, height:28, borderRadius:'50%',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background: msg.role === 'assistant'
                    ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                    : 'var(--color-background-tertiary)',
                }}>
                  {msg.role === 'assistant'
                    ? <Bot size={14} color="white" />
                    : <User size={14} color="var(--color-text-secondary)" />}
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth:'85%',
                  padding:'10px 13px',
                  borderRadius: msg.role === 'assistant' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                    : 'var(--color-background-secondary)',
                  color: msg.role === 'user' ? 'white' : 'var(--color-text-primary)',
                  fontSize:'13px',
                  lineHeight:'1.6',
                  border: msg.role === 'assistant' ? '1px solid var(--color-border-tertiary)' : 'none',
                }}>
                  {msg.isLoading ? (
                    <div style={{ display:'flex', gap:'4px', alignItems:'center', padding:'2px 0' }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{
                          width:6, height:6, borderRadius:'50%', background:'#7c3aed', opacity:0.6,
                          animation:`assistantPulse 1.2s ease-in-out ${i*0.2}s infinite`,
                        }} />
                      ))}
                    </div>
                  ) : (
                    <div>{renderMarkdown(msg.content)}</div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions */}
          {messages.length <= 1 && (
            <div style={{ padding:'0 12px 8px', flexShrink:0 }}>
              {/* Category tabs */}
              <div style={{ display:'flex', gap:'6px', marginBottom:'8px', flexWrap:'wrap' }}>
                {SUGGESTIONS.map(cat => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.label;
                  return (
                    <button key={cat.label}
                      onClick={() => setActiveCategory(isActive ? null : cat.label)}
                      style={{
                        display:'flex', alignItems:'center', gap:'5px',
                        padding:'4px 10px', borderRadius:'20px', border:'1px solid',
                        fontSize:'11px', fontWeight:500, cursor:'pointer', transition:'all .15s',
                        borderColor: isActive ? '#7c3aed' : 'var(--color-border-secondary)',
                        background:  isActive ? '#EEEDFE' : 'var(--color-background-secondary)',
                        color:       isActive ? '#3C3489' : 'var(--color-text-secondary)',
                      }}>
                      <Icon size={11} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Questions for active category */}
              {activeCategory && (
                <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                  {SUGGESTIONS.find(c => c.label === activeCategory)?.questions.map(q => (
                    <button key={q} onClick={() => sendMessage(q)}
                      style={{
                        display:'flex', alignItems:'center', gap:'8px',
                        padding:'7px 10px', borderRadius:'8px', border:'1px solid var(--color-border-tertiary)',
                        background:'var(--color-background-secondary)', color:'var(--color-text-secondary)',
                        fontSize:'12px', cursor:'pointer', textAlign:'left', transition:'all .15s',
                      }}>
                      <ChevronRight size={12} style={{ flexShrink:0, color:'#7c3aed' }} />
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding:'10px 12px', borderTop:'1px solid var(--color-border-tertiary)',
            display:'flex', gap:'8px', alignItems:'flex-end', flexShrink:0,
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask anything about invoices, customers, or workflows…"
              rows={2}
              style={{
                flex:1, resize:'none', border:'1px solid var(--color-border-secondary)',
                borderRadius:'10px', padding:'8px 12px', fontSize:'13px',
                background:'var(--color-background-secondary)', color:'var(--color-text-primary)',
                outline:'none', lineHeight:'1.5', opacity: loading ? 0.6 : 1,
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              style={{
                width:36, height:36, borderRadius:'10px', border:'none',
                background: (!input.trim() || loading) ? 'var(--color-background-tertiary)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>
              {loading
                ? <Loader size={14} color="var(--color-text-tertiary)" style={{ animation:'spin 1s linear infinite' }} />
                : <Send size={14} color={(!input.trim() || loading) ? 'var(--color-text-tertiary)' : 'white'} />}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes assistantPulse {
          0%,100% { transform:scale(0.8); opacity:0.4; }
          50% { transform:scale(1.2); opacity:1; }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </>
  );
}

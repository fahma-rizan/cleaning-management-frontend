import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';

const ADJUST_TYPES = [
  { value: 'restock',    label: 'Restock (+)'        },
  { value: 'deduct',     label: 'Deduct (−)'          },
  { value: 'return',     label: 'Return unused (+)'  },
  { value: 'adjustment', label: 'Set absolute value' },
];

const INITIAL = { type: 'restock', quantity: '', reference: '', notes: '' };

const inputStyle = (focused) => ({
  width: '100%', boxSizing: 'border-box', padding: '10px 13px',
  background: focused ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.05)',
  border: focused ? '1px solid rgba(124,58,237,0.7)' : '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, fontSize: 13, color: '#fff', outline: 'none',
  transition: 'all 0.2s',
  boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.14)' : 'none',
});

const FocusInput = ({ as: Tag = 'input', value, onChange, placeholder, type = 'text', min, rows }) => {
  const [focused, setFocused] = useState(false);
  return (
    <Tag
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      min={min} rows={rows}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ ...inputStyle(focused), resize: Tag === 'textarea' ? 'none' : undefined }}
    />
  );
};

const StockAdjustModal = ({ open, item, onClose, onConfirm, loading, error }) => {
  const [form, setForm] = useState(INITIAL);
  const [typeOpen, setTypeOpen] = useState(false);

  useEffect(() => { if (open) setForm(INITIAL); }, [open]);

  if (!open) return null;

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const preview = {
    restock:    `→ New total: ${Number(item?.quantity || 0) + Number(form.quantity || 0)} ${item?.unit || ''}`,
    deduct:     `→ Remaining: ${Number(item?.quantity || 0) - Number(form.quantity || 0)} ${item?.unit || ''}`,
    return:     `→ New total: ${Number(item?.quantity || 0) + Number(form.quantity || 0)} ${item?.unit || ''}`,
    adjustment: `→ Will be set to: ${form.quantity || 0} ${item?.unit || ''}`,
  };

  const selectedType = ADJUST_TYPES.find(t => t.value === form.type);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: 'rgba(18,18,30,0.98)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        boxShadow: '0 25px 80px rgba(0,0,0,0.7)',
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: 'hidden',
      }}>
        {/* header */}
        <div style={{
          padding: '20px 24px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(147,51,234,0.05))',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Adjust Stock</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12.5, marginTop: 2 }}>
              {item?.name}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.07)', border: 'none',
            borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.5)',
          }}>
            <CloseIcon sx={{ fontSize: 17 }}/>
          </button>
        </div>

        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 9, fontSize: 12.5,
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', display: 'flex', gap: 8,
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          {/* current stock info */}
          <div style={{
            padding: '10px 14px', borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Current stock:</span>
            <span style={{ fontWeight: 700, color: item?.isLowStock ? '#EF4444' : '#10B981', fontSize: 14 }}>
              {item?.quantity} {item?.unit}
            </span>
            {item?.isLowStock && (
              <span style={{
                marginLeft: 4, padding: '2px 8px', borderRadius: 20,
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171', fontSize: 10, fontWeight: 600,
              }}>⚠ LOW</span>
            )}
          </div>

          {/* transaction type */}
          <div>
            <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
              Transaction Type
            </label>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setTypeOpen(o => !o)}
                style={{
                  width: '100%', padding: '10px 13px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, color: '#fff', fontSize: 13,
                  cursor: 'pointer', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  outline: 'none',
                }}
              >
                {selectedType?.label}
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>▼</span>
              </button>
              {typeOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100,
                  background: '#1C1C30', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8, overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}>
                  {ADJUST_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => { set('type', t.value); setTypeOpen(false); }}
                      style={{
                        width: '100%', padding: '10px 14px',
                        background: t.value === form.type ? 'rgba(124,58,237,0.2)' : 'transparent',
                        border: 'none', cursor: 'pointer',
                        color: t.value === form.type ? '#c4b5fd' : 'rgba(255,255,255,0.7)',
                        fontSize: 13, textAlign: 'left',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { if (t.value !== form.type) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                      onMouseLeave={e => { if (t.value !== form.type) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* quantity */}
          <div>
            <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
              Quantity ({item?.unit})
            </label>
            <FocusInput
              type="number" min="1"
              value={form.quantity}
              onChange={e => set('quantity', e.target.value)}
              placeholder="Enter quantity"
            />
            {Number(form.quantity) > 0 && (
              <div style={{ marginTop: 5, fontSize: 11.5, color: '#a78bfa' }}>{preview[form.type]}</div>
            )}
          </div>

          {/* reference */}
          <div>
            <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
              Reference <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400, letterSpacing: 0 }}>(optional)</span>
            </label>
            <FocusInput
              value={form.reference}
              onChange={e => set('reference', e.target.value)}
              placeholder="e.g. Booking ID or PO number"
            />
          </div>

          {/* notes */}
          <div>
            <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
              Notes <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400, letterSpacing: 0 }}>(optional)</span>
            </label>
            <FocusInput
              as="textarea" rows={2}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any additional notes…"
            />
          </div>

          {/* actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button" onClick={onClose}
              style={{
                flex: 1, padding: '11px 0', borderRadius: 9,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!form.quantity || Number(form.quantity) <= 0) return;
                onConfirm({ ...form, quantity: Number(form.quantity) });
              }}
              disabled={loading || !form.quantity || Number(form.quantity) <= 0}
              style={{
                flex: 2, padding: '11px 0', borderRadius: 9, border: 'none',
                background: (loading || !form.quantity || Number(form.quantity) <= 0)
                  ? 'rgba(124,58,237,0.4)'
                  : 'linear-gradient(135deg, #7C3AED, #9333ea)',
                color: '#fff', fontWeight: 700, fontSize: 14,
                cursor: (loading || !form.quantity || Number(form.quantity) <= 0) ? 'not-allowed' : 'pointer',
                boxShadow: (loading || !form.quantity || Number(form.quantity) <= 0)
                  ? 'none' : '0 4px 18px rgba(124,58,237,0.4)',
              }}
            >
              {loading ? 'Saving…' : 'Confirm Adjustment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustModal;

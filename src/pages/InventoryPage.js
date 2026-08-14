import React, { useState } from 'react';
import WarningAmberIcon  from '@mui/icons-material/WarningAmber';
import CloseIcon         from '@mui/icons-material/Close';
import InventoryTable    from '../components/inventory/InventoryTable';
import StockAdjustModal  from '../components/inventory/StockAdjustModal';
import StaffTopBar       from '../components/common/StaffTopBar';
import useInventory      from '../hooks/useInventory';

const ITEM_TYPES = [
  { value: 'consumable', label: 'Consumable' },
  { value: 'equipment',  label: 'Equipment'  },
];

const inputStyle = (focused) => ({
  width: '100%', boxSizing: 'border-box', padding: '10px 13px',
  background: focused ? 'rgba(124,58,237,0.05)' : '#f9fafb',
  border: focused ? '1px solid rgba(124,58,237,0.7)' : '1px solid #d1d5db',
  borderRadius: 8, fontSize: 13, color: '#111827', outline: 'none',
  transition: 'all 0.2s',
  boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.14)' : 'none',
});

const FocusInput = ({ value, onChange, placeholder, type = 'text', disabled, min }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      disabled={disabled} min={min}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ ...inputStyle(focused), opacity: disabled ? 0.5 : 1 }}
    />
  );
};

const EMPTY_FORM = {
  name: '', sku: '', type: 'consumable', unit: '',
  quantity: '', costPerUnit: '', lowStockThreshold: '',
  supplierName: '', supplierContact: '',
};

const ItemModal = ({ open, editing, onClose, onSave }) => {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [typeOpen, setTypeOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  React.useEffect(() => {
    if (!open) return;
    setError('');
    setLoading(false);
    if (editing) {
      setForm({
        name: editing.name || '', sku: editing.sku || '', type: editing.type || 'consumable',
        unit: editing.unit || '', quantity: editing.quantity ?? '', costPerUnit: editing.costPerUnit ?? '',
        lowStockThreshold: editing.lowStockThreshold ?? '',
        supplierName: editing.supplier?.name || '', supplierContact: editing.supplier?.contact || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, editing]);

  if (!open) return null;

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.name || !form.sku || !form.unit || form.quantity === '' || form.costPerUnit === '') {
      setError('Please fill in all required fields'); return;
    }
    setLoading(true); setError('');
    try {
      const payload = {
        name: form.name, sku: form.sku, type: form.type, unit: form.unit,
        quantity: Number(form.quantity), costPerUnit: Number(form.costPerUnit),
        lowStockThreshold: form.lowStockThreshold !== '' ? Number(form.lowStockThreshold) : undefined,
        supplier: (form.supplierName || form.supplierContact)
          ? { name: form.supplierName, contact: form.supplierContact }
          : undefined,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = ITEM_TYPES.find(t => t.value === form.type);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: '100%', maxWidth: 560,
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        fontFamily: "'Inter', system-ui, sans-serif",
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* header */}
        <div style={{
          padding: '20px 24px 18px',
          borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(147,51,234,0.03))',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0,
        }}>
          <div style={{ color: '#111827', fontWeight: 700, fontSize: 16 }}>
            {editing ? 'Edit Item' : 'Add New Item'}
          </div>
          <button onClick={onClose} style={{
            background: '#f3f4f6', border: '1px solid #e5e7eb',
            borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6B7280',
          }}>
            <CloseIcon sx={{ fontSize: 17 }}/>
          </button>
        </div>

        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 9, fontSize: 12.5, background: '#fef2f2', border: '1px solid rgba(239,68,68,0.3)', color: '#DC2626', display: 'flex', gap: 8 }}>
              <span>⚠</span> {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>Item Name *</label>
              <FocusInput value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Detergent Powder" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>SKU *</label>
              <FocusInput value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="e.g. DET-001" disabled={!!editing} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>Type *</label>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setTypeOpen(o => !o)}
                  style={{
                    width: '100%', padding: '10px 13px',
                    background: '#f9fafb',
                    border: '1px solid #d1d5db',
                    borderRadius: 8, color: '#111827', fontSize: 13,
                    cursor: 'pointer', textAlign: 'left',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    outline: 'none',
                  }}
                >
                  {selectedType?.label}
                  <span style={{ color: '#9CA3AF', fontSize: 10 }}>▼</span>
                </button>
                {typeOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100,
                    background: '#ffffff', border: '1px solid #e5e7eb',
                    borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  }}>
                    {ITEM_TYPES.map(t => (
                      <button
                        key={t.value} type="button"
                        onClick={() => { set('type', t.value); setTypeOpen(false); }}
                        style={{
                          width: '100%', padding: '10px 14px', border: 'none', cursor: 'pointer',
                          background: t.value === form.type ? 'rgba(124,58,237,0.08)' : 'transparent',
                          color: t.value === form.type ? '#7C3AED' : '#374151',
                          fontSize: 13, textAlign: 'left',
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>Unit *</label>
              <FocusInput value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="kg / litres / pcs" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>Initial Qty *</label>
              <FocusInput type="number" min="0" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>Cost / Unit (Rs.) *</label>
              <FocusInput type="number" min="0" value={form.costPerUnit} onChange={e => set('costPerUnit', e.target.value)} placeholder="0" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>Low Stock Threshold</label>
              <FocusInput type="number" min="0" value={form.lowStockThreshold} onChange={e => set('lowStockThreshold', e.target.value)} placeholder="e.g. 10" />
            </div>
            <div />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>Supplier Name</label>
              <FocusInput value={form.supplierName} onChange={e => set('supplierName', e.target.value)} placeholder="ABC Suppliers" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>Supplier Contact</label>
              <FocusInput value={form.supplierContact} onChange={e => set('supplierContact', e.target.value)} placeholder="+94 71 000 0000" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '11px 0', borderRadius: 9,
              border: '1px solid #d1d5db',
              background: '#f9fafb',
              color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}>Cancel</button>
            <button onClick={handleSave} disabled={loading} style={{
              flex: 2, padding: '11px 0', borderRadius: 9, border: 'none',
              background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7C3AED, #9333ea)',
              color: '#fff', fontWeight: 700, fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 18px rgba(124,58,237,0.4)',
            }}>
              {loading ? 'Saving…' : editing ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Main InventoryPage ─────────────────────────────────────── */
const InventoryPage = ({ isEmbedded = false }) => {
  const { items, lowStockItems, loading, addItem, editItem, removeItem, adjust } = useInventory();
  const [itemModalOpen, setItemModalOpen]     = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [editingItem, setEditingItem]         = useState(null);
  const [adjustTarget, setAdjustTarget]       = useState(null);
  const [adjustError, setAdjustError]         = useState('');
  const [adjustLoading, setAdjustLoading]     = useState(false);
  const [toast, setToast]                     = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd    = () => { setEditingItem(null); setItemModalOpen(true); };
  const openEdit   = (item) => { setEditingItem(item); setItemModalOpen(true); };
  const openAdjust = (item) => { setAdjustTarget(item); setAdjustError(''); setAdjustModalOpen(true); };

  const handleSave = async (payload) => {
    if (editingItem) {
      await editItem(editingItem._id, payload);
      showToast('Item updated successfully');
    } else {
      await addItem(payload);
      showToast('Item created successfully');
    }
  };

  const handleDelete = async (id) => {
    try {
      await removeItem(id);
      showToast('Item deactivated');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to deactivate item', 'error');
    }
  };

  const handleAdjust = async (data) => {
    setAdjustLoading(true); setAdjustError('');
    try {
      await adjust(adjustTarget._id, data);
      showToast('Stock adjusted successfully');
      setAdjustModalOpen(false);
    } catch (err) {
      setAdjustError(err.response?.data?.message || 'Adjustment failed');
    } finally {
      setAdjustLoading(false);
    }
  };

  const body = (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ color: '#111827', fontWeight: 800, fontSize: 22, margin: 0 }}>Inventory</h1>
        <p style={{ color: '#6B7280', fontSize: 13, margin: '4px 0 0' }}>
          Track consumables and equipment. All adjustments are fully logged.
        </p>
      </div>

      {lowStockItems.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '12px 16px', borderRadius: 12,
          background: '#fef2f2',
          border: '1px solid rgba(239,68,68,0.3)',
          color: '#DC2626', fontSize: 13,
        }}>
          <WarningAmberIcon sx={{ fontSize: 18, color: '#EF4444', flexShrink: 0, marginTop: 0.5 }}/>
          <div>
            <strong style={{ color: '#DC2626' }}>Low stock alert:</strong>{' '}
            {lowStockItems.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}
          </div>
        </div>
      )}

      <InventoryTable
        items={items} loading={loading}
        onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} onAdjust={openAdjust}
      />
    </div>
  );

  const overlays = (
    <>
      <ItemModal
        open={itemModalOpen} editing={editingItem}
        onClose={() => setItemModalOpen(false)}
        onSave={handleSave}
      />
      <StockAdjustModal
        open={adjustModalOpen} item={adjustTarget}
        onClose={() => setAdjustModalOpen(false)}
        onConfirm={handleAdjust}
        loading={adjustLoading} error={adjustError}
      />
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
          padding: '12px 18px', borderRadius: 10,
          background: toast.type === 'error' ? '#EF4444' : '#10B981',
          color: '#fff', fontWeight: 600, fontSize: 13.5,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}>
          {toast.type === 'error' ? '⚠ ' : '✓ '}{toast.msg}
        </div>
      )}
    </>
  );

  if (isEmbedded) return <>{body}{overlays}</>;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <StaffTopBar />
      {body}
      {overlays}
    </div>
  );
};

export default InventoryPage;

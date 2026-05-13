import React, { useState } from 'react';
import AddIcon      from '@mui/icons-material/Add';
import EditIcon     from '@mui/icons-material/Edit';
import DeleteIcon   from '@mui/icons-material/Delete';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import SearchIcon   from '@mui/icons-material/Search';

const TypeBadge = ({ type }) => (
  <span style={{
    display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: type === 'consumable' ? 'rgba(37,99,235,0.08)' : 'rgba(124,58,237,0.08)',
    border: `1px solid ${type === 'consumable' ? 'rgba(37,99,235,0.25)' : 'rgba(124,58,237,0.25)'}`,
    color: type === 'consumable' ? '#2563EB' : '#7C3AED',
  }}>
    {type === 'consumable' ? 'Consumable' : 'Equipment'}
  </span>
);

const IconBtn = ({ onClick, title, children, danger }) => (
  <button
    onClick={onClick} title={title}
    style={{
      width: 30, height: 30, borderRadius: 7, border: 'none', cursor: 'pointer',
      background: danger ? 'rgba(239,68,68,0.08)' : '#f3f4f6',
      color: danger ? '#EF4444' : '#6B7280',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.15s, color 0.15s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.16)' : '#e5e7eb';
      e.currentTarget.style.color = danger ? '#DC2626' : '#111827';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : '#f3f4f6';
      e.currentTarget.style.color = danger ? '#EF4444' : '#6B7280';
    }}
  >
    {children}
  </button>
);

const HEADERS = ['SKU', 'Name', 'Type', 'Stock', 'Cost/Unit', 'Supplier', 'Actions'];
const COLS = '90px 1fr 120px 130px 120px 140px 120px';

const InventoryTable = ({ items, loading, onAdd, onEdit, onDelete, onAdjust }) => {
  const [search, setSearch] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 16, overflow: 'hidden',
    }}>
      {/* toolbar */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        flexWrap: 'wrap',
      }}>
        <span style={{ color: '#111827', fontWeight: 700, fontSize: 14.5 }}>Inventory Items</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <SearchIcon sx={{ fontSize: 15, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}/>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name or SKU…"
              style={{
                paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: 8, color: '#111827', fontSize: 12.5, outline: 'none',
                width: 200,
              }}
            />
          </div>
          <button
            onClick={onAdd}
            style={{
              padding: '8px 14px', border: 'none', borderRadius: 8, cursor: 'pointer',
              background: 'linear-gradient(135deg, #7C3AED, #9333ea)',
              color: '#fff', fontWeight: 700, fontSize: 12.5,
              display: 'flex', alignItems: 'center', gap: 5,
              boxShadow: '0 3px 12px rgba(124,58,237,0.4)',
            }}
          >
            <AddIcon sx={{ fontSize: 15 }}/> Add Item
          </button>
        </div>
      </div>

      {/* header row */}
      <div style={{
        display: 'grid', gridTemplateColumns: COLS,
        padding: '10px 20px',
        background: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
      }}>
        {HEADERS.map(h => (
          <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase' }}>
            {h}
          </span>
        ))}
      </div>

      {/* rows */}
      {loading ? (
        <div style={{ padding: '52px 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '3px solid #7C3AED', borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
          }}/>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '52px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 13.5 }}>
          No items found
        </div>
      ) : (
        filtered.map((row, i) => (
          <div
            key={row._id}
            style={{
              display: 'grid', gridTemplateColumns: COLS,
              padding: '13px 20px', alignItems: 'center',
              borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
              transition: 'background 0.15s',
              background: row.isLowStock ? '#fff5f5' : '#ffffff',
            }}
            onMouseEnter={e => e.currentTarget.style.background = row.isLowStock ? 'rgba(239,68,68,0.08)' : '#f9fafb'}
            onMouseLeave={e => e.currentTarget.style.background = row.isLowStock ? '#fff5f5' : '#ffffff'}
          >
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#9CA3AF' }}>{row.sku}</span>
            <span style={{ fontSize: 13.5, color: '#111827', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>{row.name}</span>
            <TypeBadge type={row.type} />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: row.isLowStock ? '#EF4444' : '#10B981' }}>
              {row.quantity} {row.unit}
              {row.isLowStock && (
                <span style={{
                  marginLeft: 6, fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 20,
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#EF4444',
                }}>LOW</span>
              )}
            </span>
            <span style={{ fontSize: 13, color: '#374151' }}>Rs. {row.costPerUnit.toLocaleString()}</span>
            <span style={{ fontSize: 12.5, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
              {row.supplier?.name || '—'}
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <IconBtn onClick={() => onAdjust(row)} title="Adjust stock">
                <SwapVertIcon sx={{ fontSize: 15 }}/>
              </IconBtn>
              <IconBtn onClick={() => onEdit(row)} title="Edit">
                <EditIcon sx={{ fontSize: 15 }}/>
              </IconBtn>
              {confirmId === row._id ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => { onDelete(row._id); setConfirmId(null); }}
                    style={{ padding: '3px 8px', borderRadius: 6, border: 'none', background: '#EF4444', color: '#fff', fontSize: 10.5, fontWeight: 700, cursor: 'pointer' }}
                  >Yes</button>
                  <button
                    onClick={() => setConfirmId(null)}
                    style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f3f4f6', color: '#6B7280', fontSize: 10.5, cursor: 'pointer' }}
                  >No</button>
                </div>
              ) : (
                <IconBtn onClick={() => setConfirmId(row._id)} title="Deactivate" danger>
                  <DeleteIcon sx={{ fontSize: 15 }}/>
                </IconBtn>
              )}
            </div>
          </div>
        ))
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default InventoryTable;

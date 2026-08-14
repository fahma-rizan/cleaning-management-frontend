import React, { useState } from 'react';
import AddIcon      from '@mui/icons-material/Add';
import EditIcon     from '@mui/icons-material/Edit';
import DeleteIcon   from '@mui/icons-material/Delete';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import SearchIcon   from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

/* ─── Type badge ─────────────────────────────────────────── */
const TypeBadge = ({ type }) => {
  const isConsumable = type === 'consumable';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 12px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
      background: isConsumable ? '#EFF6FF' : '#F5F3FF',
      border: `1px solid ${isConsumable ? '#BFDBFE' : '#DDD6FE'}`,
      color: isConsumable ? '#1D4ED8' : '#6D28D9',
      letterSpacing: 0.2,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: isConsumable ? '#3B82F6' : '#7C3AED',
        display: 'inline-block', flexShrink: 0,
      }} />
      {isConsumable ? 'Consumable' : 'Equipment'}
    </span>
  );
};

/* ─── Icon button ─────────────────────────────────────────── */
const IconBtn = ({ onClick, title, children, danger, accent }) => {
  const base = danger
    ? { bg: 'rgba(239,68,68,0.07)', color: '#EF4444', hoverBg: 'rgba(239,68,68,0.15)', hoverColor: '#DC2626' }
    : accent
    ? { bg: 'rgba(124,58,237,0.07)', color: '#7C3AED', hoverBg: 'rgba(124,58,237,0.15)', hoverColor: '#6D28D9' }
    : { bg: '#F3F4F6', color: '#6B7280', hoverBg: '#E5E7EB', hoverColor: '#111827' };

  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
        background: base.bg, color: base.color,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = base.hoverBg;
        e.currentTarget.style.color = base.hoverColor;
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = base.bg;
        e.currentTarget.style.color = base.color;
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {children}
    </button>
  );
};

/* ─── Stock pill ──────────────────────────────────────────── */
const StockPill = ({ quantity, unit, isLowStock }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{
      fontSize: 13.5, fontWeight: 700,
      color: isLowStock ? '#DC2626' : '#059669',
    }}>
      {quantity} <span style={{ fontWeight: 500, fontSize: 12 }}>{unit}</span>
    </span>
    {isLowStock && (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
        background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626',
        letterSpacing: 0.4,
      }}>
        <WarningAmberIcon sx={{ fontSize: 10 }} /> LOW
      </span>
    )}
  </div>
);

/* ─── Column layout ───────────────────────────────────────── */
const COLS = '100px 1fr 150px 150px 120px';
const HEADERS = [
  { label: 'SKU',     align: 'left'   },
  { label: 'Name',    align: 'left'   },
  { label: 'Type',    align: 'left'   },
  { label: 'Stock',   align: 'left'   },
  { label: 'Actions', align: 'right'  },
];

/* ─── Main component ──────────────────────────────────────── */
const InventoryTable = ({ items = [], loading, onAdd, onEdit, onDelete, onAdjust }) => {
  const [search,    setSearch]    = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
    }}>

      {/* ── Toolbar ──────────────────────────────────────── */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #F3F4F6',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, flexWrap: 'wrap',
        background: '#FAFAFA',
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827', letterSpacing: -0.2 }}>
            Inventory Items
          </p>
          {!loading && (
            <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>
              {filtered.length} item{filtered.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <SearchIcon sx={{
              fontSize: 15, position: 'absolute', left: 10, top: '50%',
              transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none',
            }}/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or SKU…"
              style={{
                paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9,
                background: '#FFFFFF', border: '1px solid #E5E7EB',
                borderRadius: 10, color: '#111827', fontSize: 13, outline: 'none',
                width: 220,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#7C3AED';
                e.target.style.boxShadow   = '0 0 0 3px rgba(124,58,237,0.1)';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#E5E7EB';
                e.target.style.boxShadow   = '0 1px 2px rgba(0,0,0,0.04)';
              }}
            />
          </div>

          {/* Add button */}
          <button
            onClick={onAdd}
            style={{
              padding: '9px 16px', border: 'none', borderRadius: 10, cursor: 'pointer',
              background: '#7C3AED',
              color: '#fff', fontWeight: 600, fontSize: 13,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              boxShadow: '0 2px 8px rgba(124,58,237,0.35)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background   = '#6D28D9';
              e.currentTarget.style.boxShadow    = '0 4px 14px rgba(124,58,237,0.45)';
              e.currentTarget.style.transform    = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background   = '#7C3AED';
              e.currentTarget.style.boxShadow    = '0 2px 8px rgba(124,58,237,0.35)';
              e.currentTarget.style.transform    = 'translateY(0)';
            }}
          >
            <AddIcon sx={{ fontSize: 16 }}/> Add Item
          </button>
        </div>
      </div>

      {/* ── Header row ───────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: COLS,
        padding: '10px 24px',
        background: '#F9FAFB',
        borderBottom: '1px solid #E5E7EB',
        alignItems: 'center',
      }}>
        {HEADERS.map(h => (
          <span key={h.label} style={{
            fontSize: 10.5, fontWeight: 700, color: '#9CA3AF',
            letterSpacing: 0.8, textTransform: 'uppercase',
            textAlign: h.align,
          }}>
            {h.label}
          </span>
        ))}
      </div>

      {/* ── Body ─────────────────────────────────────────── */}
      {loading ? (
        <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            border: '3px solid #EDE9FE', borderTopColor: '#7C3AED',
            animation: 'spin 0.75s linear infinite',
          }}/>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          padding: '60px 0', textAlign: 'center',
          color: '#9CA3AF', fontSize: 14,
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
          No inventory items found
        </div>
      ) : (
        filtered.map((row, i) => (
          <div
            key={row._id}
            style={{
              display: 'grid', gridTemplateColumns: COLS,
              padding: '14px 24px', alignItems: 'center',
              borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none',
              transition: 'background 0.12s',
              background: row.isLowStock ? '#FFFBFB' : '#FFFFFF',
              borderLeft: row.isLowStock ? '3px solid #FCA5A5' : '3px solid transparent',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
            onMouseLeave={e => e.currentTarget.style.background = row.isLowStock ? '#FFFBFB' : '#FFFFFF'}
          >
            {/* SKU */}
            <span style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: 11.5, color: '#9CA3AF', letterSpacing: 0.3,
            }}>
              {row.sku}
            </span>

            {/* Name */}
            <span style={{
              fontSize: 14, color: '#111827', fontWeight: 600,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              paddingRight: 16,
            }}>
              {row.name}
            </span>

            {/* Type */}
            <div><TypeBadge type={row.type} /></div>

            {/* Stock */}
            <StockPill quantity={row.quantity} unit={row.unit} isLowStock={row.isLowStock} />

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>
              <IconBtn onClick={() => onAdjust(row)} title="Adjust stock" accent>
                <SwapVertIcon sx={{ fontSize: 15 }}/>
              </IconBtn>
              <IconBtn onClick={() => onEdit(row)} title="Edit item">
                <EditIcon sx={{ fontSize: 15 }}/>
              </IconBtn>

              {confirmId === row._id ? (
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <button
                    onClick={() => { onDelete(row._id); setConfirmId(null); }}
                    style={{
                      padding: '4px 10px', borderRadius: 7, border: 'none',
                      background: '#EF4444', color: '#fff',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
                    onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    style={{
                      padding: '4px 10px', borderRadius: 7,
                      border: '1px solid #E5E7EB', background: '#F9FAFB',
                      color: '#6B7280', fontSize: 11, cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'}
                    onMouseLeave={e => e.currentTarget.style.background = '#F9FAFB'}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <IconBtn onClick={() => setConfirmId(row._id)} title="Delete item" danger>
                  <DeleteIcon sx={{ fontSize: 15 }}/>
                </IconBtn>
              )}
            </div>
          </div>
        ))
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
};

export default InventoryTable;
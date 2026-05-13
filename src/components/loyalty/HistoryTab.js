import React, { useState, useMemo } from 'react';
import FilterListIcon    from '@mui/icons-material/FilterList';
import FileDownloadIcon  from '@mui/icons-material/FileDownload';
import SearchIcon        from '@mui/icons-material/Search';
import { TRANSACTION_LABELS } from '../../constants/loyalty';

const fmt = (iso) =>
  new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });

const Badge = ({ type }) => {
  const meta = TRANSACTION_LABELS[type] || { label: type, color: '#6B7280' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 0.5,
      background: `${meta.color}14`,
      color: meta.color,
      border: `1px solid ${meta.color}35`,
    }}>
      {meta.label}
    </span>
  );
};

const LightSelect = ({ value, onChange, options, placeholder }) => (
  <div style={{ position: 'relative' }}>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        appearance: 'none', WebkitAppearance: 'none',
        background: '#f3f4f6',
        border: '1px solid #e5e7eb',
        borderRadius: 8, color: value ? '#111827' : '#9CA3AF',
        fontSize: 12.5, padding: '8px 32px 8px 12px',
        cursor: 'pointer', outline: 'none',
      }}
    >
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <span style={{
      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
      color: '#9CA3AF', pointerEvents: 'none', fontSize: 10,
    }}>▼</span>
  </div>
);

const LightInput = ({ value, onChange, placeholder, icon: Icon }) => (
  <div style={{ position: 'relative' }}>
    {Icon && (
      <Icon sx={{
        fontSize: 15, position: 'absolute', left: 10, top: '50%',
        transform: 'translateY(-50%)', color: '#9CA3AF',
      }}/>
    )}
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: '#f3f4f6',
        border: '1px solid #e5e7eb',
        borderRadius: 8, color: '#111827',
        fontSize: 12.5, padding: Icon ? '8px 12px 8px 30px' : '8px 12px',
        outline: 'none', width: 160,
      }}
    />
  </div>
);

/* ── Main HistoryTab ──────────────────────────────────────── */
const HistoryTab = ({ transactions = [] }) => {
  const [typeFilter, setTypeFilter]       = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [fromDate, setFromDate]           = useState('');
  const [toDate, setToDate]               = useState('');
  const [page, setPage]                   = useState(1);
  const PER_PAGE = 10;

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (typeFilter && tx.type !== typeFilter) return false;
      if (bookingSearch && !(tx.reason || '').toLowerCase().includes(bookingSearch.toLowerCase())) return false;
      if (fromDate && new Date(tx.createdAt) < new Date(fromDate)) return false;
      if (toDate   && new Date(tx.createdAt) > new Date(toDate + 'T23:59:59')) return false;
      return true;
    });
  }, [transactions, typeFilter, bookingSearch, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleExport = () => {
    const rows = [
      ['Date', 'Booking ID', 'Reason', 'Type', 'Points'],
      ...filtered.map(tx => [
        fmt(tx.createdAt),
        tx.bookingId ? String(tx.bookingId).slice(-8).toUpperCase() : '—',
        tx.reason || '—',
        TRANSACTION_LABELS[tx.type]?.label || tx.type,
        (tx.points > 0 ? '+' : '') + tx.points,
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'loyalty-history.csv';
    a.click(); URL.revokeObjectURL(url);
  };

  const typeOptions = Object.entries(TRANSACTION_LABELS).map(([k, v]) => ({ value: k, label: v.label }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Filter bar ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 12, padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <FilterListIcon sx={{ fontSize: 16, color: '#9CA3AF' }}/>
        <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, letterSpacing: 0.5, marginRight: 4 }}>
          FILTERS
        </span>

        <LightInput
          value={bookingSearch} onChange={v => { setBookingSearch(v); setPage(1); }}
          placeholder="Search reason…" icon={SearchIcon}
        />

        <LightSelect
          value={typeFilter} onChange={v => { setTypeFilter(v); setPage(1); }}
          options={typeOptions} placeholder="All Types"
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>FROM</span>
          <input
            type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }}
            style={{
              background: '#f3f4f6', border: '1px solid #e5e7eb',
              borderRadius: 8, color: fromDate ? '#111827' : '#9CA3AF',
              fontSize: 12.5, padding: '8px 10px', outline: 'none',
            }}
          />
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>TO</span>
          <input
            type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }}
            style={{
              background: '#f3f4f6', border: '1px solid #e5e7eb',
              borderRadius: 8, color: toDate ? '#111827' : '#9CA3AF',
              fontSize: 12.5, padding: '8px 10px', outline: 'none',
            }}
          />
        </div>

        {(typeFilter || bookingSearch || fromDate || toDate) && (
          <button
            onClick={() => { setTypeFilter(''); setBookingSearch(''); setFromDate(''); setToDate(''); setPage(1); }}
            style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8, color: '#DC2626', fontSize: 11.5, padding: '7px 12px',
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            Clear
          </button>
        )}

        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={handleExport}
            style={{
              background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: 8, color: '#7C3AED', fontSize: 12, padding: '8px 14px',
              cursor: 'pointer', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <FileDownloadIcon sx={{ fontSize: 14 }}/> Export CSV
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {/* Header row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '130px 1fr 2fr 120px 100px',
          padding: '11px 20px',
          background: '#f8fafc',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}>
          {['Date', 'Booking ID', 'Reason', 'Status', 'Points'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase' }}>
              {h}
            </span>
          ))}
        </div>

        {paginated.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 13.5 }}>
            No transactions found
          </div>
        ) : (
          paginated.map((tx, i) => {
            const positive = tx.points >= 0;
            return (
              <div
                key={tx._id || i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '130px 1fr 2fr 120px 100px',
                  padding: '13px 20px',
                  borderBottom: i < paginated.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                  transition: 'background 0.12s',
                  alignItems: 'center',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: 12.5, color: '#6B7280' }}>{fmt(tx.createdAt)}</span>
                <span style={{ fontSize: 12.5, color: '#9CA3AF', fontFamily: 'monospace' }}>
                  {tx.bookingId ? String(tx.bookingId).slice(-8).toUpperCase() : '—'}
                </span>
                <span style={{ fontSize: 13, color: '#111827' }}>{tx.reason || '—'}</span>
                <Badge type={tx.type} />
                <span style={{ fontSize: 14, fontWeight: 700, color: positive ? '#10B981' : '#EF4444' }}>
                  {positive ? '+' : ''}{tx.points.toLocaleString()}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: p === page ? '1px solid rgba(124,58,237,0.5)' : '1px solid #e5e7eb',
                  background: p === page ? 'rgba(124,58,237,0.1)' : '#ffffff',
                  color: p === page ? '#7C3AED' : '#6B7280',
                  fontSize: 12.5, fontWeight: p === page ? 700 : 400,
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryTab;

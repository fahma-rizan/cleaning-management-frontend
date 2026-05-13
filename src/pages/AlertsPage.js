import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffTopBar from '../components/common/StaffTopBar';
import { getActiveAlerts, getAlertHistory } from '../services/alertService';

/* ── Type meta ──────────────────────────────────────────────── */
const TYPE_META = {
  consumable: { label: 'Consumable', bg: 'rgba(6,182,212,0.1)',   color: '#06B6D4'  },
  equipment:  { label: 'Equipment',  bg: 'rgba(124,58,237,0.1)',  color: '#7C3AED'  },
};

/* ── Spinner ────────────────────────────────────────────────── */
const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      border: '3px solid #7C3AED', borderTopColor: 'transparent',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

/* ── Active alert card ──────────────────────────────────────── */
const AlertCard = ({ alert, onRestock }) => {
  const item      = alert.item || alert;
  const qty       = item.quantity ?? alert.currentQuantity ?? alert.quantity ?? 0;
  const threshold = item.lowStockThreshold ?? alert.threshold ?? 0;
  const veryLow   = threshold > 0 && qty <= threshold * 0.5;

  const typeMeta = TYPE_META[item.type] || { label: item.type || 'Item', bg: '#f3f4f6', color: '#6B7280' };

  const triggeredDate = (alert.triggeredAt || alert.createdAt)
    ? new Date(alert.triggeredAt || alert.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div style={{
      background: veryLow ? '#fff5f5' : '#fffbeb',
      border: veryLow ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(245,158,11,0.25)',
      borderRadius: 16,
      padding: '20px 22px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, flexWrap: 'wrap',
    }}>
      {/* Left: item info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 15.5, color: '#111827' }}>
            {item.name || '—'}
          </span>
          <span style={{
            padding: '2px 9px', borderRadius: 12, fontSize: 11.5, fontWeight: 600,
            background: typeMeta.bg, color: typeMeta.color,
          }}>
            {typeMeta.label}
          </span>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>
            {item.sku || ''}
          </span>
        </div>

        {/* Quantity display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 28, fontWeight: 800,
            color: veryLow ? '#EF4444' : '#F59E0B',
            lineHeight: 1,
          }}>
            {qty}
          </span>
          <div style={{ fontSize: 12.5, color: '#6B7280' }}>
            <div>{item.unit || 'units'} remaining</div>
            <div>Threshold: <span style={{ color: '#374151' }}>{threshold}</span></div>
          </div>
        </div>

        {/* Visual bar */}
        <div style={{ width: 200, height: 5, borderRadius: 3, background: '#e5e7eb', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: threshold > 0 ? `${Math.min(100, (qty / (threshold * 2)) * 100)}%` : '0%',
            borderRadius: 3,
            background: veryLow ? '#EF4444' : '#F59E0B',
            transition: 'width 0.4s',
          }} />
        </div>

        <div style={{ fontSize: 12, color: '#9CA3AF' }}>
          Triggered: {triggeredDate}
        </div>
      </div>

      {/* Right: restock button */}
      <button
        onClick={onRestock}
        style={{
          padding: '10px 22px', borderRadius: 9, fontSize: 13.5, fontWeight: 700,
          background: 'linear-gradient(135deg, #7C3AED, #9333ea)',
          boxShadow: '0 4px 24px rgba(124,58,237,0.35)',
          border: 'none', color: '#fff', cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Restock Now
      </button>
    </div>
  );
};

/* ── History table ──────────────────────────────────────────── */
const HISTORY_PAGE_SIZE = 10;

const HistorySection = () => {
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const data = await getAlertHistory({ page, limit: HISTORY_PAGE_SIZE });
        if (Array.isArray(data)) {
          setHistory(data);
          setTotalPages(1);
        } else {
          setHistory(data?.docs || data?.alerts || data?.history || []);
          setTotalPages(data?.totalPages || data?.pages || 1);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load alert history');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  const thStyle = {
    padding: '10px 14px', fontSize: 11, fontWeight: 600,
    color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8,
    textAlign: 'left', borderBottom: '1px solid #e5e7eb',
  };
  const tdStyle = {
    padding: '11px 14px', fontSize: 13, color: '#374151',
    borderBottom: '1px solid #f1f5f9',
  };

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Resolved Alerts History</div>
        <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 3 }}>
          Past low-stock alerts that have been restocked and resolved
        </div>
      </div>

      {loading && <Spinner />}

      {error && (
        <div style={{ padding: '16px 20px', color: '#DC2626', fontSize: 13 }}>{error}</div>
      )}

      {!loading && !error && history.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: 13 }}>
          No resolved alerts yet
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={thStyle}>Item</th>
                  <th style={thStyle}>SKU</th>
                  <th style={thStyle}>Triggered At</th>
                  <th style={thStyle}>Resolved At</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Qty Restored</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => {
                  const item = h.item || h;
                  const triggeredDate = h.triggeredAt
                    ? new Date(h.triggeredAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '—';
                  const resolvedDate = h.resolvedAt
                    ? new Date(h.resolvedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '—';
                  return (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                      <td style={tdStyle}>{item.name || h.itemName || '—'}</td>
                      <td style={{ ...tdStyle, color: '#9CA3AF', fontSize: 12 }}>{item.sku || h.sku || '—'}</td>
                      <td style={tdStyle}>{triggeredDate}</td>
                      <td style={{ ...tdStyle, color: '#10B981' }}>{resolvedDate}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', color: '#10B981', fontWeight: 600 }}>
                        +{h.quantityRestored ?? h.restocked ?? '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '14px 20px' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '5px 14px', borderRadius: 7, fontSize: 12.5, cursor: page === 1 ? 'not-allowed' : 'pointer',
                  background: '#f3f4f6', border: '1px solid #e5e7eb',
                  color: page === 1 ? '#D1D5DB' : '#6B7280',
                }}
              >
                ← Prev
              </button>
              <span style={{ fontSize: 12.5, color: '#9CA3AF' }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '5px 14px', borderRadius: 7, fontSize: 12.5, cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  background: '#f3f4f6', border: '1px solid #e5e7eb',
                  color: page === totalPages ? '#D1D5DB' : '#6B7280',
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ── Main page ──────────────────────────────────────────────── */
const AlertsPage = ({ isEmbedded = false }) => {
  const navigate = useNavigate();
  const [alerts, setAlerts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const data = await getActiveAlerts();
        setAlerts(Array.isArray(data) ? data : (data?.alerts || data?.docs || []));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pageContent = (
    <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Active alerts section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%',
            background: '#EF4444',
            display: 'inline-block',
            boxShadow: '0 0 8px rgba(239,68,68,0.5)',
          }} />
          <span style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>
            Active Alerts
          </span>
          {!loading && (
            <span style={{
              padding: '2px 9px', borderRadius: 12, fontSize: 12, fontWeight: 600,
              background: 'rgba(239,68,68,0.1)', color: '#EF4444',
            }}>
              {alerts.length}
            </span>
          )}
        </div>

        {error && (
          <div style={{
            padding: '14px 18px', borderRadius: 12,
            background: '#fef2f2', border: '1px solid rgba(239,68,68,0.3)',
            color: '#DC2626', fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {loading && <Spinner />}

        {!loading && !error && alerts.length === 0 && (
          <div style={{
            background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16,
            textAlign: 'center', padding: '48px 24px',
          }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 6 }}>All stock levels are healthy</div>
            <div style={{ fontSize: 13, color: '#6B7280' }}>
              No items are currently below their low-stock threshold.
            </div>
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {alerts.map((alert, i) => (
              <AlertCard
                key={alert._id || i}
                alert={alert}
                onRestock={() => navigate('/inventory')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resolved alerts history */}
      <HistorySection />
    </div>
  );

  const pageHeader = (
    <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #e5e7eb' }}>
      <h1 style={{ margin: 0, fontWeight: 800, fontSize: 22, color: '#111827' }}>Low-Stock Alerts</h1>
      <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>
        Items that have dropped below their configured restock threshold.
      </p>
    </div>
  );

  if (isEmbedded) {
    return (
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {pageHeader}
        {pageContent}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <StaffTopBar />
      {pageHeader}
      {pageContent}
    </div>
  );
};

export default AlertsPage;

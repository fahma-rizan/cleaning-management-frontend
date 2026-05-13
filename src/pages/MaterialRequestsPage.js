import React, { useState, useEffect, useCallback } from 'react';
import StaffTopBar from '../components/common/StaffTopBar';
import {
  getRequests,
  approveRequest,
  rejectRequest,
} from '../services/materialRequestService';

/* ── Helpers ────────────────────────────────────────────────── */
const formatServiceType = (s) =>
  s ? s.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()) : '—';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  }) : '—';

/* ── Status helpers ─────────────────────────────────────────── */
const STATUS_META = {
  pending:  { label: 'Pending Review', bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
  approved: { label: 'Approved',       bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
  rejected: { label: 'Rejected',       bg: 'rgba(239,68,68,0.12)',  color: '#EF4444' },
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || { label: status, bg: '#f3f4f6', color: '#6B7280' };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600,
      background: meta.bg, color: meta.color, letterSpacing: 0.3,
    }}>
      {meta.label}
    </span>
  );
};

/* ── Tab filter buttons ─────────────────────────────────────── */
const TABS = [
  { key: '',         label: 'All' },
  { key: 'pending',  label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

/* ── Small reusable input ───────────────────────────────────── */
const FocusInput = ({ value, onChange, placeholder }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%', boxSizing: 'border-box',
        padding: '8px 12px',
        background: focused ? 'rgba(124,58,237,0.05)' : '#f9fafb',
        border: focused ? '1px solid rgba(124,58,237,0.7)' : '1px solid #d1d5db',
        boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.14)' : 'none',
        borderRadius: 8, fontSize: 13, color: '#111827', outline: 'none',
        transition: 'all 0.2s',
      }}
    />
  );
};

/* ── Item details table ─────────────────────────────────────── */
const DetailsTable = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div style={{ marginTop: 16, textAlign: 'center', padding: '24px 0', color: '#9CA3AF', fontSize: 13 }}>
        No item details available
      </div>
    );
  }

  const thStyle = {
    padding: '8px 12px', fontSize: 11, fontWeight: 600,
    color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8,
    textAlign: 'left', borderBottom: '1px solid #e5e7eb',
  };
  const tdStyle = {
    padding: '9px 12px', fontSize: 13, color: '#374151',
    borderBottom: '1px solid #f1f5f9',
  };

  const consumables = items.filter(i => i.itemType === 'consumable');
  const equipment   = items.filter(i => i.itemType === 'equipment');

  const ItemTable = ({ rows, label }) => (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
        {label}
      </div>
      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={thStyle}>Item</th>
              <th style={thStyle}>SKU</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Requested Qty</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>In Stock</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Sufficient?</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, i) => {
              const name       = item.name      || '—';
              const sku        = item.sku       || '—';
              const inStock    = item.inStock   ?? null;
              const sufficient = item.sufficient ?? null;
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                  <td style={{ ...tdStyle, fontWeight: 500, color: '#111827' }}>{name}</td>
                  <td style={{ ...tdStyle, color: '#9CA3AF', fontSize: 12 }}>{sku}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{item.requestedQty}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {inStock !== null ? inStock : '—'}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    {sufficient !== null ? (
                      <span style={{
                        padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                        background: sufficient ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                        color: sufficient ? '#10B981' : '#EF4444',
                      }}>
                        {sufficient ? 'Yes' : 'No'}
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {consumables.length > 0 && <ItemTable rows={consumables} label="Consumables" />}
      {equipment.length   > 0 && <ItemTable rows={equipment}   label="Equipment"   />}
    </div>
  );
};

/* ── Request card ───────────────────────────────────────────── */
const RequestCard = ({ request, onAction }) => {
  const [expanded,      setExpanded]      = useState(false);
  const [rejecting,     setRejecting]     = useState(false);
  const [rejectReason,  setRejectReason]  = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError,   setActionError]   = useState('');

  const booking      = request.bookingId || {};
  const customerName = booking.customerId?.name || '—';
  const scheduledDate = formatDate(booking.scheduledDate);
  const serviceType  = formatServiceType(booking.serviceType);
  const items        = request.items || [];
  const itemCount    = items.length;

  const handleApprove = async () => {
    setActionLoading(true); setActionError('');
    try {
      await approveRequest(request._id);
      onAction();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { setActionError('Please enter a reason'); return; }
    setActionLoading(true); setActionError('');
    try {
      await rejectRequest(request._id, rejectReason.trim());
      onAction();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16,
      padding: '18px 20px',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 14.5, color: '#111827' }}>
              {booking.bookingRef || request._id?.slice(-8)?.toUpperCase() || '—'}
            </span>
            <StatusBadge status={request.status} />
            {booking.serviceType && (
              <span style={{
                padding: '2px 9px', borderRadius: 12, fontSize: 11.5, fontWeight: 500,
                background: 'rgba(6,182,212,0.1)', color: '#06B6D4',
              }}>
                {serviceType}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, color: '#9CA3AF' }}>
              Customer: <span style={{ color: '#374151' }}>{customerName}</span>
            </span>
            <span style={{ fontSize: 12.5, color: '#9CA3AF' }}>
              Scheduled: <span style={{ color: '#374151' }}>{scheduledDate}</span>
            </span>
            {booking.usageFactorValue && (
              <span style={{ fontSize: 12.5, color: '#9CA3AF' }}>
                {formatServiceType(booking.usageFactor)}: <span style={{ color: '#374151' }}>{booking.usageFactorValue}</span>
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>
            <span style={{ color: '#374151', fontWeight: 600 }}>{itemCount}</span> item{itemCount !== 1 ? 's' : ''} needed
          </div>
        </div>

        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
            background: expanded ? 'rgba(124,58,237,0.08)' : '#f3f4f6',
            border: expanded ? '1px solid rgba(124,58,237,0.3)' : '1px solid #e5e7eb',
            color: expanded ? '#7C3AED' : '#6B7280',
            transition: 'all 0.15s',
          }}
        >
          {expanded ? 'Hide Details ▲' : 'View Details ▼'}
        </button>
      </div>

      {/* Rejection reason display */}
      {request.status === 'rejected' && request.rejectionReason && (
        <div style={{
          marginTop: 12, padding: '9px 13px', borderRadius: 9,
          background: '#fef2f2', border: '1px solid rgba(239,68,68,0.2)',
          fontSize: 12.5, color: '#DC2626',
        }}>
          <strong>Rejection reason:</strong> {request.rejectionReason}
        </div>
      )}

      {/* Expanded details */}
      {expanded && <DetailsTable items={items} />}

      {/* Action buttons — only for pending */}
      {request.status === 'pending' && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
          {actionError && (
            <div style={{
              marginBottom: 10, padding: '8px 12px', borderRadius: 8, fontSize: 12.5,
              background: '#fef2f2', border: '1px solid rgba(239,68,68,0.3)',
              color: '#DC2626',
            }}>
              {actionError}
            </div>
          )}

          {rejecting ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <FocusInput
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason…"
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { setRejecting(false); setRejectReason(''); setActionError(''); }}
                  style={{
                    padding: '8px 18px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                    background: '#f9fafb', border: '1px solid #d1d5db',
                    color: '#374151', fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  style={{
                    padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    background: actionLoading ? 'rgba(239,68,68,0.5)' : '#EF4444',
                    border: 'none', color: '#fff',
                    boxShadow: actionLoading ? 'none' : '0 4px 16px rgba(239,68,68,0.3)',
                  }}
                >
                  {actionLoading ? 'Rejecting…' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                style={{
                  padding: '8px 22px', borderRadius: 9, fontSize: 13, fontWeight: 700,
                  background: actionLoading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7C3AED, #9333ea)',
                  boxShadow: actionLoading ? 'none' : '0 4px 24px rgba(124,58,237,0.35)',
                  border: 'none', color: '#fff', cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.6 : 1,
                }}
              >
                {actionLoading ? 'Approving…' : 'Approve'}
              </button>
              <button
                onClick={() => { setRejecting(true); setActionError(''); }}
                style={{
                  padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#DC2626',
                }}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
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

/* ── Main page ──────────────────────────────────────────────── */
const MaterialRequestsPage = ({ isEmbedded = false }) => {
  const [activeTab, setActiveTab] = useState('');
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = activeTab ? { status: activeTab } : {};
      const data = await getRequests(params);
      const raw = Array.isArray(data) ? data : (data?.requests || data?.docs || []);
      const sorted = [...raw].sort((a, b) => {
        const dateA = new Date(a.bookingId?.scheduledDate || 0);
        const dateB = new Date(b.bookingId?.scheduledDate || 0);
        return dateA - dateB;
      });
      setRequests(sorted);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load material requests');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);

  const filterTabs = (
    <div style={{ display: 'flex', gap: 6 }}>
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          style={{
            padding: '7px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500,
            cursor: 'pointer', transition: 'all 0.15s',
            background: activeTab === tab.key ? 'rgba(124,58,237,0.08)' : '#f3f4f6',
            border: activeTab === tab.key ? '1px solid rgba(124,58,237,0.4)' : '1px solid #e5e7eb',
            color: activeTab === tab.key ? '#7C3AED' : '#6B7280',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  const pageContent = (
    <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {filterTabs}

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

      {!loading && !error && requests.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>📋</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 6 }}>No requests found</div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>
            {activeTab ? `No ${activeTab} requests at the moment.` : 'No material requests have been generated yet.'}
          </div>
        </div>
      )}

      {!loading && !error && requests.map(req => (
        <RequestCard key={req._id} request={req} onAction={load} />
      ))}
    </div>
  );

  const pageHeader = (
    <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #e5e7eb' }}>
      <h1 style={{ margin: 0, fontWeight: 800, fontSize: 22, color: '#111827' }}>Material Requests</h1>
      <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>
        Review and approve material requests generated for upcoming bookings.
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

export default MaterialRequestsPage;

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import StaffTopBar from '../components/common/StaffTopBar';
import { getMonthlyReport } from '../services/reportService';

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

/* ── Stat card ──────────────────────────────────────────────── */
const StatCard = ({ label, value, unit, color = '#111827' }) => (
  <div style={{
    background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16,
    padding: '18px 22px',
    flex: '1 1 160px',
    minWidth: 140,
  }}>
    <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
      {label}
    </div>
    <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>
      {value ?? '—'}
    </div>
    {unit && (
      <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 5 }}>{unit}</div>
    )}
  </div>
);

/* ── Breakdown table ────────────────────────────────────────── */
const BreakdownTable = ({ rows }) => {
  const thStyle = {
    padding: '10px 14px', fontSize: 11, fontWeight: 600,
    color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8,
    textAlign: 'left', borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap',
  };
  const tdStyle = {
    padding: '11px 14px', fontSize: 13, color: '#374151',
    borderBottom: '1px solid #f1f5f9',
  };

  const ITEM_TYPE_META = {
    consumable: { bg: 'rgba(6,182,212,0.1)',   color: '#06B6D4' },
    equipment:  { bg: 'rgba(124,58,237,0.1)',  color: '#7C3AED' },
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            <th style={thStyle}>Item</th>
            <th style={thStyle}>SKU</th>
            <th style={thStyle}>Type</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Deducted</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Returned</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Net Consumed</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Restocked</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Txns</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const typeMeta = ITEM_TYPE_META[row.type] || { bg: '#f3f4f6', color: '#6B7280' };
            return (
              <tr key={i} style={{ background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                <td style={{ ...tdStyle, fontWeight: 500, color: '#111827' }}>{row.name || row.itemName || '—'}</td>
                <td style={{ ...tdStyle, color: '#9CA3AF', fontSize: 12 }}>{row.sku || '—'}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '2px 9px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                    background: typeMeta.bg, color: typeMeta.color,
                  }}>
                    {row.type || '—'}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', color: '#EF4444' }}>{row.deducted ?? 0}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: '#10B981' }}>{row.returned ?? 0}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#111827' }}>{row.netConsumed ?? 0}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: '#06B6D4' }}>{row.restocked ?? 0}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: '#9CA3AF' }}>{row.transactionCount ?? 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/* ── Main page ──────────────────────────────────────────────── */
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MonthlyReportPage = ({ isEmbedded = false }) => {
  const now   = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const reportData = await getMonthlyReport(year, month);
      setReport(reportData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totals    = report?.totals    || {};
  const breakdown = report?.breakdown || [];

  const yearOptions = [];
  for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) {
    yearOptions.push(y);
  }

  const downloadPDF = () => {
    const doc       = new jsPDF();
    const monthName = MONTHS[month - 1];
    const today     = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Title
    doc.setFontSize(20);
    doc.setTextColor(124, 58, 237);
    doc.text('Monthly Inventory Report', 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(107, 114, 128);
    doc.text(`${monthName} ${year}  —  Cloud Laundry.LK`, 14, 30);

    // Summary section header
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text('Summary', 14, 44);

    autoTable(doc, {
      startY: 48,
      head: [['Metric', 'Value']],
      body: [
        ['Total Deducted',  `${totals.totalDeducted ?? 0} units`],
        ['Total Returned',  `${totals.totalReturned ?? 0} units`],
        ['Net Consumed',    `${totals.totalNetConsumed ?? 0} units`],
        ['Total Restocked', `${totals.totalRestocked ?? 0} units`],
      ],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [124, 58, 237], textColor: 255 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: { 1: { halign: 'right' } },
    });

    // Per-item breakdown
    if (breakdown.length > 0) {
      const afterSummary = doc.lastAutoTable.finalY + 14;
      doc.setFontSize(12);
      doc.setTextColor(17, 24, 39);
      doc.text(`Per-Item Breakdown  (${breakdown.length} items)`, 14, afterSummary);

      autoTable(doc, {
        startY: afterSummary + 6,
        head: [['Item', 'SKU', 'Type', 'Deducted', 'Returned', 'Net Used', 'Restocked', 'Txns']],
        body: breakdown.map(row => [
          row.name || row.itemName || '—',
          row.sku || '—',
          row.type || '—',
          row.deducted ?? 0,
          row.returned ?? 0,
          row.netConsumed ?? 0,
          row.restocked ?? 0,
          row.transactionCount ?? 0,
        ]),
        styles: { fontSize: 8.5 },
        headStyles: { fillColor: [124, 58, 237], textColor: 255 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: {
          3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' },
          6: { halign: 'right' }, 7: { halign: 'right' },
        },
      });
    }

    // Footer on every page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8.5);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Generated by Cloud Laundry.LK on ${today}  —  Page ${i} of ${pageCount}`,
        14,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(`inventory-report-${monthName}-${year}.pdf`);
  };

  const selectStyle = {
    padding: '8px 14px', borderRadius: 8, fontSize: 13,
    background: '#ffffff', border: '1px solid #d1d5db',
    color: '#111827', cursor: 'pointer', outline: 'none',
  };

  const periodPicker = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <select value={month} onChange={e => setMonth(Number(e.target.value))} style={selectStyle}>
        {MONTHS.map((m, i) => (
          <option key={i + 1} value={i + 1}>{m}</option>
        ))}
      </select>

      <select value={year} onChange={e => setYear(Number(e.target.value))} style={selectStyle}>
        {yearOptions.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <button
        onClick={load}
        disabled={loading}
        style={{
          padding: '8px 22px', borderRadius: 9, fontSize: 13, fontWeight: 700,
          background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7C3AED, #9333ea)',
          boxShadow: loading ? 'none' : '0 4px 18px rgba(124,58,237,0.35)',
          border: 'none', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Loading…' : 'Load Report'}
      </button>

      {!loading && report && (
        <button
          onClick={downloadPDF}
          style={{
            padding: '8px 20px', borderRadius: 9, fontSize: 13, fontWeight: 600,
            background: '#f3f4f6', border: '1px solid #d1d5db',
            color: '#374151', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          ↓ Download PDF
        </button>
      )}
    </div>
  );

  const pageContent = (
    <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      {periodPicker}

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

      {!loading && !error && report && (
        <>
          {/* Summary stat cards */}
          <section>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
              {MONTHS[month - 1]} {year} — Summary
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <StatCard label="Total Deducted"  value={totals.totalDeducted}    unit="units out"  color="#EF4444"  />
              <StatCard label="Total Returned"  value={totals.totalReturned}    unit="units back" color="#10B981"  />
              <StatCard label="Net Consumed"    value={totals.totalNetConsumed} unit="units used" color="#111827"  />
              <StatCard label="Total Restocked" value={totals.totalRestocked}   unit="units in"   color="#06B6D4"  />
            </div>
          </section>

          {/* Per-item breakdown */}
          <section>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
              Per-Item Breakdown ({breakdown.length} items)
            </div>
            {breakdown.length === 0 ? (
              <div style={{
                background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16,
                textAlign: 'center', padding: '48px 24px',
              }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6 }}>No transactions this month</div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>
                  There was no stock movement recorded for {MONTHS[month - 1]} {year}.
                </div>
              </div>
            ) : (
              <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
                <BreakdownTable rows={breakdown} />
              </div>
            )}
          </section>

        </>
      )}
    </div>
  );

  const pageHeader = (
    <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #e5e7eb' }}>
      <h1 style={{ margin: 0, fontWeight: 800, fontSize: 22, color: '#111827' }}>Monthly Inventory Report</h1>
      <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>
        Stock movement summary for a calendar month.
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

export default MonthlyReportPage;
